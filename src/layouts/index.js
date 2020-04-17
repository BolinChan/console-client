import React from "react"
import styles from "./index.css"
import withRouter from "umi/withRouter"
import { LocaleProvider } from "antd"
import zh_CN from "antd/lib/locale-provider/zh_CN"
import "moment/locale/zh-cn"
import { Component } from "react"
import { Helmet } from "react-helmet"

class Layout extends Component {
    state = { isJiafen: false }
    componentDidMount () {
        let ex = this.getExplore()
        if (ex !== "Chrome") {
            alert("如不兼容，请切换极速模式或Chrome浏览器打开")
        }
        const url = window.location.href
        if (url.indexOf("jiafen.scrm.la") !== -1) {
            this.setState({ isJiafen: true })
        }
    }
    getExplore = () => {
        let userAgent = navigator.userAgent
        if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
            return "Opera"
        } else if (userAgent.indexOf("MicroMessenger") > -1) {
            return "WeChat"
        } else if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1) {
            return "IE"
        } else if (userAgent.indexOf("Edge") > -1) {
            return "Edge"
        } else if (userAgent.indexOf("Firefox") > -1) {
            return "Firefox"
        } else if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1) {
            return "Safari"
        } else if (userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1) {
            return "Chrome"
        } else if (!!window.ActiveXObject || "ActiveXObject" in window) {
            return "IE>=11"
        } else {
            return "Unkonwn"
        }
    }
    render () {
        return (
            <span>
                <Helmet>
                    <title>{this.state.isJiafen ? "加分" : "有客来"}</title>
                    <meta name="renderer" content="webkit" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                </Helmet>
                <LocaleProvider locale={zh_CN}>
                    <div className={styles.container}>{this.props.children}</div>
                </LocaleProvider>
            </span>
        )
    }
}
export default withRouter(Layout)
