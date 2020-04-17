import { Component } from "react"
import styles from "./TextAreas.css"
import Express from "./Express"

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
class TextAreas extends Component {

    handleChangeTextarea = (e) => {
        this.triggerChange(e.target.value)
    }
    selectExpress = (item) => {
        const {addText} = item
        let value = this.refs.TextRef.value
        const { id } = this.props
        const ele = document.getElementById(`textarea${id}`)
        const start = getCursorPos(ele)
        let text = value.substring(0, start) + addText + value.substring(start, value.length)

        this.triggerChange(text)
        this.refs.TextRef.value = text
        setCaretPosition(ele, start + addText.length)
    }
    triggerChange = (changedValue) => {
        const onChange = this.props.onChange
        if (onChange) {
            onChange(changedValue)
        }
    }
    render () {
        const { placeholder, id, value, style } = this.props


        return (
            <div className={styles.box} style={style}>
                <textarea
                    id={`textarea${id}`}
                    ref="TextRef"
                    placeholder={placeholder || "请输入内容"}
                    onClick={this.textareaClick}
                    name="content"
                    value={value || ""}
                    onChange={this.handleChangeTextarea}
                />
                <div className={styles.betweenItem}>
                    <div className={styles.express}>
                        <Express title="发送表情" customShow addMsg={this.selectExpress} placement="topLeft" />
                    </div>
                </div>
            </div>
        )
    }
}

export default TextAreas

