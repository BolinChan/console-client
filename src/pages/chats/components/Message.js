import classNames from "classnames"
import styles from "./Message.css"
import { Avatar, Icon, Menu, Dropdown, Button } from "antd"
import { textParse } from "../../../utils/helper"
import { Ellipsis } from "ant-design-pro"
import AddCard from "./AddFriendCard"
import { CopyToClipboard } from "react-copy-to-clipboard"

const SubMenu = Menu.SubMenu

const vdp = "//qn.fuwuhao.cc/vdp.png"
const idp = "//qn.fuwuhao.cc/idp.png"

const mvp = require("../../../assets/mine_voice_playing.gif")
const vp = require("../../../assets/voice_playing.gif")
const mv = require("../../../assets/mine_voice.png")
const v = require("../../../assets/voice.png")
let selText = ""
const errMsg = (<div className={styles.textMsg}>消息格式解析错误，请联系客服</div>)
const Copy = () => {
    SelectText()
}
// 文本消息
const textMess = (text) => {
    text && (text = text.replace(/\n/g, "<br/>"))
    return <div className={styles.textMsg} dangerouslySetInnerHTML={{ __html: text }} onClick={Copy} />
}
const SelectText = () => {
    try {
        var selecter = window.getSelection().toString()
        if (selecter !== null && selecter.trim() !== "") {
            selText = selecter
        } else {
            selText = ""
        }
    } catch (err) {
        var st = document.selection.createRange()
        var s = st.text
        if (s !== null && s.trim() !== "") {
            selText = s
        } else {
            selText = ""
        }
    }
}
const CopyText = (text) => {
    if (!text) {
        return ""
    }
    let msg
    if (selText) {
        msg = selText
    } else {
        try {
            msg = text.replace(/<[^>]+>/g, "")
        } catch (err) {
            msg = text
        }
    }
    return msg
}
// 链接
const urlMsg = (msg) => (
    <span>
        {msg
            ? <div className={styles.textMsg} style={{ width: 320 }}>
                <div className={styles.urlHeader}>
                    <Ellipsis lines={2}>{msg.Title || msg.title}</Ellipsis>
                </div>
                <div className={styles.urlBody}>
                    <Ellipsis lines={2} style={{ fontSize: "12px" }}>{msg.Des || msg.desc}</Ellipsis>
                    <div className={styles.urlThumb}>
                        <Avatar
                            icon="user"
                            shape="square"
                            size="large"
                            src={msg.Thumb || msg.thumb || msg.img_url || idp}
                            alt="Thumb"
                        />
                    </div>
                </div>
            </div >
            : errMsg
        }
    </span>
)

// 名片
const card = (msg, status, msgSvrId, WeChatId) => (
    <span>
        {msg
            ? <div className={styles.textMsg} style={{ width: 320 }}>
                <div className={styles.cardBody}>
                    <div className={styles.cardThumb}>
                        <Avatar
                            icon="user"
                            shape="square"
                            size="large"
                            src={msg.HeadImg}
                            alt="头像"
                        />
                    </div>
                    <div className={styles.cardTitle}>
                        <div className={styles.cardNick}>
                            <Ellipsis lines={1}>{msg.Nickname}</Ellipsis>
                            {msg.Sex === "1" && <Icon type="man" style={{ color: "#096dd9", marginLeft: 5 }} />}
                            {msg.Sex === "2" && <Icon type="woman" style={{ color: "#fd7e96", marginLeft: 5 }} />}
                        </div>
                        <div className={styles.cardAddress}>
                            {msg.Province && `${msg.Province} - `}{msg.City}
                        </div>
                    </div>
                </div>
                <div className={styles.cardFooter}>
                    <div className={styles.appTag}>
                        <Icon type="user" style={{ color: "#1890ff", marginRight: 4 }} />个人名片
                    </div>
                    {status === "1" && <AddCard msgSvrId={msgSvrId} WeChatId={WeChatId} />}
                </div>
            </div>
            : errMsg
        }
    </span>
)


// 小程序
const appMsg = (msgId, msg, status, collectMini, index) => (
    <span>
        {msg
            ? <div className={styles.textMsg} style={{ width: 320 }}>
                <div className={styles.appHeader}>
                    <img
                        src={`//wechat.yunbeisoft.com/index_test.php/home/Test/get_img/?url=${encodeURIComponent(msg.Icon)}`}
                        alt="Icon"
                        onError={(e) => e.target.src = idp}
                    />
                    {msg.Source}
                </div>
                <div className={styles.appBody}>
                    <div className={styles.appContent} dangerouslySetInnerHTML={{ __html: textParse(msg.Title) }} />
                    <div className={styles.appThumb}>
                        <img
                            src={msg.Thumb || idp}
                            alt="Thumb"
                            onError={(e) => e.target.src = idp}

                        />
                    </div>
                </div>
                <div className={styles.appFooter}>
                    <div className={styles.appTag}>
                        <Icon type="compass" style={{ color: "#1890ff", marginRight: 4 }} />小程序
                    </div>
                    {/* {status === "1" && <Button type="primary" size="small" onClick={() => collectMini(msgId, index)}>收藏</Button>} */}
                    <Button type="primary" size="small" onClick={() => collectMini(msgId, index)}>收藏</Button>
                </div>
            </div>
            : errMsg
        }
    </span>
)


