import * as chatService from "../services/service"
import { message } from "antd"
export default {
    namespace: "custom",
    state: {
        customLst: [],
        usergroup: [],
        customTotal: 0,
        loading: false,
        recordLst: [],
        recordLoading: false,
        recordnoMore: 0,
    },
    reducers: {
        saveCustom (state, { payload }) {
            return { ...state, customLst: payload.lst, customTotal: payload.total, loading: payload.loading, customPara: payload.customPara }
        },
        changeCustom (state, { payload }) {
            let lst = state.customLst.slice(0)
            if (lst.length && payload) {
                let fIndex = lst.findIndex((item) => item.userid === payload.userid)
                if (fIndex !== -1) {
                    switch (payload.action) {
                        case "remark":
                            lst[fIndex].remark = payload.value
                            break
                        case "phone":
                            lst[fIndex].phone = payload.value
                            break
                        case "wang":
                            lst[fIndex].buyer_name = payload.value
                            break
                        case "address":
                            lst[fIndex].address = payload.value
                            break
                        default:
                            lst[fIndex].record = payload.value
                            break
                    }
                }
            }
            return { ...state, customLst: lst }
        },
        saveGroups (state, { payload }) {
            return { ...state, usergroup: payload.data }
        },
        changeGroup (state, { payload }) {
            let list = state.customLst.slice(0)
            if (list.length && payload) {
                let fIndex = list.findIndex((item) => item.userid === payload.uid)
                if (fIndex !== -1) {
                    list[fIndex].fid = payload.fid
                }
            }
            return { ...state, customLst: list }
        },
        upTag (state, { payload }) {
            let list = state.customLst.slice(0)
            if (list.length && payload) {
                let fIndex = list.findIndex((item) => item.wxid === payload.wxid)
                if (fIndex !== -1) {
                    list[fIndex].tagid = payload.tagid
                }
            }
            return { ...state, customLst: list }
        },
        saveRecord (state, { payload }) {
            let recordLst = state.recordLst.slice(0)
            if (payload.list && payload.list.length) {
                recordLst = recordLst.concat(payload.list)
            }
            return { ...state, recordLst, recordLoading: payload.recordLoading, recordnoMore: payload.more }
        },
    },
    effects: {
        * fetchCustom ({ payload }, { call, put }) {
            yield put({ type: "saveCustom", payload: { lst: [], total: 0, loading: true, customPara: null } })
            const { data } = yield call(chatService.fetchCustom, { ...payload })
            yield put({ type: "saveCustom", payload: { lst: !data.error ? data.contents : [], total: !data.error ? Number(data.total) : 0, loading: false, customPara: payload } })
            if (data.error) {
                return message.error("网络繁忙，请稍后重试")
            }
        },
        // 获取好友分组
        * fetchGroups ({ payload }, { call, put, select }) {
            const auth = yield select((state) => state.chat.auth)
            const { data } = yield call(chatService.fetchGroups, { ...payload, zid: auth.id })
            if (data.error) {
                return
            }
            yield put({ type: "saveGroups", payload: { data: data.data } })
        },
        // 更改分组
        * changeGroups ({ payload }, { call, put, select }) {
            const { data } = yield call(chatService.changeGroups, { ...payload })
            if (data.error) {
                return message.error("网络繁忙，请稍后重试")
            }
            yield put({ type: "changeGroup", payload })
        },
        // 修改客户标签（添加，删除）
        * editTag ({ payload }, { call, put }) {
            const { data } = yield call(chatService.editTag, { ...payload })
            if (data.error) {
                return message.error("网络繁忙，请稍后重试")
            }
            yield put({ type: "upTag", payload })
        },
        * updateCustom ({ payload }, { call, put }) {
            if (payload.action === "remark" || payload.action === "phone" || payload.action === "wang") {
                payload.option = payload.action
                const { data } = yield call(chatService.updateInfo, { ...payload })
                if (data.error) {
                    return message.error("网络繁忙，请稍后重试")
                }

            } else {
                let para = { userid: payload.userid }
                payload.action === "address" ? para.address = payload.value : ""
                payload.action === "record" ? para.record = payload.value : ""
                const isTrue = yield call(chatService.updateAddress, { ...para })
                if (isTrue.data.error) {
                    return message.error("网络繁忙，请稍后重试")
                }
            }
            yield put({ type: "changeCustom", payload })
        },
        * fetchRecord ({ payload }, { call, put }) {
            yield put({type: "saveRecord", payload: {list: [], recordLoading: true, more: 0}})
            const { data } = yield call(chatService.fetchRecords, {size: 15, act: "get_friend_msg", ...payload })
            yield put({type: "saveRecord", payload: {list: !data.error ? data.data : [], recordLoading: false, more: !data.error ? data.nomore : 0 }})
        },
    },
    subscriptions: {},
}
