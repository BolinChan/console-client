import { Component } from "react"
import { connect } from "dva"
import { Button, Popover } from "antd"
import styles from "./SendBox.css"
import Express from "./Express"
import QuickReply from "./QuickReply"
import RedPage from "./RedPage"
import SelectImage from "./SelectImage"
// import classNames from "classnames"
let tag = ""
// 生产随机数
function randomFun () {
    const str = "qwertyuiopasdfghjklzxcvbnm0123456789QWERTYUIOPASDFGHJKLZXCVBNM"
    const len = str.length
    let _d = new Date()
    let strMath = ""
    for (let i = 0; i < 4; i++) {
        let math = Math.floor(Math.random() * len - 1)
        if (math < 0) {
            math = 0
        }
        strMath += str.substr(math, 1)
    }
    let dataMath = _d.getTime() + strMath
    return dataMath
}
class SendBox extends Component {
    state = {
        textarea: "",
        expressVisible: false,
        unsendVisible: false,
        imgList: {},
        textareaFocus: true,
    }
    componentDidUpdate () {
        if (this.props.tag !== tag) {
            this.setState({ textarea: "", textareaFocus: true })
            tag = this.props.tag
        }
        if (this.state.textareaFocus) {
            this.input.focus()
        }
    }
    componentDidMount () {
        document.removeEventListener("keydown", this.handleEnterKey)
        document.addEventListener("keydown", this.handleEnterKey)
        if (this.props.tag !== tag) {
            this.setState({ textarea: "", textareaFocus: true })
            tag = this.props.tag
        }
        if (this.state.textareaFocus) {
            this.input.focus()
        }
    }
    handleEnterKey = (e) => {
        if (e.ctrlKey && e.keyCode === 13) {
            this.setState({ textarea: this.state.textarea + "\n" })
            return false
        }
        if (e.keyCode === 13) {
            e.preventDefault()
            if (!this.state.textareaFocus) {
                return false
            }
            this.handleSendMsg()
        }
    }
    handleChangeTextarea = (e) => {
        this.setState({ textarea: e.target.value })
    }
    handleSendMsg = (e) => {
        this.setState({ textareaFocus: true })
        const { textarea } = this.state
        const { deviceid, tag } = this.props
        if (!textarea || textarea.replace(/\s+/g, "").length <= 0) {
            this.setState({ textarea: "", unsendVisible: true })
            setTimeout(() => {
                this.setState({ unsendVisible: false })
            }, 1000)
            return
        }
        let dataMath = randomFun()
        const message = {
            type: "1",
            text: textarea,
            deviceid,
            tag,
            status: "0",
            sendStatus: "loading",
            key: dataMath,
        }
        this.props.dispatch({
            type: "chat/addMessage",
            payload: {
                message,
            },
        })
        this.props.dispatch({ type: "chat/sendMessage", payload: { type: 1, key: dataMath, contents: this.state.textarea, deviceId: deviceid, tag } })
        this.setState({ textarea: "" })
    }
    handleSendQuickReply = (e) => {
        // e是子组件传过来的快捷回复内容
        const { deviceid, tag } = this.props
        let dataMath = randomFun()
        const message = {
            type: "1",
            text: e,
            deviceid,
            tag,
            status: "0",
            sendStatus: "loading",
            key: dataMath,
        }
        this.props.dispatch({
            type: "chat/addMessage",
            payload: {
                message,
            },
        })
        this.props.dispatch({ type: "chat/sendMessage", payload: { type: 1, contents: e, key: dataMath, deviceId: deviceid, tag } })
        this.setState({ textarea: "" })
    }
    selectExpress = (item) => {
        // 表情
        this.setState({ textarea: this.state.textarea + item.name })
    }
    selectImage = (deviceid, tag, dispatch) => (info) => {
        // 选择发送的图片
        this.setState({ imgList: info.file })
        const status = info.file.status
        if (status === "done") {
            const img = `//images.jutaobao.cc/${this.state.imgList.response.key}`
            let dataMath = randomFun()
            const message = {
                type: "2",
                url: img,
                deviceid,
                tag,
                status: "0",
                sendStatus: "loading",
                key: dataMath,
            }
            dispatch({
                type: "chat/addMessage",
                payload: {
                    message,
                },
            })
            dispatch({ type: "chat/sendMessage", payload: { type: 2, url: img, key: dataMath, deviceId: deviceid, tag } })
        }
    }
    sendRedPage = (deviceid, tag, dispatch) => (e) => {
        const url = `//${this.props.RedData}`
        if (this.props.RedData) {
            let dataMath = randomFun()
            const message = {
                type: "2",
                url,
                deviceid,
                tag,
                status: "0",
                sendStatus: "loading",
                key: dataMath,
            }
            dispatch({
                type: "chat/addMessage",
                payload: {
                    message,
                },
            })
            dispatch({ type: "chat/sendMessage", payload: { type: 2, url, key: dataMath, deviceId: deviceid, tag } })
        }
    }

    textareaClick = () => {
        this.setState({ textareaFocus: true })
    }
    onBlurTextarea = () => {
        this.setState({ textareaFocus: false })
    }
    saveInputRef = (input) => (this.input = input)
    render () {
        let { deviceid, tag, dispatch, hsWord, hsGroup, MaxVaule } = this.props
        return (
            <div className={styles.message_edit} onBlur={this.onBlurTextarea}>
                <div className={styles.functionBar}>
                    <div className={styles.iconPadding}>
                        <Express title="发送表情" selectExpress={this.selectExpress} placement="topLeft" />
                        <SelectImage handleChange={this.selectImage(deviceid, tag, dispatch)} />
                        <RedPage devicid={deviceid} dispatch={dispatch} tag={tag} MaxVaule={MaxVaule} onClick={this.sendRedPage(deviceid, tag, dispatch)} />
                        {hsWord &&
                            hsWord.length > 0 &&
                            hsGroup &&
                            hsGroup.length > 0 &&
                            hsGroup.map((item, index) => {
                                let isdeviceid = JSON.parse(item.deviceids).find((deviceids) => deviceids === deviceid)
                                let words = []
                                hsWord.map((it) => {
                                    if (it.groupid === item.groupid && !!isdeviceid) {
                                        words.push(it.text)
                                    }
                                })
                                if (words.length > 0) {
                                    // item.devices.findIndex(mess=>mess===deviceid)!==-1
                                    return <QuickReply key={index} handleSendQuickReply={this.handleSendQuickReply} title={item.name} hsWord={words} />
                                }
                            })}
                    </div>
                </div>
                <div className={styles.inputbox}>
                    <textarea
                        ref={this.saveInputRef}
                        // placeholder="按 Enter 发送, Ctrl + Enter 可换行"
                        onClick={this.textareaClick}
                        name="content"
                        value={this.state.textarea}
                        onChange={this.handleChangeTextarea}
                    />
                </div>
                <div className={styles.sendbox}>
                    <div className={styles.placeHolder}>按 Enter 发送, Ctrl + Enter 可换行</div>
                    <Popover trigger="click" content="发送的内容不能为空" visible={this.state.unsendVisible}>
                        <Button type="primary" onClick={this.handleSendMsg}>
                            发送
                        </Button>
                    </Popover>
                </div>
            </div>
        )
    }
}
function mapStateToProps (state) {
    const { dispatch } = state.chat
    return {
        dispatch,
    }
}
export default connect(mapStateToProps)(SendBox)
