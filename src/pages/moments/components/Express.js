import { Icon, Popover, Tabs } from "antd"
import styles from "./Express.css"
import { Component } from "react"
import expressList from "../../chats/components/expressList"
import emoji from "emoji"
const TabPane = Tabs.TabPane
// function sports () {
//     let sports = Object.keys(emoji.EMOJI_MAP).splice(1, 20)
//     return sports
// }
// function symbol (params) {
//     let symbol = Object.keys(emoji.EMOJI_MAP).splice(1, 20)
//     return symbol
// }
// function identy (params) {
//     let identy = Object.keys(emoji.EMOJI_MAP).slice(35, 64)
//     identy.push(...Object.keys(emoji.EMOJI_MAP).slice(840, 841))
//     return identy
// }
// function look (params) {
//     let look = Object.keys(emoji.EMOJI_MAP).slice(5, 7)
//     look.push(...Object.keys(emoji.EMOJI_MAP).slice(840, 841))
//     look.push(...Object.keys(emoji.EMOJI_MAP).slice(790, 806))
//     look.push(...Object.keys(emoji.EMOJI_MAP).slice(191, 239))
//     return look
// }


class Express extends Component {
    state = {
        visiblePopover: false,
        tabIndex: "1",
    }
    componentDidMount () {
        document.body.addEventListener("click", this.Listener)
    }
    componentWillUnmount () {
        document.body.removeEventListener("click", this.Listener)
    }
    Listener = (e) => {
        if (e && e.target.innerText &&
            (e.target.innerText.includes("通用") ||
            e.target.innerText.includes("emoji") ||
            e.target.innerText.includes("表情") ||
            e.target.innerText.includes("标识")
            )) {
            return
        }
        this.setState({ visiblePopover: false })
    }
    TabChange = (e) => {
        this.setState({ tabIndex: e })
    }
    content = (tabIndex) => (
        <Tabs
            size="small"
            activeKey={tabIndex}
            className={styles.expressTab}
            tabPosition="bottom"
            onChange={this.TabChange}
        >
            <TabPane tab={<span>通用</span>} key="1" className={styles.expressBoxItem} >
                {expressList.map((item, index) => (
                    <i
                        key={index}
                        onClick={() => {
                            this.props.selectExpress(item.name, index, tabIndex)
                        }}
                    >
                        <span title={item.name} className={`sprite sprite-${item.className}`} />
                    </i>
                ))}
            </TabPane>
            <TabPane tab={<span>emoji</span>} key="2" className={styles.expressBoxItem}>
                {Object.keys(emoji.EMOJI_MAP).map((item, index) => (
                    <i
                        key={index}
                        dangerouslySetInnerHTML={{ __html: emoji.unifiedToHTML(item) }}
                        onClick={() => {
                            this.props.selectExpress(item, index, tabIndex)
                        }}
                    />
                ))}
            </TabPane>

        </Tabs>
    )
    openPopover = () => {
        if (!isFinite(this.props.disabled)) {
            this.setState({ visiblePopover: true, tabIndex: "1" })
        } else {
            this.setState({ visiblePopover: !this.props.disabled })
        }
    }
    render () {
        const { tabIndex } = this.state
        const { iscontent } = this.props
        const overlayStyle = { background: this.props.background || "whitesmoke" }
        // iscontent 是否只显示内容
        return (
            <div>
                {iscontent
                    ? this.content(tabIndex)
                    : <Popover
                        placement={this.props.placement}
                        visible={this.state.visiblePopover}
                        overlayClassName={styles.popover}
                        content={this.content(tabIndex)}
                        overlayStyle={overlayStyle}
                        id="expressNew"
                        onClick={this.openPopover}
                        arrowPointAtCenter={true}
                        autoAdjustOverflow={true}
                    >
                        <b title={this.props.title} className={styles.emojiIcon}>
                            <Icon type="smile-o" />
                        </b>
                    </Popover>}
            </div>
        )
    }
}
export default Express

