import request from "../utils/request"
const api = "//wechat.yunbeisoft.com/index_test.php/home/api"
const home = "//wechat.yunbeisoft.com/index_test.php/home"
export function fetchWechats (body) {
    return request({
        method: "post",
        url: `${api}/get_device`,
        data: JSON.stringify(body),
    })
}
export function fetchMessages (body) {
    return request({
        method: "post",
        url: `${api}/get_stat_msg_history`,
        data: JSON.stringify(body),
    })
}
export function fetchRecords (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/get_friend_msg`,
        data: JSON.stringify(body),
    })
}
export function sendMessage (body) {
    return request({
        method: "post",
        url: `${api}/domessage`,
        data: JSON.stringify(body),
    })
}
export function log (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/login`,
        data: JSON.stringify(body),
    })
}
export function isLog (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/yantoken`,
        data: JSON.stringify(body),
    })
}
export function fetchFastWord (body) {
    return request({
        method: "post",
        url: `${home}/hsgroup/gets_ksy?access_token=ACCESS_TOKEN`,
        data: JSON.stringify(body),
    })
}
// 修改客户资料（备注，手机，旺旺）
export function updateInfo (body) {
    const { option, value, wxid, kefu_wxid } = body
    let url
    let payload = { wxid, kefu_wxid }
    switch (option) {
        case "remark":
            url = `${api}/update_remark`
            payload.remark = value
            break
        case "phone":
            url = `${api}/phone_to_wxid`
            payload.phone = value
            break
        default:
            url = `${api}/ww_to_wxid`
            payload.wangwang = value
            break
    }
    return request({ method: "post", url, data: JSON.stringify(payload) })
}
// 修改客户标签（添加，删除）
export function editTag (body) {
    return request({
        method: "post",
        url: `${home}/tagg/taggwxid`,
        data: JSON.stringify(body),
    })
}
export function fetchUserInfo (body) {
    return request({
        method: "post",
        url: `${home}/api/get_userinfo`,
        data: JSON.stringify(body),
    })
}
export function fetchUserTags (body) {
    return request({
        method: "post",
        url: `${home}/tagg/kefu_taggleft`,
        data: JSON.stringify(body),
    })
}
export function fetchWechatTags (body) {
    return request({
        method: "post",
        url: `${home}/WechatTag/wechatTagByFriend`,
        data: JSON.stringify(body),
    })
}
export function fetchTags (body) {
    return request({
        method: "post",
        url: `${home}/tagg/taggjuti`,
        data: JSON.stringify(body),
    })
}
// 获取主账号下的标签
export function fetchAllTags (body) {
    return request({
        method: "post",
        url: `${home}/tagg/taggall`,
        data: JSON.stringify(body),
    })
}
// export function fetchShoppingInfo (body) {
//     return request({
//         method: "post",
//         url: "//wxx.jutaobao.cc/wxGroupCtrl/?token=ACCESS_TOKEN",
//         data: JSON.stringify(body),
//     })
// }
// export function sedRendPackage (body) {
//     return request({
//         method: "post",
//         url: "//wxx.jutaobao.cc/yunbei_send_redpack/qr_code.php?code=1",
//         data: JSON.stringify(body),
//     })
// }
export function getBigPic (body) {
    return request({
        method: "post",
        url: `${home}/api/getmsg_bigimg`,
        data: JSON.stringify(body),
    })
}

export function fetchMoments (body) {
    return request({
        method: "post",
        url: `${home}/pengyouquan/getpengyouquan`,
        data: JSON.stringify(body),
    })
}
export function addChat (body) {
    return request({
        method: "post",
        url: `${home}/Setting/addFriend`,
        data: JSON.stringify(body),
    })
}
// 群内加人
export function addGroupChat (body) {
    return request({
        method: "post",
        url: `${home}/quns/add_friend_qun`,
        data: JSON.stringify(body),
    })
}
export function addTag (body) {
    return request({
        method: "post",
        url: `${home}/tagg/kefuaddtagg`,
        data: JSON.stringify(body),
    })
}
// 子账号退出登陆
export function logOut (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/loginout`,
        data: JSON.stringify(body),
    })
}
// 获取更新日志
export function fetchLog (body) {
    return request({
        method: "post",
        url: `${home}/updatelog/getList`,
        data: JSON.stringify(body),
    })
}
// 选择联系人时更新lastTime
export function upChatLastTime (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/updateUserLastTime`,
        data: JSON.stringify(body),
    })
}
// 页面刷新，关闭时更新lastTime
export function upLastTime (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/update_lasttime`,
        data: JSON.stringify(body),
    })
}
// 移动联系人分组
export function changeGroups (body) {
    return request({
        method: "post",
        url: `${api}/editusergroup`,
        data: JSON.stringify(body),
    })
}
// 获取最近订单
// export function fetchOrders (body) {
//     return request({
//         method: "post",
//         url: "//wxx.jutaobao.cc/getOrderMsg/",
//         data: JSON.stringify(body),
//     })
// }
// 获取收藏信息
export function fetchCollection (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/select_msg`,
        data: JSON.stringify(body),
    })
}
// 一键收藏消息
export function addCollection (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/add_msg`,
        data: JSON.stringify(body),
    })
}
export function cutCollection (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/delete_msg`,
        data: JSON.stringify(body),
    })
}
export function sendTime (body) {
    return request({
        method: "post",
        url: `${api}/do_time_message`,
        data: JSON.stringify(body),
    })
}
export function fetchSendTime (body) {
    return request({
        method: "post",
        url: `${api}/getdingshimessage`,
        data: JSON.stringify(body),
    })
}
export function delSendTime (body) {
    return request({
        method: "post",
        url: `${api}/deldingshimessage`,
        data: JSON.stringify(body),
    })
}
export function delTop (body) {
    return request({
        method: "post",
        url: `${home}/topping/delTop`,
        data: JSON.stringify(body),
    })
}
export function addTop (body) {
    return request({
        method: "post",
        url: `${home}/topping/addTop`,
        data: JSON.stringify(body),
    })
}
// 获取好友分组
export function fetchGroups (body) {
    return request({
        method: "post",
        url: `${api}/kefugetsusergroup`,
        data: JSON.stringify(body),
    })
}
// // 获取红包关联订单
// export function fetchAssociationOrders (body) {
//     return request({
//         method: "post",
//         url: "//wxx.jutaobao.cc/getOrderMsg/index.php?access_token=ACCESS_TOKEN",
//         data: JSON.stringify(body),
//     })
// }
// 添加快捷语
export function addKsy (body) {
    return request({
        method: "post",
        url: `${home}/hsgroup/create_msg?access_token=ACCESS_TOKEN`,
        data: JSON.stringify(body),
    })
}
export function fetchKefu (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/get_lists`,
        data: JSON.stringify(body),
    })
}
// 快捷语排序
export function sortFastWord (body) {
    return request({
        method: "post",
        url: `${home}/hsgroup/update_orders`,
        data: JSON.stringify(body),
    })
}
// 编辑快捷语
export function editKsy (body) {
    return request({
        method: "post",
        url: `${home}/hsgroup/update_msg?access_token=ACCESS_TOKEN`,
        data: JSON.stringify(body),
    })
}
// 转接客服
export function customShare (body) {
    return request({
        method: "post",
        url: `${home}/device/zhaun_friends?access_token=ACCESS_TOKEN`,
        data: JSON.stringify(body),
    })
}
// 更新朋友圈
export function momentsUpdate (body) {
    return request({
        method: "post",
        url: `${home}/FriendPengyouquan/friendPengyouquanPull`,
        data: JSON.stringify(body),
    })
}
// 匹配快捷语
export function getKsy (body) {
    return request({
        method: "post",
        url: `${home}/hsgroup/gethsword?access_token=ACCESS_TOKEN`,
        data: JSON.stringify(body),
    })
}
// 新增分组
export function addGroup (body) {
    return request({
        method: "post",
        url: `${home}/hsgroup/create?access_token=ACCESS_TOKEN`,
        data: JSON.stringify(body),
    })
}
// 获取快捷语分组
export function getGroup (body) {
    return request({
        method: "post",
        url: `${home}/hsgroup/gets?access_token=ACCESS_TOKEN`,
        data: JSON.stringify(body),
    })
}
// 删除快捷语
export function delKsy (body) {
    return request({
        method: "post",
        url: `${home}/hsgroup/delete_msg?access_token=ACCESS_TOKEN`,
        data: JSON.stringify(body),
    })
}
// 修改地址以及备忘录
export function updateAddress (body) {
    return request({
        method: "post",
        url: `${home}/setting/editFriend?access_token=ACCESS_TOKEN`,
        data: JSON.stringify(body),
    })
}
// 朋友圈点赞
export function doLike (body) {
    return request({
        method: "post",
        url: `${home}/friendPengyouquan/pengyouquanDianzan`,
        data: JSON.stringify(body),
    })
}
// 删除评论
export function delComment (body) {
    return request({
        method: "post",
        url: `${home}/friendPengyouquan/pengyouquanCommentDelete`,
        data: JSON.stringify(body),
    })
}
// 朋友圈评论
export function doComment (body) {
    return request({
        method: "post",
        url: `${home}/friendPengyouquan/pengyouquanComment`,
        data: JSON.stringify(body),
    })
}
// 检测设备的朋友圈
export function myMomentUpdate (body) {
    return request({
        method: "post",
        url: `${home}/FriendPengyouquan/devicePengyouquanPull`,
        data: JSON.stringify(body),
    })
}
// 获取设备朋友圈
export function fetchDevicMoment (body) {
    return request({
        method: "post",
        url: `${home}/FriendPengyouquan/devicePengyouquanList`,
        data: JSON.stringify(body),
    })
}
// 获取标签标签
export function fetchTag (body) {
    return request({
        method: "post",
        url: `${home}/tagg/taggListService`,
        data: JSON.stringify(body),
    })
}
// 客户资料列表
export function fetchCustom (body) {
    return request({
        method: "post",
        url: `${home}/api/dogetuserlists`,
        data: JSON.stringify(body),
    })
}

