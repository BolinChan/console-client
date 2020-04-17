import { Component } from "react"
import { Icon } from "antd"
import styles from "./TextArea.css"
import Express from "./Express"
import { connect } from "dva"
// 获取焦点位置
function getCursorPos (pTextArea) {
    let cursurPosition = 0
    if (pTextArea.selectionStart) {// 非IE浏览器
        pTextArea.focus()
        cursurPosition = pTextArea.selectionStart
    }
    if (document.selection) {// IE
        let range = document.selection.createRange()
        range.moveStart("character", -pTextArea.value.length)
        cursurPosition = range.text.length
    }
    return cursurPosition
}
// 聚焦在某个位置
function setCaretPosition (elem, caretPos) {
    let range
    if (elem.createTextRange) {
        range = elem.createTextRange()
        range.select()
    } else {
        elem.focus()
        elem.setSelectionRange(caretPos, caretPos)
    }
}
class TextArea extends Component {
    state = {
        textLength: 0,
    }
    componentDidMount () {
        if (!this.props.Emoj) {
            this.props.dispatch({ type: "vertisy/getemoji" })
        }
    }
    handleChangeTextarea = (e) => {
        this.setState({ text: e.target.value, textLength: e.target.value.length })
        this.triggerChange(e.target.value)
    }
    selectExpress = (item) => {
        let value = this.refs.TextRef.value
        const { id } = this.props
        const ele = document.getElementById(`textarea${id}`)
        const start = getCursorPos(ele)
        let text = value.substring(0, start) + item + value.substring(start, value.length)
        this.setState({ text, textLength: text.length })
        this.triggerChange(text)
        this.refs.TextRef.value = text
        setCaretPosition(ele, start + item.length)
    }
    triggerChange = (changedValue) => {
        const onChange = this.props.onChange
        if (onChange) {
            onChange(changedValue)
        }
    }
    render () {
        const { visibleBottom, visibleNumber, visibleExpress, placeholder, id, disabled, value } = this.props
        let BottomVisible = visibleBottom || "visible"
        let NumberVisible = visibleNumber || "hidden"
        let ExpressVisible = visibleExpress || "visible"
        const boxStyle = {
            height: this.props.height || "142px",
            width: this.props.width || "100%",
            minWidth: "400px",
        }
        if (this.state.textLength <= 0) {
            NumberVisible = "hidden"
        }
        const maxLengths = Number(this.props.maxLength)
        // const haveEmoj = Emoj && Emoj.length > 0
        return (
            <div className={styles.box} style={boxStyle}>
                <textarea
                    id={`textarea${id}`}
                    disabled={disabled}
                    ref="TextRef"
                    placeholder={placeholder || "请输入内容"}
                    onClick={this.textareaClick}
                    name="content"
                    value={value || ""}
                    onChange={this.handleChangeTextarea}
                />
                {BottomVisible === "visible" && (
                    <div className={styles.betweenItem}>
                        {ExpressVisible === "visible" && (
                            <div className={styles.express}>
                                <Express background="none" disabled={this.props.disabled} placement="topLeft" selectExpress={this.selectExpress} selectEmoji={this.selectEmoji} />
                            </div>
                        )}
                        {/* {isRandom &&
                        <Button
                            size="small"
                            type="primary"
                            disabled={!haveEmoj}
                            title={!haveEmoj ? "请先设置随机表情" : ""}
                            onClick={() => this.selectExpress("#随机表情#")}>添加随机表情</Button>
                        } */}
                        {/* {isRandom && <EditorExpress/>} */}

                        {NumberVisible === "visible" && (
                            <div className={styles.Tagging}>
                                已输入字数&nbsp;&nbsp;
                                {this.state.textLength}
                                {maxLengths ? <span>/{maxLengths}</span> : null}
                                {maxLengths && this.state.textLength >= maxLengths ? (
                                    <span className={styles.overText}>
                                        <Icon type="exclamation-circle" />
                                        字数已超出限制
                                    </span>
                                ) : null}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }
}

export default connect()(TextArea)
// disabled={ture};是否禁用输入框boolean值
// NumberVisible是否计数，ExpressVisible是否显示表情；BottomVisible是否显示表情和计数；“visible”、“hidden”
// height,width,
// maxLengths：输入框的最大长度
// 默认值defaultValue
// isRandom 是否显示添加随机表情按钮，默认false不显示
