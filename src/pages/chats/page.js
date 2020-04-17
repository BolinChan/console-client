import { connect } from "dva"
import { Component } from "react"
import styles from "./page.css"
import Tabs from "../../components/Tabs"
import SearchContact from "./components/SearchContact"
import Contacts from "./components/Contacts"
import ConsoleHeader from "./components/ConsoleHeader"
import Console from "./components/Console"
import Editor from "./components/Editor"
import SidebarR from "./components/SidebarR"
import Record from "./components/Record"
import AddFriend from "./components/AddFriend"
import { Modal, Input } from "antd"
import request from "../../utils/request"
const loadUrl = "//wechat.yunbeisoft.com/index_test.php/home/api/get_friends_new"
class Chats extends Component {
    state = {
        recordVisible: false,
        type: "",
        checkKsy: "",
        checkTime: "",
        remarkVisible: false,
        remark: "",
        editId: "",
        isLoading: false,
    }
    componentDidMount () {
        this.getData()
    }
    getData = () => {
        const { wechats, dispatch, kefu, auth, usergroup, menuFold, wechatsActive } = this.props
        if (wechats === "") {
            dispatch({ type: "chat/fetchWechats", payload: { userid: auth.id } })
        }
        if (kefu === "") {
            dispatch({ type: "chat/fetchKefu" })
        }
        if (usergroup && usergroup.length === 0) {
            let wechatlst = []
            if (!menuFold) {
                wechats.map((item) => {
                    wechatlst.push(item.wxid)
                })
            } else {
                wechatlst.push(wechatsActive)
            }
            dispatch({ type: "custom/fetchGroups", payload: { kefu_wxid: wechatlst } })
        }
        dispatch({ type: "chat/fetchAllTags" })
    }
    changeRecord = () => {
        const { recordVisible } = this.state
        this.setState({ recordVisible: !recordVisible })
    }
    checkKsy = (e) => () => {
        this.setState({ type: "ksy", checkKsy: e, checkTime: Date.now() })
    }
    upChatsActive = (e, kefuid) => {
        const { chatsActive, dispatch } = this.props
        if (kefuid) {
            dispatch({ type: "chat/hasKefuid", payload: kefuid })
        }
        dispatch({ type: "chat/cancleFouc", payload: { value: false } })
        if (e !== chatsActive && e) {
            dispatch({ type: "chat/upChatsActive", payload: { userid: e } })
        }
    }
    selectSearch = (e) => {
        const { chatsActive, dispatch } = this.props
        if (e && e.userid && e.userid !== chatsActive) {
            dispatch({ type: "chat/upChatsActive", payload: e })
        }
    }
    toTop = (param) => {
        this.props.dispatch({ type: "chat/toTop", payload: param })
    }
    editRemark = (param) => {
        this.setState({ remarkVisible: true, remark: param.remark, editId: param.id })
    }
    changeRemark = (e) => {
        this.setState({ remark: e.target.value })
    }
    handleRemarkOk = () => {
        const { chats } = this.props
        const { editId, remark } = this.state
        const active = chats.find((item) => item.userid === editId)
        this.props.dispatch({
            type: "chat/editInfo",
            payload: { option: "remark", changeValue: remark, oldValue: active.remark || "", wxid: active.wxid, kefu_wxid: active.kefu_wxid },
        })
        this.handleRemarkCancel()
    }
    handleRemarkCancel = () => {
        this.setState({ remarkVisible: false, remark: "", editId: "" })
    }
    handleInfiniteOnLoad = async () => {
        let { wechatsActive, menuFold, auth, token, chatHasMore, concatCurrent, dispatch, tag } = this.props
        if (menuFold && wechatsActive === "") {
            return
        }
        let payload = {
            token,
            page: 1,
            kefuid: auth.id,
            type: menuFold ? wechatsActive : "all",
            typeOf: tag,
        }
        if (menuFold) {
            payload.kefu_wxid = [wechatsActive]
        }
        concatCurrent = chatHasMore ? concatCurrent + 1 : 1
        payload.page = concatCurrent
        let option = {
            url: loadUrl,
            data: JSON.stringify(payload),
        }
        await this.setState({ isLoading: true })
        let { data } = await request(option)
        if (!data.error) {
            if (wechatsActive !== this.props.wechatsActive) {
                this.setState({ isLoading: false })
                return
            }
            await dispatch({
                type: "chat/saveChats",
                payload: { data: data.data, hasMore: data.hasMore, type: payload.type, page: payload.page },
            })
        }
        this.setState({ isLoading: false })
    }
    onCancleFoucs = () => {
        this.props.dispatch({ type: "chat/cancleFouc", payload: { value: false } })
    }
    changeGroup = (e, user) => {
        const { dispatch } = this.props
        let payload = {
            uid: user.userid,
            fid: e.id,
        }
        dispatch({ type: "contact/changeGroups", payload })
        dispatch({ type: "chat/changeChatFid", payload: { user, fid: e.id, changeGroup: true } })
    }
    changeAlter = (userid, isIgnore) => {
        this.props.dispatch({
            type: "chat/changeAlter",
            payload: { userid, isIgnore },
        })
    }
    delFriend = async (para) => {
        this.props.dispatch({ type: "chat/delFirend", payload: para })
    }

