import { Component } from "react"
import { connect } from "dva"
import styles from "./Tabs.css"
import { Radio } from "antd"
import withRouter from "umi/withRouter"
import { routerRedux } from "dva/router"
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

class Tabs extends Component {
    changeActive = (e) => {
        const { dispatch } = this.props
        const val = e.target.value
        if (val) {
            dispatch(routerRedux.push({ pathname: "/web", query: { p: val } }))
            if (val === "chats" || val === "qun") {
                dispatch({
                    type: "chat/upActive",
                    payload: { sidebarActive: val },
                })
            } else {
                dispatch({
                    type: "chat/upTab",
                    payload: { sidebarActive: val },
                })
            }
        }
    }
    render () {
        const { sidebarActive, location } = this.props
        let checked = location.query.p || sidebarActive
        return (
            <div className={styles.btns}>
                <RadioGroup
                    value={checked}
                    buttonStyle="solid"
                    onChange={this.changeActive}
                >
                    <RadioButton value="chats">聊天</RadioButton>
                    <RadioButton value="qun">群组</RadioButton>
                    <RadioButton value="contacts">分组</RadioButton>
                    <RadioButton value="tags">标签</RadioButton>
                </RadioGroup>
            </div>
        )
    }
}
function mapStateToProps (state) {
    const { sidebarActive } = state.chat
    return { sidebarActive }
}

const mapState = connect(mapStateToProps)(Tabs)
export default withRouter(mapState)
