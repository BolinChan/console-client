import { Component } from "react"
import { Icon, Popover } from "antd"
import styles from "./Appqrcode.css"
const android = "//qn.fuwuhao.cc/2019-04-28_2019042810194036273733155cc50dbc8bbc9.png"
const ios = "//qn.fuwuhao.cc/2019-04-28_2019042810202172644882365cc50de5d944f.png"
class Appqrcode extends Component {


    render () {
        const content = (
            <div className={styles.content}>
                <div className={styles.item} style={{ marginRight: 20 }}>

                    <img src={android} alt="" />
                    <a>安卓下载</a>
                </div>
                <div className={styles.item}>

                    <img src={ios} alt="" />
                    <a>ios下载</a>
                </div>
            </div>
        )

        return (
            <Popover placement="bottom" content={content} >
                <div className={styles.popItem}>
                    <Icon type="qrcode" />
                    <span style={{ marginLeft: 8, fontSize: 12 }} >有客聊下载</span>
                </div>
            </Popover>

        )
    }
}

export default Appqrcode
