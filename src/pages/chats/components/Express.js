import { connect } from "dva"
import { Icon, Popover, Tabs, Empty, Menu, Dropdown } from "antd"
import styles from "./Express.css"
import { Component } from "react"
import expressList from "./expressList"
import emoji from "emoji"
const TabPane = Tabs.TabPane

class Express extends Component {
    state = {
        visible: false,
        tabIndex: "1",
    }
    componentDidMount () {
        document.body.addEventListener("click", this.Listener)
    }
    componentWillUnmount () {
        document.body.removeEventListener("click", this.Listener)
    }
    Listener = (e) => {
        if (e) {
            const classValue = e.target.classList.value
            if (classValue.indexOf("ant-tabs-tab") !== -1 || classValue.indexOf("Express__expressBox") !== -1 || classValue.indexOf("ant-dropdown-menu-item") !== -1) {
                return
            }
        }
        this.setState({ visible: false })
    }
    openPopover = (e) => {
        this.setState({ visible: true })
    }
    checkData = () => {
        const { customExpress, dispatch } = this.props
        if (customExpress.length < 1) {
            dispatch({ type: "chat/fetchCustom" })
        }
    }
    TabChange = (e) => {
        this.setState({ tabIndex: e })
    }
    sendCustom = (src) => {
        const { chat, send, auth } = this.props
        const msg = {
            type: 2,
            url: src,
            tag: chat.wxid,
            device_wxid: chat.kefu_wxid,
            userid: chat.userid,
            auth: auth.accountnum,
        }
        // dispatch({ type: "chat/addMsg", payload: msg })
        send(msg)
    }
    cutCustom = (id) => {
        this.props.dispatch({ type: "chat/cutCustom", payload: { id } })
    }
    content = (tabIndex, customExpress, customShow) => (
        <Tabs
            size="small"
            activeKey={tabIndex}
            tabPosition="bottom"
            onChange={this.TabChange}
        >
            <TabPane tab="通用" key="1">
                <div className={styles.expressBox}>
                    {expressList.map((item, index) => (
                        <i
                            key={index}
                            className={styles.express}
                            style={{ paddingTop: 3 }}
                            onClick={() => {
                                this.props.addMsg({ type: "express", addText: item.name, addTime: Date.now() })
                            }}
                        >
                            <span title={item.name} className={`sprite sprite-${item.className}`} />
                        </i>
                    ))}
                </div>
            </TabPane>
            {!customShow && <TabPane tab="我的收藏" key="2">
                <div className={styles.expressBox}>
                    {customExpress.length > 0
                        ? customExpress.map((item, index) =>
                            <Dropdown
                                key={index}
                                overlay={
                                    <Menu>
                                        <Menu.Item key="1" onClick={() => this.cutCustom(item.id)}>删除</Menu.Item>
                                    </Menu>
                                }
                                trigger={["contextMenu"]}
                            >
                                <span
                                    title="点击发送"
                                    className={styles.customItem}
                                    onClick={() => this.sendCustom(item.Img)}
                                >
                                    <img src={item.Img} alt="custom" />
                                </span>
                            </Dropdown>
                        )
                        : <div className={styles.emptyBox}><Empty /></div>
                    }
                </div>
            </TabPane>}


            <TabPane tab="emoji" key="3">
                <div className={styles.expressBox}>
                    {Object.keys(emoji.EMOJI_MAP).map((item, index) => (
                        <i
                            key={index}
                            className={styles.express}
                            style={{ paddingTop: 5 }}
                            onClick={() => {
                                this.props.addMsg({ type: "express", addText: item, addTime: Date.now() })
                            }}
                            dangerouslySetInnerHTML={{ __html: emoji.unifiedToHTML(item) }}
                        />
                    ))}
                </div>
            </TabPane>
        </Tabs>
    )
    render () {
        return (
            <Popover
                id="express"
                placement="topLeft"
                visible={this.state.visible}
                content={this.content(this.state.tabIndex, this.props.customExpress, this.props.customShow)}
                overlayClassName={styles.popover}
                onClick={this.openPopover}
                arrowPointAtCenter={true}
                autoAdjustOverflow={true}
            >
                <Icon
                    type="smile-o"
                    title="选择表情"
                    style={{ cursor: "pointer" }}
                    onClick={this.checkData}
                />
            </Popover>
        )
    }
}
function mapStateToProps (state) {
    const { customExpress, auth } = state.chat
    return { customExpress, auth }
}
export default connect(mapStateToProps)(Express)
