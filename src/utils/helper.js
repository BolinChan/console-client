import expressList from "../pages/chats/components/expressList"
import emoji from "emoji"
export const testSubstr = (str, substr) => {
    var reg = new RegExp(substr, "g")
    return reg.test(str)
}

export const delay = (timer) => new Promise((resolve) => setTimeout(resolve, timer))

export const getParameterByName = (name, string) => {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]")
    let regex = new RegExp("[\\?&]" + name + "=([^&#]*)")
    let results = regex.exec(string)
    return results === null ? null : decodeURIComponent(results[1])
}

export const makeKey = () => {
    const str = "qwertyuiopasdfghjklzxcvbnm0123456789QWERTYUIOPASDFGHJKLZXCVBNM"
    const len = str.length
    let _d = new Date()
    let strMath = ""
    for (let i = 0; i < 4; i++) {
        let math = Math.floor(Math.random() * len - 1)
        if (math < 0) {
            math = 0
        }
        strMath += str.substr(math, 1)
    }
    let dataMath = _d.getTime() + strMath
    return dataMath
}

export const sortByTime = (x, y) => {
    if (x.lastMsgTime < y.lastMsgTime) {
        return 1
    } else if (x.lastMsgTime > y.lastMsgTime) {
        return -1
    } else {
        return 0
    }
}

export const send = (ws, body) => {
    body.token = window.sessionStorage.getItem("token") || ""
    ws.send(JSON.stringify(body))
}
export const textParse = (text) => {
    if (text) {
        for (let v of expressList) {
            let index = -1
            if (text) {
                do {
                    index = text.indexOf(v.name, index + 1)
                    if (index !== -1) {
                        text = text.replace(v.name, "<i class='sprite sprite-" + v.className + "' ></i>")
                    }
                } while (index !== -1)
            }
        }
        text = emoji.unifiedToHTML(text)
    }
    return text
}
export const fileType = (url) => {
    let type = ""
    let typeLst = ["doc", "xls", "ppt", "pdf", "mp4"]
    for (let i = 0, len = typeLst.length; i < len; i++) {
        if (url.includes(`.${typeLst[i]}`)) {
            type = typeLst[i]
            break
        }
    }
    return type
}
export const imgAuto = (payload) => {
    let { width, height, setMax, boxW, boxH, minWidth, maxWidth, minHeight, maxHeight } = payload
    if (width > height) {
        const whBl = width / height
        setMax = "height"
        if (whBl <= 3) {
            boxW = width <= minWidth ? minWidth : maxWidth
            boxH = width <= minWidth ? height / (width / minWidth) : height / (width / maxWidth)
        } else {
            let h1 = height / (width / minWidth) < minHeight ? minHeight : height / (width / minWidth)
            let h2 = height / (width / maxWidth) < minHeight ? minHeight : height / (width / maxWidth)
            boxW = width <= minWidth ? minWidth : maxWidth
            boxH = width <= minWidth ? h1 : h2
        }
    }
    if (width === height) {
        boxW = width <= minWidth ? minWidth : maxWidth
        boxH = width <= minWidth ? minHeight : maxHeight
        setMax = "width"
    }
    if (height > width) {
        let hwBl = height / width
        setMax = "width"
        if (hwBl <= 3) {
            boxW = height <= minHeight ? width / (height / minHeight) : width / (height / maxHeight)
            boxH = height <= minHeight ? minHeight : maxHeight
        } else {
            let w1 = width / (height / minHeight) < minWidth ? minWidth : width / (height / minHeight)
            let w2 = width / (height / maxHeight) < minWidth ? minWidth : width / (height / maxHeight)
            boxW = height <= minHeight ? w1 : w2
            boxH = height <= minHeight ? minHeight : maxHeight
        }
    }
    return { boxH, boxW, setMax }

}
// 朋友圈去重
export const monentLst = (list, payloadLst) => {
    let temp = [] // 一个新的临时数组
    let array = [...list, ...payloadLst]
    for (let i = 0; i < array.length; i++) {
        array[i].imgLoad = false
        if (fIndex(temp, array[i].CircleId) === -1) {
            temp.push(array[i])
        }
    }
    if (temp) {
        temp = hasTimeSort(temp)
    }

    return temp
}
// 按时间排序
const hasTimeSort = (arr) => arr.sort((a, b) => new Date(b.createtime).getTime() - new Date(a.createtime).getTime())
function fIndex (temp, item) {
    return temp.findIndex((it) => it.CircleId === item)
}

// 聚合 开关
export const updateMenuFold = (data) => {
    let {chats, wechats, messages, object, auth, chatsActive, type} = data
    try {
        if (type) {
            const index = chats && chats.findIndex((chat) => chat.userid === object.userid)
            const newChat = updateContact(chats, object, auth, chatsActive)
            wechats = updateWechats(wechats, object, chatsActive)
            if (chatsActive === object.userid) {
                const keyIndex = messages.findIndex((item) => item.key && item.key === object.key)
                if (keyIndex === -1) {
                    if (index !== -1) {
                        chats && chats.splice(index, 1)
                        chats = [newChat].concat(chats)
                    }
                    messages.push(object)
                } else {
                    messages[keyIndex] = object
                }
            } else {
                if (index !== -1) {
                    chats && chats.splice(index, 1)
                }
                chats = [newChat].concat(chats)
            }
        } else {
            wechats = updateWechats(wechats, object, chatsActive)
        }
        return { chats, messages, wechats }
    } catch (error) {
        return { chats, messages, wechats }
    }
}
// 更新联系人
function updateContact (contact, object, auth, chatsActive) {
    let newChat = ""
    try {
        const userid = object.userid
        const status = object.status
        const lastMsgId = object.message_id
        const lastMsgTime = object.addtime
        const index = contact && contact.findIndex((chat) => chat.userid === userid)
        const msgType = {
            "2": "[图片]",
            "3": "[语音]",
            "4": "[视频]",
            "6": "[链接]",
            "7": "[小程序]",
            "9": "[名片]",
            "11": "[红包消息]",
            "12": "[转账消息]",
        }
        const lastMsg = msgType[object.type] || object.text
        if (index === -1) {
            newChat = {
                userid,
                lastMsg,
                lastMsgId,
                unread: 0,
                lastMsgTime,
                nick: object.nick,
                phone: object.phone,
                wxid: object.FriendId,
                headImg: object.headImg,
                lastTime: auth.lastTime,
                kefu_wxid: object.WeChatId,
                remark: object.remark || "",
                buyer_name: object.buyer_name,
            }
        } else {
            newChat = { ...contact[index], lastMsgId, lastMsgTime, lastMsg }
        }
        if (status === "1" && userid !== chatsActive) {
            newChat.unread = Number(newChat.unread) + 1
        }
        if (status === "0" && userid !== chatsActive && object.unread) {
            newChat.unread = Number(newChat.unread) + Number(object.unread)
        }
        return newChat
    } catch (error) {
        return ""
    }
}
// 更新设备
function updateWechats (wechats, object, chatsActive) {
    try {
        const userid = object.userid
        const status = object.status
        const index = wechats.findIndex((we) => we.wxid === object.WeChatId)
        if (index !== -1) {
            if (status === "1" && userid !== chatsActive) {
                wechats[index].unread = Number(wechats[index].unread) + 1
            }
            if (status === "0" && userid !== chatsActive && object.unread) {
                wechats[index].unread = Number(wechats[index].unread) + Number(object.unread)
            }
        }
        return wechats

    } catch (error) {
        return wechats
    }
}
