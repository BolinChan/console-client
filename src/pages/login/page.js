import "ant-design-pro/dist/ant-design-pro.css"
import { Component } from "react"
import { message } from "antd"
import LogForm from "../../components/Log"
import { connect } from "dva"
import { routerRedux } from "dva/router"

class Page extends Component {
    componentDidMount () {
        const tui = window.sessionStorage.getItem("tui")
        if (tui) {
            const tip = tui === "1" ? "您的账号已在其他地方登陆"
                : tui === "3" ? "账号密码已被修改，请重新登录" : "您的token已过期，请重新登录"
            message.warning(tip, 3, this.handleClose)
        }
    }
    componentDidUpdate () {
        const { isLog, dispatch } = this.props
        if (isLog === "1") {
            dispatch(routerRedux.push({ pathname: "/web", query: { p: "chats" } }))
        }
    }
    handleClose = () => {
        window.sessionStorage.setItem("tui", "")
    }
    render () {
        return (<LogForm />)
    }
}

function mapStateToProps (state) {
    const { isLog } = state.chat
    return { isLog }
}
export default connect(mapStateToProps)(Page)
