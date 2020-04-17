import { Component } from "react"
import { Avatar, Empty, Input, Spin, message, Icon, Row } from "antd"
import * as service from "../../../services/service"
import { Ellipsis } from "ant-design-pro"
import styles from "./SearchOrder.css"
import moment from "moment"
class SearchOrder extends Component {
    state = {
        loading: false,
        item: {},
    }
    componentDidMount () {
        const { order_sn } = this.props
        if (order_sn) {
            this.onSearch(order_sn)
        }
    }
    onSearch = async (order_sn) => {
        const { item } = this.state
        if (!(order_sn.trim() && order_sn !== (item && item.ordersn))) {
            return
        }
        this.setState({ loading: true })
        const { data } = await service.scrmUrl({
            aid: this.props.aid,
            order_sn,
            scrm_url: "http://wxx.jutaobao.cc/getOrderMsg/getlist.php?code=order_details",
        })
        if (data.error) {
            message.error(data.msg)
        }
        this.setState({ loading: false, item: data.data || {}, order_sn })
    }
    render () {
        const { item, loading } = this.state
        let address
        let goods_num = 0
        if (item && item.id) {
            address = item.aprovince + item.acity + item.aarea + item.aaddress
        }

        return (
            <span>
                <Input.Search
                    placeholder="请输入订单号"
                    onSearch={this.onSearch}
                    enterButton
                    defaultValue={this.props.order_sn}
                />
                <div style={{ margin: 24 }}>
                    <Spin spinning={loading} style={{ width: "100%" }}>
                        {item && item.id
                            ? <div>
                                <Row type="flex">
                                    <Icon type="environment" className={styles.environment} />
                                    <Ellipsis tooltip lines={1} className={styles.f1}>
                                        <p style={{ overflow: "hidden" }}>{address}</p>
                                    </Ellipsis>
                                </Row>

                                <Row type="flex">
                                    <Icon type="user" className={styles.environment} />
                                    <Ellipsis tooltip lines={1} className={styles.f1}>
                                        <p style={{ overflow: "hidden" }}>{item.arealname}（{item.buyer_name}） {item.amobile}</p>
                                    </Ellipsis>
                                </Row>

                                <ul className={styles.goods}>
                                    <div className={styles.shop}>
                                        <Icon type="shop" shape="square" className={styles.environment} /> 商品
                                    </div>
                                    {item.goods.map((i, index) => {
                                        goods_num = Number(i.total) + goods_num
                                        return <li key={index}>
                                            <Avatar
                                                className={styles.environment}
                                                src={i.pic_path || i.thumb}
                                                shape="square"
                                                size={60}
                                                icon="gift"
                                            />
                                            <div className={styles.f1}>
                                                <Ellipsis tooltip lines={2}>{i.title || i.optiontitle}</Ellipsis>
                                                {i.remark && <Ellipsis tooltip lines={1}>备注：{i.remark}</Ellipsis>}
                                            </div>

                                            <div className={styles.price}>
                                                <span>
                                                    <span className={styles.symbol}>￥ </span>
                                                    {i.price}
                                                </span>
                                                <br />
                                                <span className={styles.num}>x {i.total}</span>
                                            </div>

                                        </li>
                                    })}
                                    <div className={styles.orderFooter}>
                                        共{goods_num}件商品 合计：<span className={styles.symbol}>￥ </span>{item.price}
                                    </div>
                                </ul>
                                <div>
                                    <div className={styles.order}>订单信息</div>
                                    <p>订单编号：{item.ordersn}</p>
                                    <p>创建时间：{moment(new Date(item.createtime * 1000)).format("YYYY-MM-DD HH:mm:ss")}</p>

                                    {!!Number(item.paytime) && <p>
                                        付款时间：{moment(new Date(item.paytime * 1000)).format("YYYY-MM-DD HH:mm:ss")}
                                    </p>}

                                    {item.finishtime && !!Number(item.paytime) && <p>
                                        成交时间：{moment(new Date(item.finishtime * 1000)).format("YYYY-MM-DD HH:mm:ss")}
                                    </p>}
                                </div>

                            </div>

                            : !loading && <Empty />
                        }
                    </Spin>
                </div>
            </span>

        )
    }
}
export default SearchOrder
