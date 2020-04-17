import { Component } from "react"
import { Popover, Input } from "antd"
import "./DatePick.css"
import PickContent from "./PickContent"

class DatePick extends Component {
    constructor (props) {
        super(props)
        this.state = {
            value: props.value || "",
            visible: false,
        }
    }
    componentWillReceiveProps (nextProps) {
        if ("value" in nextProps) {
            const value = nextProps.value
            this.setState({ value })
        }
    }
    valueChange = (e) => {
        const value = typeof e === "string" ? e : e.target.value
        if (!("value" in this.props)) {
            this.setState({ value })
        }
        this.triggerChange(value)
    }
    contentSubmit = (value) => {
        if (!("value" in this.props)) {
            this.setState({ value })
        }
        this.setState({ visible: false })
        this.triggerChange(value)
    }
    triggerChange = (changedValue) => {
        const onChange = this.props.onChange
        if (onChange) {
            onChange(changedValue)
        }
    }
    visibleChange = (visible) => {
        this.setState({ visible })
    }
    render () {
        const { size } = this.props
        const { visible, value } = this.state
        return (
            <Popover
                content={
                    <PickContent
                        initValue={value}
                        onChange={this.valueChange}
                        onSubmit={this.contentSubmit}
                    />
                }
                id="datePick"
                trigger="click"
                visible={visible}
                onVisibleChange={this.visibleChange}
                placement="bottomLeft"
            >
                <Input
                    type="text"
                    size={size}
                    value={value}
                    onChange={this.valueChange}
                />
            </Popover>
        )
    }
}
export default DatePick
