import { connect } from "dva"
import { Component } from "react"
import { Button, Modal, Input, Form } from "antd"
const FormItem = Form.Item
const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 5 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
    colon: false,
}
// const tailFormItemLayout = {
//     wrapperCol: { xs: { span: 24, offset: 0 }, sm: { span: 16, offset: 5 } },
// }

class AddCard extends Component {
    state = {
        visible: false,

    }

    onSubmit = (e) => {
        const { form, dispatch, msgSvrId, WeChatId } = this.props
        e.preventDefault()
        form.validateFields((err, values) => {
            if (err) {
                return
            }
            const payload = {
                MsgSvrId: msgSvrId,
                Message: values.Message ? values.Message : "",
                Remark: values.Remark ? values.Remark : "",
                WeChatId,
            }
            dispatch({ type: "chat/addCard", payload })
            this.openModal()
        })
    }
    openModal = () => {
        let { visible } = this.state
        this.setState({ visible: !visible })
    }

    render () {
        const { visible } = this.state
        const { form } = this.props
        const { getFieldDecorator } = form
        return (
            <div>
                <Button type="primary" size="small" onClick={this.openModal} >添加</Button>
                <Modal
                    title="添加好友"
                    visible={visible}
                    onCancel={this.openModal}
                    destroyOnClose={true}
                    // footer={null}
                    style={{ position: "relative" }}
                    width={530}
                    onOk={this.onSubmit}
                >
                    <Form >
                        <FormItem label="备注" {...formItemLayout}>
                            {getFieldDecorator("Remark")(
                                <Input></Input>
                            )}
                        </FormItem>
                        <FormItem label="验证消息" {...formItemLayout}>
                            {getFieldDecorator("Message")(
                                <Input></Input>
                            )}
                        </FormItem>
                        {/* <FormItem {...tailFormItemLayout}>
                            <Button type="primary" htmlType="submit">发送</Button>
                        </FormItem> */}
                    </Form>
                </Modal>

            </div>
        )
    }
}
// function mapStateToProps (state) {
//     const { usergroup } = state.custom
//     const { menuFold, wechatsActive, addRecord, addRecordTotal, allTags } = state.chat
//     return { menuFold, wechatsActive, addRecord, addRecordTotal, allTags, usergroup }
// }
const AddCardForm = Form.create()(AddCard)
export default connect()(AddCardForm)
