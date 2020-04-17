import { connect } from "dva"
import { Component } from "react"
import CustomTable from "./components/table"
import styles from "./page.css"
import FriendForm from "./components/FriendForm"
import { Modal, Select, Checkbox } from "antd"
import { routerRedux } from "dva/router"
const Option = Select.Option
const CheckboxGroup = Checkbox.Group
class Customs extends Component {
    state = { current: 1, isGroup: false, record: "", isTag: false }
    async UNSAFE_componentWillReceiveProps (nextProps) {
        const selwechat = this.props.wechatsActive
        const menuShow = this.props.menuFold
        const { wechatsActive, menuFold } = nextProps
        await this.getWeChat(nextProps)
        if (selwechat !== wechatsActive) {
            this.initalPatch(nextProps)
        }
        if (menuShow !== menuFold) {
            this.initalPatch(nextProps)
        }
    }
    async componentDidMount () {
        await this.getWeChat(this.props)
        this.initalPatch(this.props)
    }
    hasKefu = () => {
        let wechatlst = []
        const { wechatsActive, menuFold, wechats } = this.props
        if (!menuFold) {
            wechats.map((item) => {
                wechatlst.push(item.wxid)
            })
        } else {
            wechatlst.push(wechatsActive)
        }
        return wechatlst
    }
    getWeChat = async (props) => {
        const { wechats, auth, dispatch } = props
        if (wechats === "") {
            await dispatch({ type: "chat/fetchWechats", payload: { userid: auth.id } })
        }
    }
    initalPatch (props) {
        const { wechats, dispatch, wechatsActive } = props
        if (wechats && wechatsActive) {
            dispatch({ type: "custom/fetchCustom", payload: { kefu_wxid: this.hasKefu() } })
            dispatch({ type: "custom/fetchGroups", payload: { kefu_wxid: this.hasKefu() } })
            dispatch({ type: "chat/fetchAllTags" })
            this.setState({ current: 1 })
        }

    }
    showGroup = (record) => {
        this.setState({ isGroup: true, record })
    }
    hiddenGroup = () => {
        this.setState({ isGroup: false })
    }
    changeGroup = (fid) => {
        this.setState({ fid })
    }
    selectGroupOk = () => {
        this.props.dispatch({ type: "custom/changeGroups", payload: { uid: this.state.record.userid, fid: this.state.fid } })
        this.setState({ isGroup: false })
    }
    showTag = (record) => {
        let selTag = record.tagid
        this.setState({ isTag: true, record, selTag })
    }
    onCancel = () => {
        this.setState({ isTag: false })
    }
    onChangeSelect = (selecTagid) => {
        this.setState({ selecTagid })
    }
    handleOk = () => {
        const { dispatch } = this.props
        const { selecTagid, record } = this.state
        dispatch({
            type: "custom/editTag",
            payload: { wxid: record.wxid, kefu_wxid: record.kefu_wxid, tagid: selecTagid },
        })
        this.onCancel()
    }
    pageChangeHandler = (e) => {
        const { dispatch, customPara } = this.props
        let payload = customPara
        payload.kefu_wxid = this.hasKefu()
        payload.page = e
        dispatch({ type: "custom/fetchCustom", payload })
        this.setState({ current: e })
    }
    showRecord = (item, e) => {
        const { recorId } = this.state
        if (e && recorId !== item.userid) {
            let payload = { userid: item.userid }
            this.props.dispatch({ type: "custom/fetchRecord", payload })
        }
        this.setState({ recorId: item.userid })
    }
    loadMore = (item, id) => {
        let payload = { userid: item.userid, id }
        this.props.dispatch({ type: "custom/fetchRecord", payload })
    }
    resetPage = () => {
        this.setState({ current: 1 })
    }
    goChat = async (e) => {
        const { dispatch } = this.props
        await dispatch({ type: "chat/upChatsActive", payload: e })
        dispatch(routerRedux.push({ pathname: "/web", query: { p: "chats" } }))
    }
    render () {
        const {
            dispatch,
            customLst,
            customTotal,
            loading,
            usergroup,
            allTags,
            recordLst,
            wechats,
            wechatsActive,
            recordLoading,
            recordnoMore,
        } = this.props
        const { current, isGroup, record, isTag, selTag } = this.state
        let self
        let tagslst = []
        allTags && allTags.map((item) => {
            tagslst.push({ label: item.tag_name, value: item.id })
        })
        if (wechats && wechatsActive) {
            let index = wechats.findIndex((item) => item.wxid === wechatsActive)
            self = wechats[index]
        }
        let list = customLst && customLst.length ? customLst.filter((f) => f.isQun !== "1") : []// 过滤群组信息
        return (
            <div className={styles.container}>
                <div >
                    <FriendForm resetPage={this.resetPage} hasKefu={this.hasKefu} />
                    <CustomTable
                        goChat={this.goChat}
                        recordnoMore={recordnoMore}
                        loadMore={this.loadMore}
                        recordLoading={recordLoading}
                        self={self}
                        recordLst={recordLst}
                        loading={loading}
                        list={list}
                        total={customTotal}
                        dispatch={dispatch}
                        current={current}
                        usergroup={usergroup}
                        showGroup={this.showGroup}
                        tags={allTags}
                        showRecord={this.showRecord}
                        showTag={this.showTag}
                        pageChangeHandler={this.pageChangeHandler}
                    />
                </div>
                <Modal
                    title="选择分组"
                    destroyOnClose={true}
                    visible={isGroup}
                    onOk={this.selectGroupOk}
                    onCancel={this.hiddenGroup}
                >
                    <div className={styles.modalItem}>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="请选择分组"
                            defaultValue={record && record.fenzu_name}
                            onChange={this.changeGroup}
                        >
                            {usergroup && usergroup.map((item) => <Option key={item.id} value={item.id}>{item.fenzu_name}</Option>)}
                        </Select>
                    </div>
                </Modal>

                <Modal
                    destroyOnClose
                    onOk={this.handleOk}
                    title={"编辑标签"}
                    visible={isTag}
                    onCancel={this.onCancel}
                    width="646px"
                    style={{ height: "60%", overflow: "hidden" }}
                    bodyStyle={{ height: "calc(100% - 108px)", overflow: "auto", padding: "20px" }}
                >
                    <CheckboxGroup
                        id="tags"
                        options={tagslst}
                        defaultValue={selTag && selTag}
                        onChange={this.onChangeSelect}
                    >
                    </CheckboxGroup>
                </Modal>
            </div>
        )
    }

}
function mapStateToProps (state) {
    const { wechatsActive, allTags, menuFold, wechats, auth } = state.chat
    const { customLst, customTotal, loading, usergroup, recordLst, recordLoading, recordnoMore, customPara } = state.custom
    return {
        auth,
        customPara,
        recordnoMore,
        recordLoading,
        recordLst,
        allTags,
        loading,
        customLst,
        wechatsActive,
        customTotal,
        usergroup,
        menuFold,
        wechats,
    }
}
export default connect(mapStateToProps)(Customs)
