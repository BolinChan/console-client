export default {
    namespace: "scroll",
    state: {
        record: 0,
        scrollTop: 0,
    },
    reducers: {
        updateScrollTop (state, { payload }) {
            let oldTop = state.scrollTop
            let newTop = payload.scrollTop
            let record = oldTop - newTop > 250 ? oldTop : 0
            return { ...state, record, scrollTop: newTop }
        },
    },
    effects: {},
    subscriptions: {},
}
