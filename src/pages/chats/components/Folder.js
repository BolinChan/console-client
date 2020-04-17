import { connect } from "dva"
import { imgAuto } from "../../../utils/helper"
import { Component } from "react"
import { Icon, Popover, Tabs, Button, Input, Popconfirm, Upload, message, Breadcrumb, Tooltip, Modal, Spin } from "antd"
import { Ellipsis } from "ant-design-pro"
import styles from "./Folder.css"
const TabPane = Tabs.TabPane
const defaultFolder = [
    { id: "1", name: "图片", fid: "", type: "dir" },
    { id: "2", name: "文件", fid: "", type: "dir" },
    { id: "3", name: "我的存储", fid: "", type: "dir" },
]
const uploadParam = {
    action: "//wechat.yunbeisoft.com/index_test.php/home/fileupload/upload_msg",
    showUploadList: false,
}
class Folder extends Component {
    state = {
        loading: false,
        tabsActive: "1",
        checkDir: "1",
        folderLevel: [],
        visible: false,
        popVisible: false,
        accept: "image/*",
        uploadType: { type: "image" },
    }
    handleVisibleChange = (e) => {
        const { dispatch } = this.props
        if (e) {
            dispatch({ type: "chat/fetchFolder", payload: { fid: "1" } })
        }
        this.setState({ folderLevel: [], tabsActive: "1", checkDir: "1", popVisible: e, accept: "image/*", uploadType: { type: "image" } })
    }
    tabsChange = (tabsActive) => {
        let [accept, uploadType] = ["", ""]
        const { dispatch } = this.props
        const { checkDir } = this.state
        dispatch({ type: "chat/changeFolder", payload: { type: "delOpenType" } })

        if (tabsActive !== checkDir) {
            dispatch({ type: "chat/fetchFolder", payload: { fid: tabsActive } })
        }
        switch (tabsActive) {
            case "1":
                accept = "image/*"
                uploadType = { type: "image" }
                break
            default:
                accept = ""
                uploadType = { type: "file" }
                break
        }
        this.setState({ accept, uploadType, tabsActive, checkDir: tabsActive, folderLevel: [] })
    }
    handleInputChange = (e) => {
        this.setState({ inputValue: e.target.value })
    }
    // 系列操作
    doFile = async (item, type) => {
        let time
        const { dispatch } = this.props
        const { checkDir, inputValue } = this.state
        switch (type) {
            case "add":// 增加文件夹输入
                time = new Date().toDateString()
                dispatch({ type: "chat/addFolder", payload: { type: "dir", fid: checkDir, name: "", onType: "add", id: time } })
                break
            case "addDir":// 文件增加
                await dispatch({ type: "chat/changeFolder", payload: { type: "delOpenType" } })
                if (inputValue) {
                    dispatch({ type: "chat/addFile", payload: { name: inputValue, fid: checkDir, type: "dir" } })
                    this.setState({ inputValue: "" })
                }
                break
            case "del":// 删除
                dispatch({ type: "chat/deleteFile", payload: { id: item } })
                break
            case "editorname":// 编辑更改名字
                if (inputValue) {
                    dispatch({ type: "chat/updateFileName", payload: { id: item.id, name: inputValue } })
                }
                dispatch({ type: "chat/editorFolder", payload: { id: item.id, onType: "" } })
                this.setState({ inputValue: "" })
                break

            default:
                dispatch({ type: "chat/editorFolder", payload: { id: item.id, onType: "editor" } })
                break
        }

    }
    // 上传
    upload = (info) => {
        const { checkDir, tabsActive } = this.state
        const { dispatch } = this.props
        this.setState({ loading: true })
        if (info.file.status === "done") {
            this.setState({ loading: false })
            if (info.file.size > 20971520) {
                return message.error("不能超过20M")
            }
            if (tabsActive === "2") {
                if (info.file.type && info.file.type.includes("image")) {
                    return message.error("请上传文件")
                }
            }
            if (!info.file.response.error) {
                let url = info.file.response.data[0].url
                let name = info.file.name
                let filetype = info.file.type.includes("image") ? "img" : "file"
                dispatch({ type: "chat/addFile", payload: { name, url, fid: checkDir, type: filetype } })
            } else {
                return message.error(info.file.response.msg)
            }
        }
        if (info.file.status === "error") {
            this.setState({ loading: false })
            message.error(`${info.file.name} 上传失败.`)
        }
    }
    // 进入下级
    fileIn = (item) => {
        const { folderLevel } = this.state
        if (item.type === "dir") {
            folderLevel.push(item)
            this.props.dispatch({ type: "chat/fetchFolder", payload: { fid: item.id } })
            this.setState({ folderLevel, checkDir: item.id })
        }
    }
    // 返回上级
    backOn = (item) => {
        let { folderLevel, checkDir } = this.state
        if (folderLevel.length) {
            folderLevel.splice(folderLevel.length - 1, 1)
            checkDir = folderLevel.length <= 0 ? item.id : folderLevel[folderLevel.length - 1].id
            this.props.dispatch({ type: "chat/fetchFolder", payload: { fid: checkDir } })
            this.setState({ folderLevel, checkDir })
        }
    }
    // 图片预览
    checkImg = (src) => {
        let imgObj = new Image()
        imgObj.src = src
        imgObj.onload = () => {
            let [boxW, boxH, setMax] = [0, 0, ""]
            const [maxWidth, maxHeight, minWidth, minHeight, width, height] = [540, 540, 270, 270, imgObj.width, imgObj.height]
            let check = imgAuto({ boxW, boxH, setMax, maxWidth, maxHeight, minWidth, minHeight, width, height })
            this.setState({ src, visible: true, popVisible: false, boxW: check.boxW, boxH: check.boxH, setMax: check.setMax })
        }
    }
    handleCancel = () => {
        this.setState({ visible: false, popVisible: true })
    }
    // 发送
    handleOk = () => {
        const { src } = this.state
        this.send(src, "", 2)
        this.setState({ src: "", popVisible: true, visible: false, boxW: "", boxH: "", setMax: "", key: "" })
    }
    sendFile = (item) => {
        let msgtype = 8
        if (item.type === "img") {
            msgtype = 2
        }
        if (item.url.includes("mp4")) {
            msgtype = 4
        }
        this.send(item.url, item.name, msgtype)
    }
    send = (url, name, msgtype) => {
        const { chats, dispatch, chatsActive, auth } = this.props
        const chat = chats.find((item) => item.userid === chatsActive)
        const msg = {
            type: msgtype,
            url,
            tag: chat.wxid,
            device_wxid: chat.kefu_wxid,
            userid: chat.userid,
            contents: name,
            auth: auth.accountnum,
        }
        dispatch({ type: "chat/sendMessage", payload: msg })
    }
    render () {
        const { tabsActive, checkDir, folderLevel, visible, boxW, boxH, src, setMax, popVisible, accept, uploadType, loading } = this.state
        const set = setMax === "width" ? "100% auto" : "auto 100%"
        const { folder } = this.props
        const inputStyle = {
            type: "text",
            size: "small",
            style: { width: 80, marginTop: 10 },
        }
        let folders = []
        if (folder.length > 0) {
            folders = folder.filter((item) => item.fid === checkDir)
        }
        const modalParam = {
            destroyOnClose: true,
            okText: "发送",
            // title: "确认发送图片",
            bodyStyle: { padding: "15px", height: `${boxH + 30}px` },
            wrapClassName: "modalBox",
            width: `${boxW + 30}px`,
            centered: true,
            closable: false,
        }
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
        return (
            <Popover
                visible={popVisible}
                onVisibleChange={this.handleVisibleChange}
                id="folder"
                trigger="click"
                content={
                    <div className={styles.container}>
                        <Tabs
                            activeKey={tabsActive}
                            onChange={this.tabsChange}
                            tabBarExtraContent={
                                <Button type="primary" size="small" style={{ marginRight: 16 }} onClick={() => this.doFile("", "add")}>新建文件夹</Button>
                            }
                        >
                            {defaultFolder.map((item) =>
                                <TabPane tab={item.name} key={item.id}>
                                    <div className={styles.box}>
                                        {folderLevel.length > 0 &&
                                            <div className={styles.folderNaviga}>
                                                <Breadcrumb separator=">" >
                                                    <Breadcrumb.Item >{item.name}</Breadcrumb.Item>
                                                    {folderLevel.map((level) => (
                                                        <Breadcrumb.Item key={level.id}>{level.name}</Breadcrumb.Item>
                                                    ))}
                                                </Breadcrumb>
                                                <span className={styles.folderNavigabtn} onClick={() => this.backOn(item)}>返回上级</span>
                                            </div>}

                                        {folders.length > 0 && folders.map((file, index) =>
                                            <div key={file.id} className={styles.item} >
                                                <Tooltip placement="bottom" title={
                                                    <div style={{ fontSize: 22 }}>
                                                        <Icon type="edit" onClick={() => this.doFile(file, "editor")} style={{ cursor: "pointer", marginRight: 10 }} />
                                                        <Popconfirm title="确认删除吗？" onConfirm={() => this.doFile(file.id, "del")}>
                                                            <Icon type="delete" style={{ cursor: "pointer" }} />
                                                        </Popconfirm>
                                                    </div>
                                                }>

                                                    <div className={styles.preview}>
                                                        {file.type === "img" && <img src={file.url} alt="img" onClick={() => this.checkImg(file.url)} />}
                                                        {file.type === "file" && <Popconfirm title="确认发送吗？" onConfirm={() => this.sendFile(file)}>
                                                            {file.typelevel === "doc" ? <Icon type="file-word" className={styles.icon} /> : ""}
                                                            {file.typelevel === "ppt" ? <Icon type="file-ppt" className={styles.icon} /> : ""}
                                                            {file.typelevel === "xls" ? <Icon type="file-excel" className={styles.icon} /> : ""}
                                                            {file.typelevel === "pdf" ? <Icon type="file-pdf" className={styles.icon} /> : ""}
                                                            {file.typelevel === "mp4" ? <Icon type="video-camera" className={styles.icon} /> : ""}
                                                            {!file.typelevel && <Icon type="file" className={styles.icon} />}
                                                        </Popconfirm>}
                                                        {file.type === "dir" && < Icon type="folder" className={styles.icon} onClick={() => this.fileIn(file)} />}
                                                    </div>
                                                </Tooltip>
                                                {!file.onType &&
                                                    <Ellipsis
                                                        style={{ cursor: "pointer", textAlign: "center" }}
                                                        lines={2}
                                                        tooltip
                                                    >
                                                        {file.name}
                                                    </Ellipsis>
                                                }
                                                {file.onType === "add" &&
                                                    <Input
                                                        autoFocus={true}
                                                        onPressEnter={() => this.doFile("", "addDir")} {...inputStyle} onChange={this.handleInputChange}
                                                        onBlur={() => this.doFile("", "addDir")}
                                                    />
                                                }
                                                {file.onType === "editor" &&
                                                    <Input
                                                        autoFocus={true}
                                                        onPressEnter={() => this.doFile(file, "editorname")} {...inputStyle}
                                                        onChange={this.handleInputChange}
                                                        onBlur={() => this.doFile(file, "editorname")}
                                                    />
                                                }
                                            </div>
                                        )}

                                        <div className={styles.item}>
                                            <div className={styles.preview}>
                                                <Spin spinning={loading}>
                                                    <Upload onChange={this.upload} {...uploadParam} multiple accept={accept} data={uploadType}>
                                                        <Icon type="plus" className={styles.icon} />
                                                    </Upload>
                                                </Spin>
                                            </div>
                                        </div>
                                    </div>
                                </TabPane>
                            )}
                        </Tabs>
                        <Modal
                            {...modalParam}
                            visible={visible}
                            onOk={this.handleOk}
                            onCancel={this.handleCancel}
                        >
                            <div {...divStyle} />
                        </Modal>
                    </ div>
                }
                arrowPointAtCenter={true}
            >
                <Icon type="folder" title="我的存储" />
            </Popover>
        )
    }
}
function mapStateToProps (state) {
    const { folder, chats, chatsActive, auth } = state.chat
    return { folder, chats, chatsActive, auth }
}
export default connect(mapStateToProps)(Folder)
