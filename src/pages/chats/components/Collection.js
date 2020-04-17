import { connect } from "dva"
import { Popconfirm, Icon } from "antd"
import styles from "./Collection.css"
const Collection = ({ collectionMsgs, chatsActive, chats, dispatch }) => {
    const delMsg = (id) => {
        dispatch({ type: "chat/cutCollection", payload: id })
    }
    const chat = chats.find((item) => item.userid === chatsActive)
    let msgs = collectionMsgs && collectionMsgs.filter((item) => item.userid === chat.userid) || []

    return (
        <div className={styles.container}>
            {(msgs && msgs.length > 0) ? msgs.map((item) =>
                <div className={styles.item} key={item.id}>
                    <div className={styles.content}>
                        {item.content}
                    </div>
                    <div className={styles.info}>
                        <span className={styles.time}>
                            {item.add_time}
                            <span>{item.accountnum}</span>
                        </span>
                        <div className={styles.delLink}>
                            <Popconfirm
                                title="确认删除？"
                                arrowPointAtCenter={true}
                                autoAdjustOverflow={true}
                                icon={<Icon type="exclamation-circle" style={{ color: "red" }} />}
                                onConfirm={() => delMsg(item.id)}
                            >
                                <a>删除</a>
                            </Popconfirm>
                        </div>
                    </div>
                </div>
            )
                : <div className={styles.noData}>
                    <Icon type="inbox" style={{ fontSize: 32 }} />
                    <div>什么都没有~</div>
                </div>
            }
        </div>
    )
}
function mapStateToProps (state) {
    const { collectionMsgs, chatsActive, chats } = state.chat
    return { collectionMsgs, chatsActive, chats }
}
export default connect(mapStateToProps)(Collection)
