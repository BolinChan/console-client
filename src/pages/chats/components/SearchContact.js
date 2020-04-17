import { Component } from "react"
import { Input, AutoComplete, Icon, Avatar, Spin, Empty } from "antd"
import request from "../../../utils/request"
import { connect } from "dva"
import styles from "./SearchContact.css"
const Option = AutoComplete.Option
const fakeDataUrl = "//wechat.yunbeisoft.com/index_test.php/home/api/sertch_friends"
const fakeQunUrl = "//wechat.yunbeisoft.com/index_test.php/home/api/get_quns"
class SearchContact extends Component {
    state = {
        visible: false,
        search: false,
        dataSource: "",
    }

    handleSearch = (e) => {
        let keyword = e.target.value
        if (keyword && keyword.replace(/\s+/g, "").length > 0) {
            this.setState({ search: true, visible: true })
            setTimeout(async () => {
                const { auth, wechatsActive, menuFold, sidebarActive, token } = this.props
                let payload = { kefuid: auth.id, token }
                if (menuFold) {
                    payload.kefu_wxid = [wechatsActive]
                }
                let options = ""
                // 联系人搜索
                if (sidebarActive === "chats") {
                    payload.keyword = keyword
                    options = { url: fakeDataUrl }
                }
                // 群搜索
                if (sidebarActive === "qun") {
                    payload.nick = keyword
                    options = { url: fakeQunUrl }
                }
                if (!options) {
                    this.setState({ search: false })
                    return
                }
                options.data = JSON.stringify(payload)
                let { data: res } = await request(options)
                this.setState({ dataSource: res.data, search: false })
            }, 1000)
        }
    }
    handleBlur = () => {
        this.setState({ visible: false, dataSource: "" })
    }
    handleSelect = (e) => {
        const { dataSource } = this.state
        let user = dataSource.find((item) => item.userid === e)
        this.handleBlur()
        this.props.select(user)
    }
    render () {
        const { sidebarActive } = this.props
        const { visible, search, dataSource } = this.state
        let options = [<Option key="loading" value="" className={styles.search}><Spin /></Option>]
        if (!search) {
            if (dataSource.length > 0) {
                options = dataSource.map((item) => (
                    <Option key={item.userid} value={item.userid}>
                        <Avatar icon="user" src={item.headImg} style={{ marginRight: 12 }} />
                        {item.remark || item.nick || item.wxid}
                    </Option>
                ))
            } else {
                options = [<Option key="noData" value=""><Empty /></Option>]
            }
        }
        return (
            <div className={styles.searchBox} id="search">
                <AutoComplete
                    className="search"
                    style={{ display: "block" }}
                    dataSource={options}
                    defaultActiveFirstOption={false}
                    optionLabelProp="nick"
                    allowClear={true}
                    onSelect={this.handleSelect}
                    open={visible}
                    onBlur={this.handleBlur}
                >
                    <Input
                        prefix={<Icon type="search" />}
                        placeholder={sidebarActive === "chats" ? "搜索联系人" : "搜索群组"}
                        onPressEnter={this.handleSearch}
                    />
                </AutoComplete>
            </div>
        )
    }
}
function mapStateToProps (state) {
    const { sidebarActive } = state.chat
    return { sidebarActive }
}
export default connect(mapStateToProps)(SearchContact)
