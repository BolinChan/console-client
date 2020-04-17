import styles from "./Content.css"
import Message from "./Message"
import Sendbox from "./SendBox"

const Content = ({ contact, menuFold, messages, active, dispatch }) => (
    <div className={styles.content}>
        <div className={styles.header}>
            <strong className={styles.nick}>{contact.remark || contact.nick || contact.realname}</strong>
            &nbsp;
            {!menuFold && `(${contact.deviceid})`}
        </div>
        <div className={styles.console}>
            {messages.map((item, index) => {
                if (`${item.deviceid}@${item.tag}` === contact.id) {
                    return (
                        <Message
                            dispatch={dispatch}
                            keyStatus={item.key}
                            mine={item.status === "0"}
                            type={item.type}
                            img={item.img}
                            url={item.url}
                            sendStatus={item.sendStatus}
                            content={item.text}
                            headimg={item.status === "0" ? "https://jutaobao.oss-cn-shenzhen.aliyuncs.com/header.png" : item.headimg || "https://jutaobao.oss-cn-shenzhen.aliyuncs.com/no-head.png"}
                            key={index}
                            wxId={item.tag}
                            deviceid={item.deviceid}
                        />
                    )
                }
            })}
        </div>
        <Sendbox dispatch={dispatch} />
    </div>
)

export default Content
