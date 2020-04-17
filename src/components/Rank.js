import { Component } from "react"
import { Icon, Popover, Spin, Badge, Empty } from "antd"
import { Ellipsis } from "ant-design-pro"
import request from "../utils/request"
import styles from "./Rank.css"

class Rank extends Component {
    state = {
        list: [],
        loading: false,
    }
    fetchRank = async () => {
        this.setState({ loading: true })
        const { data } = await request({ url: "//wechat.yunbeisoft.com/index_test.php/home/TaobaoBuyer/getRankingPerformance" })
        if (!data.error) {
            this.setState({ list: data.data })
        }
        this.setState({ loading: false })
    }
    handleVisibleChange = (e) => {
        if (e) {
            this.fetchRank()
        }
    }
    render () {
        const { list, loading } = this.state
        const content = (
            <Spin spinning={loading}>
                <div className={styles.content}>
                    {list.length > 0 && list.map((item, index) => (
                        <div key={item.zid} className={styles.item}>
                            <div className={styles.no}>
                                <Badge
                                    count={index + 1}
                                    style={index < 3 ? firstBadge : defaultBadge}
                                />
                            </div>
                            <div className={styles.context}>
                                <Ellipsis tooltip>{item.ziaccount}</Ellipsis>
                            </div>

                            <div style={{minWidth: 40}} className={styles.extra}>
                                <Icon type="shopping"/>  {item.order_num}
                            </div>


                            <div className={styles.extra}>
                                ￥ {item.price_z}
                            </div>
                        </div>
                    ))}
                    {!loading && !list.length && <Empty />}
                </div>
            </Spin>
        )
        return (
            <Popover
                title="当月绩效排行"
                placement="bottom"
                content={content}
                trigger="click"
                onVisibleChange={this.handleVisibleChange}
            >
                <div className={styles.popItem}>
                    <Icon type="ordered-list" />
                    <span style={{ marginLeft: 8, fontSize: 12 }} >绩效排行</span>
                </div>
            </Popover>
        )
    }
}
export default Rank
const defaultBadge = {
    backgroundColor: "#f5f5f5",
    color: "rgba(0,0,0,.65)",
}
const firstBadge = {
    backgroundColor: "#314659",
    color: "#fff",
}
