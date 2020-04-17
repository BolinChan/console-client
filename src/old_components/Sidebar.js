import { connect } from "dva"
import styles from "./Sidebar.css"
import { Switch, Badge, Icon } from "antd"
const iconStyle = {
    color: "#0093dd",
    fontSize: 24,
}

const Sidebar = ({ sidebarActive = "chats", onClick, menuFold = true, wechats, auth }) => {
    let icons = [
        { type: "chats", title: "聊天", icon: "message", newMsgNum: 0 },
    ]
    const { rights } = auth

    if ("3" in rights && rights["3"]) {
        icons.push({ type: "moments", title: "朋友圈", icon: "compass", newMsgNum: 0 })
    }
    // 客户资料
    if ("49" in rights && rights["49"]) {
        icons.push({ type: "customs", title: "客户资料", icon: "contacts", newMsgNum: 0 })
    }
    let chatsNum = 0
    if (wechats && wechats.length > 0) {
        wechats.map((un) => chatsNum += un.unread)
    }
    icons[0].newMsgNum = chatsNum
    return (
        <nav className={styles.bar}>
            <div className={styles.navs}>
                {icons.map((item) =>
                    <div
                        className={styles.nav}
                        key={item.type}
                        onClick={onClick({ sidebarActive: item.type })}
                        style={{ backgroundColor: sidebarActive === item.type ? "rgba(255,255,255,.7)" : null }}
                    >
                        <div className={styles.iconBox}>
                            <Badge count={(sidebarActive !== "chats" && sidebarActive !== "qun") ? item.newMsgNum : 0}>
                                <Icon
                                    type={item.icon}
                                    style={iconStyle}
                                    theme={sidebarActive === item.type ? "filled" : "outlined"}
                                    className={styles.def}
                                />
                                <Icon
                                    type={item.icon}
                                    style={iconStyle}
                                    theme="filled"
                                    className={styles.hid}
                                />
                            </Badge>
                        </div>
                        <div className={styles.navTitle}>
                            {item.title}
                        </div>
                    </div>
                )}
            </div>
            <div className={styles.bottomSwitch}>
                <Switch checked={menuFold} checkedChildren="开" unCheckedChildren="关" onChange={onClick({ menuFold: !menuFold })} title={menuFold ? "关闭设备" : "显示设备"} />
            </div>
        </nav >
    )
}
function mapStateToProps (state) {
    const { sidebarActive, menuFold, wechats, auth } = state.chat
    return { sidebarActive, menuFold, wechats, auth }
}
export default connect(mapStateToProps)(Sidebar)
