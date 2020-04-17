import { Component } from "react"
import VirtualizedList from "@dwqs/react-virtual-list"
import { Spin, Avatar, Badge } from "antd"
import { Ellipsis } from "ant-design-pro"
import styles from "./Contacts.css"
import moment from "moment"
import classNames from "classnames"

const onLoading = () => (
    <div className={styles.item} style={{ textAlign: "center" }}>
        <Spin spinning={true} key={0} />
    </div>
)

const iconStyle = {
    size: 19,
    className: styles.icon,
    style: { color: "#f56a00", backgroundColor: "#fde3cf" },
}

let active = ""

export default class Contact extends Component {
    constructor (props) {
        super(props)
        this.renderItem = this.renderItem.bind(this)
        this.load = this.load.bind(this)
    }
    componentDidUpdate = () => {
        const { wechatsActive, load } = this.props
        if (active !== wechatsActive) {
            active = wechatsActive
            load()
        }
    }

    renderItem = ({ index, isScrolling }) => {
        const { contacts, chatLog } = this.props
        const item = contacts[index]
        if (item) {
            let log = ""
            let nick = item.remark || item.nick || item.wxid
            if (item && "quns" in item && item.quns) {
                nick += ` (${item.quns})`
            }
            if (chatLog && chatLog.length > 0) {
                let index = chatLog.findIndex((it) => it.id === item.userid)
                log = index !== -1 ? chatLog[index].log : ""
            }

            let lastMsgTime = item.lastMsgTime ? moment(item.lastMsgTime, "YYYY-MM-DD HH:mm:ss").fromNow() : ""
            let lastMsg = item.lastMsg && item.lastMsg.replace("", "[未知表情]")

            if (item.lastMsgs && item.lastMsgs.includes("[文件]")) {
                lastMsg = "[文件]"
            }
            return (
                <div className={styles.item}>
                    <div className={styles.contact}>
                        <div className={styles.avatar}>
                            <Badge count={item.unread} dot={!!item.isIgnore}>
                                <Avatar size="large" icon="user" src={item.headImg} />
                            </Badge>
                        </div>
                        <div className={styles.info}>
                            <div className={styles.line}>
                                <div className={classNames([[styles.content], [styles.nick]])}>
                                    <Ellipsis lines={1}>{nick}</Ellipsis>
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
            )
        } else {
            return null
        }
    }
    load = () => {
        this.props.load()
    }
    render () {
        const { contacts, hasMore, isLoading } = this.props
        return (
            <div className={styles.container} id="contact">
                <VirtualizedList
                    itemCount={contacts.length}
                    renderItem={this.renderItem}
                    estimatedItemHeight={70}
                    loadMoreItems={this.load}
                    onLoading={onLoading}
                    hasMore={!isLoading && hasMore}
                    useWindow={false}
                    scrollableTarget="contact"
                />
            </div>
        )
    }
}
