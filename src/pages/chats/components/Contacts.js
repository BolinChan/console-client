import { connect } from "dva"
import { Component } from "react"
import styles from "./Contacts.css"
import {
    Avatar,
    Badge,
    Menu,
    Dropdown,
    Tooltip,
    Skeleton,
    Empty,
    Spin,
    Modal,
    Icon,
} from "antd"
import { Ellipsis } from "ant-design-pro"
import moment from "moment"
import InfiniteScroll from "react-infinite-scroller"
import classNames from "classnames"
const confirm = Modal.confirm
const SubMenu = Menu.SubMenu
const IconFont = Icon.createFromIconfontCN({
    scriptUrl: "//at.alicdn.com/t/font_862846_319ufedh24f.js",
})
const iconStyle = {
    size: 19,
    className: styles.icon,
    style: { color: "#f56a00", backgroundColor: "#fde3cf" },
}

let SkeLst = []
for (let i = 0; i < 10; i++) {
    SkeLst.push(
        <Skeleton key={i} avatar={{ shape: "circle" }} paragraph={1} title={false} className="skeletion">
            <div></div>
        </Skeleton>
    )
}
const showConfirm = (name, delFriend, wxid, kefu_wxid) => {
    confirm({
        title: `确认删除${name}吗?`,
        okText: "确认",
        cancelText: "取消",
        maskClosable: true,
        onOk () {
            delFriend({ wxid, kefu_wxid })
        },
    })
}
const Contact = ({
    changeGroup,
    usergroup,
    contacts,
    onClick,
    chatLog,
    active,
    toTop,
    editRemark,
    hasMore,
    load,
    isLoading,
    changeAlter,
    wechats,
    delFriend,
    record,
    scrollTop,
    handleScroll,
    auth,
    onCancelTransfer,
}) => {
    const menu = ({ id, remark, user, name, delFriend }) => {
        if (id.indexOf("q") !== -1) {
            return (
                <Menu>
                    <Menu.Item>
                        <div onClick={() => changeAlter(id, user.isIgnore ? 0 : 1)}>
                            {user.isIgnore ? "打开提醒" : "免打扰"}
                        </div>
                    </Menu.Item>
                    <Menu.Item>
                        <div onClick={() => toTop({ id, type: user.istop })}>
                            {user.istop ? "取消置顶" : "置顶"}
                        </div>
                    </Menu.Item>
                </Menu>
            )
        }
        return (
            <Menu>
                <Menu.Item>
                    <div onClick={() => changeAlter(id, user.isIgnore ? 0 : 1)}>
                        {user.isIgnore ? "打开提醒" : "免打扰"}
                    </div>
                </Menu.Item>
                <Menu.Item>
                    <div onClick={() => toTop({ id, type: user.istop })}>
                        {user.istop ? "取消置顶" : "置顶"}
                    </div>
                </Menu.Item>
                <Menu.Item>
                    <div onClick={() => editRemark({ id, remark })}>
                        修改备注
                    </div>
                </Menu.Item>
                <Menu.Item>
                    <div onClick={() => showConfirm(name, delFriend, user.wxid, user.kefu_wxid)}>删除好友</div>
                </Menu.Item>
                <SubMenu key="sub1" title={<span>移动分组</span>}>
                    {usergroup && usergroup.map((item) => (
                        <Menu.Item
                            disabled={item.id === user.fid}
                            key={item.id}
                            onClick={() => changeGroup(item, user)}
                        >
                            {item.fenzu_name}
                        </Menu.Item>
                    ))}
                </SubMenu>
            </Menu>
        )
    }
    const lists = ({ list, type = "all" }) => {
        if (list && list.length > 0) {
            return (
                <div className={styles.list}>
                    {list.map((item) => {
                        let nick = item.remark || item.nick || item.wxid
                        if (item && "quns" in item && item.quns) {
                            nick += ` (${item.quns})`
                        }
                        let log = ""
                        if (chatLog && chatLog.length > 0) {
                            let index = chatLog.findIndex((it) => it.id === item.userid)
                            log = index !== -1 ? chatLog[index].log : ""
                        }
                        let lastMsg = item.lastMsg && item.lastMsg.replace("", "[未知表情]")

                        if (item.lastMsgs && item.lastMsgs.includes("[文件]")) {
                            lastMsg = "[文件]"
                        }
                        if (lastMsg && lastMsg.indexOf("a_base64dddyunbei->") !== -1) {
                            lastMsg = lastMsg.replace("a_base64dddyunbei->", "")
                            lastMsg = decodeURIComponent(escape(window.atob(lastMsg)))
                        }
                        let lastMsgTime = item.lastMsgTime ? moment(item.lastMsgTime, "YYYY-MM-DD HH:mm:ss").fromNow() : ""
                        let kefuNick = ""
                        let devicename = ""
                        let deviceremark = ""
                        let weIndex = wechats.findIndex((wechat) => wechat.wxid === item.kefu_wxid)
                        if (weIndex !== -1) {
                            kefuNick = wechats[weIndex].nickname
                            devicename = wechats[weIndex].devicename
                            deviceremark = wechats[weIndex].remark
                        }
                        const tip = (
                            <div className={styles.tip}>
                                <p>备注：{item.remark}</p>
                                <p>地区：{item.Province ? `${item.Province} ` : ""}{item.city}</p>
                                <p>添加时间：{item.createtime}</p>
                                <p>手机号码：{item.phone}</p>
                                <p>旺旺号：{item.buyer_name}</p>
                                <p>备忘录：{item.record}</p>
                                <p>居住地址：{item.address}</p>
                                <p>所属微信：{kefuNick || "未知"}</p>
                                <p>所属设备：{devicename || "未知"} {deviceremark && `(${deviceremark})`}</p>
                            </div>
                        )
                        return (
                            <Dropdown
                                trigger={["contextMenu"]}
                                overlay={menu({ id: item.userid, remark: item.remark || "", user: item, name: nick, delFriend })}
                                key={item.userid}
                            >
                                <Tooltip placement="right" mouseEnterDelay={0.6} title={tip}>
                                    <div
                                        onClick={() => onClick(item.userid, item.kefu_wxid)}
                                        className={type !== "all"
                                            ? (active === item.userid ? styles.topActive : styles.topItem)
                                            : (active === item.userid ? styles.active : styles.item)
                                        }
                                    >
                                        <div className={styles.contact}>
                                            <div className={styles.avatar}>
                                                <Badge
                                                    count={active === item.userid
                                                        ? 0
                                                        : Number(item.unread) > 0
                                                            ? item.unread
                                                            : 0
                                                    }
                                                    dot={!!item.isIgnore}
                                                >
                                                    <Avatar size="large" icon="user" src={item.headImg} />
                                                </Badge>
                                            </div>
                                            <div className={styles.info}>
                                                <div className={styles.line}>
                                                    <div className={classNames([[styles.content], [styles.nick]])}>
                                                        <Ellipsis lines={1}>
                                                            {item.from_zid !== "0" && auth && <IconFont
                                                                type={
                                                                    item.from_zid === auth.id
                                                                        ? "icon-Icon-zhuanchu"
                                                                        : item.zid === auth.id ? "icon-Icon-zhuanru" : ""
                                                                }
                                                                title={item.from_zid === auth.id
                                                                    ? "转出的好友"
                                                                    : item.zid === auth.id ? "转入的好友" : ""}
                                                                style={{
                                                                    fontSize: "18px", verticalAlign: "middle", marginRight: 4,
                                                                }}

                                                            />}
                                                            {nick}
                                                        </Ellipsis>
                                                    </div>
                                                    <div className={classNames([[styles.extra], [styles.lastTime]])}>
                                                        {lastMsgTime}
                                                    </div>
                                                </div>
                                                <div className={styles.line}>
                                                    <div className={classNames([[styles.content], [styles.lastMsg]])}>
                                                        <Ellipsis lines={1}>
                                                            {active === item.userid
                                                                ? (lastMsg || <span>&nbsp;</span>)
                                                                : (log !== "" && log.replace(/\s+/g, "").length > 0
                                                                    ? <span><span className={styles.log}>[草稿]</span>{log}</span>
                                                                    : lastMsg || <span>&nbsp;</span>
                                                                )
                                                            }
                                                        </Ellipsis>
                                                    </div>
                                                    <div className={classNames([[styles.extra], [styles.newMsg]])}>
                                                        {item.hasTime && <Avatar {...iconStyle}>定</Avatar>}
                                                        {item.hasPending && <Avatar {...iconStyle}>待</Avatar>}
                                                        {item.hasTag && <Avatar {...iconStyle}>标</Avatar>}
                                                        {item.hasGroup && <Avatar {...iconStyle}>组</Avatar>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Tooltip>
                            </Dropdown>
                        )
                    })}
                </div>
            )
        } else {
            return null
        }
    }
    let chats = []
    let toppings = []
    for (let i = 0, len = contacts.length; i < len; i++) {
        let item = contacts[i]
        item.istop ? toppings.push(item) : chats.push(item)
    }
    return (
        <div
            id="chats"
            className={styles.container}
        // ref={(ref) => this.scrollParentRef = ref}
        >
            {record
                ? <div
                    className={styles.floatBtn}
                    onClick={() => handleScroll(record)}
                >
                    <Icon type="caret-down" style={{ color: "rgb(255,255,255)" }} />
                </div>
                : null
            }
            {(contacts.length === 0 && isLoading)
                ? SkeLst
                : <InfiniteScroll
                    initialLoad={true}
                    threshold={500}
                    loadMore={load}
                    hasMore={!isLoading && hasMore}
                    useWindow={false}
                    getScrollParent={() => this.scrollParentRef}
                    loader={
                        <div
                            key={0}
                            className={styles.item}
                            style={{ textAlign: "center" }}
                        >
                            <Spin spinning={true} />
                        </div>
                    }
                >
                    {lists({ list: toppings, type: "top" })}
                    {lists({ list: chats })}
                </InfiniteScroll>
            }
            {contacts.length === 0 && <Empty />}
        </div>
    )
}

class Contacts extends Component {
    componentDidMount () {
        document.getElementById("chats").addEventListener("scroll", this.onScroll)
    }
    componentWillUnmount () {
        document.getElementById("chats").removeEventListener("scroll", this.onScroll)
    }
    onScroll = (e) => {
        let scrollTop = e.target.scrollTop
        this.props.dispatch({
            type: "scroll/updateScrollTop",
            payload: { scrollTop },
        })
    }
    handleScroll = (e) => {
        const div = document.getElementById("chats") || ""
        if (!div) {
            return
        }
        div.scrollTop = e
    }
    render () {
        const { record, scrollTop } = this.props
        return (
            <Contact
                {...this.props}
                record={record}
                scrollTop={scrollTop}
                handleScroll={this.handleScroll}
            />
        )
    }
}

function mapStateToProps (state) {
    const { record, scrollTop } = state.scroll
    return { record, scrollTop }
}
export default connect(mapStateToProps)(Contacts)
