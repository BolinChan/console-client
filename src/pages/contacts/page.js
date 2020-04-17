import { connect } from "dva"
import { Component } from "react"
import styles from "./page.css"
import Tabs from "../../components/Tabs"
import Contact from "./components/Contacts"
import ContactSearch from "./components/ContactSearch"
import ConsoleHeader from "../chats/components/ConsoleHeader"
import Console from "../chats/components/Console"
import Editor from "../chats/components/Editor"
import Record from "../chats/components/Record"
import SidebarR from "../chats/components/SidebarR"
import AddFriend from "../chats/components/AddFriend"
import request from "../../utils/request"
const loadUrl = "//wechat.yunbeisoft.com/index_test.php/home/api/getFriendsByFenzu"
let wechatsUpdate = ""
class Contacts extends Component {
    state = {
        fid: "",
        isLoading: false,
        recordVisible: false,
        type: "",
        checkKsy: "",
        checkTime: "",
        page: 0,
        list: [],
        hasMore: true,
    }
    componentDidMount () {
        this.initLoad(this.props)
    }
    UNSAFE_componentWillReceiveProps (nextProps) {
        this.initLoad(nextProps)
    }
    // 初始化数据
    initLoad = async (props) => {
        const { wechatsActive, auth, dispatch, menuFold } = props
        let payload = {}
        if (wechatsActive === "") {
            await dispatch({ type: "chat/fetchWechats", payload: { userid: auth.id } })
        } else {
            // 聚合关
            if (menuFold && wechatsActive !== wechatsUpdate) {
                payload.type = wechatsActive
                payload.kefu_wxid = wechatsActive
                wechatsUpdate = menuFold && wechatsActive
                dispatch({ type: "contact/fetchGroups", payload })
                this.setState({ fid: "", hasMore: true, page: 0, list: [] })
            }
            // 聚合开
            if (!menuFold && wechatsUpdate !== "all") {
                wechatsUpdate = "all"
                payload.type = wechatsUpdate
                dispatch({ type: "contact/fetchGroups", payload })
                this.setState({ fid: "", hasMore: true, page: 0, list: [] })
            }
        }
    }
    upContactsActive = (e) => {
        const { chatsActive, dispatch } = this.props
        if (e.userid !== chatsActive && e) {
            dispatch({ type: "chat/upChatsActive", payload: e })
        }
    }
    changeGroup = (e) => {
        const { list } = this.state
        if (list.length) {
            let index = list.findIndex((f) => f.userid === e.uid)
            if (index !== -1) {
                list.splice(index, 1)
                this.setState({ list })
            }
        }
        this.props.dispatch({ type: "contact/changeGroups", payload: e })
    }
    taggle = async (e) => {
        const fid = typeof e === "undefined" ? "" : e
        await this.setState({ fid, hasMore: true, page: 0, list: [] })
        this.handleInfiniteOnLoad()
    }

    handleInfiniteOnLoad = async () => {
        const { fid, page, hasMore, list } = this.state
        const { wechatsActive, menuFold, auth, token } = this.props
        if ((menuFold && wechatsActive === "") || fid === "" || !hasMore) {
            return
        }
        let payload = {
            fid,
            page: page + 1,
            type: menuFold ? wechatsActive : "all",
            kefuid: auth.id,
            token: token,
        }
        this.setState({ isLoading: true })
        if (menuFold) {
            payload.kefu_wxid = wechatsActive
        }
        let option = {
            url: loadUrl,
            data: JSON.stringify(payload),
        }
        let { data } = await request(option)
        if (!data.error) {
            this.setState({ list: [...list, ...data.data], hasMore: data.hasMore, page: payload.page })
        }
        this.setState({ isLoading: false })
    }
    changeRecord = () => {
        const { recordVisible } = this.state
        this.setState({ recordVisible: !recordVisible })
    }
    checkKsy = (e) => () => {
        this.setState({ type: "ksy", checkKsy: e, checkTime: Date.now() })
    }
    toTop = (id) => {
        this.props.dispatch({ type: "contact/groupToTop", payload: { id } })
    }
    render () {
        const { list, hasMore, isLoading, fid, recordVisible, checkKsy, checkTime } = this.state
        const { wechats, menuFold, wechatsActive, groups, auth, chatsActive, chatLog, chats } = this.props
        return (
            <div className={styles.container}>
                <div className={styles.contacts}>
                    <div className={styles.chatHeader}>
                        <ContactSearch
                            select={this.upContactsActive}
                            auth={auth}
                            wechatsActive={wechatsActive}
                            menuFold={menuFold}
                            token={this.props.token}
                        />
                        <AddFriend />
                    </div>
                    <Tabs />
                    {groups && groups.length > 0 &&
                        <Contact
                            wechats={wechats}
                            fid={fid}
                            toTop={this.toTop}
                            chats={chats}
                            chatLog={chatLog}
                            groups={groups}
                            contacts={list}
                            active={chatsActive}
                            onClick={this.upContactsActive}
                            changeGroup={this.changeGroup}
                            taggle={this.taggle}
                            hasMore={hasMore}
                            load={this.handleInfiniteOnLoad}
                            isLoading={isLoading}
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
                            type={this.state.type}
                        />
                    </div>
                }
                {chatsActive &&
                    <div className={styles.sidebarR}>
                        {recordVisible
                            ? <Record />
                            : <SidebarR checkKsy={this.checkKsy} />
                        }
                    </div>
                }
            </div>
        )
    }
}
function mapStateToProps (state) {
    const { groups, type } = state.contact
    const { wechats, menuFold, wechatsActive, auth, token, chatsActive, unread, chatLog, chats } = state.chat
    return { wechats, menuFold, wechatsActive, groups, type, auth, token, chatsActive, unread, chatLog, chats }
}
export default connect(mapStateToProps)(Contacts)
