
import { Form, Input, Modal, Select } from "antd"
import { Component } from "react"
import { connect } from "dva"
const FormItem = Form.Item
const Option = Select.Option
class CustomPop extends Component {
    state = { customVisible: false }
    onSubmit = (e) => {
        const { form, dispatch, chatsActive } = this.props
        e.preventDefault()
        form.validateFields((err, values) => {
            if (!err) {
                dispatch({
                    type: "chat/customShare",
                    payload: { userid: chatsActive, zhuan_remark: values.zhuan_remark ? values.zhuan_remark : "", to_kefu_id: values.to_kefu_id },
                })
                this.setState({ customVisible: false })
            }
        })
    }
    showPop = () => {
        const { customVisible } = this.state
        this.setState({ customVisible: !customVisible })
    }
    render () {
        const formItemLayout = {
            labelCol: { span: 5 },
            wrapperCol: { span: 18 },
        }
        const { kefu, form, auth } = this.props
        const { getFieldDecorator } = form
        const { customVisible } = this.state
        return (
            <div>
                <span onClick={this.showPop}>转接客服</span>
                <Modal
                    title="转接客服"
                    visible={customVisible}
                    onCancel={this.showPop}
                    onOk={this.onSubmit}
                >
                    <Form >
                        <FormItem label="客服" {...formItemLayout}>
                            {getFieldDecorator("to_kefu_id", {
                                rules: [{ required: true, message: "请选择目标客服" }],
                            })(
                                <Select style={{ width: 350 }} placeholder="请选择目标客服" allowClear={true}>
                                    {kefu && kefu.map((item, index) => item.id !== auth.id && (
                                        <Option key={index} value={item.id}>{item.nickname}</Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem label="附言" {...formItemLayout} >
                            {getFieldDecorator("zhuan_remark")(<Input autoComplete="off" style={{ width: 350 }} />)}
                        </FormItem>
                    </Form>
                </Modal>
            </div>


        )
    }
}
function mapStateToProps (state) {
    const { chatsActive, kefu, auth } = state.chat
    return { chatsActive, kefu, auth }
}
const CustomForm = Form.create()(CustomPop)
export default connect(mapStateToProps)(CustomForm)
