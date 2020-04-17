import { connect } from "dva"
import styles from "./Header.css"
import groupBy from "lodash/groupBy"
import { Menu, Dropdown, Avatar, Icon, Badge, Tooltip, Popconfirm, Tag } from "antd"
import { NoticeIcon } from "ant-design-pro"
import Appqrcode from "./Appqrcode"
import SyncHistory from "./SyncHistory"
import Rank from "./Rank"
import PassRes from "./PassRes"
const logo = require("../assets/logo.png")
const logo2 = require("../assets/logo2.png")

function getNoticeData (notices, type, del) {
    if (notices.length === 0) {
        return {}
    }
    const newNotices = notices.map((notice) => {
        const newNotice = { ...notice }
        newNotice.title = (
            <span>
                <Popconfirm title="确定删除吗？" onConfirm={() => del(newNotice.id)}>
                    <Icon type="close-circle" style={{ marginRight: 10 }} />
                </Popconfirm>
                <span>{type === "sendTime" ? newNotice.dingshi_time : newNotice.addTime}</span>
                <span style={{ marginLeft: 5, color: "#1890ff" }}>{newNotice.nick || ""}</span>
            </span>
        )
        newNotice.datetime = type === "sendTime" ? "" : (<div style={{ marginBottom: 10 }}>{newNotice.content}</div>)
        if (type === "sendTime") {
            newNotice.description = (
                <div className={newNotice.type === "1" ? styles.textBox : styles.imgBox}>{newNotice.type === "1" ? newNotice.text : <img src={newNotice.url} alt="预览图" />}</div>
            )
            if (newNotice.status) {
                const color = ({ 0: "", 1: "green" })[newNotice.status]
                newNotice.extra = <Tag color={color} style={{ marginRight: 0 }}>{newNotice.status === "0" ? "未执行" : "已执行"}</Tag>
            }
        }
        newNotice.type = type === "sendTime" ? "待办" : "待办事项"
        if (newNotice.id) {
            newNotice.key = newNotice.id
        }
        return newNotice
    })
    return groupBy(newNotices, "type")
}

