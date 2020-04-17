import { Component } from "react"
import { connect } from "dva"
import { Input, DatePicker, Radio, Checkbox } from "antd"
import styles from "./Info.css"
import moment from "moment"
import Ellipsis from "ant-design-pro/lib/Ellipsis"
const { TextArea } = Input
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group
class ExtendFile extends Component {
    state = { extendName: "", extendValue: "", eIndex: null, hasValue: "" }
    componentDidMount () {
        this.getChatInfo(this.props)
    }

    getChatInfo = (param) => {
        const { dispatch } = param
        dispatch({ type: "chat/extendField" })
    }
    extendUpdate = (e) => {
        let value = this.findSame(e.id)
        this.setState({ extendName: e.name, eIndex: e.index, extendValue: value }, () => this.input.focus())
    }
    extendChange = async (item, e) => {
        if (e) {
            let type = item.type
            let value = {
                "1": e.target ? (e.target.value.replace(/[^\d]/g, "") || "") : "",
                "2": e.target ? e.target.value : "",
                "3": e.target ? e.target.value : "",
                "4": e._d ? moment(e._d).format("YYYY-MM-DD") : "",
                "5": e._d ? moment(e._d).format("YYYY-MM-DD HH:mm:ss") : "",
            }
            this.setState({ extendValue: value[type] })
            if (type === "4" || type === "5") {
                this.extendConfirm(item, value[type])
            }
        }
    }
    extendConfirm = (item, extendValue) => {
        extendValue = extendValue || this.state.extendValue
        const { chatsActive, chats, dispatch } = this.props
        const active = chats.find((item) => item.userid === chatsActive)
        let extend_fields = active.extend_fields ? JSON.parse(active.extend_fields) : {}
        extend_fields[`${item.id}`] = extendValue
        if (JSON.stringify(extend_fields) !== active.extend_fields) {
            dispatch({
                type: "chat/editfriendfield",
                payload: { userid: active.userid, extend_fields },
            })
        }
        if ((item.type === "4" || item.type === "5") && !extendValue) {
            return
        }
        this.setState({ extendName: "", extendValue: "", eIndex: null })
    }
    saveInputRef = (input) => (this.input = input)

    // /**
    //  * @param {type 1 数字 2 字符 3 多行字符 4 日期 5 日期时间 6 单选}
    //  * */
    hasMethods = (type, item) => {
        const { extendValue } = this.state
        const extendStyle = {
            type: "text",
            size: "small",
            style: {},
            value: extendValue,
        }
        extendStyle.style = type !== "3" ? { width: 130 } : { width: 180, resize: "none", height: 60 }
        let inMess = {
            "1": (
                <Input
                    ref={this.saveInputRef}
                    placeholder="请输入数字"
                    {...extendStyle}
                    onChange={(e) => this.extendChange(item, e)}
                    onBlur={() => this.extendConfirm(item)}
                    onPressEnter={() => this.extendConfirm(item)}
                />
            ),
            "2": (
                <Input
                    ref={this.saveInputRef}
                    {...extendStyle}
                    onChange={(e) => this.extendChange(item, e)}
                    onBlur={() => this.extendConfirm(item)}
                    onPressEnter={() => this.extendConfirm(item)}
                />
            ),
            "3": (
                <TextArea
                    ref={this.saveInputRef}
                    {...extendStyle}
                    onChange={(e) => this.extendChange(item, e)}
                    onBlur={() => this.extendConfirm(item)}
                />
            ),
            "4": (
                <DatePicker
                    autoFocus={true}
                    ref={this.saveInputRef}
                    style={{ width: 130 }}
                    onChange={(e) => this.extendChange(item, e)}
                    defaultValue={extendValue ? moment(extendValue) : moment()}
                    format= "YYYY-MM-DD"
                />
            ),
            "5": (
                <DatePicker
                    showToday={false}
                    autoFocus={true}
                    ref={this.saveInputRef}
                    style={{ width: 130 }}
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="请选择日期时间"
                    onChange={(e) => this.extendChange(item, e)}
                    onOk={() => this.extendConfirm(item)}
                />
            ),
        }
        return inMess[type]
    }

    findValue = (id) => (<Ellipsis lines={1} tooltip={this.findSame(id)}>{this.findSame(id)}</Ellipsis>)
    selChange = async (item, e) => {
        let value = e.target.value
        await this.setState({ extendValue: value })
        this.extendConfirm(item)
    }
    findSame = (id) => {
        const { chatsActive, chats } = this.props
        const active = chats.find((item) => item.userid === chatsActive)
        let extend_fields = JSON.parse(active.extend_fields)
        let value = extend_fields ? extend_fields[id] : ""
        return value
    }
    checkChange = async (item, e) => {
        if (e.length) {
            await this.setState({ extendValue: e.join(",") })
            this.extendConfirm(item)
        }
    }
    cancle = () => {
        this.setState({ eIndex: null, extendName: "" })
    }
    render () {
        const { extendField } = this.props
        const { extendName, eIndex } = this.state
        return (
            <div>
                {extendField && extendField.length > 0 && extendField.map((ex, exindex) => {
                    let [rValue, radio, check, checkValue] = ["", [], [], []]
                    if (ex.type === "6") {
                        rValue = this.findSame(ex.id)
                        radio = ex.field_value ? ex.field_value.replace(/，/ig, ",").split(",") : []
                    }
                    if (ex.type === "7") {
                        check = ex.field_value ? ex.field_value.replace(/，/ig, ",").split(",") : []
                        let value = this.findSame(ex.id)
                        checkValue = value ? this.findSame(ex.id).split(",") : []
                    }
                    return (
                        <div key={ex.id} className={styles.line}>
                            <div className={styles.lineInfo}>
                                <span style={{ flexShrink: 0 }}>{ex.name}：</span>
                                {ex.type !== "6" && ex.type !== "7" && (extendName === ex.name ? this.hasMethods(ex.type, ex) : this.findValue(ex.id))}
                                {ex.type === "6" && <RadioGroup value={rValue} onChange={(e) => this.selChange(ex, e)}>
                                    {radio.length && radio.map((item, index) => {
                                        if (item) {
                                            return (
                                                <Radio style={{ marginBottom: 5 }} value={item} key={index}>{item}</Radio>
                                            )
                                        }
                                    })}
                                </RadioGroup>}
                                {ex.type === "7" && <CheckboxGroup id="groupCheck" value={checkValue} options={check} onChange={(e) => this.checkChange(ex, e)} />}
                            </div>
                            {eIndex === exindex && (ex.type === "4" || ex.type === "5") && <a onClick={() => this.cancle()}>取消</a>}
                            {(eIndex !== exindex) && ex.type !== "6" && ex.type !== "7" && <a onClick={() => this.extendUpdate({ id: ex.id, name: ex.name, type: ex.type, index: exindex })}>修改</a>}
                        </div>
                    )
                })}

            </div>
        )
    }
}
function mapStateToProps (state) {
    const { extendField, chatsActive, chats } = state.chat
    return { extendField, chatsActive, chats }
}
export default connect(mapStateToProps)(ExtendFile)
