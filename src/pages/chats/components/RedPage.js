import { Input, Modal, Icon, Button, Form, Alert, Tag } from "antd"
import { Component } from "react"
import styles from "./RedPage.css"
// import { delay } from "../../../../utils/helper"
const { TextArea } = Input
const FormItem = Form.Item
const tishi = {
    position: "absolute",
    top: "52px",
    left: "0",
    width: "100%",
}
class RedPage extends Component {
    state = { visible: false, disabled: true, money: "0.00", AlertVisible: false }

    componentDidUpdate () {
        if (this.state.visible && this.input && this.state.isFocus) {
            this.input.focus()
            this.setState({ isFocus: false })
        }
    }
    componentDidMount () {
        document.removeEventListener("keydown", this.handleEnterKey)
        document.addEventListener("keydown", this.handleEnterKey)
    }
    componentWillUnmount () {
        document.removeEventListener("keydown", this.handleEnterKey)
    }
    handleSubmit = (e) => {
        e.preventDefault()
        const { tag, devicid, dispatch, form } = this.props
        form.validateFields((err, values) => {
            let { content } = values
            let { money, historyV } = this.state
            if (!err) {
                if (!content) {
                    content = "恭喜发财，大吉大利"
                }
                dispatch({ type: "console/RedPage", payload: { uid: null, content, money, devicid, wxid: tag, user: null } })
                this.setState({ loading: true })
                // ajax request after empty completing
                setTimeout(() => {
                    this.setState({
                        loading: false,
                        visible: false,
                        money: "0.00",
                        disabled: true,
                    })
                    const { onClick } = this.props
                    if (onClick) {
                        onClick()
                    }
                    form.setFieldsValue({
                        moneyValue: "",
                    })
                    // 本地存储
                    if (!historyV.find((item) => item === money)) {
                        historyV.unshift(money)
                        historyV.length > 5 && (historyV = historyV.slice(0, 5))
                        window.localStorage.historyV = JSON.stringify(historyV)
                    }
                }, 1000)
            }
        })
    }
    handleEnterKey = (e) => {
        if (e.keyCode === 13 && !this.state.disabled) {
            // enter键发送红包
            e.preventDefault()
            this.handleSubmit(e)
        }
        if (e.altKey && e.keyCode === 82) {
            // 快捷键打开发红包
            this.showModal()
        }
    }
    // 打开modal
    showModal = () => {
        // 获取本地存放
        let historyV = window.localStorage.historyV
        this.props.dispatch({ type: "console/RedSetting" })
        this.setState({
            visible: true,
            disabled: true,
            isFocus: true,
            historyV: historyV ? JSON.parse(historyV) : [],
        })
    }
    handleInputChange = (e) => {
        let { money, disabled, AlertVisible } = this.state
        let { MaxVaule } = this.props
        !MaxVaule && (MaxVaule = 200)
        var regStrs = [
            ["^0(\\d+)$", "$1"], // 禁止录入整数部分两位以上，但首位为0
            ["[^\\d\\.]+$", ""], // 禁止录入任何非数字和点
            ["\\.(\\d?)\\.+", ".$1"], // 禁止录入两个以上的点
            ["^(\\d+\\.\\d{2}).+", "$1"], // 禁止录入小数点后两位以上
            // ["^d+(.d+)?$"],
        ]
        for (let i = 0; i < regStrs.length; i++) {
            var reg = new RegExp(regStrs[i][0])
            e.target.value = e.target.value.replace(reg, regStrs[i][1])
        }
        e.target.value = e.target.value.replace(/^0/g, "") // 禁止0开头
        // 显示输入的金额￥0.00
        let value = e.target.value
        let List = value.split(".")
        if (List.length === 1 || (List.length === 2 && !List[1])) {
            List[0] ? (money = List[0] + ".00") : (money = "0.00")
        } else {
            List[1].length === 1 ? (money = value + "0") : (money = value)
        }
        disabled = !value || Number(value) > MaxVaule || Number(value) < 1
        AlertVisible = (Number(value) > MaxVaule || Number(value) < 1) && Number(value) !== 0
        this.setState({ money, disabled, AlertVisible })
    }
    // 确认发送
    handleOk = (e) => {
        this.setState({
            visible: false,
        })
    }
    // 取消发送
    handleCancel = (e) => {
        this.setState({
            visible: false,
            money: "0.00",
            AlertVisible: false,
        })
        this.props.form.setFieldsValue({
            moneyValue: "",
        })
    }
    handleClose = (e, text) => {
        e.stopPropagation()
        let { historyV } = this.state
        // 本地存储
        let index = historyV.findIndex((item) => item === text)
        historyV.splice(index, 1)
        window.localStorage.historyV = JSON.stringify(historyV)
    }