// 修改群名
export function editQun (body) {
    return request({
        method: "post",
        url: `${home}/quns/update_qun_name`,
        data: JSON.stringify(body),
    })
}

// 退群
export function logOutQun (body) {
    return request({
        method: "post",
        url: `${home}/quns/tui_qun`,
        data: JSON.stringify(body),
    })
}

// 群内踢人
export function outQun (body) {
    return request({
        method: "post",
        url: `${home}/quns/delete_qun_friend`,
        data: JSON.stringify(body),
    })
}

// 获取文件列表
export function fetchFolder (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/getFile`,
        data: JSON.stringify(body),
    })
}
// 创建待办事项
export function addRecord (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/addRecord`,
        data: JSON.stringify(body),
    })
}
// 获取待办事项
export function getRecord (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/getRecord`,
        data: JSON.stringify(body),
    })
}
// 删除待办事项
export function deleteRecord (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/deleteRecord`,
        data: JSON.stringify(body),
    })
}

// 添加文件(文件，文件夹，图片)
export function addFile (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/addFile`,
        data: JSON.stringify(body),
    })
}
// 删除文件
export function deleteFile (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/deleteFile`,
        data: JSON.stringify(body),
    })
}
// 编辑文件名
export function updateFileName (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/updateFileName`,
        data: JSON.stringify(body),
    })
}

export function getGroups (body) {
    return request({
        method: "post",
        url: `${api}/getUserGroups`,
        data: JSON.stringify(body),
    })
}
// 获取朋友圈图片
export function getMomentImg (body) {
    return request({
        method: "post",
        url: `${home}/friendPengyouquan/get_pengyouquan_img`,
        data: JSON.stringify(body),
    })
}

// 获取个人朋友圈
export function friendPengyouquanList (body) {
    return request({
        method: "post",
        url: `${home}/FriendPengyouquan/friendPengyouquanList`,
        data: JSON.stringify(body),
    })
}

// 未读数清空
export function readAll (body) {
    return request({
        method: "post",
        url: `${home}/device/delete_unreads?access_token=ACCESS_TOKEN`,
        data: JSON.stringify(body),
    })
}

// 消息 提醒/免提醒
export function changeAlter (body) {
    return request({
        method: "post",
        url: `${home}/quns/ignoreMsg`,
        data: JSON.stringify(body),
    })
}

export function groupToTop (body) {
    return request({
        method: "post",
        url: `${api}/groupTop`,
        data: JSON.stringify(body),
    })
}
// 获取添加好友记录
export function fetchaddFriend (body) {
    return request({
        method: "post",
        url: `${home}/api/addfriendlist`,
        data: JSON.stringify(body),
    })
}
// 扩展字段
export function extendField (body) {
    return request({
        method: "post",
        url: `${home}/Zdyfield/selectfield?access_token=ACCESS_TOKEN`,
        data: JSON.stringify(body),
    })
}
// 编辑好友自定义字段内容
export function editfriendfield (body) {
    return request({
        method: "post",
        url: `${home}/Zdyfield/editfriendfield`,
        data: JSON.stringify(body),
    })
}
// 获取标签分组
export function gettaggfenzu (body) {
    return request({
        method: "post",
        url: `${home}/taggfenzu/gettaggfenzu?access_token=ACCESS_TOKEN`,
        data: JSON.stringify(body),
    })
}

export function changeSkin (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/setTheme`,
        data: JSON.stringify(body),
    })
}

