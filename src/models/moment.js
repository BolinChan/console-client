import * as chatService from "../services/service"
import { makeKey, monentLst } from "../utils/helper"
import { message } from "antd"
export default {
    namespace: "moment",
    state: {
        momentLst: [],
        momentotal: 0,
        checkLoading: [],
        isloading: false,
        allList: [], // 全部朋友圈
        allLoading: [],
        myList: [], // 我的朋友圈
        myLoading: [],
        allShow: false,


        isMoment: false,
        stopMoment: true,
    },
    reducers: {
        saveMoments (state, { payload }) {
            let stopMoment = state.stopMoment
            let isloading = payload.loading
            let momentLst = state.momentLst.slice(0)
            if (payload.list && payload.list.length) {
                momentLst = monentLst(momentLst, payload.list)
            } else {
                stopMoment = false
            }
            return { ...state, momentLst: momentLst, isloading, stopMoment }
        },
        clearMoments (state, _) {
            return { ...state, momentLst: [], isMoment: false, stopMoment: true }
        },
        saveMonentImg (state, { payload }) {
            let list = state.momentLst.slice(0)
            if (payload.CircleId && payload.imgs) {
                list.map((item) => {
                    if (item.WeChatId === payload.WeChatId && Number(item.CircleId) === Number(payload.CircleId)) {
                        item.imgLoad = false
                        let imgs = []
                        payload.imgs.map((img) => {
                            imgs.push(img.ThumbImg)
                        })
                        item.Images = imgs
                    }
                })
            }
            return { ...state, momentLst: list }
        },
        changeMoments (state, { payload }) {
            let momentLst = state.momentLst.slice(0)
            let index = momentLst.findIndex((item) => item.CircleId === payload.CircleId)
            if (index !== -1) {
                if (Number(payload.IsCancel)) {
                    let dzIndex = momentLst[index].dianzan_list.findIndex((item) => item.FriendId === payload.wechatsActive)
                    if (dzIndex !== -1) {
                        momentLst[index].dianzan_list.splice(dzIndex)
                        momentLst[index].dianzan_num = Number(momentLst[index].dianzan_num) - 1
                    }

                } else {
                    momentLst[index].dianzan_num = Number(momentLst[index].dianzan_num) + 1
                    momentLst[index].dianzan_list.push({ nickname: payload.nickname, FriendId: payload.wechatsActive, id: makeKey() })
                }
            }
            return { ...state, momentLst }
        },
        doChangeComment (state, { payload }) {
            let momentLst = state.momentLst.slice(0)
            const { CircleId, Content, FriendId, WeChatId, id } = payload
            let index = momentLst.findIndex((item) => item.CircleId === CircleId)
            if (index !== -1) {
                let ReplyCommentId = "0"
                if (Number(payload.type) === 1) {
                    ReplyCommentId = payload.ReplyCommentId
                }
                momentLst[index].comment_num = Number(momentLst[index].comment_num) + 1
                momentLst[index].comment_list.unshift({ ReplyCommentId, CircleId, content: Content, WeChatId: FriendId, FriendId: WeChatId, id, isdelete: "0", nickname: payload.nickname })
            }
            return { ...state, momentLst }
        },
        doDellComment (state, { payload }) {
            let momentLst = state.momentLst.slice(0)
            const { CircleId, id } = payload
            let index = momentLst.findIndex((item) => item.CircleId === CircleId)
            if (index !== -1) {
                let cIndex = momentLst[index].comment_list.findIndex((item) => item.id === id)
                if (cIndex !== -1) {
                    momentLst[index].comment_num = Number(momentLst[index].comment_num) - 1
                    momentLst[index].comment_list.splice(cIndex, 1)
                }
            }
            return { ...state, momentLst }
        },
        deviceUpdate (state, { payload }) {
            let checkLoading = state.checkLoading.slice(0)
            if (checkLoading.length) {
                let index = checkLoading.findIndex((item) => item.WeChatId === payload.WeChatId)
                if (index !== -1) {
                    checkLoading[index].WeChatId = payload.WeChatId
                    checkLoading[index].loading = payload.loading
                } else {
                    checkLoading.push({ WeChatId: payload.WeChatId, loading: payload.loading })
                }
            } else {
                checkLoading.push({ WeChatId: payload.WeChatId, loading: payload.loading })
            }
            return { ...state, checkLoading }
        },
        upMonentOld (state, { payload }) {
            return { ...state, isMoment: payload.loading, stopMoment: payload.stopMoment ? payload.stopMoment : false }
        },
        saveImgload (state, { payload }) {
            let list = state.momentLst.slice(0)
            if (list.length && payload) {
                list.map((item) => {
                    if (item.CircleId === payload.CircleId && item.WeChatId === payload.wechatsActive) {
                        item.imgLoad = true
                    }
                })
            }
            return { ...state, momentLst: list }
        },
    },
    effects: {
        * myMomentUpdate ({ payload }, { call, put }) {
            let para = {
                WeChatId: payload.WeChatId,
                StartTime: payload.StartTime,
                FriendId: payload.FriendId,
            }
            yield call(chatService.myMomentUpdate, { ...para })
            if (payload.type === "new") {
                yield put({ type: "deviceUpdate", payload: { loading: true, WeChatId: payload.WeChatId } })
            } else {
                yield put({ type: "upMonentOld", payload: { loading: true } })
            }
        },
        * fetchDevicMoment ({ payload }, { call, put }) {
            yield put({ type: "saveMoments", payload: { loading: true, list: [] } })
            const { data } = yield call(chatService.fetchDevicMoment, { ...payload, pageSize: 8 })
            if (data.error) {
                return message.error(data.errMsg)
            }
            yield put({
                type: "saveMoments",
                payload: { list: data.data, loading: false },
            })
        },
        * doLike ({ payload }, { call, put }) {
            const { data } = yield call(chatService.doLike, { userid: payload.userid, CircleId: payload.CircleId, IsCancel: payload.IsCancel })
            if (data.error) {
                return message.error(data.errMsg)
            }
            yield put({
                type: "changeMoments",
                payload,
            })
        },
        // 朋友圈评论
        * doComment ({ payload }, { put, call }) {
            const { data } = yield call(chatService.doComment, { ...payload })
            if (!data.error) {
                payload.id = data.comments_id
                yield put({ type: "doChangeComment", payload })
                return message.success("评论成功")
            }
            return message.error(data.errMsg)

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
        // 获取朋友圈图片
        * getMomentImg ({ payload }, { put, call, select }) {
            const wechatsActive = yield select((state) => state.chat.wechatsActive)
            const { data } = yield call(chatService.getMomentImg, { ...payload })
            if (data.error) {
                return
            }
            payload.wechatsActive = wechatsActive
            yield put({ type: "saveImgload", payload })
        },
        // 发送朋友圈
        * dopengyouquan ({ payload }, { put, call }) {
            const { data } = yield call(chatService.dopengyouquan, { ...payload })
            if (data.error) {
                return message.error(data.errMsg)
            } else {
                return message.success("发送成功")
            }
        },
    },
    subscriptions: {},
}
