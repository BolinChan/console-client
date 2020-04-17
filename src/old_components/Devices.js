
import { Component } from "react"
import { connect } from "dva"
import styles from "./Devices.css"
import { Avatar, Badge, Tooltip, Dropdown, Menu, message } from "antd"
import classNames from "classnames"
import Unread from "../components/Unread"
import request from "../utils/request"
class Devices extends Component {
    state = {
        checked: false,
        page: 0,
        list: [],
        isLoad: false,
        hasMore: true,
        selWechats: "",
        wechats: "",
    }
    readAll = (wxid) => {
        this.props.dispatch({ type: "chat/readAll", payload: { wxid } })
    }
    syncMess = async (WeChatId = "") => {
        if (!WeChatId) {
            return
        }
        let option = {
            url: "//wechat.yunbeisoft.com/index_test.php/home/device/getHistoryMsg",
            data: JSON.stringify({ WeChatId }),
        }
        let { data } = await request(option)
        if (data.error) {
            return message.error(data.errmsg)
        }
    }
    freshGroup = (wxid) => {
        this.props.dispatch({ type: "chat/freshGroup", payload: { WeChatId: wxid } })
    }
    checkUnread = async (e, wxid) => {
        e.stopPropagation()
        await this.setState({ checked: true, page: 0, selWechats: wxid, list: [], isLoad: false, hasMore: true })
        this.getUnreadLst()
    }
    handleChange = (visible) => {
        if (!visible) {
            this.setState({ checked: false })
        }
    }
    getUnreadLst = async () => {
        let hasLst = []
        let { auth, token } = this.props
        let { hasMore, list, selWechats, page } = this.state
        if (!selWechats) {
            return
        }
        let payload = {
            kefuid: auth.id,
            kefu_wxid: [selWechats],
            token,
        }
        if (hasMore) {
            page = page + 1
            payload.page = page
        }
        await this.setState({ isLoad: true })
        let option = {
            url: "//wechat.yunbeisoft.com/index_test.php/home/api/get_friends_unread",
            data: JSON.stringify(payload),
        }
        let { data } = await request(option)
        if (!data.error) {
            hasLst = data.data
        }
        this.setState({ page, list: [...list, ...hasLst], isLoad: false, hasMore: data ? data.hasMore : false })
    }
    goChat = (item) => {
        const { dispatch } = this.props
        let {list} = this.state
        dispatch({ type: "chat/upUnread", payload: item })
        list = list.filter((i) => i.userid !== item.userid)
        this.setState({list})
    }
    render () {
        const menu = (wxid) => (
            <Menu>
                <Menu.Item>
                    <div onClick={() => this.readAll(wxid)}>全部已读</div>
                </Menu.Item>
                <Menu.Item>
                    <div onClick={() => this.props.forward({ kefu_wxid: wxid })}>消息群发</div>
                </Menu.Item>
                <Menu.Item>
                    <div onClick={() => this.freshGroup(wxid)}>同步群组</div>
                </Menu.Item>
                <Menu.Item>
                    <div onClick={() => this.syncMess(wxid)}>同步历史消息</div>
                </Menu.Item>
            </Menu>
        )
        const { wechatsActive, wechats, onClick, menuFold, sidebarActive } = this.props
        const { checked, list, isLoad, hasMore } = this.state
        return (
            <div className={classNames([[styles.devices], { [styles.hidden]: !menuFold }])}>
                {wechats &&
                    wechats.map((item) => (
                        <Dropdown key={item.wxid} trigger={["contextMenu"]} overlay={menu(item.wxid)}>
                            <Tooltip placement="rightTop" onVisibleChange={(visible) => this.handleChange(visible)} title={checked
                                ? <Unread
                                    unreadLst={list}
                                    isLoad={isLoad}
                                    hasMore={hasMore}
                                    goChat={this.goChat}
                                    getUnreadLst={this.getUnreadLst}
                                />
                                : <span>
                                    {item.devicename}：{item.nickname}
                                    <div>设备序号：{item.Sort && item.Sort !== "0" ? item.Sort : "未设置"}</div>
                                </span>
                            }
                            mouseEnterDelay={0.6}
                            >
                                <div
                                    onClick={onClick({ wechatsActive: item.wxid })}
                                    className={classNames([[styles.device], { [styles.active]: wechatsActive === item.wxid }])}
                                >
                                    <Avatar src={item.headimg} icon="user" size="large" />
                                    {item.Sort && item.Sort !== "0" && `(${item.Sort})`}{item.nickname || item.wxid}
                                    <div className={styles.badge}>
                                        <Badge count={(sidebarActive === "chats" || sidebarActive === "qun") ? item.unread : 0} onClick={(e) => this.checkUnread(e, item.wxid)} />
                                    </div>
                                </div>
                            </Tooltip>
                        </Dropdown>
                    ))}
            </div>
        )
    }
}
function mapStateToProps (state) {
    const { wechatsActive, wechats, menuFold, sidebarActive, auth, token } = state.chat
    return { wechatsActive, wechats, menuFold, sidebarActive, auth, token }
}
export default connect(mapStateToProps)(Devices)
