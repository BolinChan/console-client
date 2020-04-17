import "ant-design-pro/dist/ant-design-pro.css"
import { connect } from "dva"
import { Component } from "react"
import styles from "./index.css"
import { Spin } from "antd"
class Page extends Component {
    componentDidMount () {
        this.updateRoute()
    }
    componentDidUpdate () {
        this.updateRoute()
    }
    updateRoute = () => {
        const { isLog, history } = this.props
        if (isLog === "0") {
            history.push("/login")
        }
        if (isLog === "1") {
            history.push("/web")
        }
    }
    render () {
        return (
            <span id="page">
                <div className={styles.loadingBox}>
                    <Spin tip="Loading..." delay={600} />
                </div>
            </span>
        )
    }
}
function mapStateToProps (state) {
    const { isLog } = state.chat
    return { isLog }
}
export default connect(mapStateToProps)(Page)
