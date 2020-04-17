import styles from "./Editor.css"
import classNames from "classnames"
import { Ellipsis } from "ant-design-pro"
const EditorTip = ({ ksyLst, selKsy, selIndex }) => (
    <div className={styles.boxKsy}>
        <div style={{ position: "relative" }}>

            <div className={styles.boxKsyul}>
                {ksyLst && ksyLst.map((item, index) => (
                    <Ellipsis
                        style={{ cursor: "pointer" }}
                        lines={1}
                        tooltip
                        className={classNames([[styles.boxKsyulItem], { [styles.selKsyItem]: index === selIndex }])}
                        key={index}
                        onClick={selKsy.bind(this, item)}
                    >
                        {item}
                    </Ellipsis>
                ))}
            </div>
            <i></i>
        </div>
    </div>
)
export default EditorTip
