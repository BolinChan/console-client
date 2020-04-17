
import {Component} from "react"
import styles from "./Editor.css"
import classNames from "classnames"
import { Ellipsis } from "ant-design-pro"
import InfiniteScroll from "react-infinite-scroller"
import { Avatar, Spin } from "antd"

class AIT extends Component {
    render () {
        const {hasMore, isLoading, selIndex, listAit, loadMore, selKsy} = this.props
        return (
            listAit && listAit.length > 0 && <div className={styles.boxKsy} style={{width: 250}}>
                <div style={{ position: "relative" }}>
                    <div className={styles.boxKsyul} style={{maxHeight: 460, overflow: "auto"}} id="ait">
                        <InfiniteScroll
                            initialLoad={true}
                            loadMore={loadMore}
                            hasMore={!isLoading && hasMore}
                            useWindow={false}
                            getScrollParent={() => this.scrollParentRef}
                            loader={<div key={"loading"} className={styles.loadItem}><Spin spinning={true} /></div>}
                        >
                            { listAit.map((item, index) => (
                                <div
                                    key={index}
                                    style={{display: "flex", padding: "8px 0", height: "46px"}}
                                    className={classNames([[styles.boxKsyulItem], { [styles.selKsyItem]: index === selIndex }])}
                                >
                                    <Avatar src={item.headImg} icon="user"/>
                                    <Ellipsis
                                        style={{ cursor: "pointer", flex: 1, marginLeft: 8}}
                                        lines={1}
                                        tooltip
                                        key={index}
                                        onClick={() => selKsy(item, "listAit")}
                                    >
                                        {item.remark || item.nick}
                                    </Ellipsis>
                                </div>
                            ))}
                        </InfiniteScroll>
                    </div>
                </div>
            </div>
        )
    }
}

export default AIT
