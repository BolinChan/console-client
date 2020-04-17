import { Component } from "react"
import { connect } from "dva"
import { Upload, Icon, Modal, message, Button, Spin } from "antd"
import styles from "./UploadImg.css"
import axios from "axios"
import { isArray } from "util"

/*
uploadMaxNum：数字, 不传为单图上传，默认数为1，传为多图上传且最大数是该值
isPic：boolean, 是否限制上传图片, 默认限制
limitSize：boolean, 是否限制图片, 默认限制
fileSize: 数字, 限制图片大小, 默认是2M
divWidth:数字,div的宽度,默认100%
defaultImgUrl: 字符串数组["http1","http2"], 图片url, 是否展示默认图, 默认不展示
value === null ，清空数据
*/
const randomFun = () => {
    const str = "qwertyuiopasdfghjklzxcvbnm0123456789QWERTYUIOPASDFGHJKLZXCVBNM"
    const len = str.length
    let _d = new Date()
    let strMath = ""
    for (let i = 0; i < 4; i++) {
        let math = Math.floor(Math.random() * len - 1)
        if (math < 0) {
            math = 0
        }
        strMath += str.substr(math, 1)
    }
    let dataMath = _d.getTime() + strMath
    return dataMath
}
let uploadProps = {
    name: "file",
    action: "//wechat.yunbeisoft.com/index_test.php/home/fileupload/upload",
    data: { type: "image", key: `adminupload/${randomFun()}` },
    listType: "picture-card",
}


