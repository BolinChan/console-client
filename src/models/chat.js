import { testSubstr, makeKey, send, fileType, monentLst, updateMenuFold } from "../utils/helper"
import * as chatService from "../services/service"
import moment from "moment"
import { message } from "antd"
const format = "YYYY-MM-DD HH:mm:ss"

let fetch = false
let id = ""
let messFetch = false
let messHid = ""

let groupFetch = false
let groupMemberFetch = false

let lockReconnect = false
// const ip = "ws://118.31.167.215:8282"
const ip = "wss://socket.yunbeisoft.com:8282"
let ws = ""
let heartCheck = {
    timeout: 15000,
    timeoutObj: null,
    serverTimeoutObj: null,
    reset: function () {
        clearTimeout(this.timeoutObj)
        clearTimeout(this.serverTimeoutObj)
        return this
    },
    start: function () {
        this.timeoutObj = setTimeout(() => {
            send(ws, { act: "heart" })
            this.serverTimeoutObj = setTimeout(() => {
                ws.close()
            }, this.timeout)
        }, this.timeout)
    },
}
export default {
    namespace: "chat",
    state: {
        headerActive: 0,
        sidebarActive: "chats",
        wechatsActive: "",
        wechats: "",
        chatsActive: "",
        chatsWxid: "",
        chats: "",
        chatHasMore: true,
        unread: [],
        menuFold: true,
        auth: "",
        isLog: "",
        messages: [],
        records: [],
        fastgroup: [],
        fastword: [],
        friendTags: [],
        allTags: [],
        shoppingInfo: [],
        orders: [],
        searchRes: "",
        redPackageHis: [],
        log: [],
        checkDate: "",
        chatLog: [],
        topping: [],
        collectionMsgs: "",
        sendTime: "",
        associationOrders: [],
        tabActive: "fastWord",
        notificationSwitch: true,
        notification: false,
        kefu: "",
        token: "",
        moments: [],
        momentsHasMore: [],
        momentsUpdate: [],
        kaslst: [],
        foucsTip: false,
        quns: [],
        qunsHasMore: true,
        qunsPage: 1,
        wechatTags: [],
        folder: [],
        doList: [],
        groups: [],
        addRecord: [],
        addRecordTotal: 0,
        extendField: [],
        tagGroup: [],
        hasDo: false,
        concatCurrent: 0,
        isMoment: false,
        stopMoment: true,
        customExpress: [],
        miniList: [],
        hasKefuid: "",
        getKsy: [],
        pendingMsgIds: [],
        addNum: 0,
        orderVisible: false,
        order_sn: "",
    },
    reducers: {
        hasKefuid (state, { payload }) {
            return { ...state, hasKefuid: payload }
        },
        upSidebarActive (state, { payload }) {
            return { ...state, sidebarActive: payload }
        },
        updateGroup (state, { payload }) {
            let chats = state.chats.slice(0)
            chats = (chats && chats.length) ? chats.filter((item) => item.userid.indexOf("q") !== -1) || [] : []
            if (chats.length > 0) {
                const groups = payload.data
                if (groups && groups.length) {
                    groups.map((item) => {
                        const index = chats.findIndex((chat) => chat.userid === item.userid)
                        if (index !== -1) {
                            chats[index] = { ...chats[index], nick: item.nick, quns: item.quns, headImg: item.headImg }
                        }
                    })
                }
            }
            groupFetch = false
            return { ...state, chats }
        },
        updateGroupMember (state, { payload }) {
            const { data, userid } = payload
            const chatsActive = state.chatsActive
            let quns = state.quns.slice(0)
            if (chatsActive === userid) {
                if (data.length > 0) {
                    data.map((item) => {
                        const isDel = Number(item.isdelete)
                        if (isDel) {
                            if (quns.length > 0) {
                                const qIndex = quns.findIndex((qun) => qun.wxid === item.wxid)
                                if (qIndex !== -1) {
                                    quns.splice(qIndex, 1)
                                }
                            }
                        } else {
                            if (quns.length > 0) {
                                const qIndex = quns.findIndex((qun) => qun.wxid === item.wxid)
                                if (qIndex === -1) {
                                    quns = [item].concat(quns)
                                }
                            } else {
                                quns = [item].concat(quns)
                            }
                        }
                    })
                }
            }
            groupMemberFetch = false
            return { ...state, quns }
        },
        updateCustom (state, { payload }) {
            let customExpress = state.customExpress.slice(0)
            if (customExpress.length > 0) {
                const index = customExpress.findIndex((item) => item.id === payload.id)
                index === -1 ? customExpress.push(payload) : customExpress.splice(index, 1)
            } else {
                customExpress.push(payload)
            }
            return { ...state, customExpress }
        },
        saveCustom (state, { payload }) {
            return { ...state, customExpress: payload }
        },
        upNewMsg (state, { payload }) {
            let wechats = state.wechats.slice(0)
            let chats = typeof state.chats === "string" ? [] : state.chats
            if (wechats.length < 1) {
                return { ...state }
            }
            if (payload && payload.hasOwnProperty("devices") && payload.hasOwnProperty("friends")) {
                let { devices, friends } = payload
                if (devices && devices.length > 0) {
                    devices.map((item) => {
                        let wechatIndex = wechats.length ? wechats.findIndex((wechat) => wechat.wxid === item.wxid) : -1
                        if (wechatIndex !== -1) {
                            wechats[wechatIndex].unread = item.hasOwnProperty("unread") ? Number(item.unread) : Number(item.unreads)
                        }
                    })
                }
                if (friends && friends.length > 0) {
                    friends.map((item) => {
                        if (item && item.userid) {
                            let chatIndex = chats.length > 0 ? chats.findIndex((chat) => chat.userid === item.userid) : -1
                            if (chatIndex !== -1) {
                                chats.splice(chatIndex, 1)
                            }
                            chats = [item].concat(chats)
                        }
                    })
                }
            }
            fetch = false
            return { ...state, wechats, chats }
        },
        upMess (state, { payload }) {
            let messages = state.messages.slice(0)
            const chatsActive = state.chatsActive
            if (messages.length && chatsActive && payload && payload.length) {
                const index = messages.findIndex((f) => f.userid === chatsActive)
                if (index !== -1) {
                    for (let i = 0, len = payload.length; i < len; i++) {
                        const messIndex = messages.findIndex((f) => `${f.id}` === `${payload[i].id}`)
                        if (messIndex === -1 && payload[i].status === "0" && (payload[i].type === "7" || payload[i].type === "6")) {
                            continue
                        }
                        if (messIndex !== -1) {
                            messages[messIndex] = { ...messages[messIndex], ...payload[i] }
                        } else {
                            const item = payload[i]
                            let msgs = messages.filter((msg) => msg.status === item.status) || []
                            if (msgs && msgs.length > 0) {
                                const oldMsg = new Date(msgs[msgs.length - 1].addtime).getTime() > new Date(item.addtime).getTime()
                                if (!oldMsg) {
                                    messages.push(item)
                                }
                            } else {
                                messages.push(item)
                            }
                        }
                    }
                }
                messHid = payload[payload.length - 1].hid
            }
            messFetch = false
            return { ...state, messages }
        },
        doChangeAlter (state, { payload }) {
            let chats = state.chats.slice(0)
            const { userid, isIgnore } = payload
            const index = chats.findIndex((item) => item.userid === userid)
            if (index !== -1) {
                chats[index].isIgnore = isIgnore
            }
            return { ...state, chats }
        },
        upReadNum (state, { payload }) {
            const { wxid } = payload
            let chats = state.chats.slice(0)
            let wechats = state.wechats.slice(0)
            if (wechats.length) {
                let index = wechats.findIndex((f) => f.wxid === wxid)
                if (index !== -1) {
                    wechats[index].unread = 0
                }
            }
            if (chats.length) {
                for (let i = 0, len = chats.length; i < len; i++) {
                    chats[i].unread = 0
                }
            }
            return { ...state, wechats, chats }
        },
        changeGroups (state, { payload }) {
            let chats = state.chats.slice(0)
            const { uid, fid } = payload
            const index = chats.findIndex((item) => item.userid === uid)
            if (index !== -1) {
                chats[index].fid = fid
            }
            return { ...state, chats }
        },
        saveGroups (state, { payload }) {
            return { ...state, groups: payload }
        },
        editorFolder (state, { payload }) {
            let folder = state.folder.slice(0)
            if (folder.length) {
                const index = folder.findIndex((item) => item.id === payload.id)
                if (index !== -1) {
                    folder[index].onType = payload.onType ? "editor" : ""
                }
            }
            return { ...state, folder }
        },
        changeFolder (state, { payload }) {
            let folder = state.folder.slice(0)
            let openIndex, delIndex, nameIndex
            if (folder.length) {
                switch (payload.type) {
                    case "delOpenType":
                        openIndex = folder.findIndex((item) => item.onType === "add")
                        if (openIndex !== -1) {
                            folder.splice(openIndex, 1)
                        }
                        break
                    case "delFile":
                        delIndex = folder.findIndex((item) => item.id === payload.id)
                        if (delIndex !== -1) {
                            folder.splice(delIndex, 1)
                        }
                        break
                    default:
                        nameIndex = folder.findIndex((item) => item.id === payload.id)
                        if (nameIndex !== -1) {
                            folder[nameIndex].name = payload.name
                        }
                        break
                }
            }
            return { ...state, folder }
        },
        addFolder (state, { payload }) {
            let folder = state.folder.slice(0)
            if (payload) {
                if (payload.onType && payload.onType === "add") {
                    const index = folder.findIndex((item) => item.onType === "add")
                    if (index === -1) {
                        folder.push(payload)
                    } else {
                        message.error("请先填写")
                        return { ...state, folder }
                    }
                } else {
                    folder.push(payload)
                }
                if (folder.length) {
                    folder.map((item) => {
                        if (item.url) {
                            item.typelevel = fileType(item.url)
                        }
                    })
                }
            }
            return { ...state, folder }
        },
        saveFolder (state, { payload }) {
            if (payload && payload.length) {
                payload.map((item) => {
                    if (item.url) {
                        item.typelevel = fileType(item.url)
                    }
                })
            }
            return { ...state, folder: payload }
        },
        saveWechatTags (state, { payload }) {
            let wechatTags = state.wechatTags.slice(0)
            if (wechatTags && wechatTags.length > 0) {
                if (wechatTags.findIndex((item) => item.userid === payload.userid) === -1) {
                    wechatTags.push(payload)
                }
            } else {
                wechatTags.push(payload)
            }
            return { ...state, wechatTags }
        },
        doOutQun (state, { payload }) {
            let quns = state.quns.slice(0)
            const index = quns.findIndex((item) => item.userid === payload.userid)
            if (index !== -1) {
                let chats = quns[index].chats
                quns[index].chats = chats.filter((item) => item.id !== payload.id)
            }
            return { ...state, quns }
        },
        outQun (state, { payload }) {
            let chats = state.chats.slice(0)
            chats = chats.filter((item) => item.userid !== payload.userid)
            return { ...state, chatsActive: "", chats }
        },
        upQun (state, { payload }) {
            let chats = state.chats.slice(0)
            const { remark, userid } = payload
            const index = chats.findIndex((item) => item.userid === userid)
            if (index !== -1) {
                chats[index].remark = remark
            }
            return { ...state, chats }
        },
        saveQun (state, { payload }) {
            const { qun, userid } = payload
            let chatsActive = state.chatsActive
            if (chatsActive === userid) {
                let quns = state.quns.slice(0)
                const index = quns.findIndex((item) => item.wxid === qun.wxid)
                if (index !== -1) {
                    quns.splice(index, 1)
                }
                quns = [qun].concat(quns)
                return { ...state, quns }
            } else {
                return { ...state }
            }
        },
        saveQuns (state, { payload }) {
            const { hasMore, data, userid, page } = payload
            let chatsActive = state.chatsActive
            if (chatsActive === userid) {
                let quns = state.quns.slice(0)
                if (quns.length > 0) {
                    if (data && data.length > 0) {
                        data.map((item) => {
                            const index = quns.findIndex((qun) => qun.wxid === item.wxid)
                            if (index === -1) {
                                quns.push(item)
                            }
                        })
                    }
                } else {
                    quns = data
                }
                return { ...state, quns, qunsHasMore: hasMore, qunsPage: page }
            } else {
                return { ...state }
            }
        },
        upMoments (state, { payload }) {
            const { userid, isUpdate } = payload
            let momentsUpdate = state.momentsUpdate.slice(0)
            if (userid) {
                if (momentsUpdate && momentsUpdate.length > 0) {
                    const index = momentsUpdate.findIndex((item) => item.userid === userid)
                    index === -1 ? momentsUpdate.push({ userid, isUpdate }) : momentsUpdate[index].isUpdate = isUpdate
                } else {
                    momentsUpdate.push({ userid, isUpdate })
                }
            } else {
                if (momentsUpdate.length) {
                    momentsUpdate.map((item) => {
                        item.isUpdate = false
                    })
                }
            }
            return { ...state, momentsUpdate }
        },
        upMonentOld (state, { payload }) {
            return { ...state, isMoment: payload.update, stopMoment: payload.isStop ? payload.isStop : false }
        },
        changeSound (state) {
            let notificationSwitch = !state.notificationSwitch
            return { ...state, notificationSwitch }
        },
        pushMsg (state) {
            let notification = state.notificationSwitch ? !state.notification : false
            return { ...state, notification }
        },
        changeTabs (state, { payload }) {
            return { ...state, tabActive: payload }
        },
        saveOrders (state, { payload: { buyer_name, data } }) {
            let orders = state.orders.slice(0)
            if (orders && orders.length > 0) {
                const index = orders.findIndex((item) => item.buyer_name === buyer_name)
                index === -1 ? orders.push({ buyer_name, data }) : orders[index].data = data
            } else {
                orders.push({ buyer_name, data })
            }
            return { ...state, orders }
        },
        doToTop (state, { payload }) {
            const { id, type } = payload
            let chats = state.chats.slice(0)
            if (chats && chats.length) {
                let chatIndex = chats.findIndex((it) => it.userid === id)
                if (chatIndex !== -1) {
                    chats[chatIndex].istop = type ? 0 : 1
                }
            }
            return { ...state, chats }
        },
        cancleFouc (state, { payload }) {
            return { ...state, foucsTip: payload.value }
        },
        saveChatLog (state, { payload }) {
            let chatLog = state.chatLog.slice(0)
            const index = chatLog.findIndex((item) => item.id === payload.chat)
            index === -1 ? chatLog.push({ id: payload.chat, log: payload.log }) : chatLog[index].log = payload.log
            return { ...state, chatLog }
        },
        changeChatLog (state, { payload }) {
            let chatLog = state.chatLog.slice(0)
            const chatsActive = state.chatsActive
            const { type, addText } = payload
            const index = chatLog.findIndex((item) => item.id === chatsActive)
            index === -1 ? chatLog.push({ id: chatsActive, log: addText }) : chatLog[index].log = type === "ksy" ? addText : chatLog[index].log + addText
            return { ...state, chatLog }
        },
        clearChatLog (state, { payload }) {
            let chatLog = state.chatLog.slice(0)
            const index = chatLog.findIndex((item) => item.id === payload)
            if (index !== -1) {
                chatLog[index].log = ""
            }
            return { ...state, chatLog }
        },
        doLog (state, { payload }) {
            if (payload.error) {
                return { ...state, isLog: "0" }
            } else {
                window.sessionStorage.setItem("token", payload.data.token)
                window.sessionStorage.setItem("id", payload.data.id)
                return { ...state, auth: payload.data, isLog: "1", token: payload.data.token }
            }
        },
        saveLog (state, { payload }) {
            const checkDate = window.localStorage.getItem("checkDate") || ""
            return { ...state, log: payload, checkDate }
        },
        checkLog (state) {
            const checkDate = moment(Date.now()).format(format)
            window.localStorage.setItem("checkDate", checkDate)
            return { ...state, checkDate }
        },
        upActive (state, { payload }) {
            return { ...state, ...payload, chats: [], chatHasMore: true, chatsActive: "", messages: [], concatCurrent: 0 }
        },
        upTab (state, { payload }) {
            return { ...state, ...payload }
        },
        changeChatsActive (state, { payload }) {
            let chatsWxid = ""
            let wechats = state.wechats.slice(0)
            const wechatsActive = state.wechatsActive
            const chatsActive = payload.userid
            let chats = typeof state.chats === "string" ? [] : state.chats.slice(0)
            const chatIndex = chats.findIndex((item) => item.userid === payload.userid)
            if (chatIndex !== -1) {
                const unread = Number(chats[chatIndex].unread)
                if (unread > 0) {
                    const wIndex = wechats.findIndex((item) => item.wxid === wechatsActive)
                    if (wIndex !== -1) {
                        const un = Number(wechats[wIndex].unread)
                        wechats[wIndex].unread = unread > un ? 0 : un - unread
                    }
                }
                chatsWxid = chats[chatIndex].wxid
                chats[chatIndex].unread = 0
            } else {
                chatsWxid = payload.wxid ? payload.wxid : ""
                chats = [{ ...payload, unread: 0 }].concat(chats)
            }
            messHid = ""
            return { ...state, chatsActive, chatsWxid, chats, wechats, messages: [], quns: [], qunsPage: 1, qunsHasMore: true }
        },
        saveWechats (state, { payload }) {
            let wechats = payload
            try {
                wechats.map((item, index) => {
                    wechats[index].unread = Number(item.unread)
                })
                if (state.wechatsActive === "") {
                    return { ...state, wechats, wechatsActive: wechats.length ? wechats[0].wxid : "" }
                } else {
                    return { ...state, wechats }
                }
            } catch (error) {
                return { ...state, wechats }
            }
        },
        saveChats (state, { payload }) {
            const { data, hasMore, page } = payload
            let chats = typeof state.chats === "string" ? [] : state.chats
            if (data && data.length) {
                for (let i = 0, len = data.length; i < len; i++) {
                    const item = data[i]
                    const index = chats.findIndex((f) => f.userid === item.userid)
                    if (index === -1) {
                        chats.push(item)
                    }
                }
            }
            return { ...state, chats, chatHasMore: hasMore, concatCurrent: page }
        },

        upMsgTmpStatus (state, { payload }) {
            let messages = state.messages.slice(0)
            let pendingMsgIds = state.pendingMsgIds.slice(0)
            const index = messages.findIndex((item) => item.key === payload.key)
            if (index !== -1) {
                if (payload.senSitive) {
                    messages[index].tmpstatus = "senSitive"
                } else {
                    messages[index].tmpstatus = payload.status ? "failed" : ""
                    if (payload.text && Number(messages[index].type) === 1) {
                        messages[index].text = payload.text
                    }
                }
                messages[index].id = payload.id
                !payload.status && pendingMsgIds.push(payload.key)
            }
            return { ...state, messages, pendingMsgIds }
        },
        upMsgPending (state, { payload: { key, status } }) {
            let pendingMsgIds = state.pendingMsgIds.slice(0)
            let messages = state.messages.slice(0)
            pendingMsgIds = pendingMsgIds.filter((i) => i !== key)
            const index = messages.findIndex((item) => item.key === key)
            index !== -1 && (messages[index].tmpstatus = status ? "failed" : "")
            return { ...state, pendingMsgIds, messages }
        },
        saveHisMsgs (state, { payload }) {
            let messages = state.messages.slice(0)
            let { data, id } = payload
            if (id === "" && messages && messages.length > 0) {
                messages = messages.filter((item) => item.userid !== payload.userid)
            }
            messages = data.reverse().concat(messages)
            return { ...state, messages }
        },
        saveMessages (state, { payload }) {
            let data = ""
            let chats = state.chats.slice(0)
            let wechats = state.wechats.slice(0)
            let messages = state.messages.slice(0)
            const menuFold = state.menuFold
            const wechatsActive = state.wechatsActive
            const _para = {
                chats,
                wechats,
                messages,
                object: payload,
                auth: state.auth,
                chatsActive: state.chatsActive,
            }
            const type = !menuFold ? true : wechatsActive === payload.WeChatId
            data = updateMenuFold({ ..._para, type })
            if (data) {
                chats = data.chats
                messages = data.messages
                wechats = data.wechats
            }
            return { ...state, chats, messages, wechats }
        },
        saveRecords (state, { payload }) {
            let records = state.records.slice(0)
            const { data, nomore, userid } = payload
            const index = records.findIndex((item) => item.userid === userid)
            if (index === -1) {
                records.push({ userid, nomore, contents: data })
            } else {
                records[index].nomore = nomore
                records[index].contents = [...records[index].contents, ...data]
            }
            return { ...state, records }
        },
        saveFastword (state, { payload }) {
            let fastgroup = []
            let getKsy = state.getKsy.slice(0)
            if (payload.fastword && payload.fastgroup) {
                fastgroup = payload.fastgroup
                let fastword = payload.fastword
                if (fastgroup.length && fastword.length) {
                    fastgroup.map((g) => {
                        g.list = []
                        fastword.map((item) => {
                            if (g.groupId === item.groupId) {
                                g.list.push({ id: item.id, text: item.text, title: item.title, type: item.type })
                            }
                        })
                    })
                }
                payload.fastword.map((item) => {
                    getKsy.push({ type: "ksy", text: item.text })
                })
            }
            return { ...state, fastgroup, fastword: payload.fastword, getKsy }
        },
        editFastword (state, { payload }) {
            let fastword = state.fastword.slice(0)
            let fastgroup = state.fastgroup.slice(0)
            const index = fastgroup.findIndex((item) => item.groupId === payload.groupId)
            let words = fastgroup[index].list
            if (words && words.length) {
                const windex = words.findIndex((item) => item.id === payload.id)
                if (windex === -1) {
                    fastgroup.map((item, index) => {
                        const tmpIndex = item.list.findIndex((item) => item.id === payload.id)
                        tmpIndex !== -1 && fastgroup[index].list.splice(tmpIndex, 1)
                    })
                    words.push(payload)
                    fastword.push(payload)
                } else {
                    words[windex] = payload
                    const wordIndex = fastword.findIndex((item) => item.id === payload.id)
                    if (wordIndex !== -1) {
                        fastword[wordIndex] = payload
                    }
                }
                fastgroup[index].list = words
            }
            return { ...state, fastgroup, fastword }
        },
        Delksy (state, { payload }) {
            let fastword = state.fastword.slice(0)
            let fastgroup = state.fastgroup.slice(0)
            const wordIndex = fastword.findIndex((item) => item.id === payload.text_id)
            wordIndex !== -1 && fastword.splice(wordIndex, 1)
            fastgroup.map((item, index) => {
                const tmpIndex = item.list.findIndex((item) => item.id === payload.text_id)
                tmpIndex !== -1 && fastgroup[index].list.splice(tmpIndex, 1)
            })
            return { ...state, fastgroup, fastword }
        },
        searchKsy (state, { payload }) {
            let kaslst = []
            const getKsy = state.getKsy
            const { value } = payload
            if (getKsy && getKsy.length && value) {
                for (let i = 0, len = getKsy.length; i < len; i++) {
                    const item = getKsy[i]
                    const kaylength = kaslst.length
                    let text = item.text
                    if (!text || text.includes("data:image")) {
                        continue
                    }
                    if (kaylength >= 16) {
                        break
                    }
                    if (item.type === "miniapp") {
                        text = "小程序:" + text
                    }
                    if (text.includes(value)) {
                        if (!kaslst.includes("请选择快捷语")) {
                            kaslst.push("请选择快捷语")
                        }
                        const index = kaslst.findIndex((f) => f === text)
                        index === -1 ? kaslst.push(text) : kaslst[index] = text
                    }
                }
            }
            return { ...state, kaslst }
        },
        clearKsy (state) {
            return { ...state, kaslst: [] }
        },
        saveTags (state, { payload }) {
            return { ...state, friendTags: payload }
        },
        saveAllTags (state, { payload }) {
            return { ...state, allTags: payload }
        },
        doAddTag (state, { payload }) {
            let tags = state.allTags.slice(0) || []
            tags.push(payload)
            return { ...state, allTags: tags }
        },
        saveShoppingInfo (state, { payload }) {
            let shoppingInfo = state.shoppingInfo.slice(0)
            if (shoppingInfo.findIndex((item) => item.buyer_name === payload.buyer_name) === -1) {
                shoppingInfo.push(payload)
            }
            return { ...state, shoppingInfo }
        },
        upTag (state, { payload }) {
            let allTags = state.allTags.slice(0)
            let friendTags = []
            payload.tagid.map((item) => {
                let tm = allTags.find((f) => f.id === item)
                friendTags.push(tm)
            })
            return { ...state, friendTags }
        },
        upInfo (state, { payload }) {
            const { option, value, wxid, kefu_wxid } = payload
            let chats = state.chats.slice(0)
            chats.map((item, index) => {
                if (item.wxid === wxid && item.kefu_wxid === kefu_wxid) {
                    switch (option) {
                        case "remark":
                            chats[index].remark = value
                            break
                        case "phone":
                            chats[index].phone = value
                            break
                        default:
                            chats[index].buyer_name = value
                            break
                    }
                }
            })
            return { ...state, chats }
        },
        updateAdd (state, { payload }) {
            const { userid, address, record, realname } = payload
            let chats = state.chats.slice(0)
            let index = chats && chats.length ? chats.findIndex((f) => f.userid === userid) : -1
            if (index !== -1) {
                chats[index].address = address
                chats[index].record = record
                chats[index].realname = realname
            }
            return { ...state, chats }
        },
        upUserInfo (state, { payload }) {
            let chats = state.chats.slice(0)
            const index = chats.findIndex((item) => item.userid === payload.userid)
            if (index !== -1) {
                chats[index] = payload
            }
            return { ...state, chats }
        },
        saveMoments (state, { payload }) {
            let moments = state.moments.slice(0)
            moments = monentLst(moments, payload.list)
            if (moments.length) {
                let time = []
                moments.map((item) => {
                    if (item.createtime) {
                        time = item.createtime.split(" ")
                        item.creTime = time[0].split("-")
                        item.imgLoad = false
                    } else {
                        item.creTime = ["", "", ""]
                    }
                })
            }
            return { ...state, moments }
        },
        clearMoments (state, _) {
            return { ...state, moments: [] }
        },
        saveMonentImg (state, { payload }) {
            let list = state.moments.slice(0)
            if (payload.CircleId && payload.imgs) {
                const fIndex = list.findIndex((item) => Number(item.CircleId) === Number(payload.CircleId))
                if (fIndex !== -1) {
                    list[fIndex].imgLoad = false
                    let imgs = []
                    payload.imgs.map((img) => {
                        imgs.push(img.ThumbImg)
                    })
                    list[fIndex].Images = imgs
                    // list[fIndex].previewShow = true
                    // list[fIndex].previewImg = payload.imgs
                }
            }
            return { ...state, moments: list }
        },
        saveImgload (state, { payload }) {
            let list = state.moments.slice(0)
            if (payload.CircleId) {
                const fIndex = list.findIndex((item) => Number(item.CircleId) === Number(payload.CircleId))
                if (fIndex !== -1) {
                    list[fIndex].imgLoad = true
                }
            }
            return { ...state, moments: list }
        },
        saveRedPackageHis (state, { payload }) {
            return { ...state, redPackageHis: payload }
        },
        saveBigPic (state, { payload }) {
            let messages = state.messages.slice(0)
            const index = messages.findIndex((item) => item.msgSvrId === payload.msgSvrId)
            if (index !== -1) {
                messages[index].bigPic = payload.bigPic || messages[index].url
            }
            return { ...state, messages }
        },
        saveCollection (state, { payload }) {
            return { ...state, collectionMsgs: payload }
        },
        addCollectionMsgs (state, { payload }) {
            let collectionMsgs = state.collectionMsgs.slice(0) || []
            collectionMsgs.push(payload)
            return { ...state, collectionMsgs }
        },
        cutCollectionMsgs (state, { payload }) {
            let collectionMsgs = state.collectionMsgs.slice(0)
            const index = collectionMsgs.findIndex((item) => item.id === payload)
            if (index !== -1) {
                collectionMsgs.splice(index, 1)
            }
            return { ...state, collectionMsgs }
        },
        saveSendTime (state, { payload }) {
            return { ...state, sendTime: payload }
        },
        doDelSendTime (state, { payload }) {
            let sendTime = state.sendTime.slice(0)
            sendTime.splice(sendTime.findIndex((item) => item.id === payload.id), 1)
            return { ...state, sendTime }
        },
        saveAssociationOrders (state, { payload }) {
            return { ...state, associationOrders: payload }
        },
        saveKefu (state, { payload }) {
            return { ...state, kefu: payload }
        },
        doSortFW (state, { payload }) {
            let fastgroup = state.fastgroup.slice(0)
            const index = fastgroup.findIndex((item) => item.groupId === payload.gid)
            let words = fastgroup[index].list
            let newMsgs = []
            payload.ids.map((wd) => {
                newMsgs.push(words[words.findIndex((w) => w.id === wd)])
            })
            fastgroup[index].list = newMsgs
            return { ...state, fastgroup }
        },
        doLiked (state, { payload }) {
            let moments = state.moments.slice(0)
            const { CircleId, IsCancel, FriendId, nickname } = payload
            const index = moments.findIndex((item) => item.CircleId === CircleId)
            if (index !== -1) {
                if (IsCancel) {
                    const dzIndex = moments[index].dianzan_list.findIndex((item) => item.FriendId === FriendId)
                    dzIndex !== -1 && moments[index].dianzan_list.splice(dzIndex)
                } else {
                    moments[index].dianzan_list.push({ id: makeKey(), FriendId, nickname })
                }
            }
            return { ...state, moments }
        },
        doDellComment (state, { payload }) {
            let moments = state.moments.slice(0)
            const { CircleId, id } = payload
            const index = moments.findIndex((item) => item.CircleId === CircleId)
            if (index !== -1) {
                let cIndex = moments[index].comment_list.findIndex((item) => item.id === id)
                if (cIndex !== -1) {
                    let isdelete = moments[index].comment_list[cIndex].isdelete
                    moments[index].comment_list[cIndex].isdelete = isdelete === "0" ? "1" : "0"
                }
            }
            return { ...state, moments }
        },
        doChangeComment (state, { payload }) {
            let moments = state.moments.slice(0)
            const wechats = state.wechats
            const { CircleId, Content, FriendId, WeChatId, id } = payload
            const index = moments.findIndex((item) => item.CircleId === CircleId)
            if (index !== -1) {
                let ReplyCommentId = "0"
                const weindex = wechats.findIndex((item) => item.wxid === WeChatId)
                const nickname = weindex !== -1 ? wechats[weindex].nickname : ""
                if (Number(payload.type) === 1) {
                    ReplyCommentId = payload.ReplyCommentId
                }
                moments[index].comment_list.unshift({ ReplyCommentId, CircleId, content: Content, WeChatId: FriendId, FriendId: WeChatId, id, isdelete: "0", nickname })
            }
            return { ...state, moments }
        },
        addFriendRecord (state, { payload }) {
            return { ...state, addRecord: payload.list, addRecordTotal: payload.total }
        },
        changeChatFid (state, { payload }) {
            let chats = state.chats.slice(0)
            if (chats.length && payload) {
                const findex = chats.findIndex((item) => item.userid === payload.user.userid)
                chats[findex].fid = payload.fid
                if (payload.changeGroup) {
                    chats[findex].hasGroup = true
                }
            }
            return { ...state, chats }
        },
        saveDolist (state, { payload }) {
            const hasDo = !!(payload.list && payload.list.length)
            return { ...state, doList: payload.list, hasDo }
        },
        changeDolist (state, { payload }) {
            let doList = state.doList.slice(0)
            const index = doList.findIndex((item) => item.id === payload.id)
            if (index !== -1) {
                doList.splice(index, 1)
            }
            const hasDo = !!doList.length
            return { ...state, doList, hasDo }
        },
        saveExtend (state, { payload }) {
            return { ...state, extendField: payload }
        },
        changeExtend (state, { payload }) {
            let chats = state.chats.slice(0)
            if (chats && chats.length) {
                const index = chats.findIndex((item) => item.userid === payload.userid)
                if (index !== -1) {
                    chats[index].extend_fields = JSON.stringify(payload.extend_fields)
                }
            }
            return { ...state, chats }
        },
        saveTagGroup (state, { payload }) {
            return { ...state, tagGroup: payload }
        },
        messFail (state, { payload }) {
            let messages = state.messages.slice(0)
            let pendingMsgIds = state.pendingMsgIds.slice(0)
            if (messages.length) {
                const index = messages.findIndex((f) => f.id === payload.id)
                if (index !== -1) {
                    messages[index].tmpstatus = payload.error ? "failed" : ""
                    pendingMsgIds = pendingMsgIds.filter((i) => i !== messages[index].key)
                }
            }
            return { ...state, messages, pendingMsgIds }
        },
        delMess (state, { payload }) {
            let messages = state.messages.slice(0)
            if (messages.length && payload) {
                messages.splice(payload, 1)
            }
            return { ...state, messages }
        },
        // 未读数处理
        unReadActive (state, { payload }) {
            if (!payload) {
                return { ...state }
            }
            let chatsActive = payload.userid
            let chatsWxid = payload.wxid
            let wechats = state.wechats.slice(0)
            let wechatsActive = state.wechatsActive
            let chats = typeof state.chats === "string" ? [] : state.chats.slice(0)
            if (chats && chats.length) {
                const index = chats.findIndex((f) => f.userid === payload.userid)
                index !== -1 ? chats.splice(index, 1) : wechatsActive = payload.kefu_wxid
                if (wechats && wechats.length) {
                    const windex = wechats.findIndex((f) => f.wxid === payload.kefu_wxid)
                    if (windex !== -1) {
                        wechats[windex].unread = Number(wechats[windex].unread) - Number(payload.unread)
                    }
                }
                chats = [{ ...payload, unread: 0 }].concat(chats)
            }
            return { ...state, chatsActive, chatsWxid, chats, wechats, wechatsActive, chatHasMore: true, concatCurrent: 0, messages: [], quns: [], qunsPage: 1 }
        },
        saveMini (state, { payload }) {
            let getKsy = state.getKsy.slice(0)
            let miniList = []
            if (payload && payload.length) {
                for (let i = 0, len = payload.length; i < len; i++) {
                    if (payload[i].content && payload[i].msgid) {
                        try {
                            payload[i].content = JSON.parse(payload[i].content)
                        } catch (error) {
                            payload[i].content = ""
                        }
                        const index = miniList.findIndex((f) => f.msgid === payload[i].msgid)
                        if (index === -1) {
                            miniList.push(payload[i])
                            getKsy.push({ type: "miniapp", text: payload[i].content.Title })
                        }
                    }
                }
            }
            return { ...state, miniList, getKsy }
        },
        DelMiniChange (state, { payload }) {
            let miniList = state.miniList.slice(0)
            const index = miniList.findIndex((f) => f.id === payload)
            index !== -1 && miniList.splice(index, 1)
            return { ...state, miniList }
        },
        changeMini (state, { payload }) {
            let item = {}
            let miniList = state.miniList.slice(0)
            try {
                const { id, type, text } = payload
                if (miniList.length) {
                    const index = miniList.findIndex((f) => f.msgid === id)
                    if (index === -1 && text) {
                        item.id = miniList.length ? Number(miniList[miniList.length - 1].id) + 1 : 1
                        item.content = JSON.parse(text)
                        item.msgid = id
                        item.type = type
                        miniList.unshift(item)
                    }
                }
                return { ...state, miniList }
            } catch (error) {
                return { ...state, miniList }
            }
        },
        doRecall (state, { payload }) {
            let messages = state.messages.slice(0)
            if (messages && messages.length > 0) {
                const index = messages.findIndex((msg) => msg.id === payload)
                if (index !== -1) {
                    messages[index].is_call_back = "1"
                }
            }
            return { ...state, messages }
        },
        doTakeMoney (state, { payload }) {
            let messages = state.messages.slice(0)
            if (messages && messages.length > 0) {
                const index = messages.findIndex((msg) => msg.id === payload.id)
                if (index !== -1) {
                    messages[index] = { ...messages[index], ...payload }
                }
            }
            return { ...state, messages }
        },
        delChat (state, { payload }) {
            const { wxid, kefu_wxid } = payload
            let chats = state.chats.slice(0)
            let chatsActive = state.chatsActive
            if (chats.length) {
                const index = chats.findIndex((f) => f.wxid === wxid && f.kefu_wxid === kefu_wxid)
                if (index !== -1) {
                    chats.splice(index, 1)
                    chatsActive = ""
                }
            }
            return { ...state, chats, chatsActive }
        },
        changeAddNum (state, { payload }) {
            let addNum = state.addNum
            try {
                if (payload) {
                    if (typeof (payload) === "string") {
                        addNum = Number(payload)
                    }
                    if (typeof (payload) === "object" && payload.data) {
                        addNum = addNum + 1
                    }
                }
            } catch (err) {
                addNum = state.addNum
            }

            return { ...state, addNum }
        },
        lessAddNum (state, _) {
            let addNum = state.addNum
            if (addNum > 0) {
                addNum = addNum - 1
            }
            return { ...state, addNum }
        },
        saveOrderVisible (state, { payload: { orderVisible, order_sn } }) {
            return { ...state, orderVisible, order_sn }
        },
        saveBalance (state, { payload: { Balance } }) {
            let auth = state.auth
            auth.Balance = Balance || "0"
            return { ...state, auth }
        },
        upTransfer (state, { payload: { userid, from_zid } }) {
            let chats = state.chats.slice(0)
            const index = chats.findIndex((i) => i.userid === userid)
            index !== -1 && (chats[index].from_zid = from_zid)
            return { ...state, chats }
        },
    },
    effects: {
        // 消息 提醒/免提醒
        * changeAlter ({ payload }, { call, put }) {
            const { data } = yield call(chatService.changeAlter, payload)
            if (data.error) {
                return message.error(data.errMsg)
            }
            message.success("设置成功")
            yield put({ type: "doChangeAlter", payload })
        },
        // 置顶
        * toTop ({ payload }, { call, put }) {
            const { id, type } = payload
            if (type) {
                yield call(chatService.delTop, { userid: id })
            } else {
                yield call(chatService.addTop, { userid: id })
            }
            yield put({ type: "doToTop", payload })
        },
        // 验证token
        * checkToken (_, { put, call }) {
            const id = window.sessionStorage.getItem("id") || ""
            const { data } = yield call(chatService.isLog, { id })
            yield put({ type: "doLog", payload: data })
            if (!data.error) {
                yield put({ type: "changeAddNum", payload: data.data.beinum })
            }
        },
        // 登录
        * log ({ payload }, { call, put }) {
            if (!payload.agree) {
                return message.error("请阅读并同意隐私协议")
            }
            window.localStorage.setItem("agree", true)
            const { data } = yield call(chatService.log, { ...payload })
            if (data.error) {
                return message.error(data.errmsg)
            }
            yield put({ type: "doLog", payload: data })
        },
        // 退出登录
        * logOut ({ payload }, { call, select }) {
            const auth = yield select((state) => state.chat.auth)
            const { data } = yield call(chatService.logOut, { accountnum: auth.accountnum })
            if (data.error) {
                message.error(data.errmsg)
            }
            if (payload) {
                window.sessionStorage.setItem("tui", payload.msg.includes("被修改") ? 3 : 1)
            }
            window.sessionStorage.setItem("id", "")
            window.sessionStorage.setItem("token", "")
            window.location.reload()
        },
        // 页面刷新，关闭时更新lastTime
        * upLastTime (_, { call, select }) {
            const auth = yield select((state) => state.chat.auth)
            yield call(chatService.upLastTime, { accountnum: auth.accountnum })
        },
        // 获取微信号列表
        * fetchWechats ({ payload }, { call, put }) {
            const { data } = yield call(chatService.fetchWechats, { ...payload })
            if (data.error) {
                return
            }
            yield put({ type: "saveWechats", payload: data.data })
        },
        // 获取历史消息
        * fetchRecords (_, { call, put, select }) {
            const chatsActive = yield select((state) => state.chat.chatsActive)
            const records = yield select((state) => state.chat.records)
            const index = records.findIndex((item) => item.userid === chatsActive)
            let pay = { userid: chatsActive, act: "get_friend_msg", size: 15 }
            pay.id = index !== -1 ? records[index].contents[records[index].contents.length - 1].id : ""
            const { data } = yield call(chatService.fetchRecords, { ...pay })
            if (data.error) {
                return
            }
            yield put({ type: "saveRecords", payload: { ...data, userid: pay.userid } })
        },
        // 发送消息
        * sendMessage ({ payload }, { call, put }) {
            let senSitive = false// 敏感词
            if (!payload.key) {
                const key = makeKey()
                const message = {
                    id: key,
                    key,
                    message_id: key,
                    tmpstatus: "",
                    FriendId: payload.tag,
                    WeChatId: payload.device_wxid,
                    userid: payload.userid,
                    addtime: moment(Date.now()).format(format),
                    remark: payload.remark,
                    nick: payload.nick,
                    text: (payload.at || "") + payload.contents,
                    type: `${payload.type}`,
                    status: "0",
                    url: payload.url,
                    accountnum: payload.auth ? payload.auth : "",
                    seconds: payload.seconds,
                }
                yield put({ type: "saveMessages", payload: message })
                payload.key = key
            }
            const { data } = yield call(chatService.sendMessage, payload)
            if (data && data.msg && data.msg.includes("库存序列号不足")) {
                message.error(data.msg)
            }
            if (data && data.msg && data.msg.includes("包含敏感词")) {
                senSitive = true
            }
            if (data && !data.error) {
                messHid = data.hid ? data.hid : ""
            }
            yield put({
                type: "upMsgTmpStatus",
                payload: {
                    id: messHid,
                    key: payload.key,
                    status: data.error,
                    senSitive,
                    text: Number(payload.type) === 1 && data.text,
                },
            })
        },
        * upMsgStatus (_, { call, select, put }) {
            const pendingMsgIds = yield select((state) => state.chat.pendingMsgIds)
            if (pendingMsgIds.length) {
                const messages = yield select((state) => state.chat.messages.slice(0))
                for (let key of pendingMsgIds) {
                    const index = messages.findIndex((mess) => mess.key === key)
                    if (index !== -1) {
                        const addTime = new Date(messages[index].addtime).getTime()
                        const nowTime = new Date().getTime()
                        const overTime = nowTime - addTime >= 30000
                        if (overTime) {
                            const { data } = yield call(chatService.upMsgStatus, { hid: messages[index].id })
                            yield put({ type: "upMsgPending", payload: { key, status: messages[index].id ? data.error : false } })
                        }
                    } else {
                        yield put({ type: "upMsgPending", payload: { key } })
                    }
                }
            }
        },
        // 添加消息
        * addMsg ({ payload }, { put }) {
            const message = {
                userid: payload.userid,
                id: payload.key,
                key: payload.key,
                message_id: payload.key,
                tmpstatus: "",
                FriendId: payload.tag,
                WeChatId: payload.device_wxid,
                addtime: moment(Date.now()).format(format),
                text: payload.contents,
                type: `${payload.type}`,
                status: "0",
                url: payload.url,
                appid: payload.id ? payload.id : "",
                seconds: payload.seconds,
            }
            yield put({ type: "saveMessages", payload: message })
        },
        // 发红包
        * sedRendPackage ({ payload }, { call, put, select }) {
            const auth = yield select((state) => state.chat.auth)
            if (!auth.uid || !auth.user) {
                return message.error("发放失败！")
            }
            let his = window.localStorage.getItem("redPackageHis")
            let rhis = []
            if (his) {
                rhis = JSON.parse(his)
                const index = rhis.findIndex((item) => item === payload.money)
                if (rhis.length >= 5) {
                    if (index === -1) {
                        rhis.splice(0, 1)
                        rhis.push(payload.money)
                    }
                } else {
                    if (index === -1) {
                        rhis.push(payload.money)
                    }
                }
            } else {
                rhis.push(payload.money)
            }
            window.localStorage.setItem("redPackageHis", JSON.stringify(rhis))
            yield put({ type: "saveRedPackageHis", payload: rhis })
            payload.uid = auth.uid
            payload.user = auth.user
            payload.id = auth.id
            payload.crm_user_name = auth.crm_user_name
            payload.ziaccountname = auth.accountnum
            payload.kfnickname = ""
            payload.is_redpack = 1
            payload.scrm_url = "http://wxx.jutaobao.cc/yunbei_send_redpack/qr_code.php?code=1"
            const { data } = yield call(chatService.scrmUrl, payload)
            if (data.error) {
                return message.error(data.errmsg)
            }
            const _type = Number(data.send_style)
            const yunbei_send_record_id = data.yunbei_send_record_id || ""
            if (_type) {
                const _para = { auth: auth.accountnum, yunbei_send_record_id, tag: payload.wxid, device_wxid: payload.devicid, userid: payload.userid }
                const _sendPayload = {
                    1: { type: 2, url: data.url, ..._para },
                    2: {
                        type: 6, url: data.REurl, ..._para,
                        contents: JSON.stringify({
                            title: `点击领取你的红包 ￥${payload.money}`, desc: "红包将在24小时后过期，请及时领取", url: data.REurl,
                            thumb: "https://wechat.yunbeisoft.com/redpack.jpg",
                        }),
                    },
                }
                const sendPaylod = _sendPayload[_type]
                if (!sendPaylod) {
                    return
                }
                yield put({
                    type: "sendMessage",
                    payload: sendPaylod,
                })
            }
        },
        // 获取快捷语
        * fetchFastWord ({ payload }, { call, put, select }) {
            const auth = yield select((state) => state.chat.auth)
            let fastword = yield select((state) => state.chat.fastword)
            const aid = auth.aid
            if (!aid) {
                return
            }
            if (!payload.change) {
                const fast = yield call(chatService.fetchFastWord, { aid: aid, isdisplay: 1 })
                fastword = !fast.data.error ? fast.data.data : []
            }
            const { data } = yield call(chatService.getGroup, { aid: aid, isgroup: 1, hsgroup_type: payload.hsgroup_type })
            if (data.error) {
                return
            }
            yield put({ type: "saveFastword", payload: { fastword, fastgroup: data.data } })
        },
        * fetchWechatTags ({ payload }, { call, put }) {
            const { data } = yield call(chatService.fetchWechatTags, payload)
            if (data.error) {
                return
            }
            yield put({ type: "saveWechatTags", payload: { data: data.data, userid: payload.userid } })
        },
        * fetchTags ({ payload }, { call, put }) {
            const { data } = yield call(chatService.fetchTags, payload)
            if (data.error) {
                return
            }
            yield put({ type: "saveTags", payload: data.data })
        },
        * fetchAllTags ({ payload }, { call, put, select }) {
            const auth = yield select((state) => state.chat.auth)
            const aid = auth.aid
            if (!aid) {
                return
            }
            const { data } = yield call(chatService.fetchAllTags, { aid })
            yield put({ type: "saveAllTags", payload: data.data })
        },
        // 获取购物信息
        * fetchShoppingInfo ({ payload }, { call, put, select }) {
            const auth = yield select((state) => state.chat.auth)
            const name = auth.crm_user_name
            if (!name) {
                return
            }
            const { data } = yield call(chatService.scrmUrl, { name, buyer_name: payload, scrm_url: "http://wxx.jutaobao.cc/wxGroupCtrl/index.php" })
            if (data.error) {
                return
            }
            yield put({
                type: "saveShoppingInfo",
                payload: { buyer_name: payload, amount: data.amount, goods: data.goods, last_time: data.last_time, recent: data.recent, total: data.total },
            })
        },
        // 获取最近订单
        * fetchOrders ({ payload }, { call, put, select }) {
            const auth = yield select((state) => state.chat.auth)
            const username = auth.crm_user_name
            const uniacid = auth.uniacid
            if (!username && !uniacid) {
                return
            }
            const { data } = yield call(chatService.scrmUrl, { buyer_name: payload, num: "5", username, uniacid, scrm_url: "http://wxx.jutaobao.cc/getOrderMsg/index.php" })
            if (data.error) {
                return
            }
            yield put({ type: "saveOrders", payload: { buyer_name: payload, data: data.data } })
        },
        // 修改群名
        * editQun ({ payload }, { call, put }) {
            const { oldVal, newVal, userid } = payload
            yield put({ type: "upQun", payload: { userid, remark: newVal } })
            const { data } = yield call(chatService.editQun, { userid: userid, nickname: newVal })
            if (data.error) {
                message.error(data.errmsg)
                yield put({ type: "upQun", payload: { userid, remark: oldVal } })
            }
        },
        // 退群
        * logOutQun ({ payload }, { call, put }) {
            const { data } = yield call(chatService.logOutQun, payload)
            if (data.error) {
                return message.error(data.errmsg)
            }
            yield put({ type: "outQun", payload })
        },
        // 群内踢人
        * outQuns ({ payload }, { call, put }) {
            const { data } = yield call(chatService.outQun, payload)
            if (data.error) {
                return message.error(data.errmsg)
            }
            yield put({ type: "doOutQun", payload })
        },
        // 修改客户资料（备注，手机，旺旺）
        * editInfo ({ payload }, { call, put }) {
            const { option, changeValue, wxid, kefu_wxid } = payload
            const changePayload = { option, value: changeValue, wxid, kefu_wxid }
            const { data } = yield call(chatService.updateInfo, changePayload)
            if (!data.error) {
                yield put({ type: "upInfo", payload: changePayload })
            } else {
                return message.error(data.errmsg)
            }
        },
        // 修改客户标签（添加，删除）
        * editTag ({ payload }, { call, put }) {
            const { data } = yield call(chatService.editTag, { ...payload })
            if (!data.error) {
                yield put({ type: "upTag", payload })
            }
        },
        // 添加标签
        * addTag ({ payload }, { call, put }) {
            const { data } = yield call(chatService.addTag, payload)
            if (data.error) {
                return message.error(data.errmsg)
            }
            yield put({
                type: "doAddTag",
                payload: { id: data.data.tagid, tag_name: payload.tag_name, zid: payload.fzid },
            })
        },
        // 获取联系人标签
        * fetchUserTags ({ payload }, { call, put }) {
            const { data } = yield call(chatService.fetchUserTags, payload)
            if (data.error) {
                return
            }
            yield put({ type: "upTag", payload: { ...payload, tagid: data.tagid } })
        },
        * fetchUserInfo ({ payload }, { call, put }) {
            const { data } = yield call(chatService.fetchUserInfo, payload)
            if (data.error) {
                return
            }
            yield put({ type: "upUserInfo", payload: { ...data.data } })
            return data.data
        },
        * getBigPic ({ payload }, { call, put }) {
            const { data } = yield call(chatService.getBigPic, payload)
            if (data.error) {
                return
            }
            yield put({
                type: "saveBigPic",
                payload: { msgSvrId: payload.message_id, bigPic: data.data.Content },
            })
        },
        // 添加好友
        * addChat ({ payload }, { call }) {
            const { data } = yield call(chatService.addChat, payload)
            if (data.error) {
                return message.error(data.errmsg)
            } else {
                return message.success("发送成功")
            }
        },
        // 群内加人
        * addGroupChat ({ payload }, { call }) {
            const { data } = yield call(chatService.addGroupChat, payload)
            if (data.error) {
                return message.error(data.errmsg)
            } else {
                return message.success("发送成功")
            }
        },
        // 获取更新日志
        * fetchLog (_, { call, put }) {
            const { data } = yield call(chatService.fetchLog, { type: 1, pagezise: 5 })
            if (data.error) {
                return
            }
            yield put({ type: "saveLog", payload: data.data })
        },
        // 获取收藏信息
        * fetchCollection (_, { call, put, select }) {
            const auth = yield select((state) => state.chat.auth)
            if (!auth) {
                return
            }
            const { data } = yield call(chatService.fetchCollection, { kefuid: auth.id })
            if (data.error) {
                return
            }
            yield put({ type: "saveCollection", payload: data.data })
        },
        // 一键收藏
        * addCollection ({ payload }, { call, put, select }) {
            const auth = yield select((state) => state.chat.auth)
            const chatsActive = yield select((state) => state.chat.chatsActive)
            const { data } = yield call(chatService.addCollection, { kefuid: auth.id, ...payload, accountnum: auth.accountnum, userid: chatsActive, aid: auth.aid })
            if (data.error) {
                return message.error("收藏失败！")
            }
            yield put({ type: "addCollectionMsgs", payload: data.data })
        },
        * cutCollection ({ payload }, { call, put }) {
            const { data } = yield call(chatService.cutCollection, { id: payload })
            if (data.error) {
                return message.error("删除失败！")
            }
            yield put({ type: "cutCollectionMsgs", payload })
        },
        * sendTime ({ payload }, { call, put }) {
            const { data } = yield call(chatService.sendTime, payload)
            if (data.error) {
                return message.error("设置失败！")
            }
        },
        * fetchSendTime ({ payload }, { call, put }) {
            const { data } = yield call(chatService.fetchSendTime, payload)
            if (data.error) {
                return
            }
            yield put({ type: "saveSendTime", payload: data.data })
        },
        * delSendTime ({ payload }, { call, put }) {
            const { data } = yield call(chatService.delSendTime, payload)
            if (data.error) {
                return message.error("删除失败！")
            }
            yield put({ type: "doDelSendTime", payload })
        },
        * upUnread ({ payload }, { call, put }) {
            yield put({ type: "unReadActive", payload })
            yield call(chatService.upChatLastTime, { userid: payload.userid.replace("q", "") })
        },
        * upChatsActive ({ payload }, { call, put }) {
            yield put({ type: "changeChatsActive", payload })
            yield call(chatService.upChatLastTime, { userid: payload.userid.replace("q", "") })
        },
        // 获取红包关联订单
        * fetchAssociationOrders ({ payload }, { put, call, select }) {
            const auth = yield select((state) => state.chat.auth)
            const { data } = yield call(chatService.scrmUrl, { ...payload, uniacid: auth.uniacid, scrm_url: "http://wxx.jutaobao.cc/getOrderMsg/index.php" })
            if (data.error) {
                return
            }
            yield put({ type: "saveAssociationOrders", payload: data.data })
        },
        // 添加快捷语
        * addKsy ({ payload }, { put, call }) {
            const { data } = yield call(chatService.addKsy, payload)
            if (data.error) {
                return message.error(data.errmsg)
            }
            yield put({ type: "editFastword", payload: { ...payload, id: data.text_id } })
            return message.success("添加成功")
        },
        // 编辑快捷语
        * editKsy ({ payload }, { put, call }) {
            const { data } = yield call(chatService.editKsy, { ...payload, text_id: payload.id })
            if (data.error) {
                return message.error(data.errmsg)
            }
            yield put({ type: "editFastword", payload })
            return message.success("修改成功")
        },
        * fetchKefu (_, { put, call, select }) {
            const auth = yield select((state) => state.chat.auth)
            const { data } = yield call(chatService.fetchKefu, { aid: auth.aid })
            if (data.errmsg) {
                return
            }
            yield put({ type: "saveKefu", payload: data.data })
        },
        * sortFastWord ({ payload }, { put, call, select }) {
            const auth = yield select((state) => state.chat.auth)
            yield call(chatService.sortFastWord, { aid: auth.id, ...payload })
            yield put({ type: "doSortFW", payload })
        },
        * customShare ({ payload }, { put, call, select }) {
            const { data } = yield call(chatService.customShare, { ...payload })
            if (data.error) {
                return message.error(data.errmsg)
            }
            const auth = yield select((state) => state.chat.auth)
            yield put({
                type: "upTransfer",
                payload: { userid: payload.userid, from_zid: auth.id },
            })
            return message.success(data.errmsg)
        },
        // 更新朋友圈
        * momentsUpdate ({ payload }, { put, call }) {
            let para = {
                userid: payload.userid,
                StartTime: payload.StartTime,
            }
            const { data } = yield call(chatService.momentsUpdate, { ...para })
            if (data.error) {
                return
            }
            if (payload.type === "new") {
                yield put({ type: "upMoments", payload: { ...payload, isUpdate: true } })
            } else {
                yield put({ type: "upMonentOld", payload: { update: true } })
            }
        },
        // 添加快捷语
        * addGroup ({ payload }, { put, call, select }) {
            const { aid } = yield select((state) => state.chat.auth)
            const { data } = yield call(chatService.addGroup, { aid, isDisplay: 1, ...payload })
            if (data.error) {
                return message.error(data.errmsg)
            }
            return message.success("添加成功")
        },
        // 删除快捷语
        * delKsy ({ payload }, { put, call }) {
            const { data } = yield call(chatService.delKsy, { ...payload })
            if (data.error) {
                return message.error(data.errmsg)
            }
            yield put({ type: "Delksy", payload })
            return message.success("删除成功")
        },
        // 修改备忘录地址
        * updateAddress ({ payload }, { put, call }) {

            const { data } = yield call(chatService.updateAddress, { ...payload })
            if (data.error) {
                return message.error(data.errmsg)
            }
            yield put({ type: "updateAdd", payload })
        },
        // 朋友圈点赞
        * doLike ({ payload }, { put, call }) {
            yield put({ type: "doLiked", payload })
            const { data } = yield call(chatService.doLike, { ...payload })
            if (data.error) {
                message.error(data.errMsg)
                yield put({ type: "doLiked", payload: { ...payload, IsCancel: payload.IsCancel ? 0 : 1 } })
            }
        },
        // 朋友圈删除评论
        * delComment ({ payload }, { put, call }) {
            yield put({ type: "doDellComment", payload })
            const { data } = yield call(chatService.delComment, { WeChatId: payload.WeChatId, id: payload.id })
            if (data.error) {
                message.error(data.errMsg)
                yield put({ type: "doDellComment", payload })
            }
        },
        // 朋友圈评论
        * doComment ({ payload }, { put, call }) {
            const { data } = yield call(chatService.doComment, { ...payload })
            if (!data.error) {
                payload.id = data.comments_id
                yield put({ type: "doChangeComment", payload })
                return
            }
            return message.error(data.errMsg)
        },
        // 获取朋友圈图片
        * getMomentImg ({ payload }, { put, call }) {
            const { data } = yield call(chatService.getMomentImg, { ...payload })
            if (data.error) {
                return
            }
            yield put({ type: "saveImgload", payload })
        },
        * fetchaddFriend ({ payload }, { put, call }) {
            const { data } = yield call(chatService.fetchaddFriend, { ...payload })
            if (data.error) {
                return message.error(data.errMsg)
            }
            yield put({ type: "addFriendRecord", payload: { list: data.data, total: Number(data.total) } })
        },
        * fetchFolder ({ payload }, { put, call }) {
            const { data } = yield call(chatService.fetchFolder, payload)
            if (data.error) {
                return
            }
            yield put({ type: "saveFolder", payload: data.data })
        },
        * addFile ({ payload }, { put, call }) {
            const { data } = yield call(chatService.addFile, { ...payload })
            if (data.error) {
                return
            }
            payload.id = data.id
            yield put({ type: "addFolder", payload })
        },
        * deleteFile ({ payload }, { put, call }) {
            const { data } = yield call(chatService.deleteFile, { ...payload })
            if (data.error) {
                return
            }
            payload.type = "delFile"
            yield put({ type: "changeFolder", payload })
        },
        * updateFileName ({ payload }, { put, call }) {
            const { data } = yield call(chatService.updateFileName, { ...payload })
            if (data.error) {
                return
            }
            yield put({ type: "changeFolder", payload })
        },
        * fetchDolist ({ payload }, { put, call }) {
            const { data } = yield call(chatService.getRecord, { ...payload })
            if (data.error) {
                return
            }
            yield put({ type: "saveDolist", payload: { list: data.data } })
        },
        * deleteRecord ({ payload }, { put, call }) {
            const { data } = yield call(chatService.deleteRecord, { ...payload })
            if (data.error) {
                return message.error(data.errMsg)
            }
            yield put({ type: "changeDolist", payload })
        },
        * addDolist ({ payload }, { put, call }) {
            const { data } = yield call(chatService.addRecord, { ...payload })
            if (data.error) {
                return message.error(data.errMsg)
            }
        },
        * fetchGroups (_, { put, call }) {
            const { data } = yield call(chatService.getGroups, {})
            if (data.error) {
                return
            }
            yield put({ type: "saveGroups", payload: data.data })
        },
        * readAll ({ payload }, { put, call }) {
            const { data } = yield call(chatService.readAll, payload)
            yield put({ type: "upReadNum", payload })
            if (data.error) {
                return message.error(data.errMsg)
            }
        },
        // 扩展字段
        * extendField ({ payload }, { put, call }) {
            const { data } = yield call(chatService.extendField, { status: 1 })
            if (data.error) {
                return
            }
            yield put({ type: "saveExtend", payload: data.data })
        },
        * editfriendfield ({ payload }, { put, call }) {
            let userid = payload.userid
            if (userid.includes("q")) {
                userid = userid.replace("q", "")
            }
            const { data } = yield call(chatService.editfriendfield, { ...payload, userid })
            if (data.error) {
                return message.error(data.errMsg)
            }
            yield put({ type: "changeExtend", payload })
        },
        * gettaggfenzu ({ payload }, { put, call, select }) {
            const auth = yield select((state) => state.chat.auth)
            const aid = auth.aid
            if (!aid) {
                return
            }
            const { data } = yield call(chatService.gettaggfenzu, { aid })
            if (data.error) {
                return message.error(data.errmsg)
            }
            yield put({ type: "saveTagGroup", payload: data.data })
        },
        * changeSkin (_, { put, call, select }) {
            const auth = yield select((state) => state.chat.auth)
            const theme = auth.theme ? 0 : 1
            yield call(chatService.changeSkin, { theme })
            window.location.reload()
        },
        * fetchNewMsg (_, { put, call, select }) {
            if (fetch) {
                return
            }
            const isLog = yield select((state) => state.chat.isLog)
            if (!isLog) {
                return
            }

            fetch = true
            const menuFold = yield select((state) => state.chat.menuFold)
            const kefu_wxid = yield select((state) => state.chat.wechatsActive)
            const userid = yield select((state) => state.chat.chatsActive)
            const typeOf = yield select((state) => state.chat.sidebarActive)
            const { data } = yield call(chatService.fetchNewMsg, { id: id, type: menuFold ? 1 : 2, kefu_wxid, userid, typeOf })
            if (!data || data.error) {
                fetch = false
                return
            }
            id = data && data.hid || ""
            yield put({ type: "upNewMsg", payload: data })
        },
        * fetchFriendMsg (_, { put, call, select }) {
            if (messFetch) {
                return
            }
            const userid = yield select((state) => state.chat.chatsActive)
            const wxid = yield select((state) => state.chat.chatsWxid)
            const kefu_wxid = yield select((state) => state.chat.hasKefuid)
            if (!userid || !wxid || !kefu_wxid) {
                return
            }
            messHid = ""
            let messages = yield select((state) => state.chat.messages)
            if (messages && messages.length > 0) {
                let msgs = messages.filter((item) => item.id) || []
                if (msgs && msgs.length > 0) {
                    messHid = msgs[msgs.length - 1].id
                }
            }
            // if (!messages.length) {
            //     messHid = ""
            //     return
            // }
            // if (!messHid) {
            //     messHid = messages[messages.length - 1].id
            // }
            let payload = { kefu_wxid, userid, wxid, id: messHid }
            messFetch = true
            const { data } = yield call(chatService.fetchFriendMsg, { ...payload })
            if (!data || data.error) {
                messFetch = false
                return
            }
            yield put({ type: "upMess", payload: data.data })
        },
        * fetchCustom (_, { put, call }) {
            const { data } = yield call(chatService.fetchCustomExpress, {})
            if (data.error) {
                return
            }
            yield put({ type: "saveCustom", payload: data.data })
        },
        * addCustom ({ payload }, { put, call }) {
            const { data } = yield call(chatService.addCustom, payload)
            if (data.error) {
                return message.error(data.errmsg)
            }
            message.success(data.errmsg)
            yield put({ type: "updateCustom", payload: data.data })
        },
        * cutCustom ({ payload }, { put, call }) {
            const { data } = yield call(chatService.cutCustom, payload)
            if (data.error) {
                return message.error(data.errmsg)
            }
            yield put({ type: "updateCustom", payload: data.data })
        },
        * fetchGroupUpdate (_, { put, call, select }) {
            const sidebarActive = yield select((state) => state.chat.sidebarActive)
            if (sidebarActive !== "qun" || groupFetch) {
                return
            }
            const kefu_wxid = yield select((state) => state.chat.wechatsActive)
            groupFetch = true
            const { data } = yield call(chatService.fetchGroupUpdate, { kefu_wxid })
            if (!data || data.error) {
                groupFetch = false
                return
            }
            yield put({ type: "updateGroup", payload: data })
        },
        * fetchGroupMemberUpdate (_, { put, call, select }) {
            const chatsActive = yield select((state) => state.chat.chatsActive)
            if (chatsActive.indexOf("q") === -1 || groupMemberFetch) {
                return
            }
            groupMemberFetch = true
            const kefu_wxid = yield select((state) => state.chat.wechatsActive)
            const { data } = yield call(chatService.fetchGroupMemberUpdate, { userid: chatsActive, kefu_wxid })
            if (!data || data.error) {
                groupMemberFetch = false
                return
            }
            yield put({ type: "updateGroupMember", payload: { data: data.data, userid: chatsActive } })
        },
        * freshGroup ({ payload }, { put, call }) {
            const { data } = yield call(chatService.freshGroup, payload)
            if (data.error) {
                return message.error(data.errmsg)
            }
        },
        * addQuns ({ payload }, { put, call }) {
            yield call(chatService.addQun, payload)
        },
        * collectMini ({ payload }, { put, call, select }) {
            const { data } = yield call(chatService.collectMini, { msgId: payload.msgId })
            if (!data.error) {
                yield put({ type: "changeMini", payload: payload.item })
                return message.success("收藏成功")
            }
        },
        * getCollect ({ payload }, { put, call }) {
            const { data } = yield call(chatService.getCollect, payload)
            if (!data.error) {
                yield put({ type: "saveMini", payload: data.data })
            }
        },
        * DelMini ({ payload }, { put, call }) {
            const { data } = yield call(chatService.DelMini, { ...payload })
            if (!data.error) {
                yield put({ type: "DelMiniChange", payload: payload.id })
            }

        },
        * qunsAddFriends ({ payload }, { put, call }) {
            const { data } = yield call(chatService.qunsAddFriends, { ...payload })
            if (data.error) {
                return message.error(data.errmsg)
            } else {
                return message.success(data.errmsg)
            }
        },
        * addCard ({ payload }, { put, call }) {
            const { data } = yield call(chatService.addFriend_card, { ...payload })
            if (data.error) {
                return message.error(data.errmsg)
            } else {
                return message.success("成功")
            }
        },
        * takeMoney ({ payload }, { call }) {
            const { data } = yield call(chatService.takeMoney, payload)
            if (data.error) {
                return message.error(data.errMsg)
            } else {
                return message.success("请求成功")
            }
        },
        * recall ({ payload }, { put, call }) {
            const { data } = yield call(chatService.recall, payload)
            if (data.error) {
                return message.error(data.errmsg)
            } else {
                yield put({ type: "doRecall", payload: payload.hid })
            }
        },
        * toText ({ payload }, { put, call }) {
            const { data } = yield call(chatService.toText, payload)
            if (data.error) {
                return message.error(data.msg)
            } else {
                yield put({
                    type: "doTakeMoney", payload: {
                        ...payload,
                        toText: data.data,
                    },
                })
            }
        },

        // 删除好友
        * delFirend ({ payload }, { put, call }) {
            const { data } = yield call(chatService.delFriend, payload)
            if (!data.error) {
                yield put({
                    type: "delChat",
                    payload,
                })
                return message.success("删除成功")
            } else {
                return message.error(data.msg)
            }
        },
        // 获取公众号余额
        * fetchBalance ({ payload }, { put, call }) {
            const { data } = yield call(chatService.getBalance, payload)
            if (!data.error) {
                yield put({
                    type: "saveBalance",
                    payload: data.data,
                })
            }
        },
    },
    subscriptions: {
        setup ({ dispatch, history, query }) {
            return history.listen(async ({ pathname, search, query }) => {
                if (query && query.id && query.token) {
                    await window.sessionStorage.setItem("id", query.id)
                    await window.sessionStorage.setItem("token", query.token)
                }
                await dispatch({ type: "checkToken" })
                if (testSubstr(pathname, "/web")) {
                    await dispatch({ type: "upSidebarActive", payload: query.p })
                    await dispatch({ type: "checkToken" })
                    const reconnect = () => {
                        if (lockReconnect) {
                            return
                        }
                        lockReconnect = true
                        setTimeout(() => {
                            createSocket()
                            lockReconnect = false
                        }, 5000)
                    }
                    const initSocket = () => {
                        ws.onopen = (evt) => {
                            heartCheck.reset().start()
                        }
                        ws.onmessage = (evt) => {
                            heartCheck.reset().start()
                            let payload
                            try {
                                payload = JSON.parse(evt.data)
                            } catch (error) {
                                payload = ""
                            }

                            if (payload && "act" in payload && payload.act) {
                                switch (payload.act) {
                                    case "friends_add":
                                        dispatch({ type: "changeAddNum", payload })
                                        break
                                    case "ping":
                                        send(ws, { act: "pong" })
                                        break
                                    case "file_address":
                                        if (payload.data.url) {
                                            window.location.href = payload.data.url
                                        }
                                        break
                                    case "bei_login_out":
                                        dispatch({ type: "logOut", payload})
                                        break
                                    case "msg_result":
                                        dispatch({ type: "messFail", payload })
                                        break
                                    case "tui_msg":
                                        if (payload.contents.act === "new_circle") {
                                            const list = payload.contents.Circle ? payload.contents.Circle : []
                                            const isStop = !!payload.contents.Circle
                                            dispatch({ type: "saveMoments", payload: { list } })
                                            dispatch({ type: "upMoments", payload: { userid: payload.contents.userid, isUpdate: false } })
                                            dispatch({ type: "upMonentOld", payload: { update: false, isStop } })

                                            dispatch({ type: "moment/upMonentOld", payload: { loading: false, stopMoment: true } })
                                            dispatch({ type: "moment/deviceUpdate", payload: { loading: false, WeChatId: payload.contents.WeChatId } })
                                            dispatch({ type: "moment/saveMoments", payload: { list: payload.contents.Circle ? payload.contents.Circle : [], loading: false } })
                                            return
                                        }
                                        // dispatch({ type: "fetchNewMsg" })
                                        // dispatch({ type: "fetchFriendMsg" })
                                        if (payload.contents.status === "1") {
                                            dispatch({ type: "pushMsg" })
                                        }
                                        break
                                    case "redpack_img":
                                        if (payload.Success) {
                                            dispatch({
                                                type: "doTakeMoney",
                                                payload: {
                                                    id: payload.hid,
                                                    redpack_status: "1",
                                                    money: payload.Amount,
                                                },
                                            })
                                        } else {
                                            return message.error("领取失败")
                                        }
                                        break
                                    case "tui_qun_msg":
                                        if (payload.contents.status === "1") {
                                            dispatch({ type: "pushMsg" })
                                        }
                                        break
                                    case "group_update":
                                        dispatch({ type: "fetchGroupUpdate" })
                                        break
                                    case "group_member_update":
                                        dispatch({ type: "fetchGroupMemberUpdate" })
                                        break
                                    case "offline_device":
                                        message.warning("你已有设备断开连接，请检查设备！")
                                        break
                                    case "online_device":
                                        message.info("您有新的设备连接，请手动刷新！")
                                        break
                                    case "device_circle":
                                        dispatch({ type: "moment/upMonentOld", payload: { loading: false, stopMoment: !!payload.Circle } })
                                        dispatch({ type: "moment/deviceUpdate", payload: { loading: false, WeChatId: payload.WeChatId } })
                                        dispatch({ type: "moment/saveMoments", payload: { list: payload.Circle ? payload.Circle : [], loading: false } })
                                        break
                                    case "circle_img":
                                        dispatch({ type: "saveMonentImg", payload: { CircleId: payload.CircleId, imgs: payload.Images } })
                                        dispatch({ type: "moment/saveMonentImg", payload: { CircleId: payload.CircleId, WeChatId: payload.WeChatId, imgs: payload.Images } })
                                        break
                                    case "tui_fresh_qun_msg":
                                        message.success("群组信息刷新成功")
                                        break
                                    default: break
                                }
                            }
                        }
                        ws.onclose = () => {
                            reconnect()
                        }
                    }
                    const createSocket = () => {
                        try {
                            ws = new WebSocket(`${ip}?token=${window.sessionStorage.getItem("token")}`)
                            initSocket()
                        } catch (e) {
                            reconnect()
                        }
                    }
                    if (window.sessionStorage.getItem("token")) {
                        if (ws === "") {
                            createSocket()
                        }
                    } else {
                        if (ws) {
                            ws.close()
                        }
                    }
                    dispatch({ type: "fetchLog" })
                    dispatch({ type: "fetchDolist", payload: {} })
                    let his = window.localStorage.getItem("redPackageHis")
                    his = his ? JSON.parse(his) : []
                    dispatch({ type: "saveRedPackageHis", payload: his })
                }
            })
        },
    },
}
