import { Form, Input, Modal, Radio, Button } from "antd"
const FormItem = Form.Item
const AddGroup = ({ form, groupVisible, addGroup, defalSel, dispatch }) => {
    const { getFieldDecorator } = form
    const onSubmit = (e) => {
        e.preventDefault()
        form.validateFields((err, values) => {
            if (!err) {
                const { nameGroup, hsgroup_type } = values
                dispatch({
                    type: "chat/addGroup",
                    payload: { nameGroup, hsgroup_type },
                })
                dispatch({ type: "chat/fetchFastWord", payload: { hsgroup_type } })
                addGroup()
            }
        })
    }
    const formItemLayout = {
        labelCol: { span: 5 },
        wrapperCol: { span: 18 },
    }
    return (
        <div>
            <Button type="primary" icon="plus" onClick={addGroup} style={{ marginBottom: 20, marginLeft: 10 }}>添加分组</Button>
            <Modal
                title="添加分组"
                visible={groupVisible}
                onCancel={addGroup}
                onOk={onSubmit}
            >
                <Form >
                    <FormItem label="快捷语类型" {...formItemLayout}>
                        {getFieldDecorator("hsgroup_type", { initialValue: defalSel }, { rules: [{ required: true, message: "请选择快捷语类型" }] })(

                            <Radio.Group buttonStyle="solid" style={{ marginBottom: 20 }}>
                                <Radio.Button value="1">私有快捷语</Radio.Button>
                                <Radio.Button value="2">公有快捷语</Radio.Button>
                                <Radio.Button value="3">部门快捷语</Radio.Button>
                            </Radio.Group>
                        )}
                    </FormItem>
                    <FormItem label="名称" {...formItemLayout} >
                        {getFieldDecorator("nameGroup", { rules: [{ required: true, message: "请填写名称" }] })(<Input autoComplete="off" style={{ width: 350 }} />)}
                    </FormItem>
                </Form>
            </Modal>
        </div>
    )
}
const GroupForm = Form.create()(AddGroup)
export default GroupForm
