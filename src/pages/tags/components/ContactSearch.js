import { Component } from "react"
import { Input, AutoComplete, Icon, Avatar, Spin, Empty } from "antd"
import request from "../../../utils/request"
import styles from "./ContactSearch.css"
const Option = AutoComplete.Option
const fakeDataUrl = "//wechat.yunbeisoft.com/index_test.php/home/tagg/taggListService"

class ContactSearch extends Component {
    state = {
        visible: false,
        search: false,
        dataSource: "",
    }
    handleSearch = (e) => {
        let tag_name = e.target.value
        if (tag_name && tag_name.replace(/\s+/g, "").length > 0) {
            this.setState({ search: true, visible: true })
            setTimeout(async () => {
                const { auth, wechatsActive, menuFold } = this.props
                let payload = { kefuid: auth.id, token: this.props.token, tag_name }
                if (menuFold) {
                    payload.kefu_wxid = [wechatsActive]
                }
                let { data: res } = await request({ url: fakeDataUrl, data: JSON.stringify(payload) })
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
        const { search, dataSource } = this.state
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
                    onBlur={this.handleBlur}
                    open={false}
                    onChange={this.props.onChangeTag}
                    // open={visible}
                    // disabled
                >
                    <Input
                        prefix={<Icon type="search" />}
                        placeholder="搜索标签"
                        onPressEnter={this.props.handleSearch}
                    />
                </AutoComplete>
            </div>
        )
    }
}
export default ContactSearch

