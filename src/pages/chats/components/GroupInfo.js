import { Component } from "react"
import { connect } from "dva"
import { Avatar, Spin, Input, Popconfirm, Icon, Form, Modal, Button, Divider, AutoComplete, Empty, Badge } from "antd"
import { Ellipsis } from "ant-design-pro"
import styles from "./GroupInfo.css"
import request from "../../../utils/request"
import GroupJoin from "./GroupJoin"
import GroupAdd from "./GroupAdd"
import ExtendFile from "./extendFile"
const FormItem = Form.Item
const { TextArea } = Input
const Option = AutoComplete.Option
const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 5 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
    colon: false,
}
const tailFormItemLayout = {
    wrapperCol: { xs: { span: 24, offset: 0 }, sm: { span: 16, offset: 5 } },
}
const loadUrl = "//wechat.yunbeisoft.com/index_test.php/home/quns/get_qun_friends"

class GroupInfo extends Component {
    state = {
        isLoading: false,
        visible: false,
        value: "",
        modalVisible: false,
        addId: "",
        search: false,
        searchVisible: false,
        dataSource: "",
    }
    componentDidMount () {
        this.initLoad()
    }
    componentDidUpdate () {
        this.initLoad()
    }
    initLoad = () => {
        const { quns, qunsPage, qunsHasMore, chatsActive, token } = this.props
        if (!this.state.isLoading && qunsHasMore && quns.length < 1) {
            this.load({ userid: chatsActive, page: qunsPage, token })
        }
    }
    loadMore = () => {
        const { qunsPage, qunsHasMore, chatsActive, token } = this.props
        if (!this.state.isLoading && qunsHasMore) {
            this.load({ userid: chatsActive, token, page: qunsPage + 1 })
        }
    }
    load = async (data) => {
        this.setState({ isLoading: true })
        data.wxid = this.props.wechatsActive
        let option = {
            url: loadUrl,
            data: JSON.stringify(data),
        }
        let { data: res } = await request(option)
        if (!res.error) {
            this.props.dispatch({
                type: "chat/saveQuns",
                payload: { ...res, ...data },
            })
        }
        setTimeout(() => {this.setState({ isLoading: false })}, 1000)
    }
    editQun = (active) => {
        this.setState({ visible: true, value: active.remark || active.nick || active.wxid }, () => this.input.focus())
    }
    changeQun = (e) => {
        this.setState({ value: e.target.value })
    }
    doneChange = () => {
        const { value } = this.state
        this.setState({ visible: false, value: "" })
        if (value && value.replace(/\s+/g, "").length > 0) {
            const { dispatch, chatsActive, chats } = this.props
            const active = chats.find((item) => item.userid === chatsActive)
            dispatch({
                type: "chat/editQun",
                payload: { oldVal: active.remark, newVal: value, userid: chatsActive },
            })
        }
    }
    logOutQun = () => {
        const { dispatch, chatsActive, chats } = this.props
        const active = chats.find((item) => item.userid === chatsActive)
        dispatch({
            type: "chat/logOutQun",
            payload: { userid: chatsActive, wxid: active.kefu_wxid },
        })
    }
    outQun = (id) => {
        this.props.dispatch({
            type: "chat/outQuns",
            payload: { id, userid: this.props.chatsActive },
        })
    }
    getTalk = (item) => {
        this.props.dispatch({ type: "chat/upChatsActive", payload: item })
    }
    getFriend = (item) => {
        this.setState({ modalVisible: true, addId: item.wxid })
    }
    addCancel = () => {
        this.setState({ modalVisible: false, addId: "" })
    }
    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
                return
            }
            window.sessionStorage.setItem("message", fieldsValue.message || "")
            const { dispatch, chatsActive, chats } = this.props
            const active = chats.find((item) => item.userid === chatsActive)
            dispatch({
                type: "chat/addGroupChat",
                payload: { wxid: this.state.addId, ...fieldsValue, userid: active.userid },
            })
            this.addCancel()
        })
    }
    handleSearch = (e) => {
        let nick = e.target.value
        if (nick && nick.replace(/\s+/g, "").length > 0) {
            this.setState({ search: true, searchVisible: true })
            setTimeout(async () => {
                const { chatsActive, chats, token } = this.props
                const active = chats.find((item) => item.userid === chatsActive)
                let data = { wxid: active.kefu_wxid, userid: chatsActive, nick, token }
                let option = {
                    url: loadUrl,
                    data: JSON.stringify(data),
                }
                let { data: res } = await request(option)
                this.setState({ dataSource: res.data, search: false })
            }, 1000)
        }
    }
    handleBlur = () => {
        this.setState({ searchVisible: false, dataSource: "" })
    }
    handleSelect = (e) => {
        const { dataSource } = this.state
        let qun = dataSource.find((item) => item.id === e)
        this.handleBlur()
        const { dispatch, chatsActive } = this.props
        dispatch({ type: "chat/saveQun", payload: { qun, userid: chatsActive } })
    }
    saveInputRef = (input) => (this.input = input)
    render () {
        const { getFieldDecorator } = this.props.form
        const { chatsActive, chats, quns, qunsHasMore } = this.props
        const { isLoading, visible, value, modalVisible, search, searchVisible, dataSource } = this.state
        let options = [<Option key="loading" value="" className={styles.search}><Spin /></Option>]
        if (!search) {
            if (dataSource && dataSource.length > 0) {
                options = dataSource.map((item) => (
                    <Option key={item.id} value={item.id}>
                        <Avatar
                            icon="user"
                            src={item.headImg}
                            style={{ marginRight: 12 }}
                        />
                        {item.remark || item.nick || item.wxid}
                    </Option>
                ))
            } else {
                options = [<Option key="noData" value=""><Empty /></Option>]
            }
        }
        const active = chats.find((item) => item.userid === chatsActive)
        const groupChats = quns
        const hasMore = qunsHasMore
        const inputStyle = {
            type: "text",
            size: "small",
            style: { width: 130 },
            value: value,
        }
        let showOutQun = false
        const index = groupChats ? groupChats.findIndex((i) => `${i.is_qunzhu}` === "1") : -1
        if (index !== -1 && groupChats[index].wxid === active.kefu_wxid) {
            showOutQun = true
        }
        return (
            <div className={styles.infoBox}>
                <div className={styles.item}>
                    <div className={styles.itemHeader}>群信息</div>
                    <div className={styles.itemBody}>
                        <div className={styles.line}>
                            <div className={styles.thumb}>
                                <Avatar size="large" icon="user" src={active.headImg} />
                            </div>
                            <div className={styles.nick}>
                                <div className={styles.nickItem}>
                                    {visible
                                        ? <Input
                                            {...inputStyle}
                                            ref={this.saveInputRef}
                                            onChange={this.changeQun}
                                            onBlur={this.doneChange}
                                            onPressEnter={this.doneChange}
                                        />
                                        : <Ellipsis lines={2} tooltip>
                                            {active.remark || active.nick || active.wxid}
                                        </Ellipsis>
                                    }
                                </div>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <a onClick={() => this.editQun(active)}>修改群名称</a>
                                    <Divider type="vertical" />
                                    <GroupJoin userid={chatsActive} />
                                    <Divider type="vertical" />
                                    <Popconfirm
                                        title={`退出"${active.remark || active.nick || active.wxid}"群聊？`}
                                        onConfirm={this.logOutQun}
                                        icon={
                                            <Icon
                                                type="exclamation-circle"
                                                style={{ color: "red" }}
                                            />
                                        }
                                    >
                                        <a style={{ color: "red" }}>退群</a>
                                    </Popconfirm>
                                </div>

                            </div>
                        </div>
                        <ExtendFile />
                    </div>
                </div>
                <div className={styles.item}>
                    <div className={styles.itemHeader}>
                        群成员
                        <div className={styles.extra}>
                            <div id="search">
                                <AutoComplete
                                    size="small"
                                    defaultActiveFirstOption={false}
                                    allowClear={true}
                                    open={searchVisible}
                                    dataSource={options}
                                    optionLabelProp="nick"
                                    onBlur={this.handleBlur}
                                    onSelect={this.handleSelect}
                                >
                                    <Input
                                        size="small"
                                        prefix={<Icon type="search" />}
                                        placeholder="搜索群联系人"
                                        onPressEnter={this.handleSearch}
                                    />
                                </AutoComplete>
                            </div>
                            <GroupAdd userid={chatsActive} />
                        </div>
                    </div>
                    <div className={styles.itemBody}>
                        {groupChats && groupChats.length > 0 && groupChats.map((item) =>
                            <div key={item.id} className={styles.member}>
                                <div className={styles.thumb}>
                                    <Avatar icon="user" src={item.headImg} />
                                </div>
                                {Number(item.is_qunzhu) === 1 && <Badge style={{ backgroundColor: "#1890ff", color: "#fff", marginRight: 8 }} count="群主" />}
                                <div className={styles.nick}>
                                    <Ellipsis lines={1} tooltip>
                                        {item.remark || item.nick || item.wxid}
                                    </Ellipsis>
                                </div>
                                <div className={styles.action}>
                                    {item.is_benren === 1
                                        ? <span style={{ color: "rgba(0, 0, 0, .45)" }}>自己</span>
                                        : <span>
                                            {item.is_friend === "1"
                                                ? <a onClick={() => this.getTalk(item)}>聊天</a>
                                                : <a onClick={() => this.getFriend(item)}>添加</a>
                                            }
                                            {showOutQun &&
                                                <Popconfirm
                                                    title={`将"${item.nick}"移出群聊？`}
                                                    onConfirm={() => this.outQun(item.id)}
                                                    icon={<Icon type="exclamation-circle" style={{ color: "red" }} />}
                                                >
                                                    <Divider type="vertical" />
                                                    <a style={{ color: "red" }}>移出</a>
                                                </Popconfirm>
                                            }
                                        </span>
                                    }
                                </div>
                            </div>
                        )}
                        {hasMore &&
                            <div className={styles.btn}>
                                {isLoading
                                    ? <Spin />
                                    : <a onClick={this.loadMore}>查看更多</a>
                                }
                            </div>
                        }
                    </div>
                </div>
                <Modal
                    title="添加好友"
                    visible={modalVisible}
                    onCancel={this.addCancel}
                    destroyOnClose={true}
                    footer={null}
                >
                    <Form onSubmit={this.handleSubmit}>
                        <FormItem label="备注" {...formItemLayout} extra="不填则默认后台设置备注，或为空">
                            {getFieldDecorator("remark")(<Input ref={(input) => (input && input.focus())} placeholder="请输入备注" />)}
                        </FormItem>
                        <FormItem label="验证消息" {...formItemLayout}>
                            {getFieldDecorator("message", { initialValue: window.sessionStorage.getItem("message") })(
                                <TextArea style={{ height: 112, resize: "none" }} placeholder="请输入验证消息" />
                            )}
                        </FormItem>
                        <FormItem {...tailFormItemLayout}>
                            <Button type="primary" htmlType="submit">发送</Button>
                        </FormItem>
                    </Form>
                </Modal>
            </div>
        )
    }
}
function mapStateToProps (state) {
    const { chatsActive, chats, quns, token, qunsPage, qunsHasMore, wechatsActive } = state.chat
    return { chatsActive, chats, quns, token, qunsPage, qunsHasMore, wechatsActive }
}
const GroupInfoForm = Form.create()(GroupInfo)
export default connect(mapStateToProps)(GroupInfoForm)
