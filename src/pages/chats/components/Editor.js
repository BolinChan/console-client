import { connect } from "dva"
import { Component } from "react"
import { Input, Button, Popover, Icon, message, Modal } from "antd"
import styles from "./Editor.css"
import Express from "./Express"
import SendImg from "./SendImg"
import Redpackage from "./Redpackage"
import SendTime from "./SendTime"
import Setdolist from "./Setdolist"
import classNames from "classnames"
import EditorTip from "./EditorTip"
import CustomPop from "./CustomPop"
import Folder from "./Folder"
import Goods from "./Goods"
import Taobao from "./Taobao"
import App from "./App"
import Activity from "./Activity"
import Videos from "./Videos"
import Voice from "./Voice"
import Ait from "./Ait"
import request from "../../../utils/request"

const { TextArea } = Input
let expressTime = ""
let ksyTime = ""
let chat = ""
class Editor extends Component {
    state = {
        error: false,
        textareaFocus: false,
        blob: "",
        selIndex: 0,
        messageLog: "",
        isFind: "",
        listAit: [],
        wxidAit: [],
        startPosition: 0,
    }
    componentDidMount () {
        this.setFocus()
        const ipt = document.getElementById("editIpt")
        const editor = document.getElementById("editor")
        ipt.addEventListener("paste", (event) => {
            const clipboardData = event.clipboardData
            let i = 0
            let items = 0
            let item = 0
            let types = 0
            if (clipboardData) {
                items = clipboardData.items
                if (!items) {
                    return
                }
                item = items[0]
                types = clipboardData.types || []
                for (; i < types.length; i++) {
                    if (types[i] === "Files") {
                        item = items[i]
                        break
                    }
                }
                if (item && item.kind === "file" && item.type.match(/^image\//i)) {
                    let blob = item.getAsFile()
                    this.setState({ blob })
                }
            }
        })
        editor.addEventListener("drop", (event) => {
            event.preventDefault()
            var fileList = event.dataTransfer.files
            if (fileList.length === 0) {
                return
            }
            if (fileList[0].type.indexOf("image") !== -1) {
                let blob = fileList[0]
                this.setState({ blob })
            } else {
                message.warning("当前仅支持图片拖拽")
                return
            }
        }, false)
    }
    clear = () => {
        this.setState({ blob: "" })
    }
    UNSAFE_componentWillReceiveProps (nextProps) {
        this.addMsg(nextProps)
        this.findLog(nextProps)
    }
    findLog (props) {
        let log = ""
        let { isFind } = this.state
        const { chatsActive, chatLog, dispatch } = props
        this.setState({ isFind: chatsActive })
        if (isFind !== chatsActive) {
            if (chatLog && chatLog.length > 0) {
                const index = chatLog.findIndex((item) => item.id === chatsActive)
                if (index !== -1) {
                    log = chatLog[index].log
                }
                this.setState({ messageLog: log })
                dispatch({ type: "chat/clearKsy" })
            }
        }
    }
    componentDidUpdate () {
        this.setFocus()
    }
    setFocus = () => {
        const { chatsActive } = this.props
        if (chatsActive !== chat) {
            this.setState({ textareaFocus: true })
            chat = chatsActive
        }
        const { textareaFocus } = this.state
        if (textareaFocus) {
            this.input.focus()
        }
    }
    delFocus = () => {
        const { messageLog } = this.state
        const { dispatch, chatsActive } = this.props
        if (messageLog) {
            dispatch({ type: "chat/saveChatLog", payload: { chat: chatsActive, log: messageLog } })
        } else {
            dispatch({ type: "chat/clearChatLog", payload: chatsActive })
        }
        this.setState({ textareaFocus: false })
    }
    getFocus = () => {
        this.setState({ textareaFocus: true })
        this.props.dispatch({ type: "chat/cancleFouc", payload: { value: true } })
    }
    addMsg = (e) => {
        const { messageLog } = this.state
        const { dispatch } = this.props
        const { type, addText, addTime } = e
        if (type && addText && addTime) {
            if (type === "ksy" && addTime !== ksyTime) {
                ksyTime = addTime
                if (addText.type === "1") {
                    dispatch({ type: "chat/changeChatLog", payload: { ...e, addText: addText.content } })
                    this.getFocus()
                    this.setState({ messageLog: messageLog + addText.content })
                } else if (addText.type === "3") {
                    const url = addText.content.split("?duration=")
                    const seconds = url[1] ? url[1] : 1
                    this.preparMsg({ type: 3, url: addText.content, seconds })
                } else {
                    if (addText.type === "9") {
                        const blob = addText.content.find((i) => i.type === "2").content
                        const blobText = addText.content.find((i) => i.type === "1").content
                        this.setState({ blob, blobText })
                    } else {
                        this.setState({ blob: addText.content, blobText: "" })
                    }
                }
            } else if (type === "express" && addTime !== expressTime) {
                expressTime = addTime
                dispatch({ type: "chat/changeChatLog", payload: e })
                this.getFocus()
                this.setState({ messageLog: messageLog + addText })
            }
        }
    }
    sendTextMsg = (e, extraMsg) => {
        let { messageLog } = this.state
        messageLog = extraMsg || messageLog
        const { chatsActive, dispatch } = this.props
        if (!messageLog || messageLog.replace(/\s+/g, "").length <= 0) {
            this.setState({ error: true })
            setTimeout(() => {
                this.setState({ error: false })
            }, 1500)
            return
        }
        this.preparMsg({ type: 1, contents: messageLog })
        dispatch({ type: "chat/clearChatLog", payload: chatsActive })
        this.setState({ messageLog: "", listAit: [] })
    }
    // 消息发送封装
    preparMsg = (para) => {
        const { wxidAit } = this.state
        const { chatsActive, chats, auth } = this.props
        const chat = chats.find((item) => item.userid === chatsActive)
        let Remark = []
        let at = ""
        if (wxidAit) {
            wxidAit.map((i) => {
                if (para.contents.indexOf(`@${i.name}`) !== -1) {
                    para.contents = para.contents.replace(`@${i.name}`, "")
                    Remark.push(i.wxid)
                    at = at + `@${i.name}`
                }
            })
        }
        const msg = {
            ...para,
            Remark,
            at,
            tag: chat.wxid,
            device_wxid: chat.kefu_wxid,
            userid: chat.userid,
            remark: chat.remark,
            nick: chat.nick,
            auth: auth.accountnum,
        }
        this.sendMsg(msg)
        this.setState({ wxidAit: [] })
    }
    sendMsg = (msg) => {
        const { dispatch } = this.props
        dispatch({ type: "chat/sendMessage", payload: msg })
        dispatch({ type: "chat/clearKsy" })
    }
    keyDown = (e) => {
        let { selIndex, selKsyItem, listAit } = this.state
        let { kaslst, foucsTip } = this.props
        let len = kaslst.length || listAit.length
        let type = "kaslst"
        if (kaslst.length === 0) {
            kaslst = listAit
            type = "listAit"
        }
        if ((e.ctrlKey || e.shiftKey) && e.keyCode === 13) {
            e.preventDefault()
            let obj = document.getElementById("editIpt")
            let str = "\n"

            if (document.selection) {
                var sel = document.selection.createRange()
                sel.text = str
            } else if (typeof obj.selectionStart === "number" && typeof obj.selectionEnd === "number") {
                var startPos = obj.selectionStart
                var endPos = obj.selectionEnd

                var cursorPos = startPos
                var tmpStr = obj.value
                obj.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length)
                cursorPos += str.length
                obj.selectionStart = obj.selectionEnd = cursorPos
            } else {
                obj.value += str
            }

            this.setState({ messageLog: obj.value })
            this.props.dispatch({ type: "chat/changeChatLog", payload: { type: "", addText: "\n" } })
            return false
        }
        // 快捷语键盘/@事件选择,优先快捷语
        if (len && foucsTip) {
            if (e.keyCode === 40) {
                e.preventDefault()
                selIndex = selIndex === (len - 1) ? 0 : selIndex + 1
                if (type === "listAit") {
                    const ele = document.getElementById("ait")
                    ele.scrollTop = selIndex > 9 ? (ele.scrollTop + 46) : 0
                }
            }
            if (e.keyCode === 38) {
                e.preventDefault()
                if (selIndex === 0 && type === "listAit") {
                    return
                }
                selIndex = selIndex <= 0 ? len - 1 : selIndex - 1
            }
            selKsyItem = kaslst[selIndex]
            if (e.keyCode === 13) {
                if (selKsyItem && (selIndex || (selIndex === 0 && type === "listAit"))) {
                    e.preventDefault()
                    this.selKsy(kaslst[selIndex], type)
                    selIndex = 0
                    selKsyItem = null
                } else {
                    e.returnValue = false
                    e.preventDefault()
                    this.sendTextMsg()
                    selKsyItem = null
                }
            }
            this.setState({ selIndex, selKsyItem })
            return
        }

        if (e.keyCode === 13) {
            e.returnValue = false
            e.preventDefault()
            this.sendTextMsg()
            return false
        }
        if (e.shiftKey && (e.keyCode === 50 || e.keyCode === 229)) { // @
            this.setState({ visibleAit: true })
        }
    }
    changeEditor = (e, b) => {
        let { dispatch } = this.props
        let { listAit, visibleAit, wxidAit } = this.state
        let value = e.target.value
        dispatch({ type: "chat/cancleFouc", payload: { value: true } })
        dispatch({ type: "chat/searchKsy", payload: { value } })

        if (!value.includes("@")) {
            listAit = []
            visibleAit = false
        } else {
            visibleAit && this.loadMore(1, [], value)
        }
        if (wxidAit && wxidAit.length > 0) {
            wxidAit = wxidAit && wxidAit.filter((i) => value.indexOf(`@${i.name}`) !== -1)
        }

        this.setState({ selIndex: 0, selKsyItem: null, messageLog: value, listAit, visibleAit, wxidAit })
    }

