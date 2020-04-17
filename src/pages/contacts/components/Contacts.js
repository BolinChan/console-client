import styles from "./Contacts.css"
import { Avatar, Collapse, Menu, Dropdown, Tooltip, Empty, Spin, Icon } from "antd"
import InfiniteScroll from "react-infinite-scroller"
import { Ellipsis } from "ant-design-pro"
import classNames from "classnames"
import moment from "moment"
const Panel = Collapse.Panel
const SubMenu = Menu.SubMenu
const iconStyle = {
    size: 19,
    className: styles.icon,
    style: { color: "#f56a00", backgroundColor: "#fde3cf" },
}

const Contacts = ({ wechats, fid, hasMore, active, contacts, groups, onClick, changeGroup, taggle, load, isLoading, chatLog, chats, toTop }) => {
    const menu = ({ uid, fid, index }) => (
        <Menu>
            <SubMenu title="移动分组">
                {groups.map((item) => <Menu.Item key={item.fid} disabled={item.fid === fid} onClick={() => changeGroup({ uid, fid: item.fid, index })}>{item.fname || "未分组"}</Menu.Item>)}
            </SubMenu>
        </Menu>
    )
    const beforeToTop = (e, id) => {
        e.stopPropagation()
        toTop(id)
    }
    return (
        <div
            className={styles.container}
            id="contacts"
            ref={(ref) => this.scrollParentRef = ref}
        >
            <InfiniteScroll
                initialLoad={false}
                loadMore={load}
                hasMore={!isLoading && hasMore}
                useWindow={false}
                getScrollParent={() => this.scrollParentRef}
                loader={null}
            >
                {(groups && groups.length > 0) ? (
                    <Collapse bordered={false} accordion onChange={taggle} activeKey={fid}>
                        {groups.map((group, gIndex) => (
                            <Panel
                                key={group.fid}
                                header={
                                    <div className={styles.header}>
                                        {group.fname || "未分组"} ({group.number})
                                        <a onClick={(e) => beforeToTop(e, group.fid)}>置顶</a>
                                    </div>
                                }
                            >

                                {(contacts && contacts.length > 0) ? contacts.map((item) => {
                                    let nick = item.remark || item.nick || item.wxid
                                    let log = ""
                                    if (chatLog && chatLog.length > 0) {
                                        let index = chatLog.findIndex((it) => it.id === item.userid)
                                        log = index !== -1 ? chatLog[index].log : ""
                                    }
                                    let tipObj = item
                                    let member = chats && chats.find((chat) => chat.userid === item.userid) || ""
                                    let lastMsgTime = item.lastMsgTime ? moment(item.lastMsgTime, "YYYY-MM-DD HH:mm:ss").fromNow() : ""
                                    if (member) {
                                        lastMsgTime = member.lastMsgTime ? moment(member.lastMsgTime, "YYYY-MM-DD HH:mm:ss").fromNow() : ""
                                        tipObj = member
                                    }
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
                                            <p>备注：{tipObj.remark}</p>
                                            <p>地区：{tipObj.Province ? `${tipObj.Province} ` : ""}{tipObj.city}</p>
                                            <p>添加时间：{tipObj.createtime}</p>
                                            <p>手机号码：{tipObj.phone}</p>
                                            <p>旺旺号：{tipObj.buyer_name}</p>
                                            <p>备忘录：{tipObj.record}</p>
                                            <p>居住地址：{tipObj.address}</p>
                                            <p>所属微信：{kefuNick || "未知"}</p>
                                            <p>所属设备：{devicename || "未知"} {deviceremark && `(${deviceremark})`}</p>
                                        </div>
                                    )
                                    return (
                                        <Dropdown
                                            trigger={["contextMenu"]}
                                            overlay={menu({ uid: item.userid, fid: item.fid, index: gIndex })}
                                            key={item.userid}
                                        >
                                            <Tooltip placement="right" title={tip}>
                                                <div
                                                    className={active === item.userid ? styles.active : styles.item}
                                                    onClick={() => onClick(item)}
                                                >
                                                    <div className={styles.contact}>
                                                        <div className={styles.avatar}>
                                                            <Avatar
                                                                size="large"
                                                                icon="user"
                                                                src={item.headImg}
                                                            />
                                                        </div>
                                                        <div className={styles.info}>
                                                            <div className={styles.line}>
                                                                <div
                                                                    className={classNames([[styles.content], [styles.nick]])}
                                                                >
                                                                    <Ellipsis lines={1}>{nick}</Ellipsis>
                                                                </div>
                                                                <div
                                                                    className={classNames([[styles.extra], [styles.lastTime]])}
                                                                >
                                                                    {lastMsgTime}
                                                                </div>
                                                            </div>
                                                            <div className={styles.line}>
                                                                <div
                                                                    className={classNames([[styles.content], [styles.lastMsg]])}
                                                                >
                                                                    <Ellipsis lines={1}>
                                                                        {active === item.userid
                                                                            ? (member.lastMsg || item.lastMsg || <span>&nbsp;</span>)
                                                                            : (log !== "" && log.replace(/\s+/g, "").length > 0
                                                                                ? <span><span className={styles.log}>[草稿]</span>{log}</span>
                                                                                : member.lastMsg || item.lastMsg || <span>&nbsp;</span>
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
                                }) : fid && !hasMore && <div className={styles.noData}><Empty /></div>}
                                {isLoading && <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />} style={{ display: "flex", justifyContent: "center", marginBottom: 20 }} />}
                            </Panel>
                        ))}
                    </Collapse>
                )
                    : <div className={styles.noData}><Empty /></div>
                }
            </InfiniteScroll>
        </div >
    )
}
export default Contacts
