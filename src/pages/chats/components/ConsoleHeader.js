import { connect } from "dva"
import { NoticeIcon } from "ant-design-pro"
import groupBy from "lodash/groupBy"
import { Icon, Tag, Popconfirm, Divider, Popover, Select, Input } from "antd"
import styles from "./ConsoleHeader.css"
import { Component } from "react"
const Option = Select.Option
let chat = ""

const noticeParam = {
    title: "定时消息",
    emptyText: "暂无定时消息",
    showClear: false,
    emptyImage: "https://gw.alipayobjects.com/zos/rmsportal/HsIsxMZiWKrNUavQUXqx.svg",
}
class ConsoleHeader extends Component {
    state = {
        loading: false,
        edit: false,
        groupid: "",
        inputValue: "",
        selIndex: null,
    }
    componentDidMount () {
        const { groups, dispatch } = this.props
        if (groups.length <= 0) {
            dispatch({ type: "chat/fetchGroups" })
        }
        this.getData()
    }
    componentDidUpdate () {
        this.getData()
    }
    getData = () => {
        const { wechatTags, allTags, chatsActive, dispatch } = this.props
        if (chatsActive && chatsActive !== chat) {
            chat = chatsActive
            if (wechatTags && wechatTags.length > 0) {
                if (wechatTags.findIndex((item) => item.userid === chatsActive) === -1) {
                    dispatch({ type: "chat/fetchWechatTags", payload: { userid: chatsActive } })
                }
            } else {
                dispatch({ type: "chat/fetchWechatTags", payload: { userid: chatsActive } })
            }
            if (allTags && allTags.length <= 0) {
                dispatch({ type: "chat/fetchAllTags" })
            }
            dispatch({ type: "chat/gettaggfenzu" })
            dispatch({ type: "chat/fetchTags", payload: { userid: chatsActive } })
        }
    }
    confirm = (id) => {
        this.props.dispatch({ type: "chat/delSendTime", payload: { id } })
    }
    getNoticeData = (notices) => {
        if (notices.length === 0) {
            return {}
        }
        const newNotices = notices.map((notice) => {
            const newNotice = { ...notice }
            if (newNotice.type === "1") {
                newNotice.description = (
                    <div className={styles.textBox}>{newNotice.text}</div>
                )
            } else {
                newNotice.description = (
                    <div className={styles.imgBox}><img src={newNotice.url} alt="预览图" /></div>
                )
            }
            newNotice.type = "待办"
            newNotice.title = (
                <span>
                    <Popconfirm title="确定删除吗？" onConfirm={() => this.confirm(newNotice.id)}>
                        <Icon type="close-circle" className={styles.close} />
                    </Popconfirm>
                    {newNotice.dingshi_time}
                </span>
            )
            newNotice.datetime = (
                <div><span style={{ marginRight: 15 }}>{newNotice.addtime}</span>{newNotice.zi_name}</div>
            )
            if (newNotice.id) {
                newNotice.key = newNotice.id
            }
            if (newNotice.status) {
                const color = ({ 0: "", 1: "green" })[newNotice.status]
                newNotice.extra = <Tag color={color} style={{ marginRight: 0 }}>{newNotice.status === "0" ? "未执行" : "已执行"}</Tag>
            }
            return newNotice
        })
        return groupBy(newNotices, "type")
    }
    fetchSendTime = () => {
        const { chatsActive, auth, dispatch } = this.props
        dispatch({ type: "chat/fetchSendTime", payload: { zid: auth.id, uid: chatsActive } })
    }
    editGroup = () => {
        const { edit, groupid } = this.state
        if (edit && groupid) {
            const { chatsActive, dispatch } = this.props
            let payload = { uid: chatsActive, fid: groupid }
            dispatch({ type: "contact/changeGroups", payload })
            dispatch({ type: "chat/changeGroups", payload })
        }
        this.setState({ edit: !edit })
    }
    groupChange = (groupid) => {
        this.setState({ groupid })
    }
    showInput = (index) => {
        this.setState({ selIndex: index }, () => this.input.focus())
    }
    handleInputChange = (e) => {
        this.setState({ inputValue: e.target.value })
    }
    saveInputRef = (input) => (this.input = input)
    tags = () => {
        const { inputValue, selIndex } = this.state
        const { allTags, friendTags, tagGroup } = this.props
        if (tagGroup.length && allTags.length) {
            tagGroup.map((item) => {
                item.list = []
                allTags.map((all) => {
                    if (all.zid === item.id) {
                        item.list.push(all)
                    }
                })
            })
        }
        return (
            <div className={styles.allTags} >
                {tagGroup && tagGroup.length > 0 && tagGroup.map((item, index) => (
                    <div key={item.id} style={{ marginBottom: 10 }}>
                        <span style={{ color: "#108ee9" }}>{item.tagg_fenzu_name}：</span>
                        {item.list && item.list.length > 0 && item.list.map((tg) => (
                            <Tag
                                key={tg.id}
                                style={{ marginBottom: 8, cursor: "pointer" }}
                                color={friendTags.findIndex((tag) => tag.id === tg.id) === -1
                                    ? ""
                                    : "#108ee9"
                                }
                                onClick={() => this.editTag(tg)}
                            >
                                {tg.tag_name}
                            </Tag>
                        ))}
                        {selIndex === index ? (
                            <Input
                                ref={this.saveInputRef}
                                type="text"
                                size="small"
                                style={{ width: 78 }}
                                value={inputValue}
                                onChange={this.handleInputChange}
                                onBlur={() => this.handleInputConfirm(item.id)}
                                onPressEnter={() => this.handleInputConfirm(item.id)}

                            />
                        ) : (
                            <Tag onClick={() => this.showInput(index)} style={{ background: "#fff", borderStyle: "dashed" }}>
                                <Icon type="plus" />
                            </Tag>
                        )}
                    </div>

                ))}
            </div>
        )
    }
    handleInputConfirm = (zid) => {
        const { inputValue } = this.state
        const { chatsActive, chats, dispatch, auth } = this.props
        const active = chats.find((item) => item.userid === chatsActive)
        if (inputValue) {
            dispatch({ type: "chat/addTag", payload: { ziaccid: auth.id, tag_name: inputValue, wxid: active.kefu_wxid, fzid: zid } })
        }
        this.setState({ inputValue: "", selIndex: null })
    }
    editTag = (tag) => {
        let { friendTags, chats, chatsActive, dispatch } = this.props
        const active = chats.find((item) => item.userid === chatsActive)
        let payload = { wxid: active.wxid, kefu_wxid: active.kefu_wxid, tagid: [] }
        if (friendTags.length > 0) {
            const index = friendTags.findIndex((item) => item.id === tag.id)
            if (index === -1) {
                friendTags.push(tag)
            } else {
                friendTags.splice(index, 1)
            }
        } else {
            friendTags.push(tag)
        }
        friendTags.map((item) => {
            payload.tagid.push(item.id)
        })
        dispatch({ type: "chat/editTag", payload })
    }
    render () {
        const { chatsActive, chats, sendTime, wechatTags, friendTags, groups } = this.props
        const active = chats.find((item) => item.userid === chatsActive)
        const noticeData = this.getNoticeData(sendTime)
        let wTags = []
        let tags = []
        let wIndex = wechatTags.findIndex((item) => item.userid === chatsActive)
        if (wIndex !== -1) {
            wTags = wechatTags[wIndex].data
        }
        wTags = wTags.slice(0, 8)
        if (friendTags.length > 0 && wTags.length < 8) {
            const num = 8 - wTags.length
            if (num > friendTags.length) {
                tags = friendTags.slice(0)
            } else {
                tags = friendTags.slice(0, num)
            }
        }
        return (
            <div className={styles.header}>
                <div className={styles.nick}>
                    {active &&
                        (active.remark || active.nick || active.wxid)
                    }
                    {(active && "quns" in active && active.quns) &&
                        <span> ({active.quns})</span>
                    }
                    {active && active.sex === "1" && !("quns" in active) &&
                        <Icon
                            type="man"
                            style={{ color: "#096dd9", marginLeft: 5 }}
                        />
                    }
                    {active && active.sex === "2" && !("quns" in active) &&
                        <Icon
                            type="woman"
                            style={{ color: "#fd7e96", marginLeft: 5 }}
                        />
                    }
                </div>
                <div className={styles.content}>
                    <label>标签：</label>
                    <div className={styles.tags}>
                        {wTags.length === 0 && tags.length === 0 &&
                            <Tag style={{ marginBottom: 6 }}>暂无标签</Tag>
                        }
                        {wTags.length > 0 && wTags.map((item) =>
                            <Tag
                                key={item.id}
                                color="#87d068"
                                title={item.tagname}
                                style={{ marginBottom: 6 }}
                            >
                                {item.tagname.length > 6
                                    ? `${item.tagname.slice(0, 6)}...`
                                    : item.tagname
                                }
                            </Tag>
                        )}
                        {tags.length > 0 && tags.map((item) =>
                            <Tag
                                key={item.id}
                                color="#108ee9"
                                title={item.tag_name}
                                style={{ marginBottom: 6 }}
                            >
                                {item.tag_name.length > 6
                                    ? `${item.tag_name.slice(0, 6)}...`
                                    : item.tag_name
                                }
                            </Tag>
                        )}
                    </div>
                    <Popover
                        placement="bottom"
                        content={this.tags()}
                        arrowPointAtCenter
                    >
                        <a>编辑</a>
                    </Popover>
                    <Divider type="vertical" />
                </div>
                {groups.length > 0 &&
                    <div className={styles.content}>
                        <label>分组：</label>
                        <div className={styles.group}>
                            {this.state.edit
                                ? <Select
                                    defaultValue={active.fid !== "-1" ? active.fid : ""}
                                    size="small"
                                    onChange={this.groupChange}
                                    style={{ width: 92 }}
                                    autoFocus
                                >
                                    {groups.map((group) =>
                                        <Option
                                            key={group.id}
                                            value={group.id}
                                            disabled={group.id === active.fid}
                                        >
                                            {group.fenzu_name}
                                        </Option>
                                    )}
                                </Select>
                                : <span>
                                    {active.fid === "-1"
                                        ? "未分组"
                                        : groups.findIndex((group) => group.id === active.fid) !== -1
                                            ? groups[groups.findIndex((group) => group.id === active.fid)].fenzu_name
                                            : "未分组"
                                    }
                                </span>
                            }
                        </div>
                        <a
                            title="点击编辑好友分组"
                            onClick={this.editGroup}
                        >
                            {this.state.edit ? "确定" : "编辑"}
                        </a>
                        <Divider type="vertical" />
                    </div>
                }
                <NoticeIcon
                    bell={
                        <Icon
                            type="calendar"
                            style={{ fontSize: 20, color: "rgb(198, 197, 197)" }}
                            title="点击查看定时任务"
                            onClick={this.fetchSendTime}
                        />
                    }
                    loading={sendTime === ""}
                >
                    <NoticeIcon.Tab
                        list={noticeData["待办"]}
                        {...noticeParam}
                    />
                </NoticeIcon>
            </div>
        )
    }
}
function mapStateToProps (state) {
    const { chatsActive, chats, sendTime, auth, wechatTags, allTags, friendTags, groups, tagGroup } = state.chat
    return { chatsActive, chats, sendTime, auth, wechatTags, allTags, friendTags, groups, tagGroup }
}
export default connect(mapStateToProps)(ConsoleHeader)
