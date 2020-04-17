import { connect } from "dva"
import styles from "./Console.css"
import { Component } from "react"
import Message from "./Message"
import { Modal, message, Spin, Button } from "antd"
import request from "../../../utils/request"
import Forward from "../../../components/Forward"
import moment from "moment"
const fakeDataUrl = "//wechat.yunbeisoft.com/index_test.php/home/ziaccount/get_friend_msg"
let chated = ""
let imgStyles
const paddingStyle = { padding: "0" }
let fetchMore = false
let onScrollBottom = false
let onMessLen = 10
class Console extends Component {
    state = {
        scrollHistory: [],
        checkMsg: "",
        previewVisible: false,
        previewImage: "",
        fullImg: false,
        loading: false,
        checkMid: "",
        checkStatus: "",
        videoModal: false,
        videoPic: "",
        videoSrc: "",
        voiceMsgId: "",
        voiceSrc: "",
        forwardMsgId: "",
        isLoading: false,
        forwardVisible: false,
        forwardData: {},

        nomore: 0,

    }
    componentDidMount () {
        document.getElementById("console").addEventListener("scroll", this.onScroll)
    }
    componentWillUnmount () {
        chated = ""
        fetchMore = false
        onScrollBottom = false
        onMessLen = 10
        document.getElementById("console").removeEventListener("scroll", this.onScroll)
    }
    // 消息列表数据
    getMsgData = async (id = "", divs) => {
        const { chatsActive, dispatch } = this.props
        this.setState({ isLoading: true })
        const isGroup = chatsActive.indexOf("q") !== -1
        const option = {
            url: isGroup ? `${fakeDataUrl}_new` : fakeDataUrl,
            data: JSON.stringify({
                id,
                act: "get_friend_msg",
                userid: chatsActive,
                size: 10,
                token: window.sessionStorage.getItem("token"),
            }),
        }
        const { data } = await request(option)
        if (!data.error) {
            await dispatch({
                type: "chat/saveHisMsgs",
                payload: { ...data, userid: chatsActive, id: id },
            })
            if (!data.nomore && divs) {
                this.DoLoadScroll(divs)
            }
            this.setState({ nomore: data.nomore })
            onMessLen = this.props.messages.length

        }
        this.setState({ isLoading: false })
        if (!id) {
            const that = this
            setTimeout(() => {
                that.onBottom()
            }, 100)
        }
        fetchMore = false
        onScrollBottom = false
    }
    componentDidUpdate () {
        this.checkData()
    }
    checkData = async () => {
        const { chatsActive } = this.props
        if (chated !== chatsActive) {
            onMessLen = 10
            fetchMore = false
            onScrollBottom = true
            chated = chatsActive
            await this.getMsgData()

        } else {
            let len = this.props.messages.length
            if (len && len >= 5 && !fetchMore && onMessLen !== len) {
                onMessLen = len
                await this.DoMessScroll(this.props.messages[len - 1])
            }
        }
    }

    // 滚动监听
    onScroll = (e) => {
        const { nomore } = this.state
        const { messages, chats, chatsActive } = this.props
        if (onScrollBottom) {
            return
        }
        const active = chats.find((item) => item.userid === chatsActive)
        const msg = messages.filter((item) => item.userid === chatsActive && item.FriendId === active.wxid)
        if (e.target.scrollTop === 0) {
            if (nomore === 1 || fetchMore) {
                return
            }
            fetchMore = true
            this.getMsgData(msg[0].id, e.target.children)
        }
    }
    // 滚动底部
    onBottom = () => {
        const div = document.getElementById("console") || ""
        if (!div) {
            return
        }
        if (div.scrollHeight - div.scrollTop !== div.clientHeight) {
            div.scrollTop = div.scrollHeight
        }
    }
    // 滚动加载时处理滚动条位置
    DoLoadScroll = (divs) => {
        let height = 0
        if (divs) {
            for (let i = 0; i < 10; i++) {
                if (divs[i] && divs[i].scrollHeight) {
                    height += divs[i].scrollHeight
                }
            }
            document.getElementById("console").scrollTop = height
        }
    }

