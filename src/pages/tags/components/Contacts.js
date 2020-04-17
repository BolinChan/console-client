import styles from "./Contacts.css"
import { Avatar, Collapse, Spin, Empty, Icon } from "antd"
import InfiniteScroll from "react-infinite-scroller"
import { Ellipsis } from "ant-design-pro"
const Panel = Collapse.Panel
const Contacts = ({ tagLoad, tagMore, fid, hasMore, active, list, groups, onClick, taggle, load, isLoading }) => (
    <div
        className={styles.container}
        id="contacts"
        ref={(ref) => this.scrollParentRef = ref}
    >
        <InfiniteScroll
            initialLoad={false}
            loadMore={load}
            hasMore={(!isLoading && hasMore) || (!tagLoad && tagMore)}
            useWindow={false}
            getScrollParent={() => this.scrollParentRef}
        >
            {groups && groups.length > 0 && <Collapse bordered={false} accordion onChange={taggle} activeKey={fid}>
                {groups.map((group) =>
                    <Panel
                        key={group.fid}
                        header={`${group.fname || "未分组"} (${group.number})`}
                    >


                        {(list && list.length > 0) ? list.map((item) => {
                            let title = item.remark || item.nick || item.wxid
                            let nick = title.length > 15 ? title.slice(0, 11) + "..." : title
                            return (
                                <div
                                    className={active === item.userid ? styles.active : styles.item}
                                    onClick={() => onClick(item)}
                                    key={item.userid}
                                >
                                    <div className={styles.contact}>
                                        <div>
                                            <Avatar
                                                size="large"
                                                icon="user"
                                                src={item.headImg}
                                            />
                                        </div>
                                        <div className={styles.info} title={nick}>
                                            <Ellipsis lines={2}>{nick}</Ellipsis>
                                        </div>
                                    </div>
                                </div>
                            )
                        }) : fid && !tagMore && <div className={styles.noData}><Empty /></div>}
                        <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />} spinning={tagLoad} style={{ display: "flex", justifyContent: "center", margin: "30px 0" }} />
                    </Panel>
                )}
            </Collapse>}
            {!isLoading && !groups.length && <div className={styles.noData}><Empty /></div>}
            <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />} spinning={isLoading} style={{ display: "flex", justifyContent: "center", margin: "15px 0" }} />
        </InfiniteScroll>
    </div >

)

export default Contacts
