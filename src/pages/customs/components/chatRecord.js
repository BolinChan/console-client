
import { Popover, Avatar, Spin, Empty } from "antd"
import styles from "../page.css"
import { textParse } from "../../../utils/helper"
const ChatRecord = ({ showRecord, record, recordLst, self, loading, loadMore, recordnoMore }) => {
    let list = recordLst.filter((item) => item.FriendId === record.wxid) || []
    return (
        <Popover placement="left" title="聊天记录" content={chatRecord(list, self, record, loading, loadMore, recordnoMore)} trigger="click" onVisibleChange={(e) => showRecord(record, e)}>
            <a style={{ marginTop: 10 }} type="primary">聊天记录</a>
        </Popover>
    )
}
const chatRecord = (list, self, record, loading, loadMore, recordnoMore) => (
    <Spin tip="加载中..." spinning={loading} style={{ marginTop: 10 }}>
        <div className={styles.recordLst}>
            {list.length > 0 && list.map((item) => (
                <div key={item.id} className={styles.recordItem}>
                    <div style={{ display: "flex" }}>
                        <Avatar size="large" shape="square" icon="user" src={findAva(item, self, record).src} style={{ marginRight: 10, flexShrink: 0 }} />
                        <div className={styles.recordContent}>
                            <span style={{ color: "#1890ff" }}>{findAva(item, self, record).name}</span>
                            {item.type === "1" && <span className={styles.content} dangerouslySetInnerHTML={{ __html: textParse(item.text) }} />}
                            {item.type === "2" && <img alt="" className={styles.contentImg} src={item.url} ></img>}
                            {item.type === "3" && <span>语音消息</span>}
                            {item.type === "4" && <span>视频消息</span>}
                        </div>
                    </div>
                    <span style={{ flexShrink: 0, color: "rgb(153, 153, 153)" }}>{item.addtime}</span>
                </div>
            ))}
            {list.length > 0 && recordnoMore === 0 && <div className={styles.loadMoreBtn} onClick={() => loadMore(record, list[list.length - 1].id)} >查看更多消息</div>}
            {list.length > 0 && recordnoMore === 1 && <div className={styles.loadMoreBtn} >没有更多了~</div>}
            {loading === false && list.length <= 0 && <span><Empty /></span>}
        </div>
    </Spin>
)
function findAva (item, self, record) {
    let [src, name] = ["", ""]

    let key = Number(item.status)
    switch (key) {
        case 0:
            src = self.headimg
            name = self.nickname
            break
        case 1:
            src = record.headImg
            name = record.nick
            break
        default:
            src = ""
            name = "未知"
            break
    }


    return { src, name }
}
export default ChatRecord