const Header = ({
    hasDo,
    onCancleFoucs,
    delDoList,
    delSendTime,
    doList,
    fetchDoList,
    sendTime,
    fetchSendTime,
    headerActive = 0,
    auth,
    dispatch,
    modalShow,
    badge,
    soundSwitch,
    changeSwitch,
    logoKey,
    addNum,
}) => {
    const noticeData = getNoticeData(sendTime, "sendTime", delSendTime)

    const noticeParam = {
        title: "定时消息",
        emptyText: "暂无定时消息",
        showClear: false,
        emptyImage: "https://gw.alipayobjects.com/zos/rmsportal/HsIsxMZiWKrNUavQUXqx.svg",
    }
    const hasMore = getNoticeData(doList, "doList", delDoList)
    const doListParam = {
        title: "待办事项",
        emptyText: "暂无待办事项",
        showClear: false,
        emptyImage: "https://gw.alipayobjects.com/zos/rmsportal/HsIsxMZiWKrNUavQUXqx.svg",
    }
    const toAdmon = () => {
        const token = window.sessionStorage.getItem("token")
        const id = window.sessionStorage.getItem("id")
        const url = logoKey === 1 ? "http://admin.scrm.la" : "//jiafen.admin.scrm.la"
        window.location.href = `${url}/#/home?token=${token}&id=${id}`
    }
    const help = () => {
        const a = document.createElement("a")
        a.target = "_blank"
        a.href = "http://wechat.yunbeisoft.com/index_test.php/Home/Help/index.html"
        a.click()
    }
    const menu = (
        <Menu>
            <Menu.Item onClick={toAdmon}>
                <Icon type="swap" />管理端
            </Menu.Item>
            <Menu.Item onClick={() => dispatch({ type: "chat/changeSkin" })}>
                <Icon type="skin" />切换主题
            </Menu.Item>
            <Menu.Item onClick={changeSwitch}>
                <Icon type={soundSwitch ? "sound" : "notification"} theme="outlined" />
                {soundSwitch ? "关闭铃声" : "开启铃声"}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item onClick={() => dispatch({ type: "chat/logOut" })}>
                <Icon type="logout" theme="outlined" />
                退出登录
            </Menu.Item>
        </Menu>
    )
    const tipContent = (
        <div>
            <div>
                当前在线微信：
                {auth.online_num}
            </div>
            <div>
                当前离线微信：
                {auth.outline_num}
                {auth.out_device && auth.out_device.length > 0 &&
                    <span>({auth.out_device.map((item, index) => <span key={item.id}>【{item.devicename}】</span>)})</span>
                }
            </div>
        </div>
    )

    return (
        <div className={styles.header} onClick={onCancleFoucs}>
            <div className={logoKey === 1 ? styles.logo : styles.logo2}>
                <img src={logoKey === 1 ? logo : logo2} alt="logo" />
            </div>
            <div className={styles.info}>
                <PassRes addNum={addNum} dispatch={dispatch} />
                <Rank />
                <SyncHistory />
                <Appqrcode />
                <div className={styles.item} onClick={toAdmon}>
                    <Icon type="swap" />
                    <span style={{ marginLeft: 8, fontSize: 12 }} >管理端</span>
                </div>
                <NoticeIcon
                    className={styles.item}
                    onPopupVisibleChange={fetchDoList}
                    bell={
                        <div>
                            <Badge dot={hasDo}>
                                <Icon type="clock-circle" />
                            </Badge>
                            <span style={{ marginLeft: 8, fontSize: 12 }} >待办事项</span>
                        </div>
                    }
                >
                    <NoticeIcon.Tab list={hasMore["待办事项"]} {...doListParam} />
                </NoticeIcon>
                <NoticeIcon
                    className={styles.item}
                    onPopupVisibleChange={fetchSendTime}
                    bell={
                        <div>
                            <Icon type="calendar" />
                            <span style={{ marginLeft: 8, fontSize: 12 }} >定时消息</span>
                        </div>
                    }
                    loading={sendTime === ""}
                >
                    <NoticeIcon.Tab list={noticeData["待办"]} {...noticeParam} />
                </NoticeIcon>

                <div
                    className={styles.item}
                    title="更新日志"
                    onClick={modalShow}
                >
                    <Badge dot={badge}>
                        <Icon type="bell" />
                    </Badge>
                    <span style={{ marginLeft: 8, fontSize: 12 }}>更新日志</span>
                </div>
                <div
                    className={styles.item}
                    title="更新日志"
                    onClick={help}
                >
                    <Icon type="question-circle" />
                    <span style={{ marginLeft: 8, fontSize: 12 }}>帮助文档</span>
                </div>
                <Tooltip arrowPointAtCenter={true} title={tipContent}>
                    <div className={styles.item}>
                        <div className={styles.status}>
                            <Badge
                                status="success"
                                text={`在线：${auth.online_num}`}
                                className={styles.bg}
                            />
                            <Badge
                                status="error"
                                text={`离线：${auth.outline_num}`}
                                className={styles.bg}
                            />
                        </div>
                    </div>
                </Tooltip>
                <Dropdown
                    overlay={menu}
                    placement="bottomRight"
                    trigger={["click"]}
                >
                    <div className={styles.item}>
                        <Avatar
                            icon="user"
                            src={auth.headimg || "//jutaobao.oss-cn-shenzhen.aliyuncs.com/headimg/default.png"}
                            style={{ marginRight: 8 }}
                        />
                        {auth.nickname || auth.accountnum}
                    </div>
                </Dropdown>
            </div>
        </div >
    )
}

function mapStateToProps (state) {
    const { headerActive, auth } = state.chat
    return { headerActive, auth }
}
export default connect(mapStateToProps)(Header)
