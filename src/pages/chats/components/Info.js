import { Component } from "react"
import { connect } from "dva"
import { Avatar, Input, Icon, Popconfirm, Empty, Button } from "antd"
import { Ellipsis } from "ant-design-pro"
import ExtendFile from "./extendFile"
import { textParse } from "../../../utils/helper"
import styles from "./Info.css"
const { TextArea } = Input
let ww = ""
let chat = ""

const shop1 = require("../../../assets/shops/1.png")
const shop2 = require("../../../assets/shops/2.png")
const shop3 = require("../../../assets/shops/3.png")
const shop4 = require("../../../assets/shops/4.png")
const shop5 = require("../../../assets/shops/5.png")
const shop6 = require("../../../assets/shops/6.png")
const shop7 = require("../../../assets/shops/7.png")

class Info extends Component {
    state = { upObj: "", inputValue: "", inputVisible: false }
    componentDidMount () {
        this.getChatInfo(this.props)
    }
    componentDidUpdate () {
        this.getChatInfo(this.props)
    }
    getChatInfo = (param) => {
        const { chatsActive, chats, shoppingInfo, dispatch, orders, collectionMsgs } = param
        const active = chats.find((item) => item.userid === chatsActive)
        const buyer_name = active.buyer_name
        if (buyer_name && buyer_name !== ww) {
            ww = buyer_name
            if (shoppingInfo.length <= 0 || shoppingInfo.findIndex((item) => item.buyer_name === buyer_name) === -1) {
                dispatch({ type: "chat/fetchShoppingInfo", payload: buyer_name })
            }
            if (orders.length <= 0 || orders.findIndex((item) => item.buyer_name === buyer_name) === -1) {
                dispatch({ type: "chat/fetchOrders", payload: buyer_name })
            }
        }
        if (chatsActive && chatsActive !== chat) {
            chat = chatsActive
            if (!active.sex || !active.city || !active.remark || !active.phone || !active.buyer_name) {
                dispatch({
                    type: "chat/fetchUserInfo",
                    payload: { wxid: active.wxid, kefu_wxid: active.kefu_wxid, userid: active.userid },
                })
            }

            if (collectionMsgs === "") {
                dispatch({ type: "chat/fetchCollection" })
            }
        }
    }
    upInfo = (e) => () => {
        this.setState({ upObj: e.obj, inputValue: e.val }, () => this.input.focus())
    }
    handleInputChange = (e) => {
        this.setState({ inputValue: e.target.value })
    }
    handleInputConfirm = async () => {
        const { upObj, inputValue } = this.state
        const { chatsActive, chats, dispatch } = this.props
        const active = chats.find((item) => item.userid === chatsActive)
        let payload
        if (upObj === "address" || upObj === "record" || upObj === "realname") {
            payload = {
                record: upObj === "record" ? inputValue : active.record ? active.record : "",
                realname: upObj === "realname" ? inputValue : active.realname ? active.realname : "",
                address: upObj === "address" ? inputValue : active.address ? active.address : "",
                userid: active.userid,
            }
            dispatch({ type: "chat/updateAddress", payload })
        } else {
            payload = {
                option: upObj,
                wxid: active.wxid,
                changeValue: inputValue,
                kefu_wxid: active.kefu_wxid,
            }
            await dispatch({ type: "chat/editInfo", payload })
            if (upObj === "buyer_name") {
                dispatch({
                    type: "chat/fetchUserInfo",
                    payload: { wxid: active.wxid, kefu_wxid: active.kefu_wxid, userid: active.userid },
                })
            }
        }
        this.setState({ upObj: "", inputValue: "", inputVisible: false })
    }
    saveInputRef = (input) => (this.input = input)
    delMsg = (id) => {
        this.props.dispatch({ type: "chat/cutCollection", payload: id })
    }
    selectHimg = (e) => {
        switch (e) {
            case "1": return shop1
            case "2": return shop2
            case "3": return shop3
            case "4": return shop4
            case "5": return shop5
            case "6": return shop6
            default: return shop7
        }
    }

