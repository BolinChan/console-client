// import * as chatService from "../services/service"
export default {
    namespace: "tag",
    state: {
        // type: "",
        groups: [],
        // contacts: [],
        // groupPage: 0,
        // groupMore: true,
        // curl: 0,
        // contactHasMore: [],
    },
    reducers: {
        clearGroup (state) {
            return { ...state, groups: [] }
        },
        saveTags (state, { payload }) {
            let list = []
            let groups = state.groups.slice(0)
            payload.map((item) => {
                list.push({ fid: String(item.id), fname: item.tag_name, number: Number(item.user_count) })
            })
            groups = [...groups, ...list]
            return { ...state, groups }
        },
        // saveContacts(state, { payload }) {
        //     let contacts = state.contacts.slice(0)
        //     let contactHasMore = state.contactHasMore.slice(0)
        //     const { page, type, data, hasMore, fid } = payload
        //     if (contacts && contacts.length > 0) {
        //         data.map((item) => {
        //             if (contacts.findIndex((user) => user.userid === item.userid && user.tid === fid) === -1) {
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
    },
    effects: {
        // 获取标签列表
        // * fetchTags ({ payload }, { call, put }) {
        //     const { data } = yield call(chatService.fetchTag, payload)
        //     yield put({
        //         type: "saveTags",
        //         payload: { data: !data.error ? data.data : [], hasMore: !data.error ? data.hasMore : true, groupPage: !data.error ? payload.page : 0 },
        //     })
        // },
    },
    subscriptions: {},
}
