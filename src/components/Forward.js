import { Component } from "react"
import { connect } from "dva"
import { Modal, Form, Checkbox, Button, Spin, Empty, message, Avatar, Radio, Input, Icon, Upload, DatePicker, Select, InputNumber } from "antd"
import { Ellipsis } from "ant-design-pro"
import InfiniteScroll from "react-infinite-scroller"
import styles from "./Forward.css"
import request from "../utils/request"
const { RangePicker } = DatePicker
const RadioButton = Radio.Button
const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group
const RadioGroup = Radio.Group
const { Option } = Select

const { TextArea } = Input
const loadUrl = "//wechat.yunbeisoft.com/index_test.php/home/Collect/get_qunfa_friends"
const sendUrl = "//wechat.yunbeisoft.com/index_test.php/home/api/doqunfa_kefu"
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

class Forward extends Component {
    state = {
        isLoading: false,
        list: [],
        hasMore: true,
        page: 1,
        deletes: [],

        uploading: false,
        imageUrl: "",

        limitTyp: "==",
        jd: "",
        tb: "",
        times: "",
        limit: "",
    }
    handleClose = () => {
        this.props.form.resetFields()
        this.setState({ isLoading: false, list: [], hasMore: true, page: 1, uploading: false, imageUrl: "" })
    }
    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                const { qunsType, text, type, fid, userids, tagid } = values
                const { wechatsActive, status, data, over } = this.props
                let times = []

                const option = {
                    url: sendUrl,
                    data: { kefu_wxid: wechatsActive, status, type, ...data },
                }

                if (status === 1) {
                    option.data.content = type === "2" ? this.state.imageUrl : text
                    switch (qunsType) {
                        case "1":
                            if (userids && userids[0] === "all") {
                                userids.splice(0, 1)
                            }
                            option.data.userids = userids
                            break
                        case "2":
                            option.data.fid = fid
                            break
                        case "3":
                            option.data.tagid = tagid
                            break
                        case "4":
                            times = values.times || []
                            if (times.length > 0) {
                                times = [times[0].format("YYYY-MM-DD"), times[1].format("YYYY-MM-DD")]
                            }
                            option.data = {
                                ...option.data,
                                userids,
                                deletes: this.state.deletes,
                                jd: values.jd,
                                times,
                                limitTyp: this.state.limitTyp,
                                limit: values.limit,
                                tb: values.tb,
                            }
                            break
                        default:
                            break
                    }

                } else {
                    option.data.userids = [userids]
                }

