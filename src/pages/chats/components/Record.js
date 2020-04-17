import { Component } from "react"
import { connect } from "dva"
import styles from "./Record.css"
import { Tabs, Spin, Avatar, Modal, message, Empty, Tooltip, Icon, Button, Checkbox } from "antd"
import { textParse } from "../../../utils/helper"
import { Ellipsis } from "ant-design-pro"
import request from "../../../utils/request"
const TabPane = Tabs.TabPane
let active = ""
let imgStyles
const paddingStyle = { padding: "0" }
const idp = "//qn.fuwuhao.cc/idp.png"
class Record extends Component {
    state = {
        tabActive: "all",
        previewVisible: false,
        previewImage: "",
        msgIds: [],
    }
    componentDidMount () {
        this.getRecord(this.props)
    }
    componentDidUpdate () {
        this.getRecord(this.props)
    }
    getRecord = (props) => {
        const { chatsActive, records, dispatch } = props
        if (chatsActive !== active) {
            active = chatsActive
            const index = records.findIndex((item) => item.userid === chatsActive)
            if (index === -1) {
                dispatch({ type: "chat/fetchRecords" })
            }
        }
    }
    getMore = () => {
        const { dispatch } = this.props
        dispatch({ type: "chat/fetchRecords" })
    }
    changeTab = (key) => {
        this.setState({ tabActive: key })
    }
    checkPic = (url) => () => {
        let src = url && url.url ? url.url : url
        let ImgObj = new Image()
        ImgObj.src = src
        let height = ImgObj.height * 0.8
        let width = ImgObj.width * 0.8
        imgStyles = { height, width }
        if (ImgObj.fileSize > 0 || (ImgObj.width > 0 && ImgObj.height > 0)) {
            this.setState({
                previewImage: src,
                previewVisible: true,
            })
        } else {
            message.config({ duration: 1 })
            message.error("图片错误")
            return false
        }
    }
    closePic = () => this.setState({ previewVisible: false })
    // 图片消息
    picEle = (re) => (
        <div className={styles.imgBox} onClick={this.checkPic(re.url)} title="查看图片">
            <img src={re.url} alt="" />
        </div>
    )
    // 文本消息
    textEle = (re) => (
        <div className={styles.textBox} dangerouslySetInnerHTML={{ __html: textParse(re.text || re.url) }} />
    )
    // 链接消息
    urlMsg = (text) => {
        const msg = text ? JSON.parse(text) : ""
        return (
            <div className={styles.urlBody} >
                <Tooltip title={msg.Title || msg.title} placement="top">
                    <Ellipsis lines={2} className={styles.urlHeader}>{msg.Title || msg.title}</Ellipsis>
                </Tooltip>
                <div className={styles.urlContent}>
                    <Ellipsis lines={2}> {msg.Des || msg.desc}</Ellipsis>
                    <div className={styles.urlThumb}>
                        <Avatar
                            icon="user"
                            shape="square"
                            size="large"
                            src={msg.Thumb || msg.thumb || msg.img_url || idp}
                            alt="Thumb"
                        />
                    </div>
                </div>
            </div>
        )
    }
    // 小程序消息
    appMsg = (text) => {
        const msg = JSON.parse(text)
        return (
            <div className={styles.urlBody}>
                <div className={styles.appHeader}>
                    <img
                        className={styles.appLogo}
                        src={`//wechat.yunbeisoft.com/index_test.php/home/Test/get_img/?url=${encodeURIComponent(msg.Icon)}`}
                        alt="Icon"
                        onError={(e) => e.target.src = idp}
                    />
                    {msg.Source}
                </div>
                <div className={styles.appBody}>
                    <div className={styles.appContent} dangerouslySetInnerHTML={{ __html: textParse(msg.Title) }} />
                    <div className={styles.appImg}>
                        <img
                            src={msg.Thumb || idp}
                            alt="Thumb"
                            onError={(e) => e.target.src = idp}
                        />
                    </div>
                </div>
                <div className={styles.appFooter}>
                    <div className={styles.appTag}>
                        <Icon type="compass" style={{ color: "#1890ff", marginRight: 4 }} />小程序
                    </div>
                </div>
            </div>
        )
    }
    // 名片
    cardMess = (text) => {
        const msg = JSON.parse(text)
        return (
            <div className={styles.urlBody} >
                <div className={styles.cardBody}>
                    <div className={styles.cardThumb}>
                        <Avatar
                            icon="user"
                            shape="square"
                            size="large"
                            src={msg.HeadImg}
                            alt="头像"
                        />
                    </div>
                    <div className={styles.cardTitle}>
                        <div className={styles.cardNick}>
                            <Ellipsis lines={1}>{msg.Nickname}</Ellipsis>
                            {msg.Sex === "1" && <Icon type="man" style={{ color: "#096dd9", marginLeft: 5 }} />}
                            {msg.Sex === "2" && <Icon type="woman" style={{ color: "#fd7e96", marginLeft: 5 }} />}
                        </div>
                        <div className={styles.cardAddress}>
                            {msg.Province && `${msg.Province} - `}{msg.City}
                        </div>
                    </div>
                </div>
                <div className={styles.cardFooter}>
                    <div className={styles.appTag}>
                        <Icon type="user" style={{ color: "#1890ff", marginRight: 4 }} />个人名片
                    </div>
                </div>
            </div>
        )
    }
    unMess = (text) => (<div className={styles.systemMsg} dangerouslySetInnerHTML={{ __html: text }} />)
    upMessage = (type, re) => {
        let mess = ""
        switch (type) {
            case "1":
                mess = this.textEle(re)
                break
            case "2":
                mess = this.picEle(re)
                break
            case "6":
                mess = this.urlMsg(re.text)
                break
            case "7":
                mess = this.appMsg(re.text)
                break
            case "9":
                mess = this.cardMess(re.text)
                break
            default:
                mess = this.unMess("不支持的消息，可在手机上查看")
                break
        }
        return mess
    }
    // 导出全部
    checkAll = async (isAll = false) => {
        const { msgIds } = this.state
        const { chatsActive, chats, wechatsActive, token } = this.props
        const userItem = chats.find((item) => item.userid === chatsActive)
        let option = {
            url: "//wechat.yunbeisoft.com/index_test.php/home/getmsg/export_task_add",
            data: {
                WeChatId: wechatsActive,
                FriendId: userItem.wxid,
                token,
            },
        }
        if (isAll) {
            if (!msgIds.length) {
                return
            }
            option.data.ids = msgIds
        }
        option.data = JSON.stringify(option.data)
        let { data } = await request(option)
        if (!data.error) {
            return message.success("任务正在创建")
        } else {
            return message.error("任务创建失败")
        }
    }
    checkItem = (e) => {
        let { msgIds } = this.state
        let value = e.target.value
        let index = msgIds.findIndex((f) => f === value)
        if (index === -1) {
            msgIds.push(value)
        }
        this.setState({ msgIds })
    }
    getHistoryMsg=async () => {
        const {chats, chatsActive} = this.props
        const chat = chats.find((item) => item.userid === chatsActive)
        let { data } = await request({
            url: "//wechat.yunbeisoft.com/index_test.php/home/device/getHistoryMsg",
            data: JSON.stringify({WeChatId: chat.kefu_wxid, FriendId: chat.wxid}),
        })
        if (data.error) {
            return message.error(data.errmsg)
        }
        message.success("已提交")
    }
    render () {
        const { tabActive, previewVisible, previewImage } = this.state
        const { wechats, chatsActive, chats, records } = this.props
        const index = records.findIndex((item) => item.userid === chatsActive)
        let recordObj
        let imgRecord = []
        if (index !== -1) {
            recordObj = records[index]
            imgRecord = records[index].contents.filter((msg) => msg.type === "2")
        }
        const chat = chats.find((item) => item.userid === chatsActive)
        const wechat = wechats.find((item) => item.wxid === chat.kefu_wxid)
        return (
            <div className={styles.recordBox} id="sidebarR">
                <Tabs activeKey={tabActive} onChange={this.changeTab}>
                    <TabPane tab="全部" key="all" >
                        <div className={styles.planBox}>
                            {index === -1 ? (
                                <div className={styles.noMssg}>
                                    <Spin />
                                </div>
                            ) : recordObj.contents.length <= 0 ? (
                                <div className={styles.noMssg}><Empty /></div>
                            ) : (
                                recordObj.contents &&
                                        recordObj.contents.length > 0 && (
                                    <span>


                                        <div className={styles.header}>

                                            <Button
                                                type="primary"
                                                style={{ marginRight: 15 }}
                                                onClick={() => this.checkAll()}
                                            >
                                                        全部导出
                                            </Button>
                                            <Button
                                                type="primary"
                                                onClick={() => this.checkAll(true)}
                                                style={{ marginRight: 15 }}

                                            >
                                                        导出选中
                                            </Button>
                                            <Button
                                                type="primary"
                                                onClick={this.getHistoryMsg}
                                            >
                                                同步记录
                                            </Button>
                                        </div>

                                        <div className={styles.tabItem} >
                                            {recordObj.contents.map((re, index) => (
                                                <div key={index} >
                                                    <Checkbox value={re.id} onChange={this.checkItem}>选中导出</Checkbox>
                                                    <div className={styles.msgBox}>
                                                        <Avatar size="large" icon="user" src={re.status === "1" ? chat.headImg : wechat.headimg} className={styles.thumb} />
                                                        <div className={styles.msgData}>
                                                            <div className={styles.info}>
                                                                <span>{re.status === "1" ? chat.nick : wechat.nickname}</span>
                                                                <span>{re.addtime}</span>
                                                            </div>
                                                            <div className={styles.msg}>
                                                                {this.upMessage(re.type, re)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {recordObj.nomore ? (
                                                <div className={styles.moreMsgs}>没有更多了</div>
                                            ) : (
                                                <div className={styles.moreMsgs}>
                                                    <a onClick={this.getMore}>加载更多</a>
                                                </div>
                                            )}
                                        </div>

                                    </span>
                                )
                            )}
                        </div>
                    </TabPane>
                    <TabPane tab="图片" key="img" style={{ height: "100%" }}>
                        <div style={{ padding: "0 15px" }}>
                            {imgRecord.length > 0 ? (
                                imgRecord.map((re, index) => (
                                    <div key={index} className={styles.msgBox}>
                                        <Avatar size="large" icon="user" src={re.status === "1" ? chat.headImg : wechat.headimg} className={styles.thumb} />
                                        <div className={styles.msgData}>
                                            <div className={styles.info}>
                                                <span>{re.status === "1" ? chat.nick : wechat.nickname}</span>
                                                <span>{re.addtime}</span>
                                            </div>
                                            <div className={styles.msg}>
                                                {re.type === "1" ? (
                                                    re.text
                                                ) : (
                                                    this.picEle(re)
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.noMssg}><Empty /></div>
                            )}
                        </div>
                    </TabPane>
                </Tabs>
                <Modal
                    style={imgStyles}
                    wrapClassName={styles.modalCenter}
                    bodyStyle={paddingStyle}
                    visible={previewVisible}
                    footer={null}
                    onCancel={this.closePic}
                    className={styles.toaseImage}
                    closable={false}
                >
                    <img style={imgStyles} src={previewImage} alt="图片" />
                </Modal>
            </div>
        )
    }
}
function mapStateToProps (state) {
    const { wechats, wechatsActive, chatsActive, chats, records, token } = state.chat
    return {
        wechats,
        chatsActive,
        chats,
        records,
        wechatsActive,
        token,
    }
}
export default connect(mapStateToProps)(Record)
