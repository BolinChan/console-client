import { Modal, Input } from "antd"
import Express from "../../chats/components/Express"
import styles from "./momentModal.css"
const { TextArea } = Input
const imgStyle = { padding: "0" }
const videoStyle = { padding: "0", width: "600px", height: "600px", margin: "0" }
const momentModal = ({ videoHideo, videoShow, VideoUrl, selImg, imgVisible, preView, commentVisible, onCancel, submitComment, commentValue, changeComment, addExpress }) => (
    <div>
        <Modal
            visible={commentVisible}
            onCancel={onCancel}
            closable={false}
            destroyOnClose={true}
            onOk={submitComment}
        >
            <div className={styles.toolBar}>
                <Express addMsg={addExpress} />
            </div>
            <TextArea
                ref={(input) => (this.input = input && input.focus())}
                id="commentEditer"
                value={commentValue}
                onChange={changeComment}
            />
        </Modal>

        <Modal
            bodyStyle={imgStyle}
            visible={imgVisible}
            onCancel={() => preView("")}
            closable={false}
            destroyOnClose={true}
            footer={null}
        >
            <img alt="图片" src={selImg} style={{ width: "100%" }}></img>
        </Modal>
        <Modal
            width="600px"
            height="600px"
            bodyStyle={videoStyle}
            visible={videoShow}
            onCancel={() => videoHideo()}
            closable={false}
            destroyOnClose={true}
            footer={null}
        >
            <video controls src={VideoUrl} style={{width: "100%", height: "100%"}}/>
        </Modal>
    </div>
)
export default momentModal
