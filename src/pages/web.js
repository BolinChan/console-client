import "ant-design-pro/dist/ant-design-pro.css"
import { connect } from "dva"
import styles from "./index.css"
import { Component } from "react"
import { Spin, Modal, Timeline, Empty } from "antd"
import Forward from "../components/Forward"

import OldSidebar from "../old_components/Sidebar"
import OldDevices from "../old_components/Devices"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import Devices from "../components/Devices"

import Chats from "./chats/page"
import Contacts from "./contacts/page"
import Tags from "./tags/page"
import Custom from "./customs/page"
import Moments from "./moments/page"
import { routerRedux } from "dva/router"

let interval = ""

class Page extends Component {
    state = {
        visible: false,
        forwardVisible: false,
        forwardData: {},
        logo: 1,
    }
    UNSAFE_componentWillMount () {
        const { dispatch } = this.props
        interval = setInterval(() => {
            dispatch({ type: "chat/fetchNewMsg" })
            dispatch({ type: "chat/fetchFriendMsg" })
            dispatch({ type: "chat/upMsgStatus" })
        }, 2000)
    }
    componentDidMount () {
        const url = window.location.href
        if (url.indexOf("jiafen.scrm.la") !== -1) {
            this.setState({ logo: 2 })
        }
        const { dispatch, isLog, history } = this.props
        if (isLog === "0") {
            history.push("/login")
            return
        }
        window.onbeforeunload = () => {
            dispatch({ type: "chat/upLastTime" })
        }
    }
    componentDidUpdate () {
        const { isLog, history } = this.props
        if (isLog === "0") {
            history.push("/login")
        }
    }
    componentWillUnmount () {
        clearInterval(interval)
    }
    modalShow = () => {
        this.setState({ visible: true })
        this.props.dispatch({ type: "chat/checkLog" })
    }
    modalHide = () => {
        this.setState({ visible: false })
    }
    changeActive = (e) => () => {
        const { dispatch, wechatsActive } = this.props
        if ("sidebarActive" in e) {
            dispatch(routerRedux.push({ pathname: "/web", query: { p: e.sidebarActive } }))
        }
        if (wechatsActive !== e.wechatsActive) {
            dispatch({ type: "chat/upActive", payload: e })
        }
        dispatch({ type: "chat/hasKefuid", payload: "" })
    }
    voiceOver = () => {
        this.props.dispatch({ type: "chat/pushMsg" })
    }
    changeSwitch = () => {
        this.props.dispatch({ type: "chat/changeSound" })
    }
    fetchSendTime = (e) => {
        if (e) {
            const { auth, dispatch } = this.props
            dispatch({ type: "chat/fetchSendTime", payload: { zid: auth.id } })
        }
    }
    delSendTime = (id) => {
        this.props.dispatch({ type: "chat/delSendTime", payload: { id } })
    }
    fetchDoList = (e) => {
        const { doList, dispatch } = this.props
        if (e) {
            if (doList.length === 0) {
                dispatch({ type: "chat/fetchDolist" })
            }
        }
    }
    delDoList = (id) => {
        this.props.dispatch({ type: "chat/deleteRecord", payload: { id } })
    }
    onCancleFoucs = () => {
        this.props.dispatch({ type: "chat/cancleFouc", payload: { value: false } })
    }
    handleStart = (forwardData) => {
        const { groups, dispatch } = this.props
        if (groups.length <= 0) {
            dispatch({ type: "chat/fetchGroups" })
        }
        this.setState({ forwardVisible: true, forwardData })
    }
    handleOver = () => {
        this.setState({ forwardVisible: false })
    }

    render () {
        const { hasDo, doList, sidebarActive, isLog, log, checkDate, notification, notificationSwitch, auth, sendTime, location, addNum } = this.props
        let checked = location.query.p || sidebarActive
        const { forwardVisible, forwardData, logo } = this.state
        return (
            <span id="page">
                {isLog === "" && (
                    <div className={styles.loadingBox}>
                        <Spin tip="Loading..." delay={600} />
                    </div>
                )}
                {isLog === "1" && auth && (
                    <div className={styles.container}>
                        <Header
                            addNum={addNum}
                            logoKey={logo}
                            hasDo={hasDo}
                            onCancleFoucs={this.onCancleFoucs}
                            doList={doList}
                            sendTime={sendTime}
                            soundSwitch={notificationSwitch}
                            modalShow={this.modalShow}
                            delDoList={this.delDoList}
                            delSendTime={this.delSendTime}
                            fetchDoList={this.fetchDoList}
                            fetchSendTime={this.fetchSendTime}
                            badge={log && log.length > 0 && log[0].createtime > checkDate}
                            changeSwitch={this.changeSwitch}
                        />
                        <div className={styles.main}>
                            {auth.theme
                                ? <Sidebar onClick={this.changeActive} sidebarActive={checked} />
                                : <OldSidebar onClick={this.changeActive} sidebarActive={checked} />
                            }
                            {auth.theme
                                ? <Devices onClick={this.changeActive} forward={this.handleStart} />
                                : <OldDevices onClick={this.changeActive} forward={this.handleStart} />
                            }
                            <div className={styles.content} style={{ padding: checked === "moments" ? 0 : 24 }}>
                                {(checked === "chats" || checked === "qun") && <Chats tag={checked} />}
                                {checked === "moments" && <Moments />}
                                {checked === "contacts" && <Contacts />}
                                {checked === "customs" && <Custom />}
                                {checked === "tags" && <Tags />}
                            </div>
                        </div>
                        {notification && notificationSwitch && <audio controls={false} onEnded={this.voiceOver} autoPlay={true}>
                            <source src="//jutb.oss-cn-hangzhou.aliyuncs.com/web/notice/notice.wav" />
                        </audio>}
                        <Forward
                            visible={forwardVisible}
                            status={1}
                            data={forwardData}
                            over={this.handleOver}
                        />
                        <Modal
                            title="更新日志"
                            centered={true}
                            width={700}
                            bodyStyle={{ maxHeight: 700, overflow: "hidden", overflowY: "auto" }}
                            footer={null}
                            onCancel={this.modalHide}
                            visible={this.state.visible}
                        >
                            <Timeline className={styles.upLog}>
                                {log && log.length > 0
                                    ? log.map((item) => (
                                        <Timeline.Item key={item.id} color="green">
                                            <div className={styles.title}>
                                                {item.createtime}
                                            </div>
                                            <p>版本号：{item.version_number}</p>
                                            <ol>
                                                {item.content.map((val, index) => <li key={index}>{val}</li>)}
                                            </ol>
                                        </Timeline.Item>
                                    ))
                                    : (
                                        <Timeline.Item color="red">
                                            <Empty />
                                        </Timeline.Item>
                                    )}
                            </Timeline>
                        </Modal>
                    </div>
                )}
            </span>
        )
    }
}
function mapStateToProps (state) {
    const { wechatsActive, sidebarActive, isLog, wechats, log, checkDate, auth, notification, notificationSwitch, sendTime, doList, hasDo, groups, addNum } = state.chat
    return { wechatsActive, sidebarActive, isLog, wechats, log, checkDate, auth, notification, notificationSwitch, sendTime, doList, hasDo, groups, addNum }
}
export default connect(mapStateToProps)(Page)
