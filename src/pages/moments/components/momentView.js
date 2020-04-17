import styles from "../page.css"
import { Avatar, Icon, Col, Row, Spin, Tooltip } from "antd"
import MomentLink from "../../chats/components/MomentLink"
import { textParse } from "../../../utils/helper"
import { Ellipsis } from "ant-design-pro"
import classNames from "classnames"
const idp = "//qn.fuwuhao.cc/idp.png"

const isLikeBoo = (item, wechatsActive) => {
    let isLiked = item.dianzan_list && item.dianzan_list.length ? item.dianzan_list.findIndex((like) => like.FriendId === wechatsActive) !== -1 : false
    return isLiked
}
// 过滤重复点赞、评论
const repeatArray = (list) => {
    let array = []
    try {
        for (let i = 0, len = list.length; i < len; i++) {
            if (array.indexOf(list[i]) === -1) {
                array.push(list[i])
            }
        }
    } catch (error) {
        array = []
    }
    return array
}

const momentView = ({ actives, item, wechatsActive, getImg, videoModal, preView, dzChange, onCancel, delComment, Replay, selectChat }) => {

    const hasImg = (imgs) => (
        <Spin spinning={item.imgLoad}>
            <Row gutter={24}>
                {imgs.map((img, index) => {
                    if (img) {
                        return (
                            <Col key={index} span={8} onClick={() => preView(img)}>
                                <img
                                    alt="图片"
                                    style={{ cursor: "pointer", width: "100%", height: 110, marginBottom: 10 }}
                                    src={img || idp}
                                />
                            </Col>
                        )
                    } else {
                        return (
                            <Col
                                key={index}
                                span={8}
                                onClick={() => getImg(item)}
                            >
                                <Icon
                                    style={{
                                        cursor: "pointer",
                                        width: "100%",
                                        height: 110,
                                        marginBottom: 10,
                                    }}
                                    type="picture"
                                    className={styles.loadImg}
                                />
                            </Col>
                        )
                    }
                })}
            </Row>
        </Spin>
    )

    const dzList = item.dianzan_list && item.dianzan_list.length ? repeatArray(item.dianzan_list) : []
    const comList = item.comment_list && item.comment_list.length ? repeatArray(item.comment_list) : []
    return (
        <div className={styles.momentLst}>
            <div className={styles.momentItem}>
                <div className={styles.momentHeader}>
                    <Avatar
                        src={item.wx_img}
                        style={{ marginRight: "16px" }}
                        icon="user"
                        onClick={() => selectChat(item)}
                        title="点击聊天"
                    />
                    <div className={styles.momentTitle}>
                        <Tooltip
                            title={
                                <div>
                                    <div>备注：{item.conRemark}</div>
                                    <div>昵称：{item.nick}</div>
                                </div>
                            }
                        >
                            <Ellipsis lines={1}>
                                {item.conRemark || item.nick || item.WeChatId}
                            </Ellipsis>
                        </Tooltip>
                        <span>{item.createtime}</span>
                    </div>
                </div>
                <div className={styles.momentMain}>
                    <div className={styles.contentText} dangerouslySetInnerHTML={{ __html: textParse(item.contents) }} />
                    {/* 图片 */}
                    {!item.Link && item.Images && item.Images.length > 0 && hasImg(item.Images)}
                    {item.Video &&
                        <img
                            alt="视频"
                            style={{ cursor: "pointer", width: "200px", height: "200px", marginBottom: 10 }}
                            src={item.Video.ThumbImg}
                            onClick={() => videoModal(item.Video.Url)}
                        />
                    }
                    {item.Link && <MomentLink {...item.Link} />}
                </div>
                <div style={{ display: "flex", margin: "10px 0" }}>
                    <span
                        style={{ marginRight: 10, cursor: "pointer" }}
                        onClick={() => dzChange(item, isLikeBoo(item, wechatsActive))}
                        className={classNames([{ [styles.dzSel]: isLikeBoo(item, wechatsActive) }])}
                    >
                        <Icon type="like-o" style={{ marginRight: 8 }} />
                        {item.dianzan_num}
                    </span>
                    <span style={{ cursor: "pointer" }} onClick={() => onCancel(item, 0)} className={classNames([{ [styles.dzSel]: item.comment_list && item.comment_list.length > 0 }])}>
                        <Icon type="message" style={{ marginRight: 8 }} />
                        {item.comment_num}
                    </span>
                </div>

                {dzList.length > 0 && <div className={styles.dzlst}>
                    <span className={styles.trangile}></span>
                    <div style={{ display: "flex" }}>
                        <Icon type="heart" style={{ margin: "10px 8px 0 0" }} />
                        <div>
                            {dzList.map((dz, dzIndex) => (
                                <Tooltip title={
                                    <div>
                                        <div>备注：{dz.conRemark}</div>
                                        <div>昵称：{dz.nickname}</div>
                                    </div>}
                                key={dzIndex}
                                >
                                    <Avatar
                                        src={dz.headimg}
                                        icon="user"
                                        shape="square"
                                        style={{ margin: 2 }}
                                        onClick={() => selectChat(dz)}
                                        title="点击聊天"
                                    />
                                </Tooltip>
                            ))}
                        </div>

                    </div>

                </div>}


                {comList.length > 0 && <div className={styles.dzlst} style={{ flexDirection: "column", textAlign: "left" }}>
                    {dzList.length <= 0 && <span className={styles.trangile}></span>}
                    {comList.map((comment, commentIndex) => (
                        <div key={commentIndex} style={{ marginRight: 8 }}>
                            <a onClick={() => selectChat(comment)} title="点击聊天">
                                {comment.nickname || comment.FriendId}{Replay(comList, comment)}：
                            </a>
                            <span style={{ wordBreak: "break-all", color: "#333" }} dangerouslySetInnerHTML={{ __html: textParse(comment.content) }} />
                            {comment.FriendId === wechatsActive ? <span onClick={() => delComment({
                                WeChatId: comment.FriendId,
                                id: comment.id,
                                CircleId: comment.CircleId,
                            })}>删除</span> : <span style={{ marginLeft: 8 }} onClick={() => onCancel(item, 1, comment.CommentId)}>回复</span>}
                        </div>
                    ))}
                </div>}

            </div>
        </div>
    )
}
export default momentView