    selKsy = (e, type) => {
        let { dispatch, chatsActive, miniList } = this.props
        if (type === "listAit" && typeof e === "object") {
            let { wxidAit, messageLog, startPosition } = this.state
            const ele = document.getElementById("editIpt")
            const start = messageLog.substring(0, startPosition)
            messageLog = start + (e.remark || e.nick) + messageLog.substring(getCursorPos(ele))
            wxidAit.push({ name: (e.remark || e.nick), wxid: e.wxid })
            this.setState({ messageLog, wxidAit, visibleAit: false, listAit: [] })
            return
        }
        // 匹配小程序
        if (e.includes("小程序") && miniList.length) {
            for (let i = 0, len = miniList.length; i < len; i++) {
                let item = miniList[i]
                let title = "小程序:" + item.content.Title
                if (title === e) {
                    this.sendMini(item)
                    break
                }
            }
            return
        }
        this.setState({ messageLog: e })
        dispatch({ type: "chat/saveChatLog", payload: { chat: chatsActive, log: e } })
        dispatch({ type: "chat/clearKsy" })
    }
    // 发送小程序
    sendMini = (item) => {
        this.preparMsg({ type: "7", contents: JSON.stringify(item.content), id: item.msgid })
        this.setState({ messageLog: "" })
    }
    alertMsg = () => {
        message.info("请使用QQ、微信等截图工具截图后粘贴")
    }

