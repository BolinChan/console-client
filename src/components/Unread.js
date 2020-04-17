import styles from "./Unread.css"
import { Avatar, Badge, Empty, Spin } from "antd"
import { Ellipsis } from "ant-design-pro"
import moment from "moment"
import InfiniteScroll from "react-infinite-scroller"
import classNames from "classnames"
let scrollParentRef = ""
const lists = ({ list, goChat }) => {
    if (list && list.length > 0) {
        return (
            <div >
                {list.map((item) => {
                    let nick = item.remark || item.nick || item.wxid
                    if (item && "quns" in item && item.quns) {
                        nick += ` (${item.quns})`
                    }
                    let LastMsg = item.lastMsg && item.lastMsg.replace("", "[未知表情]")

                    if (item.lastMsgs && item.lastMsgs.includes("[文件]")) {
                        LastMsg = "[文件]"
                    }
                    let lastMsgTime = item.lastMsgTime ? moment(item.lastMsgTime, "YYYY-MM-DD HH:mm:ss").fromNow() : ""

                    return (
                        <div key={item.userid} className={styles.contact}>
                            <Badge count={item.unread} dot={!!item.isIgnore}>
                                <Avatar icon="user" src={item.headImg} />
                            </Badge>
                            <div className={styles.info}>
                                <div className={styles.line}>
                                    <div className={styles.content}>
                                        <Ellipsis lines={1}>{nick}</Ellipsis>
                                    </div>
                                    <div className={classNames([[styles.extra], [styles.lastTime]])}>
                                        {lastMsgTime}
                                    </div>
                                </div>
                                <div className={styles.line}>
                                    <div className={classNames([[styles.content], [styles.lastMsg]])}>
                                        <Ellipsis lines={1}>{LastMsg}</Ellipsis>
                                    </div>
                                    <div className={classNames([[styles.extra], [styles.newMsg]])}>
                                        <a onClick={() => goChat(item)}>点击聊天</a>
                                    </div>

                                </div>
                            </div>
                        </div>

                    )
                })}
            </div>
        )
    } else {
        return null
    }
}
const Page = ({
    isLoad,
    hasMore,
    unreadLst,
    getUnreadLst,
    goChat,
}) => (
    <div className={styles.unreadlst} ref={(ref) => scrollParentRef = ref} id="contacts">
        {(unreadLst.length === 0 && isLoad) ? <Spin />
            : <InfiniteScroll
                initialLoad={false}
                threshold={500}
                loadMore={getUnreadLst}
                hasMore={!isLoad && hasMore}
                useWindow={false}
                getScrollParent={() => scrollParentRef && scrollParentRef}
            >
                {(!isLoad && unreadLst.length === 0)
                    ? <Empty />
                    : lists({ list: unreadLst, goChat })
                }
            </InfiniteScroll>
        }
    </div>
)
export default Page