    // 处理发送 接收消息时滚动条位置
    DoMessScroll = (mess) => {
        let div = document.getElementById("console")
        if (mess.status === "0") {
            div.scrollTop = div.scrollHeight
        } else {
            if (div.scrollHeight - div.scrollTop - div.clientHeight < (div.scrollHeight * 0.5) || div.scrollHeight - div.scrollTop - div.clientHeight < 500) {
                setTimeout(() => {
                    div.scrollTop = div.scrollHeight
                }, 300)
            }
        }
    }
    fetchClearPic = async () => {
        const { checkMsg, WeChatId, FriendId } = this.state
        this.setState({ loading: true })
        let option = {
            url: "//wechat.yunbeisoft.com/index_test.php/home/api/getmsg_original_img",
            data: JSON.stringify({ MsgSvrId: checkMsg, WeChatId, FriendId }),
        }
        let { data } = await request(option)
        if (data.error) {
            this.setState({ loading: false })
            return message.error(data.msg)
        }
        this.fetchBigPic(this.state.checkMsg)
        this.setState({ loading: false })

    }
    fetchBigPic = (message_id) => {
        this.props.dispatch({ type: "chat/getBigPic", payload: { message_id } })
    }
    checkPic = (props) => {
        const msg = props.msgId && props.msgId !== "0"
            ? this.props.messages.find((item) => item.msgSvrId === props.msgId)
            : { bigPic: props.url }
        let src = msg.bigPic || msg.url
        src = (src && src.indexOf("qpic.cn") !== -1) ? `http://img-agent.yunbeisoft.com/img?url=${src}` : src
        let ImgObj = new Image()
        ImgObj.src = src
        if (!(ImgObj.width > 0)) {
            this.fetchBigPic(props.msgId)
        }
        ImgObj.onload = () => {
            let height = ImgObj.naturalHeight
            let width = ImgObj.naturalWidth

            if (ImgObj.fileSize > 0 || (height > 0 && width > 0)) {
                const clientWidth = document.body.clientWidth * 0.65
                const clientHeight = document.body.clientHeight * 0.65
                let size = 1
                if (width > clientHeight || height > clientWidth) {
                    if (width > height) {
                        size = clientWidth / width
                    } else if (width === height) {
                        size = clientWidth > clientHeight ? clientHeight / height : clientWidth / width
                    } else {
                        size = clientHeight / height
                    }
                }
                width = width * size
                height = height * size
                imgStyles = { height, width, minWidth: 92 }
                this.setState({
                    checkMsg: props.msgId,
                    previewImage: src,
                    previewVisible: true,
                    fullImg: !msg.bigPic,
                    WeChatId: props.WeChatId,
                    FriendId: props.FriendId,
                })
                this.fetchBigPic(props.msgId)
            } else {
                message.config({ duration: 1 })
                message.error("图片错误")
                return false
            }
        }
    }

    checkVideo = async (props, url) => {
        if (!props) {
            message.error("参数错误")
            return
        }
        if (props === "0") {
            this.setState({ videoModal: true, videoPic: url, videoSrc: url })
            return
        }
        this.setState({ checkMid: props, checkStatus: "loading" })
        if (!url) {
            const msg = this.props.messages.find((item) => item.msgSvrId === props)
            url = msg.url
            if (!msg.bigPic) {
                await this.props.dispatch({ type: "chat/getBigPic", payload: { message_id: props } })
            }
        }
        let that = this
        setTimeout(() => {
            that.setState({ videoModal: true, videoPic: url, videoSrc: url })
        }, 1000)
    }

