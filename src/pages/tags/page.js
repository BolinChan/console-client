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
let wechatsUpdate = ""
let fetch = false
const getGroupUrl = "//wechat.yunbeisoft.com/index_test.php/home/tagg/taggListService"
const getTagUrl = "//wechat.yunbeisoft.com/index_test.php/home/tagg/taggFriend"
class Tags extends Component {
    state = {
        fid: "",
        isLoading: false,
        recordVisible: false,
        type: "",
        checkKsy: "",
        checkTime: "",
        groupLoading: false,
        groupMore: true,
        groupPage: 0,

        tags: [],
        tagsMore: true,
        tagsLoading: false,
        tagsPage: 0,
        tag_name: "",
    }

    componentDidMount () {
        this.getLoad(this.props)
    }
    UNSAFE_componentWillReceiveProps (nextProps) {
        this.getLoad(nextProps)
    }
    getLoad = async (props) => {
        const { wechatsActive, dispatch, auth, menuFold } = props
        if (wechatsActive === "") {
            await dispatch({ type: "chat/fetchWechats", payload: { userid: auth.id } })
        }
        // 聚合关
        if (menuFold && wechatsActive !== wechatsUpdate) {
            wechatsUpdate = menuFold && wechatsActive
            await dispatch({ type: "tag/clearGroup" })
            await this.setState({ fid: "", groupPage: 0, groupMore: true })
            this.getGroups()
        }
        // 聚合开
        if (!menuFold && wechatsUpdate !== "all") {
            wechatsUpdate = "all"
            await dispatch({ type: "tag/clearGroup" })
            await this.setState({ fid: "", groupPage: 0, groupMore: true })
            this.getGroups()
        }

    }
    componentWillUnmount () {
        wechatsUpdate = ""
    }
    // 下拉加载
    hasLoad = () => {
        this.getGroups()
        this.getTags()
    }
    // 获取分组
    getGroups = async () => {
        let { dispatch } = this.props
        let { groupPage, groupMore, tag_name } = this.state
        if (!groupMore || fetch) {
            return
        }
        fetch = true
        let payload = {
            ispage: 1,
            pageSize: 20,
            type: wechatsUpdate,
            tag_name,
        }
        if (payload.type !== "all") {
            payload.kefu_wxid = wechatsUpdate
        }
        groupPage = groupPage + 1
        payload.page = groupPage
        this.setState({ groupLoading: true })
        let { data } = await request({ url: getGroupUrl, data: JSON.stringify(payload) })
        if (!data.error) {
            dispatch({ type: "tag/saveTags", payload: data.data })
            this.setState({ groupMore: data.hasMore, groupPage })
        }
        this.setState({ groupLoading: false })
        fetch = false
    }
    getTags = async () => {
        let { tags, tagsMore, tagsPage, fid } = this.state
        if (!tagsMore || !fid) {
            return
        }
        tagsPage = tagsPage + 1
        let payload = {
            id: fid,
            type: wechatsUpdate,
            page: tagsPage,
            pageSize: 20,

        }
        if (payload.type !== "all") {
            payload.kefu_wxid = wechatsUpdate
        }
        this.setState({ tagsLoading: true })
        let { data } = await request({ url: getTagUrl, data: JSON.stringify(payload) })
        if (!data.error) {
            this.setState({ tags: [...tags, ...data.data], tagsMore: data.hasMore, tagsPage })
        }
        this.setState({ tagsLoading: false })
    }

    taggle = async (e) => {
        const fid = typeof e === "undefined" ? "" : e
        await this.setState({ fid, tags: [], tagsMore: true, tagsPage: 0 })
        this.getTags()
    }
    upContactsActive = (e) => {
        const { chatsActive, dispatch } = this.props
        if (e.userid !== chatsActive && e) {
            dispatch({ type: "chat/upChatsActive", payload: e })
        }
    }
    changeRecord = () => {
        const { recordVisible } = this.state
        this.setState({ recordVisible: !recordVisible })
    }
    checkKsy = (e) => () => {
        this.setState({ type: "ksy", checkKsy: e, checkTime: Date.now() })
    }
    handleSearch=async (e) => {
        let tag_name = e.target.value.trim()
        if (tag_name !== this.state.tag_name) {
            const {dispatch} = this.props
            await dispatch({ type: "tag/clearGroup" })
            await this.setState({ fid: "", groupPage: 0, groupMore: true, tag_name })
            this.getGroups()
        }
    }
    onChangeTag=(value = "") => {
        value = value.trim()
        if (value.length === 0 && this.state.tag_name !== value) {
            this.handleSearch({target: {value}})
        }
    }
    render () {
        const { chatsActive, menuFold, wechatsActive, auth, groups } = this.props
        const { groupMore, groupLoading, fid, recordVisible, checkKsy, checkTime, tags, tagsLoading, tagsMore } = this.state
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
                            handleSearch={this.handleSearch}
                            onChangeTag={this.onChangeTag}
                        />
                        <AddFriend />
                    </div>
                    <Tabs />
                    <Contact
                        list={tags}
                        tagLoad={tagsLoading}
                        tagMore={tagsMore}
                        getTags={this.getTags}
                        fid={fid}
                        groups={groups}
                        active={chatsActive}
                        onClick={this.upContactsActive}
                        taggle={this.taggle}
                        hasMore={groupMore}
                        load={this.hasLoad}
                        isLoading={groupLoading}
                    />
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
    const { groups } = state.tag
    const { wechats, menuFold, wechatsActive, token, chatsActive, auth } = state.chat
    return { wechats, menuFold, wechatsActive, token, chatsActive, auth, groups }
}
export default connect(mapStateToProps)(Tags)
