import { connect } from "dva"
import { Component } from "react"
import classNames from "classnames"
import styles from "./Moments.css"
import { Icon, Button, Modal, Input, Spin, Row, Col, List } from "antd"
import InfiniteScroll from "react-infinite-scroller"
import MomentLink from "./MomentLink"
import { textParse } from "../../../utils/helper"
import Express from "./Express"
import request from "../../../utils/request"
import moment from "moment"
const { TextArea } = Input
let imgStyles
let fetch = false
let isPage = 0
let hasMore = true
let selChat = ""
let loadUrl = "//wechat.yunbeisoft.com/index_test.php/home/FriendPengyouquan/friendPengyouquanList"
const idp = "//qn.fuwuhao.cc/idp.png"
class Moments extends Component {
    state = {
        isLoading: false,
        videoVisible: false,
        url: "",
        thumb: "",
        commentVisible: false,
        type: "",
        CircleId: "",
        commentValue: "",
        imgVisible: false,
        selImg: "",
        // new
        hasLoading: false,
    }
    async componentDidMount () {
        isPage = 0
        fetch = false
        hasMore = true
        selChat = this.props.chatsActive
        await this.props.dispatch({ type: "chat/clearMoments" })
        this.initPath()
    }
    async UNSAFE_componentWillReceiveProps (nextProps) {
        const { dispatch } = this.props
        if (selChat !== nextProps.chatsActive) {
            isPage = 0
            fetch = false
            hasMore = true
            selChat = nextProps.chatsActive
            await dispatch({ type: "chat/clearMoments" })
            this.initPath()
        }
    }
    initPath = async () => {
        const { moments, isMoment, stopMoment } = this.props
        if (!stopMoment || isMoment || fetch) {
            return
        }
        fetch = true
        if (hasMore) {
            await this.fetchMore(selChat)
        } else {
            if (moments && moments.length > 0) {
                let StartTime = moments[moments.length - 1].createtime
                await this.catchMore(StartTime, "old")
            }
        }
        fetch = false
    }
    // 获取按钮最新
    updateNew = () => {
        this.scrollList.scrollTop = 0
        let StartTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        this.catchMore(StartTime, "new")
    }
    // 下拉加载更多
    fetchMore = async (userid) => {
        await this.setState({ hasLoading: true })
        isPage = isPage + 1
        let option = {
            url: loadUrl,
            data: JSON.stringify({ userid, token: window.sessionStorage.getItem("token"), page: isPage }),
        }
        let { data } = await request(option)
        if (!data.error) {
            hasMore = data.hasMore
            this.props.dispatch({ type: "chat/saveMoments", payload: { list: data.data } })
        } else {
            hasMore = false
        }
        this.setState({ hasLoading: false })
    }
    // 发送指令获取
    catchMore = (StartTime, type) => {
        const { chatsActive, dispatch } = this.props
        dispatch({ type: "chat/momentsUpdate", payload: { userid: chatsActive, StartTime, type } })
    }
    checkVideo = ({ url, thumb }) => () => {
        this.setState({ videoVisible: true, url, thumb })
    }
    onCancel = () => {
        this.setState({ imageVisible: false, videoVisible: false, thumb: "", commentVisible: false })
    }
    doLike = (item, isLiked, active) => {
        const { chatsActive, wechats } = this.props
        const wechat = wechats.find((item) => item.wxid === active.kefu_wxid)
        let payload = {
            userid: chatsActive,
            CircleId: item.CircleId,
            IsCancel: isLiked ? 1 : 0,
            FriendId: active.kefu_wxid,
            nickname: wechat.nickname,
        }
        this.props.dispatch({ type: "chat/doLike", payload })
    }
    doComment = (item, type) => {
        let payload = {
            type,
            CircleId: item.CircleId,
            WeChatId: item.WeChatId,
            FriendId: item.FriendId,
        }
        this.setState({ selComment: payload, commentVisible: true })
    }
    changeComment = (e) => {
        this.setState({ commentValue: e.target.value })
    }
    addExpress = (payload) => {
        this.setState({ commentValue: this.state.commentValue + payload.addText })
    }
    submitComment = () => {
        const { selComment, commentValue } = this.state
        if (selComment && commentValue) {
            this.props.dispatch({ type: "chat/doComment", payload: { ...selComment, Content: commentValue } })
            this.setState({ commentVisible: false, commentValue: "" })
        }
    }
    delComment = (item) => {
        let payload = {
            WeChatId: item.FriendId,
            id: item.id,
            CircleId: item.CircleId,
        }
        this.props.dispatch({ type: "chat/delComment", payload })
    }
    getImg = (item) => {
        let payload = {
            WeChatId: item.WeChatId,
            CircleId: item.CircleId,
        }
        this.props.dispatch({ type: "chat/getMomentImg", payload })
    }
    replayComment = (comments, comment) => {
        if (comment.ReplyCommentId !== "0") {
            let index = comments.findIndex((item) => item.CommentId === comment.ReplyCommentId)
            if (index !== -1) {
                let name = comments[index].nickname || comments[index].WeChatId
                return (
                    <span> 回复了<a
                        className={styles.text}
                        dangerouslySetInnerHTML={{ __html: textParse(name) }}
                    /></span>

                )
            }
        }
    }
    preImgLst = (imgLst, item) => (
        <Spin spinning={item.imgLoad}>
            <Row gutter={24}>
                {imgLst.map((img, index) => {
                    if (img) {
                        return (
                            <Col key={index} span={8}>
                                <img
                                    alt="图片"
                                    style={{ cursor: "pointer", width: 80, height: 80, marginBottom: 10 }}
                                    src={img || idp}
                                    onClick={() => this.preView(img)}
                                />
                            </Col>
                        )
                    } else {
                        return (
                            <Col key={index} span={8}>
                                <Icon
                                    style={{
                                        cursor: "pointer",
                                        width: 80,
                                        height: 80,
                                        marginBottom: 10,
                                    }}
                                    onClick={() => this.getImg(item)}
                                    key={index}
                                    type="picture"
                                    className={styles.loadImg}
                                />
                            </Col>
                        )
                    }
                })}
            </Row>
        </Spin>
    )
    preView = (item) => {
        const { imgVisible } = this.state
        this.setState({ imgVisible: !imgVisible, selImg: item })
    }
    render () {
        const { imgVisible, selImg, videoVisible, thumb, url, commentVisible, commentValue, hasLoading } = this.state
        const { moments, chatsActive, momentsUpdate, chats, isMoment } = this.props
        let isLoading = false
        if (momentsUpdate && momentsUpdate.length) {
            let index = momentsUpdate.findIndex((item) => item.userid === chatsActive)
            isLoading = index !== -1 ? momentsUpdate[index].isUpdate : false
        }
        let list = []
        if (moments.length) {
            list = moments.filter((item) => item.userid === chatsActive) || []
        }
        const active = chats.find((item) => item.userid === chatsActive)
        const modalProps = {
            closable: false,
            destroyOnClose: true,
            footer: null,
            onCancel: this.onCancel,
            className: styles.modalBox,
            wrapClassName: styles.modalCenter,
            bodyStyle: { padding: 0 },
            style: imgStyles,
        }
        return (
            <div className={styles.container} >
                <div className={styles.header}>
                    <Button type="primary" onClick={this.updateNew} loading={isLoading}>加载最新</Button>
                </div>
                <div className={styles.content} ref={(ref) => this.scrollList = ref}>
                    <InfiniteScroll
                        initialLoad={false}
                        pageStart={0}
                        loadMore={this.initPath}
                        hasMore={true}
                        useWindow={false}
                    >
                        <List
                            dataSource={list}
                            renderItem={(item) => {
                                let [
                                    time,
                                    link,
                                    images,
                                    video,
                                    likes,
                                    comments,
                                ] =
                                    [
                                        item.creTime,
                                        item.Link,
                                        item.Images,
                                        item.Video,
                                        item.dianzan_list,
                                        item.comment_list,
                                    ]
                                let isLiked = likes.findIndex((like) => like.FriendId === active.kefu_wxid) !== -1
                                return (
                                    <List.Item key={item.CircleId}>
                                        <div className={styles.item} key={item.CircleId}>
                                            <div style={{ display: "flex" }}>
                                                <div style={{ display: "flex", flexDirection: "column", marginRight: 15 }}>
                                                    <strong style={{ fontSize: 24, color: "#000" }}>{time[2]}</strong>
                                                    <span>{time[1] + "/" + time[0]}</span>
                                                </div>
                                                <div className={styles.mainItem}>
                                                    <span className={classNames([[styles.contents], [styles.text]])} dangerouslySetInnerHTML={{ __html: textParse(item.contents) }} />
                                                    {link && <MomentLink {...link} />}
                                                    {video &&
                                                        <div className={styles.video} onClick={this.checkVideo({ url: video.Url, thumb: video.ThumbImg })}>
                                                            <div className={styles.wrap}>
                                                                <Icon type="play-circle" />
                                                            </div>
                                                            <img src={video.ThumbImg} alt="thumb" />
                                                        </div>
                                                    }
                                                    {/* 图片 */}
                                                    {!link && images && images.length > 0 && this.preImgLst(images, item)}

                                                    <div style={{ height: 35 }}></div>
                                                    <div className={styles.action}>
                                                        <a style={{ marginRight: 10 }} onClick={() => this.doLike(item, isLiked, active)}><Icon type="heart" /> {isLiked ? "取消" : "赞"}</a>
                                                        <a onClick={() => this.doComment(item, 0)}><Icon type="message" /> 评论</a>
                                                    </div>
                                                </div>
                                            </div>
                                            {(likes.length > 0 || comments.length > 0) &&
                                                <div className={styles.interactive}>
                                                    <span className={styles.triangle} />
                                                    {likes && likes.length > 0 &&
                                                        <div className={styles.interactiveItem}>
                                                            <Icon type="heart" style={{ color: "#1890ff", marginRight: 8, fontSize: 12 }} />
                                                            {likes.map((like, index) =>
                                                                <span key={index}>
                                                                    {index + 1 === likes.length
                                                                        ? <a className={styles.text} dangerouslySetInnerHTML={{ __html: textParse(like.nickname || like.FriendId) }} />
                                                                        : <span>
                                                                            <a className={styles.text} dangerouslySetInnerHTML={{ __html: textParse(like.nickname || like.FriendId) }} />，
                                                                        </span>
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    }
                                                    {comments && comments.length > 0 &&
                                                        <div className={styles.interactiveItem}>
                                                            {comments.map((comment) =>
                                                                <div key={comment.CommentId}>
                                                                    <a className={styles.text} dangerouslySetInnerHTML={{ __html: textParse(comment.nickname || comment.FriendId) }}
                                                                    />{this.replayComment(comments, comment)}：<span
                                                                        className={styles.text}
                                                                        dangerouslySetInnerHTML={{ __html: textParse(comment.content) }}
                                                                    />
                                                                    {comment.FriendId === active.kefu_wxid &&
                                                                        <a style={{ marginLeft: 8 }}
                                                                            onClick={() => this.delComment(comment)}
                                                                        >删除</a>
                                                                    }
                                                                    {comment.FriendId !== active.kefu_wxid && <a
                                                                        style={{ marginLeft: 8 }}
                                                                        onClick={() => this.doComment(comment, 1)}
                                                                    >回复</a>
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    }
                                                </div>
                                            }
                                        </div>
                                    </List.Item>
                                )
                            }}
                        >
                            {(isMoment || hasLoading) && (
                                <div className={styles.loadingcontainer}>
                                    <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} />} />
                                </div>
                            )}

                        </List>
                    </InfiniteScroll>


                    <Modal
                        visible={imgVisible}
                        footer={null}
                        destroyOnClose={true}
                        keyboard={true}
                        onCancel={() => this.preView("")}
                        closable={false}
                        className={styles.modalBox}
                        wrapClassName={styles.modalCenter}
                        bodyStyle={{ padding: 0 }}
                        style={imgStyles}
                    >
                        <img src={selImg} alt="图片" style={{ width: "100%" }} onClick={() => this.preView("")} />
                    </Modal>

                    <Modal visible={videoVisible} {...modalProps} >
                        <video
                            id="video"
                            src={url}
                            autoPlay={true}
                            controls={true}
                            poster={thumb}
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
                    <Modal
                        visible={commentVisible}
                        onCancel={this.onCancel}
                        closable={false}
                        destroyOnClose={true}
                        onOk={this.submitComment}
                    >
                        <div className={styles.toolBar}>
                            <Express addMsg={this.addExpress} />
                        </div>
                        <TextArea
                            ref={(input) => (this.input = input && input.focus())}
                            id="commentEditer"
                            value={commentValue}
                            onChange={this.changeComment}
                        />
                    </Modal>
                </div>
            </div >
        )
    }
}
function mapStateToProps (state) {
    const { moments, chatsActive, chats, wechats, momentsUpdate, isMoment, stopMoment } = state.chat
    return { moments, chatsActive, chats, wechats, momentsUpdate, isMoment, stopMoment }
}
export default connect(mapStateToProps)(Moments)
