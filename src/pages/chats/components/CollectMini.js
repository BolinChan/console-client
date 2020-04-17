import { connect } from "dva"
import styles from "./CollectMini.css"
import { Component } from "react"
import { Avatar, Spin, Empty, Popconfirm, Divider, Radio } from "antd"
import { makeKey } from "../../../utils/helper"
import Ellipsis from "ant-design-pro/lib/Ellipsis"
class CollectMini extends Component {
    state = {
        loading: false,
        type: 0,
    }
    componentDidMount () {
        this.initLoad()
    }
    initLoad = async () => {
        await this.setState({ loading: true })
        await this.props.dispatch({ type: "chat/getCollect" })
        this.setState({ loading: false })
    }
    send = (item) => {
        const { chats, dispatch, chatsActive } = this.props
        const key = makeKey()
        const chat = chats.find((item) => item.userid === chatsActive)
        const msg = {
            key,
            id: item.msgid,
            type: item.type,
            contents: JSON.stringify(item.content),
            tag: chat.wxid,
            device_wxid: chat.kefu_wxid,
            userid: chat.userid,
        }
        dispatch({ type: "chat/addMsg", payload: msg })
        dispatch({ type: "chat/sendMessage", payload: msg })
    }
    del = (id) => {
        this.props.dispatch({ type: "chat/DelMini", payload: { id } })
    }
    selChange=(e) => {
        this.setState({type: e.target.value})
    }
    render () {
        const { loading, type } = this.state
        let { miniList } = this.props
        if (type) {
            miniList = miniList.filter((i) => i.type === type)
        }
        return (
            <ul className={styles.itemMain}>
                <div className={styles.btns}>
                    <Radio.Group defaultValue={type} buttonStyle="solid" onChange={this.selChange}>
                        <Radio.Button value={0}>全部</Radio.Button>
                        <Radio.Button value="7">小程序</Radio.Button>
                        <Radio.Button value="6">链接</Radio.Button>
                    </Radio.Group>
                </div>
                <Spin spinning={loading}>
                    {miniList.length > 0 && miniList.map((item) => (
                        <li key={item.id} className={styles.item}>
                            <div className={styles.content}>
                                <div className={styles.thumb}>
                                    <Avatar
                                        icon={item.type === "6" ? "link" : "compass"}
                                        size="large"
                                        src={item.content.Thumb}
                                        shape="square"
                                    />
                                </div>
                                <div className={styles.context}>
                                    <Ellipsis lines={1} tooltip>{item.content.Title}</Ellipsis>
                                    <Ellipsis lines={1} className={styles.from}>{item.content.Source}</Ellipsis>
                                </div>
                            </div>
                            <div style={{ flexShrink: 0 }}>
                                <Popconfirm
                                    placement="topRight"
                                    title="确定发送吗？"
                                    okText="确定"
                                    cancelText="取消"
                                    onConfirm={() => this.send(item)}
                                    arrowPointAtCenter
                                >
                                    <a>分享</a>
                                </Popconfirm>
                                <Divider type="vertical" />
                                <Popconfirm
                                    placement="topRight"
                                    title="确定删除吗？"
                                    okText="确定"
                                    cancelText="取消"
                                    onConfirm={() => this.del(item.id)}
                                    arrowPointAtCenter
                                >
                                    <a style={{ color: "#f5222d" }}>删除</a>
                                </Popconfirm>
                            </div>
                        </li>
                    ))}
                </Spin>
                {!loading && !miniList.length && <Empty className={styles.empty} />}
            </ul >
        )
    }
}
function mapStateToProps (state) {
    const { miniList, chatsActive, chats } = state.chat
    return { miniList, chatsActive, chats }
}
export default connect(mapStateToProps)(CollectMini)
