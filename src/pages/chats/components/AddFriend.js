import { connect } from "dva"
import { Component } from "react"
import styles from "./AddFriend.css"
import { Button, Modal, Input, Form, Table, Select, Radio } from "antd"
import moment from "moment"
const FormItem = Form.Item
const { TextArea } = Input
const Option = Select.Option
const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 5 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
    colon: false,
}
const tailFormItemLayout = {
    wrapperCol: { xs: { span: 24, offset: 0 }, sm: { span: 16, offset: 5 } },
}
const plainOptions = [
    { label: "手机号码", value: "1" },
    // { label: "时间+昵称", value: "2" },
    { label: "时间+昵称+号码", value: "3" },
    { label: "自定义", value: "0" },
]
class AddFriend extends Component {
    state = {
        visible: false,
        current: 1,
        hisVisibale: false,
    }
    addChat = () => {
        this.setState({ visible: true })
    }
    addCancel = () => {
        this.setState({ visible: false })
    }
    addTime = () => {
        this.props.form.setFieldsValue({
            remark: `${this.props.form.getFieldValue("remark") || ""}${moment().format("YYYY-MM-DD HH:mm:ss")}`,
        })
    }
    showHisModal = () => {
        const { dispatch, wechatsActive } = this.props
        dispatch({ type: "chat/fetchaddFriend", payload: { wxid: wechatsActive, p: 1, pagesize: 10 } })
        this.setState({ hisVisibale: true, visible: false, current: 1 })
    }
    hideHis = () => {
        this.setState({ hisVisibale: false, visible: true })
    }
    pageChangeHandler = (e) => {
        const { dispatch, wechatsActive } = this.props
        dispatch({ type: "chat/fetchaddFriend", payload: { wxid: wechatsActive, p: e, pagesize: 10 } })
        this.setState({ current: e })
    }
    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
                return
            }
            window.sessionStorage.setItem("message", fieldsValue.message || "")
            const { dispatch, wechatsActive } = this.props
            dispatch({
                type: "chat/addChat",
                payload: { wxid: wechatsActive, ...fieldsValue },
            })
            this.addCancel()
        })
    }

    render () {
        const { getFieldDecorator, getFieldValue } = this.props.form
        const { menuFold, addRecord, addRecordTotal, usergroup, allTags } = this.props
        const { visible, hisVisibale, current } = this.state
        const groups = usergroup && usergroup.length > 0 ? usergroup.filter((item) => item.id !== "0") : []
        const columns = [{
            title: "设备",
            dataIndex: "devicename",
            key: "devicename",
        }, {
            title: "添加好友",
            dataIndex: "phone",
            key: "phone",
        }, {
            title: "备注",
            dataIndex: "remark",
            key: "remark",
            width: 200,
        },
        {
            title: "是否通过",
            dataIndex: "success",
            key: "success",
            width: 100,
            align: "center",
            render: (success) => success === 1 ? "是" : "否",
        },
        {
            title: "设备是否执行",
            dataIndex: "status",
            key: "status",
            width: 120,
            align: "center",
            render: (status) => status === "1" ? "是" : "否",
        },
        {
            title: "添加时间",
            dataIndex: "addtime",
            key: "addtime",

        },
        {
            title: "验证信息",
            dataIndex: "message",
            key: "message",

        }]
        const ShowTotalItem = () => (
            <span style={{ marginTop: 5, color: "rgba(0,0,0,0.5)", display: "block" }}>总数{addRecordTotal}条</span>
        )
        const paginationConfig = {
            total: addRecordTotal, // 总数
            defaultPageSize: 20, // 每页显示条数
            showTotal: ShowTotalItem,
            onChange: this.pageChangeHandler, // 点击分页
            current,
        }
        const isRemark = getFieldValue("is_auto_remark") === "0"
        return (
            <div>
                <Button
                    icon="plus"
                    className={styles.extraBtn}
                    title="添加好友"
                    onClick={this.addChat}
                    disabled={!menuFold}
                />
                <Modal
                    title="添加好友"
                    visible={visible}
                    onCancel={this.addCancel}
                    destroyOnClose={true}
                    footer={null}
                    style={{ position: "relative" }}
                    width={530}
                >
                    <Form onSubmit={this.handleSubmit}>
                        <FormItem label="自动分组" {...formItemLayout}>
                            {getFieldDecorator("fid")(
                                <Select>
                                    {groups.map((item) =>
                                        <Option value={item.id} key={item.id}>{item.fenzu_name}</Option>
                                    )}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem label="自动打标" {...formItemLayout}>
                            {getFieldDecorator("tagid")(
                                <Select>
                                    {allTags && allTags.map((item) =>
                                        <Option value={item.id} key={item.id}>{item.tag_name}</Option>
                                    )}
                                </Select>
                            )}
                        </FormItem>
                        <FormItem label="手机号码" {...formItemLayout}>
                            {getFieldDecorator("telephone", { rules: [{ required: true, message: "请输入要添加的手机" }] })(
                                <Input ref={(input) => (input && input.focus())} placeholder="请输入手机号码" />
                            )}
                        </FormItem>
                        <FormItem label="备注" {...formItemLayout} style={{margin: isRemark && 0}}>
                            {getFieldDecorator("is_auto_remark", {initialValue: "1"})(
                                <Radio.Group options={plainOptions}/>
                            )}
                        </FormItem>
                        {isRemark && <FormItem label=" " {...formItemLayout}>
                            {getFieldDecorator("remark")(<Input placeholder="请输入备注" />)}
                        </FormItem>}
                        <FormItem label="验证消息" {...formItemLayout}>
                            {getFieldDecorator("message", { initialValue: window.sessionStorage.getItem("message") })(
                                <TextArea style={{ height: 112, resize: "none" }} placeholder="请输入验证消息" />
                            )}
                        </FormItem>
                        <FormItem {...tailFormItemLayout}>
                            <Button type="primary" htmlType="submit">发送</Button>
                            <a className={styles.checkBtn} onClick={this.showHisModal}>查看加好友记录</a>
                        </FormItem>
                    </Form>
                </Modal>
                <Modal
                    style={{ top: 50 }}
                    width="1200px"
                    title="添加好友记录"
                    visible={hisVisibale}
                    onCancel={this.hideHis}
                    destroyOnClose={true}
                    footer={null}
                >
                    <Table bordered pagination={paginationConfig} rowKey="id" dataSource={addRecord} columns={columns} />
                </Modal>
            </div>
        )
    }
}
function mapStateToProps (state) {
    const { usergroup } = state.custom
    const { menuFold, wechatsActive, addRecord, addRecordTotal, allTags } = state.chat
    return { menuFold, wechatsActive, addRecord, addRecordTotal, allTags, usergroup }
}
const AddFriendForm = Form.create()(AddFriend)
export default connect(mapStateToProps)(AddFriendForm)