// 图片消息
const imgMess = (url, msgId, checkPic, WeChatId, FriendId) => {
    url = (url && url.indexOf("qpic.cn") !== -1) ? `http://img-agent.yunbeisoft.com/img?url=${url}` : url
    return (
        <div className={styles.imgMsg} onClick={() => checkPic({ msgId, url, WeChatId, FriendId })}>
            <img src={url} alt="图片" onError={(e) => e.target.src = idp} />
        </div>
    )
}

// 语音消息
const voiceMess = (voiceMsgId, msgId, seconds, palyVoice, status, vtt) => (
    <div className={classNames(styles.textMsg, styles.embed)} onClick={() => palyVoice(msgId)}>
        {voiceMsgId === msgId
            ? (<img src={status === "0" ? mvp : vp} alt="播放中" />)
            : (<img src={status === "0" ? mv : v} alt={status === "0" ? "mv" : "v"} />)
        }
        {vtt && <div style={{ paddingTop: 8 }}>{vtt}</div>}
        <div className={styles.duration}>{seconds || "1"}"</div>
    </div>
)

// 视频消息
const videoMess = (url, checkMid, msgId, checkStatus, checkVideo, Thumb) => (
    <div className={styles.imgMsg} onClick={() => checkVideo(msgId, url)}>
        <div className={styles.wrap}>
            {(checkMid === msgId && checkStatus === "loading")
                ? <Icon type="loading" style={{ fontSize: 40 }} />
                : <Icon type="play-circle" theme="filled" style={{ color: "rgba(255,255,255,.85)", fontSize: 40 }} />
            }
        </div>
        <img src={Thumb} alt="视频" onError={(e) => e.target.src = vdp} />
    </div>
)

// type :5消息
const unMess = (msg, text) => (
    msg
        ? <div className={styles.systemMsg} dangerouslySetInnerHTML={{ __html: text }} />
        : <div className={styles.textMsg} dangerouslySetInnerHTML={{ __html: text }} />
)

// 文件消息
const fileMess = (text) => (
    text
        ? <div className={styles.textMsg} >
            <Icon type="file" style={{ marginRight: 10 }} />
            <span>{text}</span>
        </div >
        : errMsg
)

// 转账红包消息
const moneyMess = (text, msg, status, _takeMoney, money, onpened, zhuang_type) => {
    let textObj
    try {
        textObj = JSON.parse(text)
    } catch (err) {
        textObj = {}
    }
    return (
        <div
            className={styles.textMsg}
            style={{
                width: 320,
                padding: 0,
                overflow: "hidden",
                backgroundColor: "#FFFFFF",
            }}
        >
            <div
                className={styles.cardBody}
                style={{
                    background: onpened === "1" ? "rgb(252,225,195)" : "rgb(255,150,9)",
                    padding: 8,
                    margin: 0,
                }}
            >
                <div className={styles.cardThumb}>
                    <Avatar
                        icon={msg === "转账"
                            ? zhuang_type === 1
                                ? "check-circle"
                                : "pay-circle"
                            : "red-envelope"
                        }
                        shape="square"
                        size="large"
                        style={{ background: onpened === "1" ? "rgb(252,225,195)" : "rgb(255,150,9)" }}
                    />
                </div>
                <div className={styles.cardTitle}>
                    <div className={styles.cardNick}>
                        <Ellipsis
                            lines={1}
                            style={{ color: "#FFFFFF", fontWeight: "bold" }}
                        >
                            {zhuang_type === 1 ? "领取成功" : `${msg}消息`}
                        </Ellipsis>
                    </div>
                    {msg === "转账"
                        ? <div className={styles.cardAddress} style={{ color: "#FFFFFF" }}>
                            转账{textObj.Feedesc || money}
                        </div>
                        : onpened === "1" &&
                        <div className={styles.cardAddress} style={{ color: "#FFFFFF" }}>
                            领取￥{textObj.Feedesc || money}
                        </div>
                    }
                </div>
            </div>
            <div className={styles.cardFooter} style={{ padding: 8 }}>
                <div className={styles.appTag}>
                    {/* <Icon
                        type={msg === "转账" ? "pay-circle" : "red-envelope"}
                        style={{ color: "#1890ff", marginRight: 4}}
                    /> */}
                    {`微信${msg}`}
                </div>
                {status === "1" &&
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => _takeMoney()}
                        disabled={onpened === "1"}
                    >
                        {`领取${msg}`}
                    </Button>
                }
            </div>
        </div>
    )
}