export function fetchNewMsg (body) {
    return request({
        method: "post",
        url: `${home}/Getmsg/get_msg_current`,
        data: JSON.stringify(body),
    })
}
export function fetchFriendMsg (body) {
    return request({
        method: "post",
        url: `${home}/Getmsg/get_friend_msg_new_current`,
        data: JSON.stringify(body),
    })
}

export function fetchCustomExpress (body) {
    return request({
        method: "post",
        url: `${home}/emoticon/getsEmoticon`,
        data: JSON.stringify(body),
    })
}
export function addCustom (body) {
    return request({
        method: "post",
        url: `${home}/emoticon/addEmoticon`,
        data: JSON.stringify(body),
    })
}
export function cutCustom (body) {
    return request({
        method: "post",
        url: `${home}/emoticon/delEmoticon`,
        data: JSON.stringify(body),
    })
}

export function fetchGroupUpdate (body) {
    return request({
        method: "post",
        url: `${api}/get_group_update`,
        data: JSON.stringify(body),
    })
}

export function fetchGroupMemberUpdate (body) {
    return request({
        method: "post",
        url: `${home}/quns/get_member_update`,
        data: JSON.stringify(body),
    })
}
export function freshGroup (body) {
    return request({
        method: "post",
        url: `${home}/ziaccount/fresh_quns`,
        data: JSON.stringify(body),
    })
}
// 拉人进群
export function addQun (body) {
    return request({
        method: "post",
        url: `${home}/quns/add_to_qun`,
        data: JSON.stringify(body),
    })
}
export function collectMini (body) {
    return request({
        method: "post",
        url: `${home}/Collect/collect_small_programe`,
        data: JSON.stringify(body),
    })
}
export function getCollect (body) {
    return request({
        method: "post",
        url: `${home}/Collect/get_collects`,
        data: JSON.stringify(body),
    })
}
export function DelMini (body) {
    return request({
        method: "post",
        url: `${home}/Collect/delete_collect`,
        data: JSON.stringify(body),
    })
}
// 客服端批量加群内好友
export function qunsAddFriends (body) {
    return request({
        method: "post",
        url: `${home}/quns/add_friend_quns`,
        data: JSON.stringify(body),
    })
}
// 更新消息
export function upMsgStatus (body) {
    return request({
        method: "post",
        url: `${home}/Collect/get_msg_status`,
        data: JSON.stringify(body),
    })
}

