import { Component } from "react"
import {
    Icon,
    Popover,
    Spin,
    Empty,
    Avatar,
    Button,
    message,
    Badge,
} from "antd"
import { Ellipsis } from "ant-design-pro"
import request from "../utils/request"
import styles from "./PassRes.css"
import InfiniteScroll from "react-infinite-scroller"

class PassRes extends Component {
    state = {
        list: [],
        loading: false,
        page: 0,
        hasMore: true,
    }

    fetchList = async () => {
        let {hasMore, page, list} = this.state
        if (this.state.loading) {
            return
        }
        this.setState({ loading: true })
        if (hasMore) {
            page = page + 1
        }
        const { data } = await request({
            url: "//wechat.yunbeisoft.com/index_test.php/home/ids/get_bei_jia",
            data: JSON.stringify({page}),
        })
        data.data = data.data || []
        if (!data.error) {
            this.setState({ list: [...list, ...data.data]})
        }
        this.setState({ loading: false, page, hasMore: data.data.length === 20 })
    }

    handleVisibleChange = (e) => {
        if (e) {
            this.fetchList()
        } else {
            this.setState({list: [], hasMore: true, page: 0})
        }
    }

    handleChange = (params) => async () => {
        const { data } = await request({
            url: "//wechat.yunbeisoft.com/index_test.php/home/ids/tonge_bei_jia",
            data: JSON.stringify(params),
        })
        if (!data.error) {
            params.dispatch({ type: "chat/lessAddNum" })
            let {list} = this.state
            const index = list.findIndex((i) => i.id === params.id)
            list[index].isCheck = true
            this.setState({list})
            // this.fetchList()
        } else {
            return message.error(data.errMsg)
        }
    }

    render () {
        const { addNum, dispatch } = this.props
        const { list, loading, hasMore} = this.state

        const content = (
            <div className={styles.content} ref={(ref) => this.scrollParentRef = ref}>
                <InfiniteScroll
                    loadMore={this.fetchList}
                    hasMore={!loading && hasMore}
                    useWindow={false}
                    getScrollParent={() => this.scrollParentRef}
                    initialLoad={false}
                >
                    {list.length > 0 && list.map((item) => (
                        <div key={item.id} className={styles.item}>
                            <div className={styles.header}>
                                <Ellipsis lines={1} tooltip>来自：（{item.devicename || "未命名"}）{item.nickname}</Ellipsis>
                            </div>
                            <div className={styles.context}>
                                <div>
                                    <Avatar icon="user" src={item.Avatar} style={{ marginRight: 8 }} />
                                </div>
                                <Ellipsis tooltip lines={2}>{item.FriendNick || item.FriendId}</Ellipsis>
                            </div>
                            {item.Reason &&
                                <div className={styles.reason}>
                                    <Ellipsis tooltip>验证语：{item.Reason}</Ellipsis>
                                </div>
                            }
                            <div className={styles.footer}>
                                <div className={styles.time}>{item.addtime}</div>
                                <div>
                                    {Number(item.status) === 0
                                        ? <div>
                                            <Button
                                                size="small"
                                                type="primary"
                                                style={{ margin: "auto 8px" }}
                                                onClick={this.handleChange({ id: item.id, Operation: 1, dispatch })}
                                                disabled={item.isCheck}
                                            >
                                                通过
                                            </Button>
                                            <Button
                                                size="small"
                                                onClick={this.handleChange({ id: item.id, Operation: 2, dispatch })}
                                            >
                                                拒绝
                                            </Button>
                                        </div>
                                        : "已处理"
                                    }
                                </div>
                            </div>
                        </div>
                    ))}
                    {!loading && !list.length && <Empty />}
                    {loading && <Spin spinning={true} style={{width: "100%", padding: 8}}/>}

                </InfiniteScroll>
            </div>
        )
        return (
            < Popover
                title="好友请求"
                placement="bottom"
                content={content}
                trigger="click"
                onVisibleChange={this.handleVisibleChange}
            >
                <div className={styles.popItem}>
                    <Badge count={addNum} overflowCount={999}>
                        <Icon type="usergroup-add" />
                        <span style={{ marginLeft: 8, fontSize: 12 }} >好友请求</span>
                    </Badge>
                </div>
            </Popover>
        )
    }
}

export default PassRes