    render () {
        const { chatHasMore, chatsActive, menuFold, chats, wechatsActive, chatLog, unread, auth, usergroup, tag, wechats } = this.props
        const { recordVisible, type, checkKsy, checkTime, remarkVisible, remark, isLoading } = this.state
        let list = chats

        if (chats.length > 0) {
            if (tag === "chats") {
                // list = chats.filter((item) => item.userid.indexOf("q") === -1 && item.lastMsg && item.lastMsgTime)
                list = chats.filter((item) => item.userid.indexOf("q") === -1)
            } else {
                list = chats.filter((item) => item.userid.indexOf("q") !== -1)
            }
            if (menuFold) {
                list = list.filter((item) => item.kefu_wxid === wechatsActive)
            }
        }

        let activeUnread = []
        if (unread && unread.length > 0) {
            activeUnread = menuFold ? unread.filter((item) => item.kefu_wxid === wechatsActive) : unread
        }
        let groupLst = []
        if (usergroup && usergroup.length) {
            groupLst = usergroup.filter((item) => item.fenzu_name !== "未分组")
        }
        return (
            <div className={styles.container}>
                <div className={styles.contacts}>
                    <div className={styles.chatHeader}>
                        <SearchContact
                            select={this.selectSearch}
                            auth={auth}
                            wechatsActive={wechatsActive}
                            menuFold={menuFold}
                            token={this.props.token}
                        />
                        <AddFriend />
                    </div>
                    <Tabs />
                    {this.props.wechats && this.props.kefu && wechatsActive &&
                        <Contacts
                            changeAlter={this.changeAlter}
                            changeGroup={this.changeGroup}
                            usergroup={groupLst}
                            contacts={list}
                            delFriend={this.delFriend}
                            onClick={this.upChatsActive}
                            chatLog={chatLog}
                            active={chatsActive}
                            toTop={this.toTop}
                            editRemark={this.editRemark}
                            unread={activeUnread}
                            hasMore={chatHasMore}
                            load={this.handleInfiniteOnLoad}
                            isLoading={isLoading}
                            wechats={wechats}
                            auth={auth}
                        />
                    }
                </div>
                {chatsActive &&
                    <div className={styles.content}>
                        <ConsoleHeader />
                        <Console />
                        <Editor
                            changeRecord={this.changeRecord}
                            recordVisible={recordVisible}
                            addText={checkKsy}
                            addTime={checkTime}
                            type={type}
                        />
                    </div>
                }
                {chatsActive &&
                    <div className={styles.sidebarR} onClick={this.onCancleFoucs}>
                        {recordVisible
                            ? <Record />
                            : <SidebarR checkKsy={this.checkKsy} />
                        }
                    </div>
                }
                <Modal
                    title="修改备注"
                    visible={remarkVisible}
                    onOk={this.handleRemarkOk}
                    onCancel={this.handleRemarkCancel}
                >
                    <Input
                        value={remark}
                        ref={(input) => (input && input.focus())}
                        onChange={this.changeRemark}
                        onPressEnter={this.handleRemarkOk}
                    />
                </Modal>
            </div>
        )
    }
}

function mapStateToProps (state) {
    const { usergroup } = state.custom
    const { concatCurrent, chatHasMore, chats, dispatch, chatsActive, wechats, wechatsActive, menuFold, chatLog, unread, kefu, auth, token } = state.chat
    return { concatCurrent, chatHasMore, chats, dispatch, chatsActive, menuFold, wechats, wechatsActive, chatLog, unread, kefu, auth, token, usergroup }
}

export default connect(mapStateToProps)(Chats)