    closeVideo = () => {
        this.setState({ checkMid: "", checkStatus: "", videoModal: false })
    }
    closePic = () => {
        this.setState({
            checkMsg: "",
            previewVisible: false,
            fullImg: false,
            loading: false,
        })
    }
    palyVoice = (props) => {
        if (!props) {
            return message.error("参数错误，播放失败")
        }
        if (this.state.voiceMsgId === props) {
            this.voiceOver()
        } else {
            const msg = this.props.messages.find((item) => item.id === props)
            this.setState({ voiceMsgId: props, voiceSrc: msg.url })
        }
    }
    voiceOver = () => {
        this.setState({ voiceMsgId: "", voiceSrc: "" })
    }
    editInfo = (e) => {
        const { chatsActive, chats, dispatch } = this.props
        const active = chats.find((item) => item.userid === chatsActive)
        dispatch({
            type: "chat/editInfo",
            payload: { option: "phone", changeValue: e, oldValue: active.phone, wxid: active.wxid, kefu_wxid: active.kefu_wxid },
        })
    }
    collectionMsg = (payload) => {
        if (payload.content) {
            this.props.dispatch({ type: "chat/addCollection", payload })
        }
    }
    changeTabs = () => {
        const { rights } = this.props.auth
        if ("8" in rights && rights["8"]) {
            this.props.dispatch({ type: "chat/changeTabs", payload: "info" })
        }
    }
    addKsy = (e) => {
        let { groupId, text, type, url, seconds } = e
        if (type === "3" && seconds) {
            text = text + `?duration=${seconds}`
        }
        this.props.dispatch({
            type: "chat/addKsy",
            payload: { groupId, title: `一键添加${moment(new Date()).format("YYYY-MM-DD HH:mm:ss")}`, text: type === "1" || type === "3" ? text : url, type },
        })
    }
    cancleFoucs = () => {
        this.props.dispatch({ type: "chat/cancleFouc", payload: { value: false } })
    }
    addCustom = (url) => {
        if (url) {
            this.props.dispatch({ type: "chat/addCustom", payload: { Img: url } })
        }
    }
    // 重发
    reSend = async (payload) => {
        const { chats, chatsActive, dispatch } = this.props
        const chat = chats.find((item) => item.userid === chatsActive)
        let msg = {
            type: payload.type,
            tag: chat.wxid,
            device_wxid: chat.kefu_wxid,
            userid: chat.userid,
            remark: chat.remark,
            nick: chat.nick,
            auth: payload.auth,
        }
        if (payload.text) {
            msg.contents = payload.text
        } else {
            msg.url = payload.url
        }
        // 发送小程序需要带上id
        if (payload.appid && msg.type === "7") {
            msg.id = payload.appid
        }
        await dispatch({ type: "chat/delMess", payload: payload.msgKey })
        dispatch({ type: "chat/sendMessage", payload: msg })
    }
    collectMini = (msgId, index) => {
        const { chatsActive, messages, miniList } = this.props
        const msg = messages.filter((item) => item.userid === chatsActive)
        if (msgId) {
            let lindex = miniList.findIndex((f) => f.msgid === msgId)
            if (lindex === -1) {
                this.props.dispatch({ type: "chat/collectMini", payload: { msgId, item: msg[index] } })
            } else {
                return message.success("已收藏")
            }
        }
    }