    onClickTag = (money) => {
        let e = { target: { value: money } }
        this.handleInputChange(e)
        this.props.form.setFieldsValue({
            moneyValue: money,
        })
    }
    InputRef = (input) => (this.input = input)
    render () {
        const { disabled, money, loading, AlertVisible, historyV } = this.state
        const { getFieldDecorator } = this.props.form
        const message = `单个红包金额不可小于1元或者超过${this.props.MaxVaule ? this.props.MaxVaule : "200"}元`
        return (
            <span className={styles.redPage}>
                <Icon title="发红包 快捷键Alt+R" onClick={this.showModal} type="red-envelope" style={{ fontSize: "20px" }} />
                <Modal
                    footer={null}
                    visible={this.state.visible}
                    bodyStyle={{
                        background: "#fff",
                        paddingTop: "130px",
                        height: "600px",
                        borderRadius: "4px",
                    }}
                    style={{ maxWidth: "520px", margin: "auto" }}
                    onCancel={this.handleCancel}
                >
                    <div className={styles.top}>发红包</div>
                    <Alert style={tishi} message="请确认是否开通零钱到账功能（已开通请忽略），否则导致发送给用户无法领取" banner />
                    {historyV &&
                        historyV.length > 0 && (
                        <div className={styles.historyBt}>
                            {historyV.map((item) => (
                                <Tag className={styles.tag} closable={true} key={item} onClick={() => this.onClickTag(item)} onClose={(e) => this.handleClose(e, item)}>
                                        ￥<strong>{item.length >= 8 ? item.slice(0, 5) + "..." : item}</strong>
                                </Tag>
                            ))}
                        </div>
                    )}
                    <Form onSubmit={this.handleSubmit} className={styles.formS}>
                        <FormItem>
                            <div className={styles.RedItem}>
                                <span>金额</span>
                                <div className={styles.mey}>
                                    {getFieldDecorator("moneyValue")(<Input placeholder="0.00" ref={this.InputRef} autoComplete="off" onChange={this.handleInputChange} />)}
                                    <span>元</span>
                                </div>
                            </div>
                        </FormItem>
                        <FormItem>
                            <div className={styles.RedB}>{getFieldDecorator("content")(<TextArea style={{ resize: "none" }} rows={3} placeholder="恭喜发财，大吉大利" />)}</div>
                        </FormItem>
                        <h1 className={styles.mode}>￥{money}</h1>
                        <FormItem>
                            <div className={styles.mode}>
                                <Button loading={loading} htmlType="submit" type="danger" disabled={disabled}>
                                    塞钱进红包
                                </Button>
                            </div>
                        </FormItem>
                    </Form>
                    {AlertVisible && <Alert className={styles.excessive} message={message} type="error" showIcon />}
                    {/* <div className={styles.}>单个红包金额不可小于1元或者超过20000元</div> */}
                </Modal>
            </span>
        )
    }
}
const WrappedNormalLoginForm = Form.create()(RedPage)
export default WrappedNormalLoginForm
