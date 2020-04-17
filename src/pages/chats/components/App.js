import { connect } from "dva"
import { Component } from "react"
import { Popover, Icon, Empty, Avatar } from "antd"
import styles from "./App.css"
import Ellipsis from "ant-design-pro/lib/Ellipsis"
class App extends Component {
    state = {
        visible: false,
    }
    componentDidMount () {
        this.initLoad()
    }
    initLoad = async () => {
        await this.props.dispatch({ type: "chat/getCollect" })
    }
    handleVisibleChange = (e) => {
        this.setState({ visible: e })
    }
    send = (item) => {
        this.setState({ visible: false })
        const { chats, dispatch, chatsActive, auth } = this.props
        const chat = chats.find((item) => item.userid === chatsActive)
        const msg = {
            id: item.msgid,
            type: "7",
            contents: JSON.stringify(item.content),
            tag: chat.wxid,
            device_wxid: chat.kefu_wxid,
            userid: chat.userid,
            auth: auth.accountnum,
        }
        dispatch({ type: "chat/sendMessage", payload: msg })
    }
    render () {
        const { miniList } = this.props
        const { visible } = this.state
        return (
            <Popover
                visible={visible}
                onVisibleChange={this.handleVisibleChange}
                arrowPointAtCenter
                id="app"
                trigger="click"
                content={
                    <div className={styles.container}>
                        {miniList.length > 0
                            ? miniList.map((item, index) => item.type === "7" &&
                                <div
                                    key={index}
                                    className={styles.item}
                                    title="点击发送"
                                    onClick={() => this.send(item)}
                                >
                                    <div className={styles.thumb}>
                                        <Avatar
                                            icon="compass"
                                            size="large"
                                            src={item.content.Thumb}
                                            shape="square"
                                        />
                                    </div>
                                    <div className={styles.content}>
                                        <Ellipsis lines={1} tooltip>{item.content.Title}</Ellipsis>
                                        <Ellipsis lines={1} className={styles.from}>{item.content.Source}</Ellipsis>
                                    </div>
                                </div>
                            )
                            : <div className={styles.emptyContainer}><Empty /></div>
                        }
                    </div>
                }
            >
                <Icon type="compass" title="小程序" />
            </Popover>
        )
    }
}
function mapStateToProps (state) {
    const { miniList, chatsActive, chats, auth } = state.chat
    return { miniList, chatsActive, chats, auth }
}
export default connect(mapStateToProps)(App)
