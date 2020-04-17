import * as chatService from "../services/service"
import { message } from "antd"
export default {
    namespace: "contact",
    state: {
        // type: "",
        groups: [],
        // contacts: [],
        // page: 1,
        // contactHasMore: [],
    },
    reducers: {
        saveGroups (state, { payload }) {
            let groups = []
            // let contacts = state.contacts.slice(0)
            // let contactHasMore = state.contactHasMore.slice(0)
            // let type = state.type
            // if ((type === "all" || payload.type === "all") && type !== payload.type) {
            //     contacts = []
            //     contactHasMore = []
            // }
            payload.data.map((item) => {
                groups.push({ fid: String(item.id), fname: item.fenzu_name, number: Number(item.number) })
            })
            return { ...state, groups }
        },
        // saveContacts (state, { payload }) {
        //     let contacts = state.contacts.slice(0)
        //     let contactHasMore = state.contactHasMore.slice(0)
        //     const { page, type, data, hasMore, fid } = payload
        //     if (contacts && contacts.length > 0) {
        //         data.map((item) => {
        //             if (contacts.findIndex((user) => user.userid === item.userid) === -1) {
        //                 contacts.push(item)
        //             }
        //         })
        //     } else {
        //         contacts = data
        //     }
        //     if (contactHasMore && contactHasMore.length > 0) {
        //         let index = contactHasMore.findIndex((item) => item.type === type)
        //         if (index === -1) {
        //             contactHasMore.push({ type, hasMore: [{ fid, page, hasMore }] })
        //         } else {
        //             let hm = contactHasMore[index].hasMore
        //             let hindex = hm.findIndex((item) => item.fid === fid)
        //             if (hindex === -1) {
        //                 contactHasMore[index].hasMore.push({ fid, page, hasMore })
        //             } else {
        //                 contactHasMore[index].hasMore[hindex] = { fid, page, hasMore }
        //             }
        //         }
        //     } else {
        //         contactHasMore.push({ type, hasMore: [{ fid, page, hasMore }] })
        //     }
        //     return { ...state, contacts, contactHasMore }
        // },
        doChangeGroups (state, { payload }) {
            let groups = state.groups.slice(0)
            if (groups.length && payload) {
                groups[payload.index].number = groups[payload.index].number > 0 ? groups[payload.index].number - 1 : 0
                const newIndex = groups.findIndex((item) => item.fid === payload.fid)
                if (newIndex !== -1) {
                    groups[newIndex].number += 1
                }
            }
            return { ...state, groups }
        },
        doGroupToTop (state, { payload }) {
            let groups = state.groups.slice(0)
            const { id } = payload
            const index = groups.findIndex((item) => item.fid === id)
            if (index !== -1) {
                const top = groups[index]
                groups.splice(index, 1)
                groups = [top].concat(groups)
            }
            return { ...state, groups }
        },
    },
    effects: {
        // 获取好友分组
        * fetchGroups ({ payload }, { call, put, select }) {
            const auth = yield select((state) => state.chat.auth)
            const { data } = yield call(chatService.fetchGroups, { ...payload, zid: auth.id })
            if (data.error) {
                return
            }
            yield put({ type: "saveGroups", payload: { data: data.data, type: payload.type } })
        },
        // 移动联系人分组
        * changeGroups ({ payload }, { call, put }) {
            let { uid, fid } = payload
            const { data } = yield call(chatService.changeGroups, { uid, fid })
            if (data.error) {
                return message.error(data.errmsg)
            }
            yield put({ type: "doChangeGroups", payload })
        },
        // 分组置顶
        * groupToTop ({ payload }, { call, put }) {
            const { data } = yield call(chatService.groupToTop, payload)
            if (data.error) {
                return message.error(data.errmsg)
            }
            yield put({ type: "doGroupToTop", payload })
        },
    },
    subscriptions: {},
}
