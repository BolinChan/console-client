import { connect } from "dva"
import { Component } from "react"
import { Icon, Modal, Input, Button, message, AutoComplete, Alert } from "antd"
import { NumberInfo } from "ant-design-pro"
import numeral from "numeral"
import styles from "./Redpackage.css"
const { TextArea } = Input
class Redpackage extends Component {
    state = {
        visible: false,
        moneyValue: "",
        contentValue: "恭喜发财，大吉大利",
        orderValue: "",
        hbremark: "",
    }
    showModal = () => {
        const { chatsActive, chats, dispatch, auth } = this.props
        const chat = chats.find((item) => item.userid === chatsActive)
        dispatch({
            type: "chat/fetchAssociationOrders",
            payload: { type: "get_hong_orders", buyer_name: chat.buyer_name },
        })
        this.setState({ visible: true }, () => this.input && this.input.focus())
        if (!Number(auth.Balance)) {
            dispatch({
                type: "chat/fetchBalance",
            })
        }
    }
    closeModal = () => {
        this.setState({
            visible: false,
            moneyValue: "",
            contentValue: "恭喜发财，大吉大利",
            hbremark: "",
        })
    }
    changeMoneyValue = (e) => {
        let moneyValue = typeof e !== "object" ? e : e.target.value
        const regStrs = [["^0(\\d+)$", "$1"], ["[^\\d\\.]+$", ""], ["\\.(\\d?)\\.+", ".$1"], ["^(\\d+\\.\\d{2}).+", "$1"]]
        for (let i = 0; i < regStrs.length; i++) {
            let reg = new RegExp(regStrs[i][0])
            moneyValue = moneyValue.replace(reg, regStrs[i][1])
        }
        this.setState({ moneyValue })
    }
    changeContentValue = (e) => {
        this.setState({ contentValue: e.target.value })
    }
    changeHbremark = (e) => {
        this.setState({ hbremark: e.target.value })
    }
    changeOrderValue = (e) => {
        this.setState({ orderValue: e })
    }
    send = () => {
        const { moneyValue, contentValue, orderValue, hbremark } = this.state
        if (!moneyValue || moneyValue < 1 || moneyValue > 5000) {
            return message.error("发放失败！请设置正确红包金额（1~5000￥）")
        }
        if (moneyValue > Number(this.props.auth.Balance)) {
            return message.error("公众号余额不足，请确认后重试。")
        }
        const { wechatsActive, wechats, dispatch, chatsActive, chats } = this.props
        const active = chats.find((item) => item.userid === chatsActive)
        const wechat = wechats.find((item) => item.wxid === wechatsActive)
        dispatch({
            type: "chat/sedRendPackage",
            payload: {
                money: moneyValue,
                content: contentValue,
                devicid: active.kefu_wxid,
                wxid: active.wxid,
                remarks: active.remark,
                nickname: active.nick,
                headImg: active.headImg,
                userid: active.userid,
                xgorder: orderValue,
                kfnickname: wechat.nickname,
                hbremark,
            },
        })
        this.setState({ visible: false, moneyValue: "", contentValue: "恭喜发财，大吉大利" })
    }
    delHis = (e) => () => {
        let his = window.localStorage.getItem("redPackageHis")
        his = JSON.parse(his)
        his.splice(his.findIndex((item) => item === e), 1)
        window.localStorage.setItem("redPackageHis", JSON.stringify(his))
        this.props.dispatch({ type: "chat/saveRedPackageHis", payload: his })
    }
    moneyInput = (input) => (this.input = input)
    render () {
        const { moneyValue, contentValue, hbremark } = this.state
        const modalProps = {
            centered: true,
            footer: null,
            visible: this.state.visible,
            onCancel: this.closeModal,
            bodyStyle: { padding: "0" },
            wrapClassName: "redpackage",
        }
        const { redPackageHis, associationOrders, auth } = this.props
        return (
            <span>
                <Icon type="red-envelope" theme="outlined" title="发红包" onClick={this.showModal} />

                <Modal {...modalProps}>
                    <div className={styles.header}>发红包</div>
                    <Alert
                        type="warning"
                        message="请确认是否开通零钱到账功能（已开通请忽略），否则导致发送给用户无法领取"
                        showIcon
                        banner
                    />
                    <div className={styles.content}>
                        <div className={styles.tags}>
                            {(redPackageHis && redPackageHis.length > 0) &&
                                redPackageHis.map((item, index) =>
                                    <div key={index} className={styles.tag}>
                                        <div className={styles.tagvalue} onClick={() => this.changeMoneyValue(item)}>
                                            ￥{item}
                                        </div>
                                        <span onClick={this.delHis(item)}>
                                            <Icon type="close" theme="outlined" />
                                        </span>
                                    </div>
                                )
                            }
                        </div>
                        <div className={styles.item} style={{ flexDirection: "column" }}>
                            {/* {auth && <Alert
                                type="warning"
                                message={Number(auth.Balance) ? `当前账号余额：${Number(auth.balance)}` : "公众号余额不足"}
                                showIcon={!(Number(auth.Balance) && Number(auth.balance))}
                                banner
                            />} */}
                            <Input
                                placeholder="红包金额 ￥"
                                autoComplete="off"
                                ref={this.moneyInput}
                                value={moneyValue}
                                size="large"
                                onChange={this.changeMoneyValue}
                            />
                            {auth && !!Number(auth.Balance)
                                ? <span style={{ marginTop: 10, color: "#cf1322" }}>{Number(auth.balance) ? `当前账号余额：${Number(auth.balance)}元` : "当前账号余额不足"}</span>
                                : <span style={{ marginTop: 10, color: "#cf1322" }}>公众号余额不足</span>
                            }
                        </div>
                        <div className={styles.item}>
                            <TextArea
                                size="large"
                                style={{ height: 80, resize: "none", fontSize: 16 }}
                                placeholder="红包留言"
                                autoComplete="off"
                                value={contentValue}
                                onChange={this.changeContentValue}
                            />
                        </div>
                        <div className={styles.item}>
                            <Input
                                placeholder="红包备注"
                                autoComplete="off"
                                value={hbremark}
                                size="large"
                                onChange={this.changeHbremark}
                            />
                        </div>
                        <div className={styles.item}>
                            <AutoComplete
                                dataSource={associationOrders}
                                placeholder="关联订单（选填）"
                                size="large"
                                dropdownStyle={{ width: "100%" }}
                                style={{ width: "100%" }}
                                filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                                onChange={this.changeOrderValue}
                            />
                        </div>
                        <div className={styles.moneyBox}>
                            <NumberInfo total={`￥${numeral(moneyValue || 0).format("0,0.00")}`} />
                        </div>
                        <div className={styles.item}>
                            <Button type="danger" size="large" style={{ width: "100%" }} onClick={this.send}>
                                塞钱进红包
                            </Button>
                        </div>
                    </div>
                </Modal>
            </span>
        )
    }
}

function mapStateToProps (state) {
    const { auth, wechatsActive, wechats, chatsActive, chats, redPackageHis, associationOrders } = state.chat
    return { auth, wechatsActive, wechats, chatsActive, chats, redPackageHis, associationOrders }
}

export default connect(mapStateToProps)(Redpackage)
