import { connect } from "dva"
import { Component } from "react"
import { Icon, Modal, Form, Button, Radio, Upload, Input, message } from "antd"
import DatePick from "../../../components/DatePick"
import styles from "./SendTime.css"
const FormItem = Form.Item
const RadioGroup = Radio.Group
const { TextArea } = Input
const uploadParam = {
    accept: "image/*",
    action: "//wechat.yunbeisoft.com/index_test.php/home/fileupload/upload_msg",
    data: { type: "image" },
    showUploadList: false,
    listType: "picture-card",
}
function getBase64 (img, callback) {
    const reader = new FileReader()
    reader.addEventListener("load", () => callback(reader.result))
    reader.readAsDataURL(img)
}

class SendTime extends Component {
    state = {
        visible: false,
        type: "1",
        loading: false,
        imageUrl: "",
    }
    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
                return
            }
            const { chatsActive, auth, dispatch } = this.props
            const { setTime, type, contents, url } = fieldsValue
            let payload = { type, dingshi_time: setTime, uid: chatsActive, zid: auth.id }
            type === "1" ? payload.contents = contents : payload.url = url.file.response.data[0].url
            dispatch({ type: "chat/sendTime", payload })
            this.setState({ visible: false, imageUrl: "", loading: false })
        })
    }
    showModal = () => {
        this.setState({ visible: true })
    }
    closeModal = () => {
        this.setState({ visible: false })
    }
    changeType = (e) => {
        this.setState({ type: e.target.value })
    }
    handleChange = (info) => {
        if (info.file.status === "uploading") {
            this.setState({ loading: true })
            return
        }
        if (info.file.status === "done") {
            getBase64(info.file.originFileObj, (imageUrl) => this.setState({ imageUrl, loading: false }))
        }
    }
    beforeUpload (file) {
        const isJPG = !!(file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg" || file.type === "image/gif")
        if (!isJPG) {
            message.error("请选择图片文件")
        }
        return isJPG
    }
    render () {
        const modalProps = {
            footer: null,
            title: "创建定时消息",
            visible: this.state.visible,
            onCancel: this.closeModal,
            centered: true,
            destroyOnClose: true,
        }
        const formItemLayout = {
            labelCol: { xs: { span: 24 }, sm: { span: 5 } },
            wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
            colon: false,
        }
        const tailFormItemLayout = {
            wrapperCol: { xs: { span: 24, offset: 0 }, sm: { span: 16, offset: 5 } },
        }
        const { getFieldDecorator } = this.props.form
        const { imageUrl, type } = this.state
        const uploadButton = (
            <div>
                <Icon type={this.state.loading ? "loading" : "plus"} />
                <div className="ant-upload-text">Upload</div>
            </div>
        )
        const uploaded = (
            <div className={styles.imgBox}>
                <img src={imageUrl} alt="avatar" />
            </div>
        )
        return (
            <span>
                <Icon type="clock-circle" theme="outlined" title="定时消息" onClick={this.showModal} />
                <Modal {...modalProps}>
                    <Form onSubmit={this.handleSubmit}>
                        {/* <FormItem {...formItemLayout} label="选择时间">
                            {getFieldDecorator("setTime", { rules: [{ type: "object", required: true, message: "请选择时间！" }] })(
                                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: "100%" }} />
                            )}
                        </FormItem> */}
                        <FormItem {...formItemLayout} label="选择时间">
                            {getFieldDecorator("setTime", {
                                // initialValue: "2018-12-8 12:30",
                                rules: [{ required: true, message: "请选择时间！" }],
                            })(
                                <DatePick />
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout} label="选择类型">
                            {getFieldDecorator("type", { initialValue: type })(
                                <RadioGroup onChange={this.changeType}>
                                    <Radio value="1">文本</Radio>
                                    <Radio value="2">图片</Radio>
                                </RadioGroup>
                            )}
                        </FormItem>
                        {type === "1" ? (
                            <FormItem {...formItemLayout} label="发送内容">
                                {getFieldDecorator("contents", { rules: [{ required: true, message: "发送内容不能为空！" }] })(
                                    <TextArea style={{ height: 112, resize: "none" }} placeholder="请输入文本内容" />
                                )}
                            </FormItem>
                        ) : (
                            <FormItem {...formItemLayout} label="发送内容">
                                <div className="dropbox">
                                    {getFieldDecorator("url",
                                        { rules: [{ required: true, message: "发送内容不能为空！" }] }
                                    )(
                                        <Upload name="files" {...uploadParam} beforeUpload={this.beforeUpload} onChange={this.handleChange} >
                                            {imageUrl ? uploaded : uploadButton}
                                        </Upload>
                                    )}
                                </div>
                            </FormItem>
                        )}
                        <FormItem {...tailFormItemLayout}>
                            <Button type="primary" htmlType="submit">提交</Button>
                        </FormItem>
                    </Form>
                </Modal>
            </span>
        )
    }
}
function mapStateToProps (state) {
    const { chatsActive, auth } = state.chat
    return { chatsActive, auth }
}
const SendTimeForm = Form.create()(SendTime)
export default connect(mapStateToProps)(SendTimeForm)