    handleStart = (forwardData) => {
        this.setState({ forwardVisible: true, forwardData })
    }
    handleOver = () => {
        this.setState({ forwardVisible: false, forwardData: {} })
    }
    takeMoney = (hid) => {
        this.props.dispatch({
            type: "chat/takeMoney",
            payload: { hid },
        })
    }
    recall = (WeChatId, FriendId, hid) => {
        this.props.dispatch({
            type: "chat/recall",
            payload: { WeChatId, FriendId, hid },
        })
    }
    toText = (id) => {
        this.props.dispatch({
            type: "chat/toText",
            payload: { id },
        })
    }
    onWheel = (e) => {
        e.preventDefault()
        e.stopPropagation()
        let zoom
        try {
            const target = e.currentTarget
            zoom = parseInt(target.style.zoom, 10) || 100
            zoom -= e.deltaY / 12
            if (zoom >= 40) {
                target.style.zoom = zoom + "%"
            }
            return false
        } catch (error) {
            return false
        }
    }
    addGrpFri = (payload) => {
        this.props.dispatch({ type: "chat/addGroupChat", payload })
    }
    hanldOrder = (payload) => {
        this.props.dispatch({ type: "chat/saveOrderVisible", payload })
    }
    render () {
        const { wechats, chatsActive, chats, messages, fastgroup } = this.props
        let isGroup = chatsActive.indexOf("q") !== -1
        const active = chats.find((item) => item.userid === chatsActive)
        const wechat = wechats.find((item) => item.wxid === active.kefu_wxid)
        let msg = messages.filter((item) => item.userid === chatsActive && item.WeChatId === active.kefu_wxid)
        if (msg && msg.length > 0) {
            msg.sort((a, b) => new Date(a.addtime).getTime() - new Date(b.addtime).getTime())
        }
        const { previewVisible, previewImage, isLoading, forwardVisible, forwardData, checkMsg, loading } = this.state
        return (
            <div
                id="console"
                className={styles.console}
                ref={(ref) => (this.scrollList = ref)}
                onClick={this.cancleFoucs}
            >
                {isLoading && <Spin className={styles.statusBox} />}
                {msg.length > 0 && msg.map((item, index) =>
                    <Message
                        addGrpFri={this.addGrpFri}
                        Thumb={item.Thumb}
                        forward={this.handleStart}
                        appid={item.appid ? item.appid : ""}
                        key={index}
                        msgKey={index}
                        userid={item.userid}
                        text={item.text || item.text2}
                        type={item.type}
                        url={item.url}
                        bigPic={item.bigPic}
                        status={item.status}
                        is_fail={item.is_fail}
                        tmpstatus={item.tmpstatus}
                        msgId={item.message_id}
                        addtime={item.addtime}
                        seconds={item.seconds}
                        auth={item.accountnum}
                        messageId={item.id}
                        headimg={!isGroup ? active.headImg : item.headImg}
                        nickname={!isGroup ? "" : item.remark || item.nickname || item.wxid}
                        isGroup={isGroup}
                        wechat={wechat}
                        reSend={this.reSend}
                        checkPic={this.checkPic}
                        checkVideo={this.checkVideo}
                        checkMid={this.state.checkMid}
                        checkStatus={this.state.checkStatus}
                        palyVoice={this.palyVoice}
                        voiceMsgId={this.state.voiceMsgId}
                        bindPhone={this.editInfo}
                        hanldOrder={this.hanldOrder}
                        collectionMsg={this.collectionMsg}
                        changeTabs={this.changeTabs}
                        fastWord={fastgroup}
                        addKsy={this.addKsy}
                        addCustom={this.addCustom}
                        collectMini={this.collectMini}
                        WeChatId={item.WeChatId}
                        FriendId={item.FriendId}
                        msgSvrId={item.msgSvrId}
                        wxid={item.wxid || ""}
                        takeMoney={this.takeMoney}
                        recall={this.recall}
                        money={item.money}
                        onpened={item.redpack_status}
                        zhuang_type={item.zhuang_type}
                        is_call_back={item.is_call_back}
                        vtt={item.toText}
                        toText={this.toText}
                    />)}
                <Modal
                    style={imgStyles}
                    wrapClassName={styles.modalCenter}
                    bodyStyle={paddingStyle}
                    visible={previewVisible}
                    footer={null}
                    onCancel={this.closePic}
                    className={styles.toaseImage}
                    closable={false}
                    destroyOnClose
                >
                    <Spin spinning={loading}>
                        <img
                            src={previewImage}
                            alt="图片"
                            style={imgStyles}
                            onWheel={(e) => this.onWheel(e)}
                        />
                        {!!Number(checkMsg) &&
                            <Button
                                className={styles.clearPic}
                                type="primary"
                                size="small"
                                onClick={this.fetchClearPic}
                            >
                                查看原图
                            </Button>
                        }
                    </Spin>
                </Modal>
                <Forward
                    visible={forwardVisible}
                    status={2}
                    data={forwardData}
                    over={this.handleOver}
                />
                <Modal
                    style={imgStyles}
                    wrapClassName={styles.modalCenter}
                    bodyStyle={paddingStyle}
                    visible={this.state.videoModal}
                    footer={null}
                    onCancel={this.closeVideo}
                    className={styles.toaseImage}
                    closable={false}
                    destroyOnClose={true}
                >
                    <video
                        id="video"
                        src={this.state.videoSrc}
                        autoPlay={true}
                        controls={true}
                        poster={this.state.videoPic}
                        preload="auto"
                        webkit-playsinline="true"
                        playsInline={true}
                        x-webkit-airplay="allow"
                        x5-video-player-type="h5"
                        x5-video-player-fullscreen="true"
                        x5-video-orientation="portraint"
                        style={{ objectFit: "fill" }}
                    >
                    </video>
                </Modal>
                {this.state.voiceSrc &&
                    <audio controls={false} onEnded={this.voiceOver} autoPlay={true}>
                        <source src={this.state.voiceSrc || ""} />
                    </audio>
                }
            </div >
        )
    }
}
function mapStateToProps (state) {
    const { wechats, wechatsActive, chatsActive, chats, messages, fastgroup, auth, miniList } = state.chat
    return { wechats, wechatsActive, chatsActive, chats, messages, fastgroup, auth, miniList }
}
export default connect(mapStateToProps)(Console)
