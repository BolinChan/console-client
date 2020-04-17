import { imgAuto } from "../../../utils/helper"
import { Component } from "react"
import { Upload, Icon, message, Modal } from "antd"
import axios from "axios"
import Ellipsis from "ant-design-pro/lib/Ellipsis"
const uploadParam = {
    accept: "image/*",
    action: "//wechat.yunbeisoft.com/index_test.php/home/fileupload/upload_msg",
    data: { type: "image" },
    showUploadList: false,
}
class SendImg extends Component {
    state = {
        file: "",
        src: "",
        visible: false,
        boxW: "",
        boxH: "",
        setMax: "",
        key: "",
    }
    UNSAFE_componentWillReceiveProps (nextProps) {
        const { blob, clear } = nextProps
        if (blob) {
            this.beforeUpload(blob)
            clear()
        }
    }
    // 上传前处理
    beforeUpload = (file) =>
        new Promise((reject) => {
            if (typeof file === "string") {
                this.checkImg(file)
            } else {
                const isJPG = !!(file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg" || file.type === "image/gif")
                if (!isJPG) {
                    message.error("请选择图片文件")
                    return false
                }
                if (file.size > 10 * 1048576) {
                    message.error("选择图片过大")
                    return false
                }
                let reader = new FileReader()
                reader.readAsDataURL(file)
                reader.onloadend = (e) => {
                    if (e.target.result === null) {
                        message.error("加载失败！")
                        return false
                    } else {
                        this.setState({ file })
                        this.checkImg(e.target.result)
                    }
                }
            }
            return false
        })
    // 图片预览
    checkImg = (src) => {
        let imgObj = new Image()
        imgObj.src = src
        imgObj.onload = () => {
            let [boxW, boxH, setMax] = [0, 0, ""]
            const [maxWidth, maxHeight, minWidth, minHeight, width, height] = [540, 540, 270, 270, imgObj.width, imgObj.height]
            let check = imgAuto({ boxW, boxH, setMax, maxWidth, maxHeight, minWidth, minHeight, width, height })
            this.setState({ src, visible: true, boxW: check.boxW, boxH: check.boxH, setMax: check.setMax })
        }
    }
    // 自定义上传
    customRequest = ({ action, data, file, filename, onSuccess }) => {
        const formData = new FormData()
        if (data) {
            Object.keys(data).map((key) => {
                formData.append(key, data[key])
            })
        }
        formData.append(filename, file)
        axios.post(action, formData).then(({ data: response }) => {
            onSuccess(response)
        })
    }
    // 上传回调
    onSuccess = (ret) => {
        if (ret.error) {
            return message.error(ret.msg)
        }
        // const { key } = this.state
        const { chat, send, auth } = this.props
        const url = ret.data[0].url
        const msg = { type: 2, url, tag: chat.wxid, device_wxid: chat.kefu_wxid, userid: chat.userid, auth: auth.accountnum }
        send(msg)
    }
    handleOk = () => {
        const { file, src } = this.state
        const { action, data } = uploadParam
        const { chat, auth, send, blobText, sendTextMsg } = this.props
        this.setState({ file: "", src: "", visible: false, boxW: "", boxH: "", setMax: "" })
        const msg = {
            type: 2,
            url: src,
            tag: chat.wxid,
            device_wxid: chat.kefu_wxid,
            userid: chat.userid,
            auth: auth.accountnum,
        }
        // dispatch({ type: "chat/addMsg", payload: msg })
        if (file) {
            this.customRequest({ action, data, file, filename: "file", onSuccess: this.onSuccess })
        } else {
            send(msg)
            blobText && sendTextMsg && sendTextMsg(null, blobText)
        }
    }
    handleCancel = () => {
        this.setState({ file: "", src: "", visible: false, boxW: "", boxH: "", setMax: "", key: "" })
    }
    render () {
        const { src, visible, boxW, boxH, setMax } = this.state
        const set = setMax === "width" ? "100% auto" : "auto 100%"
        const divStyle = {
            style: {
                width: boxW,
                height: boxH,
                backgroundImage: `url(${src})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center center",
                backgroundSize: set,
            },
        }
        const modalParam = {
            destroyOnClose: true,
            okText: "发送",
            bodyStyle: { padding: "15px", height: `${boxH + 30}px` },
            wrapClassName: "modalBox",
            width: `${boxW + 30}px`,
            centered: true,
            closable: false,
        }
        return (
            <span>
                <Upload beforeUpload={this.beforeUpload} customRequest={this.customRequest} {...uploadParam}>
                    <Icon type="picture" title="发送图片" />
                </Upload>
                <Modal
                    {...modalParam}
                    visible={visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <div {...divStyle} />

                    {this.props.blobText &&
                        <div style={{ margin: 8, position: "relative", top: 22 }}>
                            <Ellipsis tooltip length={40} fullWidthRecognition>{this.props.blobText + this.props.blobText + this.props.blobText}</Ellipsis>
                        </div>}

                </Modal>
            </span>
        )
    }
}
export default SendImg
