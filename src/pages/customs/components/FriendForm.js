
import { Form, Input, Select, Button, Col, Row, DatePicker } from "antd"
import { Component } from "react"
import { connect } from "dva"
import styles from "../page.css"
import moment from "moment"
const { RangePicker } = DatePicker
const FormItem = Form.Item
const Option = Select.Option
const formItemLayout = {
    style: { display: "flex" },
    labelCol: { style: { minWidth: 100 } },
    wrapperCol: { style: { flex: 1 } },
    colon: false,
}

class FriendForm extends Component {
    handleSubmit = (e) => {
        const { form, dispatch, hasKefu } = this.props
        e.preventDefault()
        form.validateFields((err, values) => {
            const { nick, city, fid, tag, createtime } = values
            if (!err) {
                let payload = { kefu_wxid: hasKefu() }
                nick ? payload.nick = nick : ""
                city ? payload.city = city : ""
                fid ? payload.fid = fid : ""
                tag ? payload.tag = tag : ""
                if (createtime) {
                    let start = moment(createtime[0]._d).format("YYYY-MM-DD 00:00:00")
                    let end = moment(createtime[1]._d).format("YYYY-MM-DD 23:59:59")
                    payload.createtime = [start, end]
                }
                dispatch({ type: "custom/fetchCustom", payload })
                this.props.resetPage()
            }
        })
    }
    UNSAFE_componentWillReceiveProps (nextProps) {
        const selwechat = this.props.wechatsActive
        const menuShow = this.props.menuFold
        const { wechatsActive, menuFold } = nextProps
        if (selwechat !== wechatsActive) {
            this.props.form.resetFields()
        }
        if (menuShow !== menuFold) {
            this.props.form.resetFields()
        }
    }
    handleReset = () => {
        const { form, dispatch, resetPage, hasKefu } = this.props
        form.resetFields()
        dispatch({ type: "custom/fetchCustom", payload: { kefu_wxid: hasKefu() } })
        resetPage()
    }

    dateChange = (e) => {
        if (e.length === 0) {
            this.handleReset()
        }
    }
    tagClear = (e) => {
        if (!e) {
            this.handleReset()
        }
    }
    render () {

        const { form, usergroup, allTags } = this.props
        const { getFieldDecorator } = form
        return (
            <Form layout="inline" onSubmit={this.handleSubmit} className={styles.friendForm}>
                <Row gutter={24} >
                    <Col span={8} >
                        <FormItem {...formItemLayout} label="好友昵称/备注" >
                            {getFieldDecorator("nick")(<Input style={{ width: "100%" }} autoComplete="off" placeholder="请输入好友昵称/备注" />)}
                        </FormItem>
                    </Col>
                    <Col span={8} >
                        <FormItem label="城市" {...formItemLayout} >
                            {getFieldDecorator("city")(<Input style={{ width: "100%" }} autoComplete="off" placeholder="请输入城市" />)}
                        </FormItem>
                    </Col>
                    <Col span={8} >
                        <FormItem label="所在分组" {...formItemLayout} >
                            {getFieldDecorator("fid")(
                                <Select style={{ width: "100%" }} allowClear={true} placeholder="请选择分组" onChange={this.tagClear}>
                                    <Option value="">全部分组</Option>
                                    {usergroup && usergroup.map((item) => (
                                        <Option key={item.id} value={item.id}>{item.fenzu_name}</Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8} style={{marginTop: 10}}>
                        <FormItem label="选择标签" {...formItemLayout} >
                            {getFieldDecorator("tag")(
                                <Select style={{ width: "100%" }} allowClear={true} placeholder="请选择标签" onChange={this.tagClear}>
                                    {allTags && allTags.map((item) => (
                                        <Option key={item.id} value={item.id}>{item.tag_name}</Option>
                                    ))}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8} style={{marginTop: 10}}>
                        <FormItem label="选择日期" {...formItemLayout} >
                            {getFieldDecorator("createtime")(
                                <RangePicker style={{ width: "100%" }} size="default" onChange={this.dateChange}
                                    ranges={{
                                        "今天": [moment(), moment()],
                                        "昨天": [moment().days(moment().days() - 1)
                                            .startOf("days"), moment().days(moment().days() - 1)
                                            .endOf("days")],
                                        "过去一周": [moment().days(moment().days() - 7)
                                            .startOf("days"), moment().endOf(moment())],
                                        "过去一个月": [moment().days(moment().days() - 30)
                                            .startOf("days"), moment().endOf(moment())],
                                        "过去半年": [moment().days(moment().days() - 183)
                                            .startOf("days"), moment().endOf(moment())],
                                    }} />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8} style={{marginTop: 10}}>
                        <FormItem {...formItemLayout} label=" ">
                            <Button type="primary" htmlType="submit">确定</Button>
                            <Button type="primary" onClick={this.handleReset} style={{ marginLeft: 30 }}>重置</Button>
                        </FormItem>
                    </Col>
                    {/* <div style={{ marginTop: 10 }}>
                        <Button type="primary" htmlType="submit">确定</Button>
                        <Button type="primary" onClick={this.handleReset} style={{ marginLeft: 30 }}>重置</Button>
                    </div> */}
                </Row >
            </Form >
        )
    }
}
function mapStateToProps (state) {
    const { wechatsActive, allTags, menuFold, wechats } = state.chat
    const { usergroup } = state.custom
    return { usergroup, allTags, wechatsActive, menuFold, wechats }
}
const FmForm = Form.create()(FriendForm)
export default connect(mapStateToProps)(FmForm)