    saveInputRef = (input) => (this.input = input)

    loadMore = async (page, list, messageLog) => {
        const { wechatsActive: wxid, chatsActive: userid } = this.props
        let { isLoading, wxidAit, startPosition } = this.state
        list = list || this.state.listAit
        page = list && list.length > 0 ? this.state.page : 1
        messageLog = messageLog || this.state.messageLog
        const ele = document.getElementById("editIpt")
        if (messageLog.charAt(getCursorPos(ele) - 1) === "@") {
            startPosition = getCursorPos(ele)
        }
        const nick = messageLog.substring(startPosition, getCursorPos(ele))
        if (isLoading || wxidAit.findIndex((i) => i.name === nick) !== -1) {
            this.setState({ listAit: [] })
            return
        }
        const option = {
            url: "//wechat.yunbeisoft.com/index_test.php/home/quns/get_qun_friends",
            data: JSON.stringify({ page, wxid, nick, userid }),
        }
        this.setState({ isLoading: true })
        let { data } = await request(option)

        if (data.error) {
            this.setState({ isLoading: false })
            return message.error(data.errmsg)
        }
        let { data: res, hasMore } = data
        if (res && res.length > 0) {
            res = res.filter((i) => i.wxid !== wxid)
            if (list.length > 0) {
                res.map((item) => {
                    if (list.findIndex((li) => li.id === item.id) === -1) {
                        list.push(item)
                    }
                })
            } else {
                list = res
            }
        }
        this.setState({ isLoading: false, hasMore, page: ++page, listAit: list, startPosition })
    }
    onCancelTransfer = async (item) => {
        const { chatsActive: userid, auth, dispatch } = this.props
        if (auth.id === item.from_zid) {
            const { data } = await request({
                url: "//wechat.yunbeisoft.com/index_test.php/home/device/tui_zhuan_friends",
                data: JSON.stringify({ userid }),
            })
            if (data.error) {
                return message.error(data.msg)
            } else {
                dispatch({ type: "chat/upTransfer", payload: { userid, from_zid: "0" } })
            }
        }
    }
    render () {
        const { error, selIndex, messageLog, listAit, hasMore, isLoading } = this.state
        const { recordVisible, changeRecord, chatsActive, chats, dispatch, auth, kaslst, foucsTip } = this.props
        const chat = chats.find((item) => item.userid === chatsActive)
        const { rights } = auth
        let showTools = true
        const url = window.location.href
        if (url.indexOf("jiafen.scrm.la") !== -1) {
            showTools = false
        }
        const pro = document.location.protocol

        return (
            <div
                id="editor"
                className={styles.editor}
                onDragLeave={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
                onDragOver={(e) => e.preventDefault()}
            >
                <div className={styles.edit}>
                    <div className={styles.toolBar}>
                        <div className={styles.leftTools}>
                            <div className={styles.tool}>
                                <Express
                                    send={this.sendMsg}
                                    chat={chat}
                                    dispatch={dispatch}
                                    addMsg={this.addMsg}
                                />
                            </div>
                            <div className={styles.tool}>
                                <SendImg
                                    auth={auth}
                                    send={this.sendMsg}
                                    sendTextMsg={this.sendTextMsg}
                                    chat={chat}
                                    dispatch={dispatch}
                                    blob={this.state.blob}
                                    blobText={this.state.blobText}
                                    clear={this.clear}
                                />
                            </div>
                            {(auth && auth.uid && auth.user && "33" in rights && rights["33"]) && (
                                <div className={styles.tool}>
                                    <Redpackage />
                                </div>
                            )}
                            <div className={styles.tool} title="截图" onClick={this.alertMsg}>
                                <Icon type="scissor" className={styles.rotate} />
                            </div>
                            <div className={styles.tool}>
                                <SendTime />
                            </div>
                            <div className={styles.tool}>
                                <Setdolist chat={chat} />
                            </div>
                            <div className={styles.tool}>
                                <Folder />
                            </div>
                            {showTools && <div className={styles.tool}>
                                <App />
                            </div>}

                            {showTools && auth.uid && <div className={styles.tool}>
                                <Goods />
                            </div>}
                            {showTools && <div className={styles.tool}>
                                <Taobao />
                            </div>}
                            {showTools && auth.uid && <div className={styles.tool}>
                                <Activity />
                            </div>}
                            {showTools && <div className={styles.tool}>
                                <Videos send={this.sendTextMsg} />
                            </div>}
                            {pro === "https:" && <div className={styles.tool}>
                                <Voice />
                            </div>}


                        </div>
                        {chat.from_zid === auth.id && <div className={styles.rightTools} onClick={() => this.onCancelTransfer(chat)}>
                            取消转接
                        </div>}
                        {(chat.zid !== auth.id || chat.from_zid === "0") && <div className={styles.rightTools}>
                            <CustomPop />
                        </div>}
                        {("7" in rights && rights["7"]) &&
                            <div
                                className={classNames([[styles.rightTools], { [styles.recordActive]: recordVisible }])}
                                title={recordVisible ? "关闭聊天记录" : "显示聊天记录"}
                                onClick={changeRecord}
                            >
                                聊天记录
                            </div>
                        }
                    </div>
                    <div className={styles.box}>
                        <TextArea
                            id="editIpt"
                            ref={this.saveInputRef}
                            value={messageLog}
                            onKeyDown={this.keyDown}
                            onChange={this.changeEditor}
                            onBlur={this.delFocus}
                            onClick={this.getFocus}
                        />
                        {!(foucsTip && kaslst && kaslst.length) && chatsActive.includes("q") && <Ait
                            onChangeAit={this.onChangeAit}
                            listAit={listAit}
                            hasMore={hasMore}
                            isLoading={isLoading}
                            loadMore={this.loadMore}
                            selIndex={selIndex}
                            selKsy={this.selKsy}
                        />
                        }

                        {foucsTip && kaslst && kaslst.length ? <EditorTip selIndex={selIndex} ksyLst={kaslst} selKsy={this.selKsy} /> : ""}
                    </div>
                    <div className={styles.bottomBar}>
                        <Popover content="发送内容不能为空" placement="top" autoAdjustOverflow={true} arrowPointAtCenter={true} visible={error}>
                            <Button type="primary" title="按Enter键发送消息，按Ctrl+Enter键换行" onClick={() => this.sendTextMsg()}>
                                发送
                            </Button>
                        </Popover>
                    </div>
                </div>
                <Modal
                    destroyOnClose={true}
                    okText={"发送"}
                    centered={true}
                    closable={false}
                    visible={this.state.visible}
                >
                    <Icon type="file" />
                    <div>文件名称：{this.state.filename}</div>
                    <div>文件类型：{this.state.filetype}</div>
                    <div>文件大小：{this.state.filesize}KB</div>
                </Modal>
            </div>
        )
    }
}
function mapStateToProps (state) {
    const { chatsActive, chats, auth, chatLog, kaslst, kefu, foucsTip, miniList, wechatsActive } = state.chat
    return { chatsActive, chats, auth, chatLog, kaslst, kefu, foucsTip, miniList, wechatsActive }
}
export default connect(mapStateToProps)(Editor)

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
