import { Component } from "react"
import { connect } from "dva"
import { Form, Icon, Input, Button, Checkbox, Modal } from "antd"
import styles from "./Log.css"
const FormItem = Form.Item
const inpStyle = { style: { width: "100%", height: "50px" } }
const itemStyle = { style: { marginBottom: "30px" } }
const downloadUrl = require("../assets/pdf/113.pdf")
let content = (
    <div id="privacy">
        <p>云控系统的使用条件</p>
        <p>云控系统是一款利用模拟人工点击技术来操作微信账号的工具，您可以用它来替代枯燥的人工点击等行为，由于云控系统的批量化操作特性，容易引发针对微信平台的非善意使用，因此若您存在如下行为，需立即退出并卸载云控系统：</p>
        <ol>
            <li>将非法获取的公民个人信息导入了云控系统中</li>
            <li>进行色情变现业务，如利用各种借口讨要红包等</li>
            <li>进行实体类诈骗业务，如套路卖茶叶等</li>
            <li>进行金融类诈骗业务，如推广非法股票配资等</li>
            <li>进行博彩类业务，如推广海外线上博彩平台等</li>
            <li>进行邪教传教业务，如法轮功推广等</li>
            <li>以上未例举但事实成立的其它违反国家法律法规的行为</li>
        </ol>
        <p>关于本补充协议：</p>
        <p>为使用云控系统（以下简称“本系统”）及服务，您应当阅读并遵守《云控系统用户使用协议》，以及《云控系统补充使用协议》，一旦您在本页面点击了“同意”，即表示您同意并接受了本协议中的所有条款、条件及通告。</p>
        <a
            download="ykl_privacy_policy.pdf"
            href={downloadUrl}
        >
            下载 PDF 文件
        </a>
    </div>
)

class Log extends Component {
    state = {
        checked: true,
        logo: 1,
    }
    componentDidMount () {
        const url = window.location.href
        if (url.indexOf("jiafen.scrm.la") !== -1) {
            this.setState({ logo: 2 })
        }
    }
    handleChange = (e) => {
        this.setState({ checked: e.target.checked })
    }
    checkPrivacy = () => {
        Modal.confirm({
            title: "隐私协议",
            content: content,
            iconType: "read",
            okText: "已阅读并同意",
            cancelText: "不同意",
            width: 520,
            onOk () {
                window.localStorage.setItem("agree", true)
            },
        })
    }
    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.dispatch({ type: "chat/log", payload: values })
            }
        })
    }
    render () {
        const { getFieldDecorator } = this.props.form
        const { checked, logo } = this.state
        return (
            <div className={styles.container}>
                <div className={styles.box}>
                    <div className={styles.titleBg}>
                        {logo === 1 && <div className={styles.bgBox} />}
                        {logo === 2 && <div className={styles.bgBox2} />}
                        <h2 className={styles.productName} > </h2>
                    </div>
                    <div className={styles.titleWrap}>
                        <span className={styles.lines} />
                        <span className={styles.title}>云客服登录</span>
                        <span className={styles.lines} />
                    </div>
                    <a
                        className={styles.goTarget}
                        href={logo === 2 ? "//jiafen.admin.scrm.la" : "http://admin.scrm.la"}
                        target={"_blank"}>
                        管理员登录>>
                    </a>
                    <Form onSubmit={this.handleSubmit} className="login-form">
                        <FormItem {...itemStyle}>
                            {getFieldDecorator("accountnum", { rules: [{ required: true, message: "请输入帐号" }] })(
                                <Input
                                    prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
                                    placeholder="请用客服帐号@主帐号登录"
                                    autoComplete="off"
                                    {...inpStyle}
                                    ref={(input) => {input = input && input.focus()}}
                                />
                            )}
                        </FormItem>
                        <FormItem {...itemStyle}>
                            {getFieldDecorator("password", {
                                rules: [{ required: true, message: "请输入密码" }],
                            })(<Input prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />} type="password" placeholder="密码" autoComplete="off" {...inpStyle} />)}
                        </FormItem>
                        <FormItem {...itemStyle}>
                            {getFieldDecorator("agree", { valuePropName: "checked", initialValue: true })(
                                <Checkbox onChange={this.handleChange}>已阅读并同意</Checkbox>
                            )}
                            <a onClick={this.checkPrivacy}>隐私协议</a>
                        </FormItem>
                        <Button
                            disabled={!checked}
                            type="primary"
                            htmlType="submit"
                            className={styles.subBtn}
                            {...inpStyle}
                        >
                            登录
                        </Button>
                    </Form>
                </div>
            </div>
        )
    }
}
const LogForm = Form.create()(Log)
function mapStateToProps (state) {
    const { dispatch } = state.chat
    return { dispatch }
}
export default connect(mapStateToProps)(LogForm)
