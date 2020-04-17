import { connect } from "dva"
import { Component } from "react"
import { Icon, Popover, Avatar, Empty, Spin, Input, Select } from "antd"
import request from "../../../utils/request"
import InfiniteScroll from "react-infinite-scroller"
import styles from "./Goods.css"
import Ellipsis from "ant-design-pro/lib/Ellipsis"
const idp = "//qn.fuwuhao.cc/idp.png"
class Taobao extends Component {
    state = {
        visible: false,
        list: [],
        page: 0,
        total: 0,
        loading: false,
        hasMore: true,
        types: [],
        typeId: "",
    }
    componentDidMount () {
        this.fetchTypes()
    }
    fetchTypes = async () => {
        const { auth } = this.props
        const { data } = await request({
            url: "//wechat.yunbeisoft.com/index_test.php/home/TaobaoGoodsCategory/taobaoGoodsCategoryList",
            data: JSON.stringify({ ispage: 0, aid: auth.id }),
        })
        if (!data.error) {
            this.setState({ types: data.list })
        }
    }
    changeType = async (typeId) => {
        await this.setState({ typeId })
        this.getData(this.state.title, true)
    }
    initLoad = async () => {
        const { total, list } = this.state
        if (total !== 0 && total === list.length) {
            this.setState({ hasMore: false })
            return
        }
        this.getData()
    }
    getData = async (title = "", isNew = false) => {
        let { page, list, typeId } = this.state
        page = title ? 1 : page + 1
        if (isNew) {
            page = 1
        }
        this.setState({ loading: true })
        const { data } = await request({ url: "//wechat.yunbeisoft.com/index_test.php/home/TaobaoBuyer/getsTaobaoGoods", data: JSON.stringify({ title, page, pageSize: 10, catid: typeId }) })
        if (!data.error) {
            let array = title ? data.data : [...list, ...data.data]
            if (isNew) {
                array = data.data
            }
            this.setState({ list: array, page, total: Number(data.count) })
        }
        this.setState({ loading: false })
    }
    onChange = async (e) => {
        await this.setState({ page: 0, list: [], hasMore: true, total: 0 })
        this.initLoad()
    }
    handleVisibleChange = () => {
        let { visible } = this.state
        visible = !visible
        this.setState({ visible })
        if (visible) {
            this.initLoad()
        } else {
            this.setState({ page: 0, list: [], hasMore: true, total: 0 })
        }

    }
    send = async (item) => {
        const { sendMsg } = this
        let { text, img } = item
        this.setState({ visible: false })
        if (!img && !text) {
            return
        }
        if (img) {
            await sendMsg({ type: 2, url: img })
        }
        if (text) {
            sendMsg({ type: 1, contents: text })
        }
    }

    sendMsg = (para) => {
        const { chats, dispatch, chatsActive, auth } = this.props
        const chat = chats.find((item) => item.userid === chatsActive)
        const msg = {
            tag: chat.wxid,
            device_wxid: chat.kefu_wxid,
            userid: chat.userid,
            auth: auth.accountnum,
        }
        const payload = { ...para, ...msg }
        dispatch({ type: "chat/sendMessage", payload })
    }

    searchGood = (e) => {
        let isNew = false
        let title = e.target.value
        this.setState({ page: 0, title })
        if (!title) {
            isNew = true
        }
        this.getData(title, isNew)
    }
    render () {
        const { visible, hasMore, loading, list, types, typeId } = this.state
        return (
            <div>
                <Popover
                    visible={visible}
                    onVisibleChange={this.handleVisibleChange}
                    arrowPointAtCenter
                    trigger="click"
                    id="app"
                    content={
                        <div style={{ height: 400, overflow: "hidden" }}>
                            <Input onChange={this.searchGood} placeholder="商品标题..." style={{ width: 200, height: 24, marginLeft: 8, marginRight: 8 }} />
                            <Select value={typeId} size="small" onChange={this.changeType}>
                                <Select.Option value="">全部</Select.Option>
                                {types && types.length > 0 && types.map((item) =>
                                    <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                                )}
                            </Select>
                            <div ref={(ref) => this.scrollParentRef = ref} className={styles.container}>
                                <InfiniteScroll
                                    initialLoad={false}
                                    loadMore={this.initLoad}
                                    hasMore={(!loading && hasMore)}
                                    useWindow={false}
                                    getScrollParent={() => this.scrollParentRef}
                                >
                                    <div className={styles.itemBody}>
                                        {list.length > 0 && list.map((item, index) =>
                                            <div
                                                key={index}
                                                className={styles.item}
                                                title="点击发送"
                                                onClick={() => this.send(item)}
                                            >
                                                <div className={styles.content} style={{ flex: "1" }}>
                                                    <Ellipsis lines={1} tooltip>{item.title}</Ellipsis>
                                                    {/* <Ellipsis lines={1} className={styles.from}>{item.content}</Ellipsis> */}

                                                </div>
                                                <div className={styles.thumb} >
                                                    <Avatar
                                                        size={66}
                                                        icon="compass"
                                                        src={item.img || idp}
                                                        shape="square"
                                                    />
                                                </div>

                                            </div>
                                        )}
                                    </div>

                                    {loading && <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />}
                                        style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: 15 }} />}

                                    {visible && !list.length && !loading && <div className={styles.emptyContainer}><Empty /></div>}
                                </InfiniteScroll>
                            </div>
                        </div>
                    }
                >
                    <Icon type="taobao" title="淘宝商品" />
                </Popover>
            </div>
        )
    }
}
function mapStateToProps (state) {
    const { auth, chats, chatsActive } = state.chat
    return { auth, chats, chatsActive }
}
export default connect(mapStateToProps)(Taobao)
