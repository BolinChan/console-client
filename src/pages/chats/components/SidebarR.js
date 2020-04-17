import { connect } from "dva"
import { Component } from "react"
import { Tabs, Modal } from "antd"
import styles from "./SidebarR.css"
import FastWord from "./FastWord"
import Info from "./Info"
import GroupInfo from "./GroupInfo"
import CollectMini from "./CollectMini"
import SearchOrder from "./SearchOrder"
// import Collection from "./Collection"
import Moments from "./Moments"
const TabPane = Tabs.TabPane
class SidebarR extends Component {
    // componentDidMount () {
    //     this.getCollection(this.props)
    // }
    // componentDidUpdate () {
    //     this.getCollection(this.props)
    // }
    // getCollection = (param) => {
    //     const { collectionMsgs, dispatch } = param
    //     if (collectionMsgs === "") {
    //         dispatch({ type: "chat/fetchCollection" })
    //     }
    // }
    changeTab = (key) => {
        this.props.dispatch({ type: "chat/changeTabs", payload: key })
    }
    hanldOrder = (value) => {
        this.props.dispatch({
            type: "chat/saveOrderVisible",
            payload: value,
        })
    }
    render () {
        const { checkKsy, tabActive, auth, chatsActive, orderVisible, order_sn } = this.props
        const { rights } = auth
        let isGroup = chatsActive.indexOf("q") !== -1
        let showTools = true
        const url = window.location.href
        if (url.indexOf("jiafen.scrm.la") !== -1) {
            showTools = false
        }
        return (
            <div className={styles.sidebar} id="sidebarR">
                <Tabs activeKey={tabActive} onChange={this.changeTab}>
                    <TabPane tab="快捷语" key="fastWord">
                        <div className={styles.planBox}>
                            <FastWord checkKsy={checkKsy} />
                        </div>
                    </TabPane>
                    {("8" in rights && rights["8"]) &&
                        <TabPane tab={!isGroup ? "客户资料" : "群组资料"} key="info">
                            <div className={styles.planBox}>
                                {!isGroup
                                    ? <Info hanldOrder={this.hanldOrder}/>
                                    : <GroupInfo />
                                }
                            </div>
                        </TabPane>
                    }
                    {/* <TabPane tab="收集信息" key="collection">
                        <Collection />
                    </TabPane> */}
                    {("3" in rights && rights["3"] && chatsActive.indexOf("q") === -1) &&
                        <TabPane tab="朋友圈" key="moments">
                            <Moments />
                        </TabPane>
                    }
                    {showTools && <TabPane tab="我的收藏" key="miniapp" style={{position: "relative"}}>
                        <CollectMini />
                    </TabPane>}

                </Tabs>
                <Modal
                    title="查询订单"
                    visible={orderVisible}
                    onCancel={() => this.hanldOrder({ orderVisible: false, order_sn: undefined })}
                    destroyOnClose={true}
                    footer={null}
                    centered
                    bodyStyle={{ height: 520, overflow: "auto" }}
                >
                    <SearchOrder
                        aid={auth && auth.aid}
                        order_sn={order_sn}
                    />
                </Modal>
            </div>
        )
    }
}
function mapStateToProps (state) {
    const { collectionMsgs, tabActive, auth, chatsActive, orderVisible, order_sn } = state.chat
    return { collectionMsgs, tabActive, auth, chatsActive, orderVisible, order_sn }
}
export default connect(mapStateToProps)(SidebarR)
