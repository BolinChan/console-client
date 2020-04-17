import { Component } from "react"
import { Icon, Popover, Empty, Badge, Spin } from "antd"
import styles from "./SyncHistory.css"
import request from "../utils/request"
class SyncHistory extends Component {
    state = { list: [], loading: false }

    getData = async () => {
        this.setState({ loading: true })
        const { data } = await request({ url: "//wechat.yunbeisoft.com/index_test.php/home/ids/get_history_msg_record" })
        if (!data.error) {
            this.setState({ list: data.data })
        }
        this.setState({ loading: false })
    }
    handleVisibleChange = (e) => {
        if (e) {
            this.getData()
        }
    }
    render () {
        const { list, loading } = this.state
        const content = (
            <Spin spinning={loading}>

                <div className={styles.content}>
                    {list.length > 0 && list.map((item) => (
                        <div key={item.id} className={styles.item}>
                            <div style={{ marginRight: 10 }}>
                                <Badge status={item.status === 0 ? "error" : item.status === 1 ? "processing" : "success"} />
                                <span>{item.nickname}</span>
                            </div>
                            <span style={{ color: item.status === 0 ? "#f5222d" : item.status === 1 ? "#1890ff" : "#52c41a" }}>{item.status === 0 ? "未开始" : item.status === 1 ? "进行中" : "已完成"}</span>
                        </div>
                    ))}
                    {!loading && !list.length && <Empty />}

                </div>
            </Spin>
        )

        return (
            <Popover
                title="执行状态"
                placement="bottom"
                content={content}
                trigger="click"
                onVisibleChange={this.handleVisibleChange}>
                <div className={styles.popItem}>

                    <Icon type="message" />
                    <span style={{ marginLeft: 8, fontSize: 12 }} >同步历史消息记录</span>
                </div>
            </Popover>

        )
    }
}

export default SyncHistory
