import { Icon, Popover } from "antd"
import styles from "./SendBox.css"
import { Component } from "react"

const overlayStyle = { background: "whitesmoke" }

// 快捷回复气泡
class QuickReply extends Component {
    state = {
        // quickReply: ["今天天气真好！", "来啊！来互相伤害啊！", "666", "你站着别动，我去给你买个橘子", "你过来，我保证不打死你", "给我个面子，听我的"],
        quickReply: this.props.hsWord,
        visiblePopover: false,
    }
    componentDidMount () {
        document.body.addEventListener("click", this.Listener)
    }
    componentWillUnmount () {
        document.body.removeEventListener("click", this.Listener)
    }
    Listener = () => {
        this.setState({ visiblePopover: false })
    }
    handleSendMsg (index) {
        // 发送快捷回复给父组件
        // 用非箭头函数写法获得下标
        let say = this.state.quickReply[index]
        this.props.handleSendQuickReply(say)
    }
    content = () => (
        <div className={styles.expressStyle}>
            {this.state.quickReply.map((item, index) => (
                <div
                    title={item}
                    className={styles.quickReply}
                    onClick={() => {
                        this.handleSendMsg(index)
                    }}
                    key={index}
                >
                    {item}
                </div>
            ))}
        </div>
    )
    openPopover = () => {
        this.setState({ visiblePopover: true })
    }
    render () {
        const { title } = this.props
        return (
            <span className={styles.select_image} title={title}>
                <Popover placement="topLeft" visible={this.state.visiblePopover} content={this.content()} overlayStyle={overlayStyle}>
                    <b>
                        <Icon type="message" onClick={this.openPopover} />
                    </b>
                </Popover>
            </span>
        )
    }
}

export default QuickReply
