import { Component } from "react"
import { connect } from "dva"
import { Collapse, Icon, Button, Modal, Form, Input, Radio, Upload, message, Menu, Dropdown, Select, Empty, Popconfirm } from "antd"
import styles from "./FastWord.css"
import Sortable from "sortablejs"
import AddGroup from "./FastAddGroup"
import TextAreas from "./TextAreas"
const Panel = Collapse.Panel
const customPanelStyle = { overflow: "hidden", borderRadius: "0" }
const Option = Select.Option
const FormItem = Form.Item
const RadioGroup = Radio.Group
// const { TextArea } = Input
const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 5 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
    colon: false,
}
const tailFormItemLayout = {
    wrapperCol: { xs: { span: 24, offset: 0 }, sm: { span: 16, offset: 5 } },
}
const uploadParam = {
    accept: "image/*",
    action: "//wechat.yunbeisoft.com/index_test.php/home/fileupload/upload_msg",
    data: { type: "image" },
    showUploadList: false,
    listType: "picture-card",
}
// function getBase64 (img, callback) {
//     const reader = new FileReader()
//     reader.addEventListener("load", () => callback(reader.result))
//     reader.readAsDataURL(img)
// }
const IconFont = Icon.createFromIconfontCN({
    scriptUrl: "//at.alicdn.com/t/font_862846_mt9ab5zhiy.js",
})
class FastWord extends Component {
    state = {
        visible: false,
        type: "1",
        loading: false,
        imageUrl: "",
        id: "",
        hsgroup_type: "1",
        groupVisible: false,
        selKsy: "",
        groupId: "",
    }
    componentDidMount () {
        const {fastgroup, dispatch} = this.props
        const isTure = fastgroup && fastgroup.findIndex((i) => i.hsgroup_type === this.state.hsgroup_type) === -1
        if (!fastgroup || isTure) {
            dispatch({ type: "chat/fetchFastWord", payload: { hsgroup_type: 1 } })
        }
    }
    addKsy = (groupId, e) => {
        e.stopPropagation()
        this.props.form.resetFields()
        this.setState({ visible: true, groupId, type: "1", imageUrl: "" })
    }
    closeModal = () => {
        this.setState({ visible: false, id: "", groupId: "" })
    }
    changeType = (e) => {
        this.setState({ type: e.target.value })
    }
    beforeUpload (file) {
        const isJPG = !!(file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg" || file.type === "image/gif")
        if (!isJPG) {
            message.error("请选择图片文件")
        }
        return isJPG
    }
    handleChange = (info) => {
        const { file } = info
        if (file.status === "uploading") {
            this.setState({ loading: true })
            return
        }
        if (file.status === "done") {
            if (!file.response.error) {
                this.setState({ imageUrl: file.response.data[0].url, loading: false })
            }
            // getBase64(info.file.originFileObj, (imageUrl) => this.setState({ imageUrl, loading: false }))
        }
    }
    handleSubmit = (e) => {
        e.preventDefault()
        const { dispatch, form } = this.props
        let { id, hsgroup_type, groupId, imageUrl } = this.state
        form.validateFields((err, fieldsValue) => {
            if (err) {
                return
            }
            const { title, type } = fieldsValue
            let text = type === "1" ? fieldsValue.text : imageUrl
            if (type === "9") {
                text = [{ type: "1", content: fieldsValue.text }, { type: "2", content: imageUrl }]
            }
            if (id) {
                groupId = fieldsValue.groupId
                dispatch({
                    type: "chat/editKsy",
                    payload: { groupId, title, type, text, id, isdisplay: 1 },
                })
            } else {
                dispatch({
                    type: "chat/addKsy",
                    payload: { groupId, title, type, text, hsgroup_type },
                })
            }
            form.resetFields()
            this.setState({ visible: false, imageUrl: "", loading: false, id: "", groupId: "" })
        })
    }
    sortableGroupDecorator = (componentBackingInstance) => {
        if (componentBackingInstance) {
            let options = {
                draggable: "div",
                animation: 150,
                onEnd: (evt) => {
                    const list = evt.to
                    const gid = list.id
                    let eleList = list.querySelectorAll("div")
                    let ids = []
                    for (let i = 0; i < eleList.length; i++) {
                        ids.push(eleList[i].id)
                    }
                    this.props.dispatch({
                        type: "chat/sortFastWord",
                        payload: { gid, ids },
                    })
                },
            }
            Sortable.create(componentBackingInstance, options)
        }
    }
    menu = ({ groupId, msg }) => (
        <Menu>
            {msg.type !== "3" ? <Menu.Item key="1">
                <div onClick={() => this.editFastWord({ groupId, msg })}>编辑快捷语</div>
            </Menu.Item> : <Menu.Item key="1">
                <div >暂不支持编辑语音</div>
            </Menu.Item>}
        </Menu>
    )
    editFastWord = ({ groupId, msg }) => {
        const { id, text, title, type } = msg
        let payload = { title, type }
        type === "1" ? payload.text = text : payload.url = text
        if (type === "9" && typeof text === "object") {
            payload.text = text.find((i) => i.type === "1").content
            payload.url = text.find((i) => i.type === "2").content
        }
        this.setState({ type, visible: true, imageUrl: type === "1" ? "" : text, id, groupId })
        this.props.form.setFieldsValue(payload)
    }
    selChange = async (e) => {
        await this.props.dispatch({ type: "chat/fetchFastWord", payload: { hsgroup_type: e.target.value, change: true } })
        this.setState({ hsgroup_type: e.target.value })
    }
    addGroup = () => {
        let { groupVisible } = this.state
        this.setState({ groupVisible: !groupVisible })
    }
    panelHeader = (item) => (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{item.name}</span>
            <Icon type="plus" onClick={(e) => this.addKsy(item.groupId, e)} style={{ color: "rgb(24,144,255)" }} />
        </div>

    )
    render () {
        let { fastgroup, checkKsy, dispatch } = this.props
        const { groupId } = this.state
        const modalProps = {
            footer: null,
            title: "添加快捷语",
            visible: this.state.visible,
            onCancel: this.closeModal,
            centered: true,
        }
        const { getFieldDecorator } = this.props.form
        const { imageUrl, type, groupVisible, hsgroup_type, id } = this.state
        if (fastgroup) {
            fastgroup = fastgroup.filter((i) => i.hsgroup_type === hsgroup_type)
        }

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
                <div className={styles.btns}>
                    <Radio.Group defaultValue={hsgroup_type} buttonStyle="solid" style={{ marginBottom: 20 }} onChange={this.selChange}>
                        <Radio.Button value="1">私有快捷语</Radio.Button>
                        <Radio.Button value="2">公有快捷语</Radio.Button>
                        <Radio.Button value="3">部门快捷语</Radio.Button>
                    </Radio.Group>
                </div>
                <span className="ksy">
                    {fastgroup.length ? (
                        <Modal {...modalProps}>
                            <Form onSubmit={this.handleSubmit}>
                                {id && <FormItem {...formItemLayout} label="选择分组">
                                    {getFieldDecorator("groupId", { rules: [{ required: true, message: "请选择分组！" }], initialValue: groupId ? groupId : fastgroup[0].groupId })(
                                        <Select>
                                            {fastgroup.map((wd) => <Option value={wd.groupId} key={wd.groupId}>{wd.name}</Option>)}
                                        </Select>
                                    )}
                                </FormItem>}

                                <FormItem {...formItemLayout} label="标题">
                                    {getFieldDecorator("title", { rules: [{ required: true, message: "请输入标题！" }] })(
                                        <Input placeholder="快捷语标题" />
                                    )}
                                </FormItem>
                                <FormItem {...formItemLayout} label="选择类型">
                                    {getFieldDecorator("type", { initialValue: type })(
                                        <RadioGroup onChange={this.changeType}>
                                            <Radio value="1">文本</Radio>
                                            <Radio value="2">图片</Radio>
                                            <Radio value="9">图文</Radio>
                                        </RadioGroup>
                                    )}
                                </FormItem>
                                <FormItem {...formItemLayout} label="快捷语" style={{ display: type !== "1" ? "block" : "none" }}>
                                    <div className="dropbox">
                                        {getFieldDecorator("url",
                                            { rules: [{ required: type !== "1", message: "内容不能为空！" }] }
                                        )(
                                            <Upload name="files" {...uploadParam} beforeUpload={this.beforeUpload} onChange={this.handleChange} >
                                                {imageUrl ? uploaded : uploadButton}
                                            </Upload>
                                        )}
                                    </div>
                                </FormItem>
                                <FormItem {...formItemLayout} label={type !== "9" ? "快捷语" : " "} style={{ display: type !== "2" ? "block" : "none" }} >
                                    {getFieldDecorator("text", { rules: [{ required: type !== "2", message: "内容不能为空！" }] })(
                                        // <TextArea style={{ height: 112, resize: "none" }} placeholder="请输入文本内容" />
                                        <TextAreas placeholder="请输入文本内容" />
                                    )}
                                </FormItem>
                                <FormItem {...tailFormItemLayout}>
                                    <Button type="primary" htmlType="submit">提交</Button>
                                </FormItem>
                            </Form>
                        </Modal>
                    ) : ""}
                    <Collapse bordered={false} defaultActiveKey={["0"]} >
                        {fastgroup.map((item) => (
                            <Panel key={item.groupId} header={this.panelHeader(item)} style={customPanelStyle}>
                                <div ref={this.sortableGroupDecorator} id={item.groupId}>
                                    {item.list && item.list.length > 0 ? item.list.map((msg) => (
                                        <Dropdown key={msg.id} overlay={this.menu({ groupId: item.groupId, msg })} trigger={["contextMenu"]}>
                                            {msg.type !== "3" ? <div id={msg.id} className={styles.word} onClick={checkKsy({ type: msg.type, content: msg.text })}>
                                                {msg.type === "9"
                                                    ? <IconFont type="icon-tuwenxiangqing" style={{ marginRight: "10px" }} />
                                                    : <Icon type={msg.type === "1" ? "edit" : "picture"} theme="twoTone" style={{ marginRight: "10px" }} />
                                                }
                                                <span title={msg.text}> {msg.title}</span>
                                            </div> : <Popconfirm id={msg.id} title="确认发送该语音吗?" onConfirm={checkKsy({ type: msg.type, content: msg.text })} okText="确定" cancelText="取消">
                                                <div className={styles.word}>
                                                    {msg.type === "9"
                                                        ? <IconFont type="icon-tuwenxiangqing" style={{ marginRight: "10px" }} />
                                                        : <Icon type="sound" theme="twoTone" style={{ marginRight: "10px" }} />
                                                    }
                                                    <span title={msg.text}> {msg.title}</span>
                                                </div>
                                            </Popconfirm>}


                                        </Dropdown>
                                    )) : <div className={styles.loadingBox}><Empty /></div>}
                                </div>
                            </Panel>
                        ))}
                    </Collapse>
                </span>
                <AddGroup groupVisible={groupVisible} addGroup={this.addGroup} dispatch={dispatch} defalSel={hsgroup_type} />
            </span>

        )
    }
}
function mapStateToProps (state) {
    const { fastgroup } = state.chat
    return { fastgroup }
}
const FastWordForm = Form.create()(FastWord)
export default connect(mapStateToProps)(FastWordForm)