    render () {
        const { chatsActive, chats, shoppingInfo, orders, collectionMsgs, hanldOrder } = this.props
        const active = chats.find((item) => item.userid === chatsActive)
        const { upObj, inputValue } = this.state
        const inputStyle = {
            type: "text",
            size: "small",
            style: { width: 130 },
            value: inputValue,
        }
        const textStyle = {
            type: "text",
            size: "small",
            style: { width: 180, resize: "none", height: 60 },
            value: inputValue,
        }
        const chat = chats.find((item) => item.userid === chatsActive)
        let msgs = collectionMsgs && collectionMsgs.filter((item) => item.userid === chat.userid) || []
        const activeShoppingInfo = shoppingInfo.find((item) => item.buyer_name === active.buyer_name) || { amount: "0.00", goods: "0", last_time: "0000-00-00 00:00:00", recent: "0", total: "0" }
        const index = orders.findIndex((item) => item.buyer_name === active.buyer_name)
        const order = index === -1 ? [] : orders[index].data
        return (
            <div className={styles.infoBox}>
                <div className={styles.item}>
                    <div className={styles.itemHeader}>个人信息</div>
                    <div className={styles.itemBody}>
                        <div className={styles.userInfo}>
                            <div className={styles.thumbBox}>
                                <div>
                                    <Avatar size="large" icon="user" src={active.headImg} className={styles.thumb} />
                                </div>
                                <span>
                                    {active.nick}
                                    {active.sex === "1" && <Icon type="man" style={{ fontSize: "16px", color: "#096dd9", marginLeft: "5px" }} />}
                                    {active.sex === "2" && <Icon type="woman" style={{ fontSize: "16px", color: "#fd7e96", marginLeft: "5px" }} />}
                                </span>
                            </div>
                            <div className={styles.line}>
                                <Ellipsis tooltip lines={1} >微信号：{active.FriendNo || active.wxid || "未知"}</Ellipsis>
                            </div>
                            <div className={styles.line}>
                                <Ellipsis tooltip lines={1} >地区： {active.city || "未知"}</Ellipsis>
                            </div>
                            <div className={styles.line}>
                                <div className={styles.lineInfo}>
                                    <span className={styles.label}>备注：</span>
                                    <div className={styles.content}>
                                        {upObj === "remark" ? (
                                            <Input {...inputStyle} ref={this.saveInputRef} onChange={this.handleInputChange} onBlur={this.handleInputConfirm} onPressEnter={this.handleInputConfirm} />
                                        ) : (
                                            <Ellipsis tooltip lines={1} >{active.remark}</Ellipsis>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.editLink}><a onClick={this.upInfo({ obj: "remark", val: active.remark })}>修改</a></div>
                            </div>
                            <div className={styles.line}>
                                <div className={styles.lineInfo}>
                                    <span>真实姓名：</span>
                                    {upObj === "realname" ? (
                                        <Input {...inputStyle} ref={this.saveInputRef} onChange={this.handleInputChange} onBlur={this.handleInputConfirm} onPressEnter={this.handleInputConfirm} />
                                    ) : (
                                        <Ellipsis tooltip lines={1} >{active.realname}</Ellipsis>

                                    )}
                                </div>
                                <a onClick={this.upInfo({ obj: "realname", val: active.realname })}>修改</a>
                            </div>
                            <div className={styles.line}>
                                <div className={styles.lineInfo}>
                                    <span>手机：</span>
                                    {upObj === "phone" ? (
                                        <Input {...inputStyle} ref={this.saveInputRef} onChange={this.handleInputChange} onBlur={this.handleInputConfirm} onPressEnter={this.handleInputConfirm} />
                                    ) : (
                                        <Ellipsis tooltip lines={1} >{active.phone}</Ellipsis>
                                    )}
                                </div>
                                <a onClick={this.upInfo({ obj: "phone", val: active.phone })}>修改</a>
                            </div>
                            <div className={styles.line}>
                                <div className={styles.lineInfo}>
                                    <span>旺旺：</span>
                                    {upObj === "buyer_name" ? (
                                        <Input {...inputStyle} ref={this.saveInputRef} onChange={this.handleInputChange} onBlur={this.handleInputConfirm} onPressEnter={this.handleInputConfirm} />
                                    ) : (
                                        <Ellipsis tooltip lines={1} >{active.buyer_name}</Ellipsis>
                                    )}
                                </div>
                                <a onClick={this.upInfo({ obj: "buyer_name", val: active.buyer_name })}>修改</a>
                            </div>

                            <div className={styles.line}>
                                <div className={styles.lineInfo}>
                                    <span>地址：</span>
                                    {upObj === "address" ? (
                                        <TextArea {...textStyle} ref={this.saveInputRef} onChange={this.handleInputChange} onBlur={this.handleInputConfirm} />
                                    ) : (
                                        <Ellipsis tooltip lines={1} >{active.address}</Ellipsis>
                                    )}
                                </div>
                                <a onClick={this.upInfo({ obj: "address", val: active.address })}>修改</a>
                            </div>

                            <div className={styles.line}>
                                <div className={styles.lineInfo}>
                                    <span>备忘录：</span>
                                    {upObj === "record" ? (
                                        <TextArea {...textStyle} ref={this.saveInputRef} onChange={this.handleInputChange} onBlur={this.handleInputConfirm} />
                                    ) : (

                                        <Ellipsis tooltip lines={1} >{active.record}</Ellipsis>

                                    )}
                                </div>
                                <a onClick={this.upInfo({ obj: "record", val: active.record })}>修改</a>
                            </div>

                            <ExtendFile />

                        </div>
                    </div>
                </div>

                <div className={styles.item}>
                    <div className={styles.itemHeader}>已收藏消息</div>
                    <div className={styles.itemBody}>
                        {msgs && msgs.length > 0 ? msgs.map((item) =>
                            <div className={styles.collectionItem} key={item.id}>
                                <div
                                    className={styles.collectionContent}
                                    dangerouslySetInnerHTML={{ __html: textParse(item.content) }}
                                />
                                <div className={styles.collectionInfo}>
                                    <div className={styles.collectionTime}>
                                        <span style={{ marginRight: 10 }}>{item.add_time}</span>
                                        <span>{item.accountnum}</span>
                                    </div>
                                    <div className={styles.collectionDel}>
                                        <Popconfirm
                                            title="确认删除吗？"
                                            arrowPointAtCenter={true}
                                            autoAdjustOverflow={true}
                                            onConfirm={() => this.delMsg(item.id)}
                                        >
                                            <a><Icon type="delete" /> 删除</a>
                                        </Popconfirm>
                                    </div>
                                </div>
                            </div>
                        ) : <Empty />}
                    </div>
                </div>

                <div className={styles.item}>
                    <div className={styles.itemHeader}>购物信息</div>
                    <div className={styles.itemBody}>
                        <div className={styles.line}>
                            最近交易：
                            {activeShoppingInfo.recent}
                            笔正在交易中
                        </div>
                        <div className={styles.line}>
                            合计：￥
                            {activeShoppingInfo.amount} 共成交
                            {activeShoppingInfo.total}笔 共{activeShoppingInfo.goods}
                            件商品
                        </div>
                        <div className={styles.line}>
                            上次交易时间：
                            {activeShoppingInfo.last_time}
                        </div>
                    </div>

                    <Button onClick={() => hanldOrder && hanldOrder({ orderVisible: true })}>查询订单</Button>

                </div>


                <div className={styles.item}>
                    <div className={styles.itemHeader}>最近10笔订单</div>
                    <div className={styles.itemBody}>
                        {order && order.length > 0 ? order.map((item) =>
                            <div key={item.id} className={styles.order} >
                                <div className={styles.orderHeader}>
                                    <div>
                                        <Avatar
                                            src={this.selectHimg(item.source)}
                                            // src={require(`../../../assets/shops/${item.source}.png`)}
                                            icon="shop"
                                            shape="square"
                                            size={20} style={{ marginRight: 4 }}
                                        />
                                        {item.ordersn}
                                    </div>
                                    <div className={styles.orderStatus}>{item.status}</div>
                                </div>
                                <div
                                    onClick={() => hanldOrder && hanldOrder({ orderVisible: true, order_sn: item.ordersn })}
                                    title="点击查看订单详情"
                                >
                                    {item.goods.map((good, index) =>
                                        <div key={index} className={styles.goods}>
                                            <div className={styles.goodsInfo}>
                                                <div className={styles.goodsThumb} >
                                                    <Avatar src={good.pic_path} shape="square" size="large" icon="gift" />
                                                </div>
                                                <div className={styles.goodsTitle}>
                                                    <Ellipsis tooltip lines={2}>{good.title}</Ellipsis>
                                                </div>
                                            </div>
                                            <div className={styles.price}>
                                                <span><span className={styles.symbol}>￥</span>{good.realprice}</span>
                                                <br />
                                                <span className={styles.num}>x {good.total}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.orderFooter}>
                                    共{item.goods_num}件商品 合计:<span className={styles.symbol}>￥</span>{item.price}
                                </div>
                            </div>
                        ) : <Empty />}
                    </div>
                </div>
            </div>
        )
    }
}
function mapStateToProps (state) {
    const { chatsActive, chats, shoppingInfo, orders, collectionMsgs} = state.chat
    return { chatsActive, chats, shoppingInfo, orders, collectionMsgs }
}
export default connect(mapStateToProps)(Info)
