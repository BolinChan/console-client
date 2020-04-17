import { connect } from "dva"
import { Component } from "react"
import styles from "./page.css"
import moment from "moment"
import { List, Spin, Icon, Button, Radio, message } from "antd"
import MomentsModal from "./components/momentModal"
import MomentLst from "./components/momentView"
import InfiniteScroll from "react-infinite-scroller"
import request from "../../utils/request"
import MomentSend from "./components/momentSend"
import { routerRedux } from "dva/router"

const loadUrl = "//wechat.yunbeisoft.com/index_test.php/home/FriendPengyouquan/devicePengyouquanList"
let fetch = false
let isPage = 0
let hasMore = true
let selwechat = ""
class Page extends Component {
    state = {
        selImg: "",
        imgVisible: false,
        dzLike: false,
        commentVisible: false,
        commentValue: "",
        commentSel: "",
        selPage: 1,
        videoShow: false,
        selType: "0", // 0 所有 1自己
        sendVisible: false,

    }
    // async componentDidMount () {
    //     this.getData(this.props.wechatsActive)
    // }
    UNSAFE_componentWillReceiveProps (nextProps) {
        const { wechatsActive } = nextProps
        if (selwechat !== wechatsActive) {
            this.setState({ selType: "0" })
            this.getData(wechatsActive)
        }
    }
    getData = async (wechatsActive) => {
        isPage = 0
        fetch = false
        hasMore = true
        selwechat = wechatsActive
        await this.props.dispatch({ type: "moment/clearMoments" })
        this.fetchMoments()
    }
    // 数据处理
    fetchMoments = async () => {
        const { dispatch, auth, stopMoment, isMoment, momentLst } = this.props
        if (!selwechat) {
            dispatch({ type: "chat/fetchWechats", payload: { userid: auth.id } })
        }
        if (!stopMoment || isMoment || fetch) {
            return
        }
        fetch = true
        if (!hasMore) {
            await this.fetchMore(selwechat)
        } else {
            let StartTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            if (momentLst && momentLst.length > 0) {
                StartTime = momentLst[momentLst.length - 1].createtime
            }
            await this.catchMore(StartTime, "old")
        }
        fetch = false
    }
    // 下拉加载更多
    fetchMore = async (wechatsActive) => {
        if (!wechatsActive) {
            return
        }
        let list = []
        const { dispatch } = this.props
        let payload = { pageSize: 8, WeChatId: wechatsActive }
        if (this.state.selType === "1") {
            payload.FriendId = wechatsActive
        }
        isPage = isPage + 1
        payload.page = isPage
        await dispatch({ type: "moment/saveMoments", payload: { loading: true, list: [] } })
        let option = {
            url: loadUrl,
            data: JSON.stringify(payload),
        }
        let { data } = await request(option)
        if (!data.error) {
            list = data.data
            hasMore = data.hasMore
        } else {
            list = []
            hasMore = false
        }
        await dispatch({ type: "moment/saveMoments", payload: { list, loading: false } })

    }
    // 发送指令获取
    catchMore = (StartTime, type) => {
        const { selType } = this.state
        const { wechatsActive, dispatch } = this.props
        let payload = {
            type,
            StartTime,
            WeChatId: wechatsActive,
        }
        if (selType === "1") {
            payload.FriendId = wechatsActive
        }
        dispatch({ type: "moment/myMomentUpdate", payload })
    }
    // 更新朋友圈
    updateCheck = async () => {
        this.scrollList.scrollTop = 0
        let StartTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        this.catchMore(StartTime, "new")
    }
    // 点击图片放大
    preView = (item) => {
        const { imgVisible } = this.state
        this.setState({ imgVisible: !imgVisible, selImg: item })
    }
    // 点赞
    dzChange = (item, isLiked) => {
        const { dispatch, wechatsActive, wechats } = this.props
        let tmp = wechats.find((f) => f.wxid === wechatsActive)
        dispatch({ type: "moment/doLike", payload: { nickname: tmp ? tmp.nickname : "", wechatsActive, userid: item.userid, CircleId: item.CircleId, IsCancel: isLiked ? 1 : 0 } })
    }
    // 表情选择
    addExpress = (payload) => {
        this.setState({ commentValue: this.state.commentValue + payload.addText })
    }
    changeComment = (e) => {
        this.setState({ commentValue: e.target.value })
    }
    // 提交评论
    submitComment = () => {
        const { dispatch, wechatsActive, wechats } = this.props
        const { commentSel, commentValue } = this.state
        if (commentSel && commentValue) {
            let tmp = wechats.find((f) => f.wxid === wechatsActive)
            dispatch({ type: "moment/doComment", payload: { nickname: tmp ? tmp.nickname : "", ...commentSel, Content: commentValue } })
            this.setState({ commentVisible: false, commentValue: "" })
        }

    }
    onCancel = (item, type, CommentId) => {
        const { commentVisible } = this.state
        let commentSel = { type, WeChatId: item.WeChatId, CircleId: item.CircleId, FriendId: item.FriendId }
        if (Number(type) === 1) {
            commentSel.ReplyCommentId = CommentId
        }
        this.setState({ commentVisible: !commentVisible, commentValue: "", commentSel })
    }
    delComment = (payload) => {
        this.props.dispatch({ type: "moment/delComment", payload })
    }
    Replay = (list, comment) => {
        if (comment && comment.ReplyCommentId !== "0") {
            let index = list.findIndex((item) => item.CommentId === comment.ReplyCommentId)
            if (index !== -1) {
                let name = list[index].nickname || list[index].WeChatId
                return (
                    <span><span style={{ color: "#333" }}>回复了</span>{name}</span>
                )
            }
        }
    }
    videoModal = (item) => {
        this.setState({ videoShow: true, VideoUrl: item })
    }
    videoHideo = () => {
        this.setState({ videoShow: false })
    }
    getImg = (item) => {
        let payload = {
            WeChatId: item.WeChatId,
            CircleId: item.CircleId,
        }
        this.props.dispatch({ type: "moment/getMomentImg", payload })
    }
    handleChange = async (e) => {
        await this.setState({ selType: e.target.value })
        this.getData(this.props.wechatsActive)
    }
    sendOpen = () => {
        let sendVisible = this.state.sendVisible
        this.setState({ sendVisible: !sendVisible })
    }
    selectChat = async (item) => {
        const { dispatch, chatsActive, wechatsActive } = this.props
        let res = await dispatch({
            type: "chat/fetchUserInfo",
            payload: { wxid: item.FriendId, kefu_wxid: wechatsActive },
        })
        if (res) {
            dispatch(routerRedux.push({ pathname: "/web", query: { p: "chats" } }))
            if (res.userid && res.userid !== chatsActive) {
                dispatch({ type: "chat/upChatsActive", payload: res })
            }
        } else {
            message.error("粉丝不存在")
        }
    }
    render () {
        const { wechats, momentLst, wechatsActive, checkLoading, isMoment, isloading, menuFold } = this.props
        const { selImg, imgVisible, commentVisible, commentValue, videoShow, VideoUrl, selType, sendVisible } = this.state
        let list = []
        let actives = {}
        if (momentLst.length) {
            list = momentLst.filter((item) => item.WeChatId === wechatsActive) || []
        }
        if (selType === "1") {
            list = momentLst.filter((item) => item.FriendId === wechatsActive) || []
            actives = wechats.find((i) => i.wxid === wechatsActive)
        }
        let btnloading = false
        let lIndex = checkLoading.findIndex((item) => item.WeChatId === wechatsActive)
        if (lIndex !== -1) {
            btnloading = checkLoading[lIndex].loading
        }

        return (
            <div className={styles.container} >
                <div style={{ display: "flex", padding: "24px 24px 0 24px" }}>
                    <Radio.Group value={selType} onChange={this.handleChange} style={{ marginRight: 20 }}>
                        <Radio.Button value="0">所有朋友圈</Radio.Button>
                        <Radio.Button value="1">自己朋友圈</Radio.Button>
                    </Radio.Group>
                    <Button style={{ background: "#1890ff", color: "#fff", marginRight: 20 }} type="small" onClick={this.updateCheck} loading={btnloading}>加载最新</Button>
                    {menuFold && <Button style={{ background: "#1890ff", color: "#fff" }} type="small" onClick={this.sendOpen}>发朋友圈</Button>}
                </div>
                <div className={styles.content} ref={(ref) => this.scrollList = ref}>
                    <InfiniteScroll
                        initialLoad={false}
                        pageStart={0}
                        loadMore={this.fetchMoments}
                        hasMore={true}
                        useWindow={false}
                    >
                        <List
                            grid={{ gutter: 16, column: 4 }}
                            dataSource={list}
                            renderItem={(item) => (
                                <List.Item key={item.CircleId}>
                                    <MomentLst
                                        item={item}
                                        actives={actives}
                                        wechatsActive={wechatsActive}
                                        getImg={this.getImg}
                                        preView={this.preView}
                                        videoModal={this.videoModal}
                                        dzChange={this.dzChange}
                                        onCancel={this.onCancel}
                                        delComment={this.delComment}
                                        Replay={this.Replay}
                                        selectChat={this.selectChat}
                                    />
                                </List.Item>
                            )}>

                            {(isMoment || isloading) && (
                                <div className={styles.loadingcontainer}>
                                    <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} />} />
                                </div>
                            )}
                        </List>
                    </InfiniteScroll>

                </div>
                <MomentsModal
                    videoShow={videoShow}
                    VideoUrl={VideoUrl}
                    videoHideo={this.videoHideo}
                    commentValue={commentValue}
                    selImg={selImg}
                    imgVisible={imgVisible}
                    commentVisible={commentVisible}
                    preView={this.preView}
                    addExpress={this.addExpress}
                    onCancel={this.onCancel}
                    submitComment={this.submitComment}
                    changeComment={this.changeComment}
                />
                <MomentSend
                    visible={sendVisible}
                    open={this.sendOpen} />

            </div>
        )
    }
}
function mapStateToProps (state) {
    const { wechatsActive, wechats, auth, menuFold } = state.chat
    const { momentLst, checkLoading, isloading, isMoment, stopMoment } = state.moment
    return {
        auth,
        isMoment,
        stopMoment,
        wechats,
        wechatsActive,
        momentLst,
        checkLoading,
        isloading,
        menuFold,
    }
}

export default connect(mapStateToProps)(Page)