// 消息时间
const timeMess = ({ msg, tmpstatus, auth, addtime, status, userid, type, onpened }) => (
    !msg && tmpstatus !== "pending" && tmpstatus !== "failed" &&
    <div className={styles.info}>
        {onpened === "1" && <span style={{ color: "rgb(135, 208, 104)", marginRight: 10 }}>已领取</span>}
        {(type !== "12" && type !== "11" && status !== "1" || (userid && userid.indexOf("q") !== -1)) &&
            <span style={{ marginRight: 8 }}>{auth || ""}</span>
        }
        <span>{addtime}</span>
    </div>
)

// 发送状态 is_fail接口返回1时表示发送失败
const statusMess = (props, tmpstatus, is_fail, reSend) => {
    if (tmpstatus === "pending") {
        return (
            <Icon
                type="loading"
                theme="outlined"
                className={styles.status}
                style={{ color: "#1890ff" }}
            />
        )
    }
    if (tmpstatus === "failed" || is_fail === "1") {
        return (
            <Icon
                onClick={() => reSend({ ...props })}
                type="exclamation-circle"
                theme="outlined"
                className={styles.status}
                style={{ color: "#f5222d", cursor: "pointer" }}
                title="点击重新发送"
            />
        )
    }
    if (tmpstatus === "senSitive") {
        return (
            <Icon
                type="question-circle"
                theme="outlined"
                className={styles.status}
                style={{ color: "#f5222d" }}
                title="包含敏感词"
            />
        )
    }
}


