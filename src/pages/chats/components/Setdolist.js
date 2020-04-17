import { Component } from "react"
import { connect } from "dva"
import { Icon, Modal, Form, Button, Input } from "antd"
import DatePick from "../../../components/DatePick"
const FormItem = Form.Item
const { TextArea } = Input
class Setdolist extends Component {
    state = {
        visible: false,
    }
    handleSubmit = (e) => {
        const {chat, dispatch, form } = this.props
        e.preventDefault()
        form.validateFields(async (err, fieldsValue) => {
            if (err) {
                return
            }
            const { content, dingshi_time } = fieldsValue
            let payload = { content, dingshi_time, userid: chat.userid }
            await dispatch({ type: "chat/addDolist", payload })
            dispatch({ type: "chat/fetchDolist" })
            this.setState({ visible: false })
        })
    }
    showModal = () => {
        this.setState({ visible: true })
    }
    closeModal = () => {
        this.setState({ visible: false })
    }

    render () {
        const modalProps = {
            footer: null,
            title: "创建待办事项",
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

        return (
            <span>
                <Icon type="form" theme="outlined" title="待办事项" onClick={this.showModal} />
                <Modal {...modalProps}>
                    <Form onSubmit={this.handleSubmit}>
                        <FormItem {...formItemLayout} label="选择时间">
                            {getFieldDecorator("dingshi_time", {
                                rules: [{ required: true, message: "请选择时间！" }],
                            })(
                                <DatePick />
                            )}
                        </FormItem>

                        <FormItem {...formItemLayout} label="内容">
                            {getFieldDecorator("content", { rules: [{ required: true, message: "填写内容不能为空！" }] })(
                                <TextArea style={{ height: 112, resize: "none" }} placeholder="请输入文本内容" />
                            )}
                        </FormItem>
                        <FormItem {...tailFormItemLayout}>
                            <Button type="primary" htmlType="submit">提交</Button>
                        </FormItem>
                    </Form>
                </Modal>
            </span>
        )
    }
}

const SetdoForm = Form.create()(Setdolist)
export default connect()(SetdoForm)
