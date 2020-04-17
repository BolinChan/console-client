import { connect } from "dva"
import styles from "./Header.css"
import groupBy from "lodash/groupBy"
import { Menu, Dropdown, Avatar, Icon, Badge, Tooltip, Popconfirm, Tag } from "antd"
import { NoticeIcon } from "ant-design-pro"
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


const Header = ({ onCancleFoucs, username, delDoList, delSendTime, doList, fetchDoList, sendTime, fetchSendTime, headerActive = 0, auth, dispatch, modalShow, badge, soundSwitch, changeSwitch }) => {
    const noticeData = getNoticeData(sendTime, "sendTime", delSendTime)

    const noticeParam = {
        title: "定时消息",
        emptyText: "暂无定时消息",
        showClear: false,
        emptyImage: "https://gw.alipayobjects.com/zos/rmsportal/HsIsxMZiWKrNUavQUXqx.svg",
    }
    const hasDo = getNoticeData(doList, "doList", delDoList)
    const doListParam = {
        title: "待办事项",
        emptyText: "暂无待办事项",
        showClear: false,
        emptyImage: "https://gw.alipayobjects.com/zos/rmsportal/HsIsxMZiWKrNUavQUXqx.svg",
    }

    const clearAuth = () => {
        dispatch({ type: "chat/logOut" })
    }
    const menu = (
        <Menu>
            <Menu.Item onClick={changeSwitch}>
                <Icon type={soundSwitch ? "sound" : "notification"} theme="outlined" />
                {soundSwitch ? "关闭铃声" : "开启铃声"}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item onClick={clearAuth}>
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
            <div className={styles.logo}>
                <img src={require("../assets/logo.png")} alt="logo" />
            </div>
            <div className={styles.info}>
                <NoticeIcon
                    className={styles.item}
                    onPopupVisibleChange={fetchDoList}
                    bell={
                        <div>
                            <Icon type="clock-circle" />
                            <span style={{ marginLeft: 8, fontSize: 12 }} >待办事项</span>
                        </div>
                    }
                >
                    <NoticeIcon.Tab list={hasDo["待办事项"]} {...doListParam} />
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


                <div className={styles.item} title="更新日志" onClick={modalShow}>
                    <Badge dot={badge}>
                        <Icon type="bell" />
                    </Badge>
                    <span style={{ marginLeft: 8, fontSize: 12 }}>更新日志</span>
                </div>
                <Tooltip arrowPointAtCenter={true} title={tipContent}>
                    <div className={styles.item}>
                        <div className={styles.status}>
                            <Badge status="success" text={`在线：${auth.online_num}`} className={styles.bg} />
                            <Badge status="error" text={`离线：${auth.outline_num}`} className={styles.bg} />
                        </div>
                    </div>
                </Tooltip>
                <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
                    <div className={styles.item}>
                        <Avatar icon="user" style={{ marginRight: "8px" }} src={auth.headimg || "//jutaobao.oss-cn-shenzhen.aliyuncs.com/headimg/default.png"} />
                        {auth.nickname || auth.accountnum}
                    </div>
                </Dropdown>
            </div>
        </div >
    )
}

function mapStateToProps (state) {
    const { headerActive, auth } = state.chat
    return {
        headerActive,
        auth,
    }
}
export default connect(mapStateToProps)(Header)