const Message = ({
    forward,
    userid,
    text,
    type,
    url,
    headimg,
    nickname,
    isGroup,
    status,
    wechat,
    checkPic,
    tmpstatus,
    is_fail,
    msgId,
    checkVideo,
    checkMid,
    checkStatus,
    addtime,
    auth,
    palyVoice,
    voiceMsgId,
    bindPhone,
    seconds,
    collectionMsg,
    fastWord,
    addKsy,
    changeTabs,
    addCustom,
    reSend,
    messageId,
    msgKey,
    collectMini,
    appid,
    WeChatId,
    FriendId,
    msgSvrId,
    takeMoney,
    recall,
    money,
    onpened,
    zhuang_type,
    is_call_back,
    vtt,
    toText,
    Thumb,
    addGrpFri,
    wxid,
    hanldOrder,
    bigPic,
}) => {
    const addFri = () => {
        addGrpFri({ wxid, userid })
    }
    const _takeMoney = () => {
        takeMoney(messageId)
    }
    const _recall = () => {
        recall(WeChatId, FriendId, messageId)
    }
    const _toText = () => {
        toText(messageId)
    }
    let oldtext = text
    let phone = ""
    let order_sn = ""
    const cardType = ["6", "7", "8", "9"]// 卡片类型消息
    const hiddenTriangle = ["2", "4", "11", "12"]
    if (cardType.findIndex((item) => item === type) === -1) {
        if (text) {
            let regex = /((13[0-9])|(14[57])|(15([0-3]|[5-9]))|(17[12567])|(18[01,5-9])|(19[12]))\d{8}/
            const regexOrder = /\d{18}/
            text = text.replace("<a href=\"weixin://findfriend/verifycontact\">发送朋友验证</a>", "发送朋友验证")

            order_sn = text.match(regexOrder)
            if (order_sn) {
                order_sn = order_sn[0]
            }
            phone = text.match(regex)
            if (phone) {
                phone = phone[0]
            }

            text = text.replace(regex, "<a href=\"javascript:;\">$&</a>")
            text = text.replace(regexOrder, "<a href=\"javascript:;\">$&</a>")
            text = textParse(text)
        }
    } else {
        try {
            if (type !== "8") {
                text = text ? JSON.parse(text) : ""
            }
        } catch (err) {
            text = ""
        }
    }
    const menu = (
        <Menu>
            {type === "1" && <Menu.Item><CopyToClipboard text={CopyText(text)} ><span>复制</span></CopyToClipboard></Menu.Item>}
            {type !== "0" && tmpstatus !== "pending" && tmpstatus !== "failed" && tmpstatus !== "senSitive" &&
                is_fail !== "1" && type !== "5" && type !== "11" && type !== "12" &&
                <Menu.Item onClick={() => forward({ content: messageId })}>消息转发</Menu.Item>}
            {type === "2" && <Menu.Item onClick={() => addCustom(url)}>添加表情</Menu.Item>}
            {phone && <Menu.Item onClick={() => bindPhone(phone)}>绑定手机：{phone}</Menu.Item>}
            {order_sn && <Menu.Item onClick={() => hanldOrder({ orderVisible: true, order_sn })}>查询订单</Menu.Item>}
            {type === "1" && <Menu.Item onClick={() => collectionMsg({ content: oldtext, type })}>收藏消息</Menu.Item>}
            {
                (type === "1" || type === "2" || type === "3") && fastWord && fastWord.length > 0 &&
                <SubMenu title="添加快捷语">
                    {fastWord.map((item) =>
                        <Menu.Item key={item.groupId} onClick={() => addKsy({ groupId: item.groupId, type, url, text: oldtext, seconds })}>
                            {item.name}
                        </Menu.Item>
                    )}
                </SubMenu>
            }
            {type === "6" && <Menu.Item onClick={() => collectMini(messageId, msgKey)}>收藏</Menu.Item>}
            {status === "0" && <Menu.Item onClick={_recall}>撤回</Menu.Item>}
            {type === "3" && !vtt && <Menu.Item onClick={_toText}>转文字</Menu.Item>}
        </Menu >
    )
    let msg = false
    try {
        msg = type === "5" && text.indexOf("开启了朋友验证") !== -1
    } catch (err) {
        msg = false
    }
    if (is_call_back === "1") {
        type = "5"
        msg = true
        text = "你撤回了一条消息"
    }

    let message = ""
    switch (type) {
        case "1":
            message = textMess(text)
            break
        case "2":
            message = imgMess((bigPic || url), msgSvrId, checkPic, WeChatId, FriendId)
            break
        case "3":
            message = voiceMess(voiceMsgId, messageId, seconds, palyVoice, status, vtt)
            break
        case "4":
            message = videoMess(url, checkMid, msgSvrId, checkStatus, checkVideo, Thumb)
            break
        case "5":
            message = unMess(msg, text)
            break
        case "6":
            message = urlMsg(text)
            break
        case "7":
            message = appMsg(messageId, text, status, collectMini, msgKey)
            break
        case "9":
            message = card(text, status, msgSvrId, WeChatId)
            break
        case "8":
            message = fileMess(text)
            break
        case "11":
            message = moneyMess(text, "红包", status, _takeMoney, money, onpened)
            break
        case "12":
            message = moneyMess(text, "转账", status, _takeMoney, money, onpened, zhuang_type)
            break
        case "99":
            message = unMess(false, "视频通话，可在手机上查看")
            break
        default:
            message = unMess(false, "不支持的消息，可在手机上查看")
            break
    }
    return (
        <div
            className={classNames(styles.message,
                {
                    [styles.mine]: status === "0",
                    // || type === "12" || type === "11"
                },
                { [styles.card]: cardType.findIndex((item) => item === type) !== -1 })}
        >
            {
                // (!msg && type !== "11" && type !== "12") &&
                !msg &&
                <div className={styles.sender}>
                    <Dropdown
                        overlayClassName={styles.memberInfo}
                        overlay={
                            <span>
                                <div className={styles.infoBox}>
                                    <div style={{ marginRight: 8 }}>
                                        <Avatar src={headimg} icon="user" />
                                    </div>
                                    <Ellipsis lines={1}>{nickname}</Ellipsis>
                                </div>
                                <div className={styles.infoBox}>
                                    <Button
                                        title="添加好友"
                                        type="primary"
                                        shape="circle"
                                        icon="plus"
                                        onClick={addFri}
                                    />
                                </div>
                            </span>
                        }
                        trigger={["click"]}
                        disabled={!isGroup || status === "0"}
                    >
                        <div
                            className={styles.avatar}
                            style={{ cursor: status === "0" ? "" : "pointer" }}
                            title={status !== "0" && !isGroup ? "查看资料" : ""}
                            onClick={status !== "0" && !isGroup ? changeTabs : null}
                        >
                            <Avatar
                                src={status === "0" ? wechat ? wechat.headimg : "" : headimg}
                                icon="user"
                                size="large"
                            />
                        </div>
                    </Dropdown>
                    <span className={classNames(styles.triangle, { [styles.hidden]: hiddenTriangle.indexOf(type) !== -1 })} />
                </div>
            }
            <Dropdown
                trigger={["contextMenu"]}
                overlay={menu}
                disabled={tmpstatus === "pending" || tmpstatus === "failed" || tmpstatus === "senSitive"}
            >
                <div className={classNames(styles.msgBox, { [styles.system]: ((type === "5" && msg)) })}>
                    {message}
                    {statusMess({ type, text: oldtext, url, auth, msgKey, appid }, tmpstatus, is_fail, reSend)}
                    {!msg && timeMess({ msg, tmpstatus, auth, addtime, status, userid, type, onpened })}
                </div>
            </Dropdown>
        </div>
    )
}
export default Message
