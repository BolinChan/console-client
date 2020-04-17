import { Component } from "react"
import { connect } from "dva"
import { Form, Radio, Modal, Button, Input, message } from "antd"
import UploadImg from "./UploadImg"
import TextArea from "./TextArea"
import request from "../../../utils/request"
const FormItem = Form.Item

const buttonStyle = {
    style: { display: "flex", width: "100%", justifyContent: "flex-end", margin: 0 },
}
const formItemLayout = {
    labelCol: { xs: { span: 1 }, sm: { span: 3 } },
    wrapperCol: { xs: { span: 1 }, sm: { span: 18 } },
    colon: false,
}
class momentSend extends Component {
    state = {
        topType: "8",
    }
    handleCancle = () => {
        this.props.open()
    }
    handleSubmit=(event) => {
        event.preventDefault()
        const {form, wechatsActive, open} = this.props
        form.validateFields(async (error, values) => {
            if (!error) {
                if ((!values.img && !values.contents) || (!values.url && !values.contents)) {
                    return message.error("请填写内容")
                }
                let option = {
                    url: "//wechat.yunbeisoft.com/index_test.php/home/api/dopengyouquan",
                    data: {deviceIds: [wechatsActive], contents: values.contents},
                }
                if (values.type === "8") {
                    option.data.imgs = values.img
                } else {
                    option.data.url = values.url
                }
                option.data.type = values.type
                option.data = JSON.stringify(option.data)
                let { data } = await request(option)
                if (!data.error) {
                    open()
                    return message.success("发送成功,请稍后刷新")
                } else {
                    return message.error("发送失败")
                }
            }
        })
    }
    onChange=(e) => {
        this.setState({topType: e.target.value})
    }
    render () {
        const { topType } = this.state
        const { visible, form, open } = this.props
        const { getFieldDecorator } = form
        return (

            <Modal
                width="600px"
                visible={visible}
                destroyOnClose={true}
                footer={null}
                maskClosable={true}
                keyboard={true}
                onCancel={open}
            >
                <Form onSubmit={this.handleSubmit}>
                    <FormItem>
                        {getFieldDecorator("type", { initialValue: topType })(
                            <Radio.Group onChange={this.onChange} buttonStyle="solid">
                                <Radio.Button value="8" style={{width: 80, textAlign: "center"}}>图文</Radio.Button>
                                <Radio.Button value="9" style={{width: 80, textAlign: "center"}}>链接</Radio.Button>
                            </Radio.Group>
                        )}
                    </FormItem>
                    {topType === "8" && <FormItem label="图片" {...formItemLayout}>
                        {getFieldDecorator("img", { initialValue: topType })(
                            <UploadImg uploadMaxNum={9} />
                        )}
                    </FormItem>}
                    {topType === "9" && <FormItem label="链接"{...formItemLayout} >
                        {getFieldDecorator("url")(<Input style={{ width: "100%" }} autoComplete="off" placeholder="请输入链接" />)}
                    </FormItem>}
                    <FormItem label="文案" {...formItemLayout}>
                        {getFieldDecorator("contents")(
                            <TextArea placeholder="输入内容不重复，降低封号几率。" isRandom={true} />
                        )}
                    </FormItem>
                    <FormItem {...buttonStyle} >
                        <Button onClick={this.handleCancle}>取消</Button>
                        <Button type="primary" htmlType="submit" style={{ marginLeft: 15 }}> 确定</Button>
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
const SendForm = Form.create()(momentSend)
function mapStateToProps (state) {
    const { wechatsActive } = state.chat
    return { wechatsActive }
}
export default connect(mapStateToProps)(SendForm)
