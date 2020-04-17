import { Component } from "react"
import { connect } from "dva"
import request from "../../../utils/request"
import classNames from "classnames"
import styles from "./GroupJoin.css"
import { Icon, Modal, Input, Checkbox, Spin, Empty } from "antd"
import InfiniteScroll from "react-infinite-scroller"
const loadUrl = "//wechat.yunbeisoft.com/index_test.php/home/quns/get_friends_to_qun"
class GroupJoin extends Component {
    state = { visible: false, list: [], loading: false, hasMore: true, btnLoading: false }
    initLoad = async (payload) => {
        let { list, hasMore } = this.state
        if (!hasMore) {
            return
        }
        let data = await this.load(payload)
        if (!data.error) {
            this.setState({ list: [...list, ...data.data], hasMore: data.hasMore })
        }
    }
    load = async (payload) => {
        this.setState({ loading: true })
        let { token, userid } = this.props
        let option = {
            url: loadUrl,
            data: JSON.stringify({ userid, token, ...payload }),
        }
        let { data } = await request(option)
        this.setState({ loading: false })
        return data
    }
    onCancel = () => {
        this.setState({ visible: false, list: [], hasMore: true })
    }
    handle = () => {
        this.initLoad({ page: 1 })
        this.setState({ visible: true })
    }
    onLoadMore = (page) => {
        this.initLoad({ page: page + 1 })
    }
    onChange = (item, index) => {
        let { list } = this.state
        item.check = !item.check
        list[index] = item
        this.setState({ list })
    }
    handleSearch = async (e) => {
        this.setState({ list: [] })
        let data = await this.load({ nick: e.target.value })
        if (!data.error) {
            this.setState({ list: data.data })
        }
    }
    clearSearch = async (e) => {
        if (!e.target.value) {
            await this.setState({ list: [], hasMore: true })
            this.initLoad({ page: 1 })
        }
    }
    addQuns = async () => {
        let wxids = ""
        let { userid, dispatch } = this.props
        let { list } = this.state
        this.setState({ btnLoading: true })
        if (list.length) {
            for (let i = 0, len = list.length; i < len; i++) {
                if (list[i].check) {
                    if (!wxids) {
                        wxids = list[i].wxid
                    } else {
                        wxids = wxids + "," + list[i].wxid
                    }
                }
            }
            if (wxids.length) {
                await dispatch({ type: "chat/addQuns", payload: { userid, wxids } })
            }
        }
        this.setState({ btnLoading: false, visible: false, list: [], hasMore: true })
    }
    render () {
        const { visible, list, loading, hasMore, btnLoading } = this.state
        return (
            <div >
                <a onClick={() => this.handle()}>拉人进群</a>
                {/* <Icon type="plus-circle" className={styles.addbtn} onClick={() => this.handle()} /> */}
                <Modal confirmLoading={btnLoading} visible={visible} onCancel={this.onCancel} title="选择联系人" onOk={this.addQuns} destroyOnClose={true} bodyStyle={{ padding: "24px 0 0 0" }}>
                    <div id="search" style={{ padding: "0 24px" }}>
                        <Input
                            allowClear
                            prefix={<Icon type="search" />}
                            placeholder="搜索联系人"
                            onPressEnter={this.handleSearch}
                            onChange={this.clearSearch}
                        />
                    </div>
                    <Spin spinning={loading && !list.length}>

                        <ul className={styles.itemMain} ref={(ref) => this.scrollParentRef = ref}>
                            {list.length > 0 && <InfiniteScroll
                                initialLoad={false}
                                threshold={500}
                                loadMore={this.onLoadMore}
                                hasMore={!loading && hasMore}
                                useWindow={false}
                                getScrollParent={() => this.scrollParentRef}
                                loader={null}
                            >
                                {list.map((item, index) => (
                                    <li className={classNames([[styles.item], { [styles.itemActive]: item.check }])} key={item.userid} onClick={() => this.onChange(item, index)} >
                                        <Checkbox checked={item.check} />
                                        <img alt="" src={item.headImg} className={styles.itemImg} />
                                        <span>
                                            {item.remark || item.nick || item.wxid}
                                        </span>
                                    </li>
                                ))}
                            </InfiniteScroll>}
                            {!loading && !list.length && <Empty />}
                        </ul>
                    </Spin>
                </Modal>
            </div >
        )
    }
}
function mapStateToProps (state) {
    const { token } = state.chat
    return { token }
}

export default connect(mapStateToProps)(GroupJoin)
