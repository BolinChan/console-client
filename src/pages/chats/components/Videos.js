import { connect } from "dva"
import { Component } from "react"
import { Popover, Icon, Button, Input, message } from "antd"
import request from "../../../utils/request"
const IconFont = Icon.createFromIconfontCN({
    scriptUrl: "//at.alicdn.com/t/font_862846_qr8cfeu9c1.js",
})
const { TextArea } = Input
const url = "//wechat.yunbeisoft.com/index_test.php/home/Collect/"
class Videos extends Component {
    constructor (props) {
        super(props)
        this.state = {
            visible: false,
            onEdit: false,
            defaultContext: "全网vip免费看，APP下载地址：http://t.cn/EJVmoxB",
        }
        this.initLoad()
    }

    initLoad=async () => {
        const {data: { data}} = await request({ url: `${url}get_content` })
        if (data && data.length) {
            this.setState({ id: data[0].id, defaultContext: data[0].content})
        }
    }
    handleVisibleChange = () => {
        let { visible, defaultContext} = this.state
        visible = !visible
        if (visible) {
            this.setState({ content: defaultContext})
        }
        if (!visible) {
            this.setState({ onEdit: false, content: defaultContext})
        }
        this.setState({ visible })
    }
    handledit = () => {
        this.setState({ onEdit: true }, () => this.input && this.input.focus())
    }
    over = async () => {
        // do something to edit
        const {content, id} = this.state
        const {data} = await request({
            url: `${url}add_content`,
            data: JSON.stringify({content, id}),
        })
        if (data.error) {
            return message.error(data.msg)
        }
        if (!id) {
            this.initLoad()
        }
        this.setState({ onEdit: false, defaultContext: content})
    }
    send = () => {
        // do something to send
        this.props.send(null, this.state.content)
        this.handleVisibleChange()
    }
    contextIpt = (input) => (this.input = input)
    insert=async () => {
        await this.setState({content: this.state.content + "#序列号#"})
        this.handledit()
    }
    onChange=(e) => {
        this.setState({content: e.target.value})
    }
    render () {
        const { visible, onEdit, content } = this.state
        // const { videoContext } = this.props
        // const context = videoContext || "酷贝影视VIP，精彩内容不容错过。"
        return (
            <div>
                <Popover
                    visible={visible}
                    onVisibleChange={this.handleVisibleChange}
                    arrowPointAtCenter
                    trigger="click"
                    content={
                        <div style={{ width: 250 }}>
                            <div style={{ marginBottom: 12, height: 80 }}>
                                {onEdit
                                    ? <TextArea
                                        style={{ height: 80, width: 250, resize: "none" }}
                                        ref={this.contextIpt}
                                        // defaultValue={context}
                                        onChange={this.onChange}
                                        value={content}
                                    />
                                    : content
                                }
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                {!onEdit &&
                                    <Button
                                        style={{ marginRight: 16 }}
                                        size="small"
                                        onClick={this.handledit}
                                    >
                                        编辑
                                    </Button>
                                }
                                {onEdit
                                    ? <div>
                                        <Button
                                            size="small"
                                            onClick={this.insert}
                                            style={{ marginRight: 16 }}
                                        >
                                        插入序列号
                                        </Button>
                                        <Button
                                            type="primary"
                                            size="small"
                                            onClick={this.over}
                                        >
                                        完成
                                        </Button>
                                    </div>
                                    : <Button type="primary" size="small" onClick={this.send}>发送</Button>
                                }
                            </div>
                        </div>
                    }
                >
                    <IconFont type="icon-fu" title="福利" />
                </Popover>
            </div>
        )
    }
}
function mapStateToProps (state) {
    const { videoContext } = state.chat
    return { videoContext }
}
export default connect(mapStateToProps)(Videos)
