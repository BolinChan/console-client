import { Upload, Icon, message } from "antd"
import { Component } from "react"
import { connect } from "dva"
import styles from "./SendBox.css"
const iconPicture = {
    fontSize: "20px",
}
function beforeUpload (file) {
    const isJPG = file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg" || file.type === "image/gif"
    if (!isJPG) {
        message.error("请选择图片文件")
    }
    return isJPG
}
class SelectImage extends Component {
    state = {}
    render () {
        const { uptoken } = this.props
        const uploadProps = {
            name: "file",
            action: "//up-z2.qiniu.com",
            data: { token: uptoken },
            showUploadList: false,
        }
        return (
            <Upload {...uploadProps} onChange={this.props.handleChange} beforeUpload={beforeUpload}>
                <b className={styles.select_image} title="选择图片">
                    <Icon type="picture" style={iconPicture} />
                </b>
            </Upload>
        )
    }
}

function mapStateToProps (state) {
    return {
        devices: state.chat.devices,
        selectTask: state.chat.selectTask,
        uptoken: state.chat.uptoken,
    }
}

export default connect(mapStateToProps)(SelectImage)
