import { connect } from "dva"
import { Component } from "react"
import { Icon, Popover, Avatar, Empty, Spin, Radio, message, Input } from "antd"
import * as service from "../../../services/service"
import InfiniteScroll from "react-infinite-scroller"
import styles from "./Goods.css"
import Ellipsis from "ant-design-pro/lib/Ellipsis"
const idp = "//qn.fuwuhao.cc/idp.png"
class Goods extends Component {
    state = {
        visible: false,
        list: [],
        page: 0,
        total: 0,
        loading: false,
        hasMore: true,
        sel: "1",
    }
    initLoad = async () => {
        const { total, list } = this.state
        if (total !== 0 && total === list.length) {
            this.setState({ hasMore: false })
            return
        }

        this.getData()
    }
    getData = async (title = "") => {
        const { auth } = this.props
        let { page, list, sel } = this.state
        if (!auth.uid) {
            return message.error("请绑定公众号")
        }
        page = title ? 1 : page + 1
        this.setState({ loading: true })
        const { data } = await service.scrmUrl({
            scrm_url: `http://wxx.jutaobao.cc/getGoods/getgoods.php?uniacid=${auth.uid}&types=${sel}&pagesize=10&page=${page}&title=${title}`,
        })
        if (!data.error) {
            for (let i = 0, len = data.data.length; i < len; i++) {
                if (data.data[i].Des) {
                    // 去除所有html标签
                    data.data[i].Des = data.data[i].Des.replace(/<[^>]+>/g, "").replace(/&nbsp;/ig, "")
                        .replace(/\s+/g, "")
                        .replace(/&lt;p&gt;/ig, "")
                        .replace(/&gt;/ig, "")
                }
            }
            const array = title ? data.data : [...list, ...data.data]
            this.setState({ list: array, page, total: Number(data.count) })
        }
        this.setState({ loading: false })
    }
    onChange = async (e) => {
        await this.setState({ sel: e.target.value, page: 0, list: [], hasMore: true, total: 0 })
        this.initLoad()
    }
    handleVisibleChange = () => {
        let { visible } = this.state
        visible = !visible
        this.setState({ visible, sel: "1" })
        if (visible) {
            this.initLoad()
        } else {
            this.setState({ page: 0, list: [], hasMore: true, total: 0 })
        }

    }
    send = (item) => {
        this.setState({ visible: false })
        const { chats, dispatch, chatsActive, auth } = this.props
        const chat = chats.find((item) => item.userid === chatsActive)
        const content = {
            title: item.Title,
            desc: item.Des,
            url: item.Url,
            thumb: item.Thumb,
        }
        const msg = {
            url: item.Url,
            type: 6,
            contents: JSON.stringify(content),
            tag: chat.wxid,
            device_wxid: chat.kefu_wxid,
            userid: chat.userid,
            auth: auth.accountnum,
        }
        dispatch({ type: "chat/sendMessage", payload: msg })
    }
    searchGood = (e) => {
        const title = e.target.value
        this.setState({ page: 0 })
        this.getData(title)
    }
    render () {
        const { visible, hasMore, loading, list, sel } = this.state
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
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                                <Radio.Group size="small" value={sel} onChange={this.onChange} style={{ margin: 8 }}>
                                    <Radio.Button value="1">购物有礼商品</Radio.Button>
                                    <Radio.Button value="2">分销商城商品</Radio.Button>
                                </Radio.Group>
                                <Input onChange={this.searchGood} placeholder="商品标题..." style={{ width: 200, height: 24 }}></Input>
                            </div>
                            <div ref={(ref) => this.scrollParentRef = ref} className={styles.container}>
                                <InfiniteScroll
                                    initialLoad={false}
                                    loadMore={this.initLoad}
                                    hasMore={(!loading && hasMore)}
                                    useWindow={false}
                                    getScrollParent={() => this.scrollParentRef}
                                >
                                    <div className={styles.itemBody} style={{ height: 70 }}>
                                        {list.length > 0 && list.map((item, index) =>
                                            <div
                                                key={index}
                                                className={styles.item}
                                                title="点击发送"
                                                onClick={() => this.send(item)}
                                            >
                                                <div className={styles.content}>
                                                    <Ellipsis lines={1} tooltip>{item.Title}</Ellipsis>
                                                    <Ellipsis lines={1} className={styles.from}>{item.Des}</Ellipsis>
                                                </div>
                                                <div className={styles.thumb}>
                                                    <Avatar
                                                        icon="compass"
                                                        size="large"
                                                        src={item.Thumb || idp}
                                                        shape="square"
                                                    />
                                                </div>

                                            </div>
                                        )}
                                    </div>
                                    {loading && <Spin
                                        indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />}
                                        style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: 15 }} />}
                                    {visible && !list.length && !loading && <div className={styles.emptyContainer}><Empty /></div>}
                                </InfiniteScroll>
                            </div>
                        </div>
                    }
                >
                    <Icon type="shopping" title="商品" />
                </Popover>
            </div>
        )
    }
}
function mapStateToProps (state) {
    const { auth, chats, chatsActive } = state.chat
    return { auth, chats, chatsActive }
}
export default connect(mapStateToProps)(Goods)
