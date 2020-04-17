// import { connect } from "dva"
import { Component } from "react"
import { Input, message } from "antd"
class SetName extends Component {
    state = {
        visible: false,
    }
    componentDidMount () {
        document.body.addEventListener("click", this.Listener)
    }
    componentDidUpdate () {
        if (document.getElementById("boxInput")) {
            document.getElementById("boxInput").removeEventListener("click", this.onClickFun)
            document.getElementById("boxInput").addEventListener("click", this.onClickFun)
        }
    }
    componentWillUnmount () {
        document.body.removeEventListener("click", this.Listener)
    }
    Listener = (e) => {
        this.setState({ visible: false })
    }
    onClickFun = (e) => {
        e.stopPropagation()
    }
    setName = () => {
        this.setState({ visible: true })
    }
    // 提交数据
    enterSubmit = (e) => {
        let name = e.target.value
        const { record, action, dispatch } = this.props
        let defaultValue = this.state.name || record.remark
        if (name !== defaultValue) {
            name = name.replace(/(\s*$)/g, "")
            // 编辑备注
            let payload = { wxid: record.wxid, kefu_wxid: record.kefu_wxid, action, value: name, userid: record.userid }
            if (payload.action === "phone" && !(/^1[34578]\d{9}$/.test(name))) {
                return message.error("请输入正确的手机号码")
            }
            dispatch({
                type: "custom/updateCustom",
                payload,
            })
            this.setState({ visible: false, name })
        }
    }
    render () {
        const { defaultname, holder } = this.props
        let { visible, name } = this.state
        let isTrue = defaultname === "无" || defaultname === "未绑定"
        return (
            <div>
                <a style={{ display: !visible ? "block" : "none", color: isTrue && "#3f78ad" }} onDoubleClick={this.setName} title="双击修改，Enter键保存">
                    {defaultname}
                </a>
                {visible && (
                    <Input
                        id="boxInput"
                        placeholder={holder}
                        defaultValue={name || (isTrue ? "" : defaultname)}
                        ref={(input) => input && input.focus()}
                        onPressEnter={this.enterSubmit}
                    />
                )}
            </div>
        )
    }
}
export default SetName
