import { Component } from "react"
import { connect } from "dva"
import { Button, Modal, Empty, Form, Input, message, Checkbox, Avatar, Spin, Icon } from "antd"
import styles from "./GroupAdd.css"
import request from "../../../utils/request"
import { Ellipsis } from "ant-design-pro"
import InfiniteScroll from "react-infinite-scroller"
const FormItem = Form.Item
const { TextArea } = Input
const CheckboxGroup = Checkbox.Group
const loadUrl = "//wechat.yunbeisoft.com/index_test.php/home/quns/get_qun_friends"
const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 5 } },
    wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
    colon: false,
}
const tailFormItemLayout = {
    wrapperCol: { xs: { span: 24, offset: 0 }, sm: { span: 16, offset: 5 } },
}
class GroupAdd extends Component {
    state = {
        show: false,
        list: [],
        loading: false,
        wxid: [],
        checkall: false,
        page: 0,
        hasMore: true,
    }
    onLoad = async () => {
        let { hasMore, page } = this.state
        let { token, chatsActive } = this.props
        if (!hasMore) {
            return []
        }
        this.setState({ loading: true })
        let data = {
            token,
            userid: chatsActive,
            page: page + 1,
        }
        let option = {
            url: loadUrl,
            data: JSON.stringify(data),
        }
        let { data: res } = await request(option)
        if (!res.error) {
            this.setState({ hasMore: res.hasMore, page: data.page })
        }
        return res.data

    }
    hasLoad = () => {
        this.openAdd()
    }
    openAdd = async () => {
        this.setState({ show: true })
        let { list } = this.state
        let quns = await this.onLoad()
        quns.map((item) => {
            if (item.is_benren !== 1 && item.is_friend !== "1") {
                list.push(item)
            }
        })
        this.setState({ list, loading: false })
    }
    onCancel = () => {
        this.setState({ show: false, list: [], wxid: [], checkall: false, page: 0, hasMore: true })
    }
    onChange = (e) => {
        let { list, checkall } = this.state
        if (e.length !== list.length) {
            checkall = false
        } else {
            checkall = true
        }
        this.setState({ wxid: e, checkall })
    }
    selAll = (e) => {
        let wxid = []
        let { list } = this.state
        if (e.target.checked) {
            for (let i = 0, len = list.length; i < len; i++) {
                wxid.push(list[i].wxid)
            }
        }
        this.setState({ wxid, checkall: e.target.checked })
    }
    handleSubmit = (e) => {
        let { wxid, checkall } = this.state
        let { userid, form, dispatch } = this.props
        e.preventDefault()
        form.validateFields((err, value) => {
            if (err) {
                return
            }

            if (!wxid.length) {
                return message.warning("请选择添加的好友")
            }
            let payload = {
                userid,
                message: value.message ? value.message : "",
                remark: value.remark ? value.remark : "",
            }
            if (checkall) {
                payload.type = "1"
            } else {
                payload.wxid = wxid
            }
            dispatch({ type: "chat/qunsAddFriends", payload })
            this.onCancel()
        })
    }
    render () {
        const { show, list, wxid, checkall, loading, hasMore } = this.state
        const { getFieldDecorator } = this.props.form
        let options = []
        if (list.length > 0) {
            list.map((item) => {
                options.push(
                    {
                        label:
                            <span>
                                <Avatar className={styles.thumb} src={item.headImg} icon="user" />
                                <Ellipsis length={25} style={{ display: "inline" }} fullWidthRecognition>
                                    {item.remark || item.nick || item.FriendNo || ""}
                                </Ellipsis>
                            </span>,
                        value: item.wxid,
                    },
                )
            })
        }
        return (
            <div >
                <Button
                    size="small"
                    icon="plus"
                    className={styles.extraBtn}
                    title="添加好友"
                    onClick={this.openAdd}
                />
                <Modal visible={show} onCancel={this.onCancel} title="选择联系人" footer={null} destroyOnClose={true} bodyStyle={{ padding: "0 24px 24px 24px" }}>

                    <div>
                        <Form onSubmit={this.handleSubmit} style={{ marginTop: 24 }}>
                            <FormItem {...formItemLayout} label="选择好友">
                                {getFieldDecorator("wxid")(<div className={styles.contacts}>
                                    <Checkbox checked={checkall} onChange={this.selAll} style={{ padding: "0 12px" }}>全部</Checkbox>
                                    <Spin
                                        indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />}
                                        spinning={loading} >
                                        <div className={styles.container} ref={(ref) => this.scrollParentRef = ref} >
                                            <InfiniteScroll
                                                initialLoad={false}
                                                loadMore={this.hasLoad}
                                                hasMore={!loading && hasMore}
                                                useWindow={false}
                                                getScrollParent={() => this.scrollParentRef}
                                            >
                                                <CheckboxGroup value={wxid} options={options} onChange={this.onChange} style={{ width: "100%" }} />
                                            </InfiniteScroll>
                                            {!loading && !list.length && <Empty />}
                                        </div>
                                    </Spin>
                                </div>)}
                            </FormItem>
                            <FormItem {...formItemLayout} label="备注" extra="不填则默认后台设置备注，或为空">
                                {getFieldDecorator("remark")(<Input placeholder="请输入备注" />)}
                            </FormItem>
                            <FormItem label="验证消息" {...formItemLayout} >
                                {getFieldDecorator("message", { initialValue: window.sessionStorage.getItem("message") })(
                                    <TextArea style={{ height: 80, resize: "none" }} placeholder="请输入验证消息" />
                                )}
                            </FormItem>
                            <FormItem {...tailFormItemLayout}>
                                <Button type="primary" htmlType="submit">确定</Button>
                                <Button onClick={() => this.onCancel()} style={{ marginLeft: 15 }}>取消</Button>
                            </FormItem>
                        </Form>
                    </div>

                </Modal>
            </div >
        )
    }
}
function mapStateToProps (state) {
    const { chatsActive, token } = state.chat
    return { chatsActive, token }
}
const GroupAddFrom = Form.create()(GroupAdd)
export default connect(mapStateToProps)(GroupAddFrom)
