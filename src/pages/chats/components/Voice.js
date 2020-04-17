import { Component } from "react"
import { connect } from "dva"
import { makeKey } from "../../../utils/helper"
import { Icon, Modal, Button, message } from "antd"
import AudioAnalyser from "react-audio-analyser"
import styles from "./Voice.css"
import axios from "axios"
import request from "../../../utils/request"
class Voice extends Component {
    state = {
        status: "inactive",
        visible: false,
        loading: false,
        audioSrc: null,
    }

    controlAudio = async (status) => {
        await this.setState({ status })
    }

    show = async () => {
        await this.setState({ visible: true, audioSrc: null })
        this.controlAudio("recording")
    }

    hidden = async () => {
        await this.setState({
            status: "inactive",
            visible: false,
            audioSrc: null,
        })
    }

    send = async () => {
        let { audioSrc, audiodata } = this.state
        if (audioSrc) {
            const token = window.sessionStorage.getItem("token") || ""
            this.setState({ loading: true })
            let formData = new FormData()
            formData.append("token", token)
            formData.append("file", audiodata)
            formData.append("type", "audio")
            const { data } = await axios.post(
                "//wechat.yunbeisoft.com/index_test.php/home/fileupload/upload_mp3",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            )
            if (data.error) {
                this.setState({ loading: false })
                return message.error(data.msg)
            }

            let res = await request({
                url: "//wechat.yunbeisoft.com/mp3_to_amr/mp3amr.php",
                data: JSON.stringify({ url: data.data[0].url, token }),
            })
            res = res.data
            if (res.error) {
                this.setState({ loading: false })
                return message.error(res.msg)
            }
            await this.setState({
                loading: false,
                visible: false,
                audioSrc: null,
                status: "inactive",
            })
            const contents = res.data + `?duration=${res.seconds}`
            this.sendDo(contents, data.data[0].url, 3, res.seconds)
        } else {
            return message.error("获取语音失败，请重试")
        }
    }

    sendDo = (contents, url, msgtype, seconds) => {
        const { chats, dispatch, chatsActive } = this.props
        const key = makeKey()
        const chat = chats.find((item) => item.userid === chatsActive)
        const msg = {
            key,
            message_id: key,
            type: msgtype,
            url,
            tag: chat.wxid,
            device_wxid: chat.kefu_wxid,
            userid: chat.userid,
            contents,
            seconds,
        }
        dispatch({ type: "chat/addMsg", payload: msg })
        dispatch({ type: "chat/sendMessage", payload: msg })
    }

    render () {
        const { status, audioSrc, visible, loading } = this.state
        const audioProps = {
            audioType: "audio/mp3",
            status,
            audioSrc,
            stopCallback: (e) => {
                this.setState({
                    audiodata: e,
                    audioSrc: window.URL.createObjectURL(e),
                })
            },
        }
        return (
            <div title="录音">
                <Icon
                    type="audio"
                    onClick={() => this.show()}
                    className={styles.play}
                />
                <Modal
                    title="语音"
                    visible={visible}
                    onCancel={this.hidden}
                    width={550}
                    destroyOnClose
                    footer={[
                        <Button key="back" onClick={this.hidden}>取消</Button>,
                        <Button
                            key="submit"
                            type="primary"
                            loading={loading}
                            onClick={this.send}
                        >
                            发送
                        </Button>,
                    ]}
                >
                    <AudioAnalyser {...audioProps}>
                        <div className={styles.main}>
                            {status !== "recording" ? "已停止" : "录音中"}
                            <Button
                                type="primary"
                                onClick={() => this.controlAudio(status !== "recording"
                                    ? "recording"
                                    : "inactive")
                                }
                                style={{ marginLeft: 16 }}
                            >
                                {status !== "recording"
                                    ? "开始" : "结束"
                                }
                            </Button>
                        </div>
                    </AudioAnalyser>
                </Modal>
            </div>
        )
    }
}

function mapStateToProps (state) {
    const { extendField, chatsActive, chats } = state.chat
    return { extendField, chatsActive, chats }
}

export default connect(mapStateToProps)(Voice)
