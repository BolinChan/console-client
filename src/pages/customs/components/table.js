import { Table, Avatar, Row, Tag, Icon } from "antd"
import styles from "../page.css"
import SetName from "./SetName"
import ChatRecord from "./chatRecord"
const preventDefault = (dispatch, tagid, id, record) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    let index = tagid.findIndex((item) => item === id)
    tagid.splice(index, 1)
    dispatch({
        type: "custom/editTag",
        payload: { wxid: record.wxid, kefu_wxid: record.kefu_wxid, tagid },
    })
}
// 删除标签
const tagFun = (tagid, tags, dispatch, record, showTag) => {
    if (tagid.length > 0) {
        let list = []
        tags.map((mess) => {
            if (tagid.find((id) => mess.id === id)) {
                list.push(mess)
            }
        })
        return (
            <span>
                {list.map((item) => (
                    <Tag closable onClose={preventDefault(dispatch, tagid, item.id, record)} color="blue" style={{ margin: "3px" }} key={item.id}>
                        {item.tag_name}
                    </Tag>
                ))}
                <Tag color="blue" style={{ margin: "3px" }} onClick={() => showTag(record)}>
                    <Icon type="plus" />
                </Tag>
            </span>
        )
    } else {
        return (
            <Tag color="blue" style={{ margin: "3px" }} onClick={() => showTag(record)}>
                <Icon type="plus" />
            </Tag>
        )
    }
}
const CustomTable = ({
    goChat,
    recordnoMore,
    loadMore,
    recordLoading,
    self,
    recordLst,
    showRecord,
    loading,
    list,
    total,
    pageChangeHandler,
    current,
    dispatch,
    usergroup,
    showGroup,
    tags,
    showTag,
}) => {
    const columns = [{
        title: "好友微信", dataIndex: "wxid", width: 280, fixed: "left", columnWidth: 280,
        render: (wxid, item) => (
            <div>
                <Row type="flex" align="middle">
                    <Avatar shape="square" size="large" icon="user" src={item.headImg} />
                    <div className={styles.beyond}>
                        <div title={item.nick || item.remark || wxid}>
                            昵称：
                            {item.nick || item.remark || wxid}
                        </div>
                        <div>
                            微信号：
                            {item.FriendNo || "未知"}
                        </div>
                    </div>
                </Row>
            </div>
        ),
    }, {
        title: "所属客服", dataIndex: "ziaccounts", width: 330, columnWidth: 330,
        render: (ziaccounts, record) => {
            let list = []
            ziaccounts.map((mess) => {
                if (mess.accountnum && !list.find((i) => i.accountnum === mess.accountnum)) {
                    list.push(mess)
                }
            })
            return (
                <div >
                    {list && list.length > 0 ? list.map((item, index) => <Tag color="blue" style={{ margin: "3px" }} key={index}>{item.accountnum}</Tag>) : "无"}
                </div>

            )

        },
    },
    { title: "性别", dataIndex: "sex", width: 150, columnWidth: 150, align: "center", render: (sex) => sex === "1" ? "男" : "女" },
    {
        title: "手机号码", dataIndex: "phone", width: 200, columnWidth: 200, align: "center",
        render: (phone, record) => <SetName action="phone" holder="请输入手机号码" record={record} dispatch={dispatch} defaultname={phone ? phone : "未绑定"} />,
    },
    {
        title: "旺旺号", width: 200, dataIndex: "buyer_name", columnWidth: 200, align: "center",
        render: (buyername, record) => <SetName action="wang" holder="请输入旺旺号" record={record} dispatch={dispatch} defaultname={buyername ? buyername : "未绑定"} />,
    }, {
        title: "备注", dataIndex: "remark", width: 300, columnWidth: 300,
        render: (remark, record) => <SetName action="remark" holder="请输入备注" record={record} dispatch={dispatch} defaultname={remark ? remark : "无"} />,
    },
    {
        title: "备忘录", dataIndex: "record", width: 300, columnWidth: 300,
        render: (text, record) => <SetName action="record" holder="请输入备忘录" record={record} dispatch={dispatch} defaultname={text ? text : "无"} />,
    },
    {
        title: "居住地址", dataIndex: "address", width: 300, columnWidth: 300,
        render: (text, record) => <SetName action="address" holder="请输入居住地址" record={record} dispatch={dispatch} defaultname={text ? text : "无"} />,
    },
    {
        title: "所在分组", dataIndex: "fid", width: 300, columnWidth: 300,
        render: (fid, record) => {
            let list = usergroup && usergroup.find((mess) => mess.id === fid)
            if (list && list.fenzu_name) {
                record.fenzu_name = list.fenzu_name
            }
            return (<a title="点击设置分组" style={{ color: !(list && list.fenzu_name) && "#3f78ad" }} onClick={() => showGroup(record)}> {list && list.fenzu_name || "设置分组"} </a>)
        },
    },
    { title: "好友标签", dataIndex: "tagid", width: 300, columnWidth: 300, render: (tagid, record) => tagFun(tagid, tags, dispatch, record, showTag) },
    { title: "地区", dataIndex: "city", width: 150, columnWidth: 150, align: "center", render: (text) => <div>{text ? text : "未知"}</div> },
    { title: "添加时间", dataIndex: "createtime", width: 300, align: "center", columnWidth: 300 },
    {
        title: "操作",
        key: "operation",
        fixed: "right",
        align: "center",
        width: 150,
        render: (record) => <div style={{display: "flex", flexDirection: "column"}}>
            <a onClick={() => goChat(record)}>点击聊天</a>
            <ChatRecord recordnoMore={recordnoMore} loadMore={loadMore} loading={recordLoading} showRecord={showRecord} self={self} record={record} recordLst={recordLst} />
        </div>,
    },
    ]
    const ShowTotalItem = () => (
        <span style={{ marginTop: 5, color: "rgba(0,0,0,0.5)", display: "block" }}>总数{total}条</span>
    )
    const paginationConfig = {
        total, // 总数
        showTotal: ShowTotalItem,
        defaultPageSize: 20, // 每页显示条数
        onChange: pageChangeHandler, // 点击分页
        current: current,
    }
    let height = document.documentElement.clientHeight > 789 ? "550px" : "380px"
    return (
        <div >
            <Table
                rowKey="userid"
                columns={columns}
                dataSource={list}
                // bordered
                simple
                scroll={{ x: 3260, y: height }}
                pagination={paginationConfig}
                loading={loading}
            />
        </div>
    )
}
export default CustomTable