class UploadImg extends Component {
    constructor (props) {
        super(props)
        this.state = {
            imgList: [],
            previewVisible: false,
            previewImage: "",
            maxNum: 1, // 默认1张
            multiple: false, // 默认单图上传
            onlyPic: true,
            ltSize: true,
            defaultSize: 2,
            divWidth: "100%",
            oid: "-1",
            loading: false,
        }
    }
    componentDidUpdate () {
        const { selectList, uploadMaxNum, onChange, value } = this.props
        if (value === null && this.state.imgList.length > 0) { // 清空图片
            this.setState({ imgList: [] })
            onChange && onChange([])
        }
        if (selectList && selectList.media.length > 0) {
            if (this.state.oid !== selectList.id && selectList.type !== "10") {
                let defaultImgUrl = selectList.media
                defaultImgUrl = defaultImgUrl.filter((item) => item)
                this.defaultFun(uploadMaxNum, defaultImgUrl)
                this.setState({ oid: selectList.id })
            }
        }
        if (value && value.length > 0 && this.state.imgList.length === 0) {
            this.defaultFun(uploadMaxNum, value)
        }
    }
    componentDidMount () {
        const { uploadMaxNum, defaultImgUrl, value } = this.props
        this.defaultFun(uploadMaxNum, defaultImgUrl || value)
    }
    defaultFun = (uploadMaxNum, defaultImgUrl) => {
        let { imgList } = this.state
        if (this.props.handlePreview) {
            this.handleSize(defaultImgUrl[0])
        }
        // 传了最大数就开启支持多图
        if (uploadMaxNum && uploadMaxNum >= 1) {
            this.setState({
                multiple: true,
                maxNum: uploadMaxNum,
            })
        }
        if (defaultImgUrl && isArray(defaultImgUrl) && defaultImgUrl.length > 0) {
            let arr = []
            defaultImgUrl.forEach((url, key) => {
                arr.push({
                    uid: key,
                    status: "done",
                    url,
                })
            })
            imgList = arr
        } else {
            imgList = []
        }
        this.triggerChange(imgList)
        this.setState({ imgList })
    }
    // 预览图片
    handlePreview = (file) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        })
    }
    // 上传前处理
    handleBeforeUpload = (file) =>
        new Promise((reject) => {
            this.setState({loading: true})
            // 限制只上传图片, 大小
            const isJPG = file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/gif" || file.type === "image/bmp" || file.type === "image/jpg"
            if (!isJPG) {
                message.error("请选择图片文件!")
                this.setState({loading: false})
                return
            }
            let reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend = (e) => {
                if (e.target.result === null) {
                    message.error("加载失败！")
                    this.setState({loading: false})
                    return false
                } if (isJPG && e.target.result !== null) {
                    const { action, data } = uploadProps
                    let thumbUrl = e.target.result
                    this.handleSize(thumbUrl)

                    this.customRequest({ action, data, file, filename: "file", thumbUrl })
                }
            }
            return false
        })
    // 自定义上传
    customRequest = ({ action, data, file, filename, thumbUrl }) => {

        const formData = new FormData()
        let token = window.sessionStorage.getItem("token")
        formData.append("token", token)
        if (data) {
            Object.keys(data).map((key) => {
                formData.append(key, data[key])
            })
        }
        formData.append(filename, file)
        const { imgList } = this.state
        const { uploadMaxNum } = this.props
        const uid = randomFun()
        if (uploadMaxNum && this.state.imgList.length < uploadMaxNum) {
            imgList.push({ thumbUrl, uid, status: "loading" })
            this.setState({ imgList })
        }

        axios.post(action, formData).then(({ data: response }) => {
            this.onSuccess(response, file, uid)
        })
    }
    // 上传回调
    onSuccess = (ret, file, uid) => {

        let { imgList } = this.state
        if (ret.error) {
            let index = imgList.findIndex((item) => item.uid === uid)
            index !== -1 && (imgList[index].status = "error")
            this.setState({ imgList })
            return message.error(ret.msg)
        }
        const url = ret.data[0].url
        let index = imgList.findIndex((item) => item.uid === uid)
        index !== -1 && (imgList[index] = { uid, url, status: "done" })
        // index !== -1 && message.success("上传成功")
        this.triggerChange(imgList)
        this.setState({ imgList, loading: false })
    }
    handleSize = (url) => {
        const { handlePreview } = this.props
        let ImgObj = new Image() // 判断图片是否存在
        ImgObj.src = url
        let height = 0
        let width = 0
        ImgObj.onload = () => {
            // 设置图片适应
            height = Math.floor(ImgObj.height * 0.6)
            width = Math.floor(ImgObj.width * 0.6)
            handlePreview && handlePreview({ width, height }, url)
        }
    }
    triggerChange = (imgs) => {
        const onChange = this.props.onChange
        if (onChange) {
            imgs = imgs.map((item) => item.url)
            onChange(imgs)
        }
    }
    // 删除图片
    onRemove = (file) => {
        let { imgList } = this.state
        imgList = imgList.filter((item) => item.uid !== file.uid)
        this.setState({ imgList })
        this.triggerChange(imgList)
    }

    // 模态框取消
    handleCancel = () => this.setState({ previewVisible: false })
    render () {
        const { imgList, previewVisible, previewImage, maxNum, loading } = this.state
        uploadProps = {
            ...uploadProps,
            multiple: true,
            fileList: imgList,
            onPreview: this.handlePreview,
            beforeUpload: this.handleBeforeUpload,
            onRemove: this.onRemove,
        }
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div>可拖拽上传</div>
            </div>
        )
        const uploadButton2 = (
            <Button>
            </Button>
        )
        return (
            <div id="imgBox" className={styles.uplodBox} onChange={this.props.uploadNum && this.props.uploadNum()}>
                <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} />} spinning={loading} >
                    <div
                        className={styles.uplodDiv}
                        title="可拖拽上传">
                        <Upload {...uploadProps}>{!this.props.isVisibal && imgList.length >= maxNum ? null : uploadButton}</Upload>
                        <Upload {...uploadProps} listType="text">
                            {imgList.length >= maxNum ? null : uploadButton2}
                        </Upload>
                    </div>
                </Spin>
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel} className={styles.previewBox}>
                    <img alt="example" style={{ width: "100%" }} src={previewImage} destroyOnClose={true} />
                </Modal>
            </div>
        )
    }
}


export default connect()(UploadImg)
