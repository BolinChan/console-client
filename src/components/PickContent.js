import { Component } from "react"
import { Select } from "antd"
import moment from "moment"
import styles from "./PickContent.css"
import classNames from "classnames"
const Option = Select.Option

class PickContent extends Component {
    constructor (props) {
        super(props)
        const initValue = props.initValue
        const state = initValue ? moment(initValue).toObject() : moment().toObject()
        this.state = {
            year: state.years,
            month: state.months + 1,
            day: state.date,
            time: `${state.hours}:${state.minutes >= 30 ? 30 : "00"}`,
        }
    }
    handleChange = (e) => {
        this.setState({ ...e })
        const onChange = this.props.onChange
        if (onChange) {
            let state = { ...this.state, ...e }
            const { year, month, day, time } = state
            onChange(`${year}-${month}-${day} ${time}`)
        }
    }
    handleSubmit = (e) => {
        this.setState({ ...e })
        const onSubmit = this.props.onSubmit
        if (onSubmit) {
            let state = { ...this.state, ...e }
            const { year, month, day, time } = state
            onSubmit(`${year}-${month}-${day} ${time}`)
        }
    }
    initYears = () => {
        let years = []
        const now = moment().years()
        for (let i = now - 10; i <= now + 2; i++) {
            years.push(i)
        }
        return years
    }
    initMonths = () => {
        let months = []
        for (let i = 1; i <= 12; i++) {
            months.push(i)
        }
        return months
    }
    initDays = () => {
        const weeks = ["日", "一", "二", "三", "四", "五", "六"]
        const { year, month } = this.state
        const now = moment().toObject()
        const nowYear = now.years
        const nowMonth = now.months + 1
        const nowDate = now.date

        let noData = 0
        const firstDay = moment(`${year}-${month}-1`).isoWeekday()
        noData = firstDay !== 7 ? 7 - (7 - firstDay) : 0
        let days = []

        for (let i = 0; i < noData; i++) {
            days.push(null)
        }
        const day = moment(`${year}-${month}`).daysInMonth()
        for (let i = 1; i <= day; i++) {
            if (nowYear === year && nowMonth === month && i === nowDate) {
                days.push({ date: i, today: 1 })
            } else {
                days.push({ date: i, today: 0 })
            }
        }
        const endDay = moment(`${year}-${month}-${day}`).isoWeekday()
        noData = 7 - endDay - 1
        for (let i = 0; i < noData; i++) {
            days.push(null)
        }
        let date = []
        days.map((item, index) => {
            let length = date.length
            if (length > 0) {
                if ((index + 7) % 7 === 0) {
                    date.push([item])
                } else {
                    date[date.length - 1].push(item)
                }
            } else {
                date[0] = [item]
            }
        })
        return { weeks, date }
    }
    initTimes = () => {
        let times = []
        for (let i = 8; i <= 23; i++) {
            times.push(`${i}:00`)
            times.push(`${i}:30`)
        }
        let re = []
        times.map((item, index) => {
            let length = re.length
            if (length > 0) {
                if ((index + 8) % 8 === 0) {
                    re.push([item])
                } else {
                    re[re.length - 1].push(item)
                }
            } else {
                re[0] = [item]
            }
        })
        return re
    }
    render () {
        const { year, month } = this.state
        const { weeks, date } = this.initDays()
        return (
            <div className={styles.container}>
                <div className={styles.box}>
                    <Select
                        className={styles.select}
                        defaultValue={year}
                        onChange={(e) => this.handleChange({ year: e })}
                    >
                        {this.initYears().map((item, index) =>
                            <Option value={item} key={index}>{item} 年</Option>
                        )}
                    </Select>
                    <Select
                        className={styles.select}
                        defaultValue={month}
                        onChange={(e) => this.handleChange({ month: e })}
                    >
                        {this.initMonths().map((item, index) =>
                            <Option value={item} key={index}>{item} 月</Option>
                        )}
                    </Select>
                </div>
                <div className={styles.main}>
                    <div className={styles.box} >
                        <div className={styles.header}>
                            {weeks.map((item, index) =>
                                <div key={index} className={styles.item}>星期{item}</div>
                            )}
                        </div>
                        <div className={styles.content}>
                            {date.map((item, index) =>
                                <div key={index} className={styles.line}>
                                    {item.map((it, key) =>
                                        <div
                                            key={key}
                                            className={classNames([[styles.item], { [styles.noItem]: !it }])}
                                            onClick={it ? () => this.handleChange({ day: it.date }) : null}
                                        >
                                            {it ? `${it.date}` : null}
                                            {it ? <span className={styles.title}>{it.today === 1 && "今天"}</span> : null}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.box} style={{ marginLeft: 16 }}>
                        <div className={styles.header}>请选择时间：</div>
                        <div className={styles.time}>
                            {this.initTimes().map((item, index) =>
                                <div key={index} className={styles.line}>
                                    {item.map((it, key) =>
                                        <div
                                            key={key}
                                            className={styles.item}
                                            onClick={() => this.handleSubmit({ time: it })}
                                        >
                                            {it}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default PickContent
