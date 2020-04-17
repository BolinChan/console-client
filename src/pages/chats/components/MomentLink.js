import { Ellipsis } from "ant-design-pro"
import { Avatar } from "antd"
import styles from "./MomentLink.css"
const MomentLink = ({ ThumbImg, Description, Url }) => (
    <div className={styles.link} onClick={() => Url && window.open(Url)}>
        <div className={styles.linkBg}>
            <img src={ThumbImg} alt="bg" />
        </div>
        <div className={styles.wrap} />
        <Avatar
            size="large"
            icon="disconnect"
            shape="square"
            style={{ marginRight: 8, backgroundColor: "#c6c5c5", borderRadius: 2 }}
            src={ThumbImg}
        />
        <div className={styles.linkDescription}>
            <Ellipsis lines={2}>{Description}</Ellipsis>
        </div>
    </div>
)
export default MomentLink