                option.data = JSON.stringify(option.data)
                let { data: res } = await request(option)
                if (res.error) {
                    message.error(res.errmsg)
                } else {
                    message.success(res.errmsg)
                }
                over()
            }
        })
    }
    loadMore = async () => {
        let { isLoading, list, page } = this.state
        if (isLoading) {
            return
        }
        const { wechatsActive: kefu_wxid } = this.props
        const option = {
            url: loadUrl,
            data: JSON.stringify({ page, kefu_wxid }),
        }
        this.setState({ isLoading: true })
        let { data } = await request(option)
        if (data.error) {
            this.setState({ isLoading: false })
            return message.error(data.errmsg)
        }
        const { data: res, hasMore } = data
        if (res && res.length > 0) {
            if (list.length > 0) {
                res.map((item) => {
                    if (list.findIndex((li) => li.userid === item.userid) === -1) {
                        list.push(item)
                    }
                })
            } else {
                list = res
            }
        }
        this.setState({ isLoading: false, list, hasMore, page: page + 1 })
        this.selectMore(res)
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
            this.setState({ uploading: true })
            return
        }
        if (file.status === "done") {
            if (!file.response.error) {
                this.setState({ imageUrl: file.response.data[0].url, uploading: false })
            }
        }
    }

    changeLimitTyp = (limitTyp) => {
        this.setState({ limitTyp })
    }

    changeTyp = (e) => {
        this.setState({
            isLoading: false,
            list: [],
            hasMore: true,
            page: 1,
            jd: "",
            tb: "",
            times: "",
            limit: "",
            deletes: [],
        })
        this.props.form.setFieldsValue({userids: []})
    }

    extraLoad = async () => {
        let {
            isLoading,
            list,
            page,
            limitTyp,
            jd,
            tb,
            times,
            limit,
        } = this.state
        if (isLoading) {
            return
        }
        const { wechatsActive: kefu_wxid } = this.props
        const option = {
            url: "//wechat.yunbeisoft.com/index_test.php/home/api/dogetuserlists_qunfa_kefu",
            data: JSON.stringify({
                page,
                kefu_wxid,
                limitTyp,
                jd,
                tb,
                times,
                limit,
            }),
        }
        this.setState({ isLoading: true })
        let { data } = await request(option)
        if (data.error) {
            this.setState({ isLoading: false })
            return message.error(data.errmsg)
        }
        const { data: res, hasMore } = data
        if (res && res.length > 0) {
            if (list.length > 0) {
                res.map((item) => {
                    if (list.findIndex((li) => li.userid === item.userid) === -1) {
                        list.push(item)
                    }
                })
            } else {
                list = res
            }
        }
        this.setState({ isLoading: false, list, hasMore, page: page + 1 })
        this.selectMore(res)
    }
    searchFriend = async () => {
        let { jd, tb, times, limit } = this.props.form.getFieldsValue(["jd", "tb", "times", "limit"])
        if (times && times.length > 0) {
            times = [times[0].format("YYYY-MM-DD"), times[1].format("YYYY-MM-DD")]
        }
        await this.setState({
            jd,
            tb,
            times,
            limit,
            isLoading: false,
            list: [],
            hasMore: true,
            page: 1,
        })
    }
    onRemove=(deletes) => {
        this.setState({deletes})
    }
    selectMore=(res) => {
        let userids = this.props.form.getFieldValue("userids")
        if (userids && userids[0] === "all") {
            const list = res && res.map((i) => i.userid) || []
            this.props.form.setFieldsValue({userids: [...userids, ...list]})
        }
    }
    render () {
        const { getFieldDecorator, getFieldValue } = this.props.form
        const { visible, status, wechatsActive, data, groups, allTags, over, auth } = this.props
        const kefu_wxid = status === 2 ? wechatsActive : data.kefu_wxid
        const { imageUrl, uploading } = this.state
        const qType = getFieldValue("qunsType")
        const userids = getFieldValue("userids") || []
        let length = userids.length
        if (userids && userids[0] === "all") {
            length = length - 1
        }
        const uploadButton = (
            <div>
                <Icon type={uploading ? "loading" : "plus"} />
                <div className="ant-upload-text">Upload</div>
            </div>
        )
        const uploaded = (
            <div className={styles.imgBox}>
                <img src={imageUrl} alt="thumb" />
            </div>
        )
        return (
            <Modal
                afterClose={this.handleClose}
                destroyOnClose={true}
                footer={null}
                title={status === 1 ? "消息群发" : "消息转发"}
                visible={visible}
                onCancel={over}
                bodyStyle={{maxHeight: 740, overflow: "auto"}}
            >
                <Form onSubmit={this.handleSubmit}>
                    {status === 2 &&
                        <FormItem {...formItemLayout} label="选择好友">
                            {getFieldDecorator("userids", { rules: [{ required: true, message: "请选择好友！" }] })(
                                <ContactsRadio
                                    {...this.state}
                                    loadMore={this.loadMore}
                                    kefu_wxid={kefu_wxid}
                                    errStatus={this.props.form.getFieldError("userids")}
                                />
                            )}
                        </FormItem>
                    }
                    {status === 1 &&
                        <span>
                            <FormItem {...formItemLayout} label="群发类型">
                                {getFieldDecorator("qunsType", { initialValue: "1" })(
                                    <RadioGroup onChange={this.changeTyp}>
                                        <RadioButton value="1">好友</RadioButton>
                                        <RadioButton value="2">分组</RadioButton>
                                        <RadioButton value="3">标签</RadioButton>
                                        {auth.aid === "1327" &&
                                            <RadioButton value="4">拓展字段</RadioButton>
                                        }
                                        {/* {auth.aid &&
                                            <RadioButton value="4">拓展字段</RadioButton>
                                        } */}
                                    </RadioGroup>
                                )}
                            </FormItem>
                            {qType === "4" &&
                                <span>
                                    <FormItem {...formItemLayout} label="京东帐号">
                                        {getFieldDecorator("jd")(
                                            <Input placeholder="填写京东帐号" />
                                        )}
                                    </FormItem>
                                    <Form.Item {...formItemLayout} label="选择时间">
                                        {getFieldDecorator("times", { rules: [{ type: "array" }] })(
                                            <RangePicker />
                                        )}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label="收菜次数">
                                        <Select
                                            value={this.state.limitTyp}
                                            style={{ width: "32%" }}
                                            onChange={this.changeLimitTyp}
                                        >
                                            <Option value="==">等于</Option>
                                            <Option value=">=">大于等于</Option>
                                            <Option value="<=">小于等于</Option>
                                        </Select>
                                        {getFieldDecorator("limit")(
                                            <InputNumber
                                                type="text"
                                                style={{ width: "65%", marginLeft: "3%" }}
                                                placeholder="填写次数"
                                            />
                                        )}
                                    </Form.Item>
                                    <FormItem {...formItemLayout} label="淘宝帐号">
                                        {getFieldDecorator("tb")(
                                            <Input placeholder="填写淘宝帐号" />
                                        )}
                                    </FormItem>
                                    <FormItem {...tailFormItemLayout}>
                                        <Button type="primary" htmlType="button" onClick={this.searchFriend}>搜索好友</Button>
                                    </FormItem>
                                    <FormItem {...formItemLayout} label="选择好友">
                                        {getFieldDecorator("userids", { rules: [{ type: "array", required: true, message: "请选择好友！" }] })(
                                            <ContactsCheckBoxAll
                                                {...this.state}
                                                loadMore={this.extraLoad}
                                                kefu_wxid={kefu_wxid}
                                                errStatus={this.props.form.getFieldError("userids")}
                                                onRemove={this.onRemove}
                                            />
                                        )}
                                    </FormItem>
                                </span>
                            }
                            {qType === "1" && <FormItem {...formItemLayout} label="选择好友" extra={`已选${length}人`}>
                                {getFieldDecorator("userids", { rules: [{ required: true, message: "请选择好友！" }] })(
                                    <ContactsCheckBox
                                        {...this.state}
                                        loadMore={this.loadMore}
                                        kefu_wxid={kefu_wxid}
                                        errStatus={this.props.form.getFieldError("userids")}
                                    />
                                )}
                            </FormItem>}
                            {qType === "2" && <FormItem {...formItemLayout} label="选择分组" >
                                {getFieldDecorator("fid", { rules: [{ required: true, message: "选择分组" }] })(
                                    <GroupCheckBox list={groups} />
                                )}
                            </FormItem>}
                            {qType === "3" && <FormItem {...formItemLayout} label="选择标签" >
                                {getFieldDecorator("tagid", { rules: [{ required: true, message: "选择标签" }] })(
                                    <GroupCheckBox list={allTags} />
                                )}
                            </FormItem>}
                            <FormItem {...formItemLayout} label="消息类型">
                                {getFieldDecorator("type", { initialValue: "1" })(
                                    <RadioGroup>
                                        <Radio value="1">文本</Radio>
                                        <Radio value="2">图片</Radio>
                                    </RadioGroup>
                                )}
                            </FormItem>
                            {getFieldValue("type") === "1" &&
                                <FormItem {...formItemLayout} label="消息内容">
                                    {getFieldDecorator("text", { rules: [{ required: true, message: "消息不能为空!" }] })(
                                        <TextArea placeholder="请输入消息内容" style={{ height: 108, resize: "none" }} />
                                    )}
                                </FormItem>
                            }
                            {getFieldValue("type") === "2" &&
                                <FormItem {...formItemLayout} label="消息内容">
                                    {getFieldDecorator("img", { rules: [{ required: true, message: "消息不能为空！" }] })(
                                        <Upload name="files" {...uploadParam} beforeUpload={this.beforeUpload} onChange={this.handleChange} >
                                            {imageUrl ? uploaded : uploadButton}
                                        </Upload>
                                    )}
                                </FormItem>
                            }
                        </span>
                    }
                    <FormItem {...tailFormItemLayout}>
                        <Button type="primary" htmlType="submit">发送</Button>
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}

class ContactsCheckBoxAll extends Component {
    state={
        isAll: false,
    }

    selectAll=(e) => {
        const {list} = this.props
        let value = []
        if (e.target.checked) {
            value = list && list.map((i) => i.userid)
            this.props.onChange(["all", ...value])
        } else {
            this.props.onChange(value)
        }
        this.setState({isAll: e.target.checked})
        this.props.onRemove && this.props.onRemove()
    }
    onChange=(e) => {
        const {isAll} = this.state
        const {checked, value} = e.target
        let list = this.props.value || []
        let deletes
        if (isAll) {
            deletes = this.props.deletes || []
        }
        if (checked) {
            list.push(value)
            isAll && (deletes = deletes.filter((i) => i !== value))
        } else {
            const index = list.findIndex((i) => i === value)
            list.splice(index, 1)
            isAll && (deletes.push(value))
        }
        this.props.onChange(list)
        this.props.onRemove && this.props.onRemove(deletes)
    }
    render () {
        const { isLoading, list, hasMore, loadMore, errStatus, value} = this.props
        let load = isLoading
        let data = list
        let isHas = hasMore
        return (
            <div className={styles.contacts} style={{ borderColor: errStatus ? "#f5222d" : "#d9d9d9" }}>
                {data.length > 0 &&
                    <Checkbox value="all" key="0" style={{ padding: "6px 12px" }} onChange={this.selectAll}>
                        全选
                    </Checkbox>
                }
                <div className={styles.container} ref={(ref) => this.scrollParentRef = ref}>
                    {(load && data.length === 0)
                        ? <div className={styles.fullContainer}><Spin spinning={true} /></div>
                        : <InfiniteScroll
                            initialLoad={true}
                            loadMore={loadMore}
                            hasMore={!load && isHas}
                            useWindow={false}
                            getScrollParent={() => this.scrollParentRef}
                            loader={<div key={"loading"} className={styles.loadItem}><Spin spinning={true} /></div>}
                        >
                            <Checkbox.Group value={value} style={{ width: "100%" }}>
                                {data.length > 0 && data.map((item) =>
                                    <Checkbox value={item.userid} key={item.userid} style={{ width: "100%", margin: 0 }} onChange={this.onChange}>
                                        <Avatar className={styles.thumb} src={item.headImg} icon="user" />
                                        <Ellipsis length={25} style={{ display: "inline" }} fullWidthRecognition>
                                            {item.remark || item.nick || item.FriendNo || ""}
                                        </Ellipsis>
                                    </Checkbox>
                                )}
                            </Checkbox.Group>
                        </InfiniteScroll>
                    }
                    {data.length === 0 && !isHas && <div className={styles.fullContainer}><Empty /></div>}
                </div>
            </div>
        )
    }
}

class ContactsCheckBox extends Component {
    state = {
        keyword: "",
        isSearch: false,
        list: [],
    }
    handleSearch = async (e) => {
        e.preventDefault()
        if (e.target.value) {
            const keyword = e.target.value
            this.setState({ keyword, isSearch: true })
            const { kefu_wxid } = this.props
            const option = {
                url: loadUrl,
                data: JSON.stringify({ kefu_wxid, keyword }),
            }
            let { data } = await request(option)
            if (data.error) {
                this.setState({ isSearch: false })
                return message.error(data.errmsg)
            }
            this.setState({ isSearch: false, list: data.data })
            this.selectAll(false)
        }
    }
    handleChange = (e) => {
        if (!e.target.value) {
            this.setState({ keyword: "", isSearch: false, list: [] })
            if (this.state.list.length !== 0) {
                this.selectAll(false)
            }
        }
    }
    selectAll=(e, data) => {
        const {keyword, list} = this.state
        data = data || (keyword ? list : this.props.list) || []
        const isAll = typeof e === "object" ? e.target.checked : e
        let value = []
        if (isAll) {
            value = data && data.map((i) => i.userid) || []
            value = ["all", ...value]
        }
        this.props.onChange(value)
        this.setState({isAll})
    }
    onChange =(value) => {
        value = this.state.isAll && value ? ["all", ...value] : value
        this.props.onChange(value)
    }
    render () {
        const {
            isLoading,
            list,
            hasMore,
            loadMore,
            errStatus,
            value,
        } = this.props
        const { keyword, isSearch, list: searchList, isAll } = this.state
        let load = isLoading
        let data = list
        let isHas = hasMore
        if (keyword) {
            load = isSearch
            data = searchList
            isHas = false
        }
        let options = []
        if (data.length > 0) {
            data.map((item) => {
                options.push(
                    {
                        label:
                            <span>
                                <Avatar className={styles.thumb} src={item.headImg} icon="user" />
                                <Ellipsis length={25} style={{ display: "inline" }} fullWidthRecognition>
                                    {item.remark || item.nick || item.FriendNo || ""}
                                </Ellipsis>
                            </span>,
                        value: item.userid,
                    },
                )
            })
        }
        return (
            <div className={styles.contacts} style={{ borderColor: errStatus ? "#f5222d" : "#d9d9d9" }}>
                <div className={styles.searchBox}>
                    <Input
                        prefix={<Icon type="search" />}
                        placeholder="搜索联系人昵称、备注"
                        onPressEnter={this.handleSearch}
                        onChange={this.handleChange}
                        allowClear
                    />
                </div>
                {data.length > 0 &&
                    <Checkbox checked={isAll} style={{ padding: "0 12px" }} onChange={this.selectAll}>
                        选择已加载粉丝
                    </Checkbox>
                }
                <div className={styles.container} ref={(ref) => this.scrollParentRef = ref}>
                    {(load && data.length === 0)
                        ? <div className={styles.fullContainer}><Spin spinning={true} /></div>
                        : <InfiniteScroll
                            initialLoad={true}
                            loadMore={loadMore}
                            hasMore={!load && isHas}
                            useWindow={false}
                            getScrollParent={() => this.scrollParentRef}
                            loader={<div key={"loading"} className={styles.loadItem}><Spin spinning={true} /></div>}
                        >
                            {data.length > 0 && <CheckboxGroup value={value} options={options} onChange={this.onChange} style={{ width: "100%" }} />}
                        </InfiniteScroll>
                    }
                    {data.length === 0 && !isHas && <div className={styles.fullContainer}><Empty /></div>}
                </div>
            </div>
        )
    }
}
class ContactsRadio extends Component {
    state = { keyword: "", isSearch: false, list: [] }
    handleSearch = async (e) => {
        e.preventDefault()
        if (e.target.value) {
            const keyword = e.target.value
            this.setState({ keyword, isSearch: true })
            const { kefu_wxid } = this.props
            const option = {
                url: loadUrl,
                data: JSON.stringify({ kefu_wxid, keyword }),
            }
            let { data } = await request(option)
            if (data.error) {
                this.setState({ isSearch: false })
                return message.error(data.errmsg)
            }
            this.setState({ isSearch: false, list: data.data })
        }
    }
    handleChange = (e) => {
        if (!e.target.value) {
            this.setState({ keyword: "", isSearch: false, list: [] })
        }
    }
    render () {
        const { isLoading, list, hasMore, loadMore, onChange, errStatus } = this.props
        const { keyword, isSearch, list: searchList } = this.state
        let load = isLoading
        let data = list
        let isHas = hasMore
        if (keyword) {
            load = isSearch
            data = searchList
            isHas = false
        }
        let options = []
        if (data.length > 0) {
            data.map((item) => {
                options.push(
                    {
                        label:
                            <span>
                                <Avatar className={styles.thumb} src={item.headImg} icon="user" />
                                <Ellipsis length={25} style={{ display: "inline" }} fullWidthRecognition>
                                    {item.remark || item.nick || item.FriendNo || ""}
                                </Ellipsis>
                            </span>,
                        value: item.userid,
                    },
                )
            })
        }
        return (
            <div className={styles.contacts} style={{ borderColor: errStatus ? "#f5222d" : "#d9d9d9" }}>
                <div className={styles.searchBox}>
                    <Input
                        prefix={<Icon type="search" />}
                        placeholder="搜索联系人昵称、备注、昵称"
                        onPressEnter={this.handleSearch}
                        onChange={this.handleChange}
                        allowClear
                    />
                </div>
                <div className={styles.container} ref={(ref) => this.scrollParentRef = ref}>
                    {(load && data.length === 0)
                        ? <div className={styles.fullContainer}><Spin spinning={true} /></div>
                        : <InfiniteScroll
                            initialLoad={true}
                            loadMore={loadMore}
                            hasMore={!load && isHas}
                            useWindow={false}
                            getScrollParent={() => this.scrollParentRef}
                            loader={<div key={"loading"} className={styles.loadItem}><Spin spinning={true} /></div>}
                        >
                            {data.length > 0 && <RadioGroup options={options} onChange={onChange} style={{ width: "100%" }} />}
                        </InfiniteScroll>
                    }
                    {data.length === 0 && !isHas && <div className={styles.fullContainer}><Empty /></div>}
                </div>
            </div>
        )
    }
}


class GroupCheckBox extends Component {
    selectAll=(e) => {
        const {list} = this.props
        const value = e.target.checked ? list && list.map((i) => i.id) : []
        this.props.onChange(value)
    }
    render () {
        const { list, onChange, value } = this.props
        let options = []
        if (list.length > 0) {
            list.map((item) => {
                options.push(
                    {
                        label:
                            <span>
                                <Ellipsis length={25} style={{ display: "inline" }} fullWidthRecognition>
                                    {item.fenzu_name || item.tag_name || ""}
                                </Ellipsis>
                            </span>,
                        value: item.id,
                    },
                )
            })
        }
        return (
            <div className={styles.contacts} style={{ borderColor: "#d9d9d9" }}>
                <span style={{padding: "6px 12px"}}>
                    {list.length > 0 &&
                        <Checkbox value="all" onChange={this.selectAll}>
                            全选
                        </Checkbox>
                    }
                </span>
                <div className={styles.container} ref={(ref) => this.scrollParentRef = ref}>

                    {list.length > 0 && <CheckboxGroup value={value} options={options} style={{ width: "100%" }} onChange={onChange} />}
                    {list.length === 0 && <div className={styles.fullContainer}><Empty /></div>}
                </div>
            </div>
        )
    }
}

function mapStateToProps (state) {
    const { auth, wechatsActive, groups, allTags } = state.chat
    return { auth, wechatsActive, groups, allTags }
}
const ForwardForm = Form.create()(Forward)
export default connect(mapStateToProps)(ForwardForm)
