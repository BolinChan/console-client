import { connect } from "dva"
import { Component } from "react"
import { Icon, Popover, Avatar, Empty, Spin } from "antd"
import styles from "./Goods.css"
import Ellipsis from "ant-design-pro/lib/Ellipsis"
import * as service from "../../../services/service"

const idp = "//qn.fuwuhao.cc/idp.png"
class Goods extends Component {
    state = {
        visible: false,
        list: [],
        loading: false,
    }
    initLoad = async () => {
        const { auth } = this.props

        this.setState({ loading: true })
        const { data } = await service.scrmUrl({
            scrm_url: `http://wxx.jutaobao.cc/qunkong_activity/qukong_activity.php?uniacid=${auth.uid}`,
        })
        if (!data.error) {
            this.setState({ list: data.data })
        }
        this.setState({ loading: false })
    }
    handleVisibleChange = () => {
        let { visible } = this.state
        visible = !visible
        this.setState({ visible })
        if (visible) {
            this.initLoad()
        }
    }
    send = (item) => {
        this.setState({ visible: false })
        const { chats, dispatch, chatsActive, auth } = this.props
        const chat = chats.find((item) => item.userid === chatsActive)
        const content = {
            title: item.title,
            url: item.url_show,
            thumb: item.img_url,
            desc: item.desc,
        }
        const msg = {
            url: item.url_show,
            type: "6",
            contents: JSON.stringify(content),
            tag: chat.wxid,
            device_wxid: chat.kefu_wxid,
            userid: chat.userid,
            auth: auth.accountnum,
        }
        dispatch({ type: "chat/sendMessage", payload: msg })
    }
    render () {
        const { visible, loading, list } = this.state
        return (
            <div>
                <Popover
                    visible={visible}
                    onVisibleChange={this.handleVisibleChange}
                    arrowPointAtCenter
                    trigger="click"
                    id="app"
                    content={
                        <div style={{ height: 400, overflow: "hidden" }}>
                            <div ref={(ref) => this.scrollParentRef = ref} className={styles.container}>
                                <div className={styles.itemBody}>
                                    {list.length > 0 && list.map((item, index) =>
                                        <div
                                            key={index}
                                            className={styles.item}
                                            title="点击发送"
                                            style={{ justifyContent: "space-between" }}
                                            onClick={() => this.send(item)}
                                        >
                                            <div className={styles.content}>
                                                <Ellipsis lines={1} tooltip>{item.title}</Ellipsis>
                                                <Ellipsis lines={1} tooltip style={{ fontSize: "12px", color: "#c6c5c5" }}>
                                                    {item.desc}
                                                </Ellipsis>
                                            </div>
                                            <div className={styles.thumb}>
                                                <Avatar
                                                    icon="compass"
                                                    size="large"
                                                    src={item.img_url || idp}
                                                    shape="square"
                                                />
                                            </div>

                                        </div>
                                    )}
                                </div>
                                {loading && <Spin
                                    indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />}
                                    style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: 15 }} />}
                                {!list.length && !loading && <div className={styles.emptyContainer}><Empty /></div>}
                            </div>
                        </div>
                    }
                >
                    <Icon type="link" title="活动" />
                </Popover>
            </div>
        )
    }
}
function mapStateToProps (state) {
    const { auth, chats, chatsActive } = state.chat
    return { auth, chats, chatsActive }
}
export default connect(mapStateToProps)(Goods)
