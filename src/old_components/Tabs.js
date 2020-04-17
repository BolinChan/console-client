import { connect } from "dva"
import styles from "./Tabs.css"
import { Radio } from "antd"
const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const Tabs = ({ sidebarActive, dispatch }) => {
    const changeActive = (e) => {
        dispatch({
            type: "chat/upActive",
            payload: { sidebarActive: e.target.value },
        })
    }
    return (
        <div className={styles.btns}>
            <RadioGroup value={sidebarActive} buttonStyle="solid" onChange={changeActive}>
                <RadioButton value="chats">最近联系</RadioButton>
                <RadioButton value="contacts">分组</RadioButton>
                <RadioButton value="tags">标签</RadioButton>
            </RadioGroup>
        </div>
    )
}
function mapStateToProps (state) {
    const { sidebarActive } = state.chat
    return { sidebarActive }
}
export default connect(mapStateToProps)(Tabs)
