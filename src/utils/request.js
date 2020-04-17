import axios from "axios"
const ErrorMsg = "操作失败"
export default async function request (options) {
    let ops = options
    let data = options.data ? JSON.parse(options.data) : {}
    const token = window.sessionStorage.getItem("token")
    if (token) {
        data.token = token
        ops.data = JSON.stringify(data)
    }
    if (!ops.hasOwnProperty("method")) {
        ops.method = "post"
    }
    let response
    try {
        response = await axios(ops)
        const resData = response.data
        if (typeof (resData.error) === "undefined") {
            response = { data: { error: true, errmsg: ErrorMsg, msg: ErrorMsg, errMsg: ErrorMsg } }
        } else {
            if (resData.error && resData.errmsg === "token过期") {
                window.sessionStorage.setItem("tui", 2)
                window.sessionStorage.setItem("id", "")
                window.sessionStorage.setItem("token", "")
                window.location.reload()
            }
            const msg = resData.errmsg || resData.msg || resData.errMsg
            response.data = { ...resData, msg, errmsg: msg, errMsg: msg }
        }
        return response
    } catch (err) {
        if (!response) {
            response = { data: { error: true, errmsg: ErrorMsg, msg: ErrorMsg, errMsg: ErrorMsg } }
        }
        return response
    }
}