// 发朋友圈
export function dopengyouquan (body) {
    return request({
        method: "post",
        url: `${home}/api/dopengyouquan`,
        data: JSON.stringify(body),
    })
}
// 名片加好友
export function addFriend_card (body) {
    return request({
        method: "post",
        url: `${home}/Ids/add_friends_by_card`,
        data: JSON.stringify(body),
    })
}

export function recall (body) {
    return request({
        method: "post",
        url: `${home}/api/callBackMsg`,
        data: JSON.stringify(body),
    })
}

export function takeMoney (body) {
    return request({
        method: "post",
        url: `${home}/api/redEnvelope`,
        data: JSON.stringify(body),
    })
}

export function toText (body) {
    return request({
        method: "post",
        url: `${home}/Voice/VoiceConversion`,
        data: JSON.stringify(body),
    })
}

export function delFriend (body) {
    return request({
        method: "post",
        url: `${home}/account/delete_user`,
        data: JSON.stringify(body),
    })
}
// 群控项目接口
export function scrmUrl (body) {
    return request({
        method: "post",
        url: `${home}/scrm/getScrmData`,
        data: JSON.stringify(body),
    })
}
// 获取公众号余额
export function getBalance (body) {
    return request({
        method: "post",
        url: `${home}/ids/get_balance`,
        data: JSON.stringify(body),
    })
}
