"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { adminApi } from "./api";
import { AdminIcon, type AdminIconName } from "./icons";
import type { AdminReport, AdminRoom, AdminTransaction, AdminUser, OverviewData, SectionId, TrendPoint } from "./types";

const navigation: Array<{ id: SectionId; label: string; icon: AdminIconName }> = [
  { id: "overview", label: "总览", icon: "overview" },
  { id: "users", label: "用户管理", icon: "users" },
  { id: "rooms", label: "语聊房间", icon: "rooms" },
  { id: "safety", label: "内容安全", icon: "safety" },
  { id: "economy", label: "经济系统", icon: "economy" },
  { id: "payments", label: "支付与退款", icon: "payments" },
  { id: "campaigns", label: "活动运营", icon: "campaigns" },
  { id: "settings", label: "系统设置", icon: "settings" },
];

const sectionDescriptions: Record<SectionId, string> = {
  overview: "关键业务指标、实时房间与安全队列",
  users: "账号状态、会员等级与资产概览",
  rooms: "实时语聊房巡检与异常处置",
  safety: "举报分级、审核流转与处置记录",
  economy: "钻石、游戏币与平台经济健康度",
  payments: "充值订单、支付状态与退款入口",
  campaigns: "任务、签到与活动运营效果",
  settings: "管理员权限与运行环境配置",
};

const reasonLabels: Record<string, string> = {
  harassment: "骚扰辱骂",
  sexual_or_violent: "色情或暴力",
  scam_or_payment: "诈骗或支付",
  spam: "垃圾推广",
  misinformation: "误导信息",
  copyright: "版权问题",
  other: "其他",
};

const statusLabels: Record<string, string> = {
  active: "正常",
  suspended: "已停用",
  live: "直播中",
  ended: "已结束",
  received: "待审核",
  reviewing: "审核中",
  resolved: "已处理",
  dismissed: "已驳回",
  succeeded: "已完成",
  requires_confirmation: "待确认",
  failed: "失败",
};

const compactNumber = new Intl.NumberFormat("zh-CN", { notation: "compact", maximumFractionDigits: 1 });
const integerNumber = new Intl.NumberFormat("zh-CN");
const currencyNumber = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });

function relativeTime(value: string) {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

function Status({ value }: { value: string }) {
  return <span className={`admin-status status-${value}`}>{statusLabels[value] ?? value}</span>;
}

function Empty({ children }: { children: string }) {
  return <div className="admin-empty"><span>暂无数据</span><p>{children}</p></div>;
}

function TrendChart({ points }: { points: TrendPoint[] }) {
  const series = [
    { key: "newUsers" as const, label: "新增用户", color: "#58ca96" },
    { key: "revenue" as const, label: "充值金额", color: "#d7b86a" },
    { key: "roomsCreated" as const, label: "新增房间", color: "#43cfe0" },
  ];
  const width = 700;
  const height = 220;
  const x = (index: number) => 38 + (index * (width - 66)) / Math.max(1, points.length - 1);
  const linePoints = (key: (typeof series)[number]["key"]) => {
    const values = points.map((point) => Number(point[key]));
    const max = Math.max(1, ...values);
    return values.map((value, index) => `${x(index)},${184 - (value / max) * 142}`).join(" ");
  };

  return <section className="admin-panel trend-panel">
    <header className="panel-header"><div><h2>核心指标趋势</h2><p>最近 7 天平台增长与交易表现</p></div><div className="chart-legend">{series.map((item) => <span key={item.key}><i style={{ background: item.color }}/>{item.label}</span>)}</div></header>
    {points.length ? <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="最近七天核心指标趋势折线图">
        {[42, 78, 113, 149, 184].map((y) => <line key={y} x1="38" x2="674" y1={y} y2={y} className="chart-grid"/>)}
        {series.map((item) => <polyline key={item.key} points={linePoints(item.key)} fill="none" stroke={item.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>) }
        {points.map((point, index) => <text key={point.day} x={x(index)} y="211" textAnchor="middle">{point.day.slice(5).replace("-", "/")}</text>)}
      </svg>
    </div> : <Empty>有业务数据后将在这里展示趋势。</Empty>}
  </section>;
}

function RoomTable({ rooms, busyId, onStatus }: { rooms: AdminRoom[]; busyId: string | null; onStatus: (room: AdminRoom) => void }) {
  return <div className="table-scroll"><table className="admin-table"><thead><tr><th>房间</th><th>主播</th><th>在线听众</th><th>状态</th><th>操作</th></tr></thead><tbody>{rooms.map((room) => <tr key={room.id}>
    <td><span className="room-name"><i>{room.title.slice(0, 1)}</i><span><strong>{room.title}</strong><small>{room.topic} · {room.id}</small></span></span></td>
    <td>{room.hostName}</td><td className="metric-cell">{integerNumber.format(room.listenerCount)}</td><td><Status value={room.status}/></td>
    <td><button className="table-action" disabled={busyId === room.id} onClick={() => onStatus(room)}>{busyId === room.id ? "处理中" : room.status === "live" ? "结束房间" : "恢复直播"}</button></td>
  </tr>)}</tbody></table>{rooms.length === 0 ? <Empty>当前筛选条件下没有房间。</Empty> : null}</div>;
}

function ReportTable({ reports, busyId, onResolve }: { reports: AdminReport[]; busyId: string | null; onResolve: (report: AdminReport, status: "resolved" | "dismissed") => void }) {
  return <div className="table-scroll"><table className="admin-table"><thead><tr><th>举报对象</th><th>举报原因</th><th>举报人</th><th>时间</th><th>状态</th><th>操作</th></tr></thead><tbody>{reports.map((report) => <tr key={report.id}>
    <td><strong>{report.targetType === "room" ? "语聊房" : "用户"}</strong><small className="cell-subline">{report.targetId}</small></td>
    <td>{reasonLabels[report.reason] ?? report.reason}<small className="cell-subline clamp">{report.details}</small></td><td>{report.reporterName}</td><td>{relativeTime(report.createdAt)}</td><td><Status value={report.status}/></td>
    <td><span className="action-group"><button disabled={busyId === report.id || report.status === "resolved"} onClick={() => onResolve(report, "resolved")}>通过</button><button className="danger" disabled={busyId === report.id || report.status === "dismissed"} onClick={() => onResolve(report, "dismissed")}>驳回</button></span></td>
  </tr>)}</tbody></table>{reports.length === 0 ? <Empty>审核队列已清空。</Empty> : null}</div>;
}

function TransactionTable({ transactions }: { transactions: AdminTransaction[] }) {
  return <div className="table-scroll"><table className="admin-table"><thead><tr><th>订单号</th><th>用户</th><th>类型</th><th>金额</th><th>状态</th><th>时间</th></tr></thead><tbody>{transactions.map((transaction) => <tr key={transaction.id}>
    <td className="mono">{transaction.providerReference ?? transaction.id}</td><td>{transaction.userName}</td><td>钻石充值 · {integerNumber.format(transaction.diamonds)}</td><td className="metric-cell">{currencyNumber.format(transaction.amountPkr)}</td><td><Status value={transaction.status}/></td><td>{relativeTime(transaction.createdAt)}</td>
  </tr>)}</tbody></table>{transactions.length === 0 ? <Empty>暂无充值交易记录。</Empty> : null}</div>;
}

function UserTable({ users, busyId, onStatus }: { users: AdminUser[]; busyId: string | null; onStatus: (user: AdminUser) => void }) {
  return <div className="table-scroll"><table className="admin-table"><thead><tr><th>用户</th><th>城市 / 语言</th><th>VIP</th><th>资产</th><th>状态</th><th>注册时间</th><th>操作</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}>
    <td><span className="user-name"><i>{user.displayName.slice(0, 1)}</i><span><strong>{user.displayName}</strong><small>{user.phone ?? user.email ?? user.id}</small></span></span></td><td>{user.city}<small className="cell-subline">{user.locale.toUpperCase()}</small></td><td className="gold-text">VIP {user.vipLevel}</td><td>{integerNumber.format(user.diamonds ?? 0)} 钻石<small className="cell-subline">{integerNumber.format(user.gameCoins ?? 0)} 游戏币</small></td><td><Status value={user.status}/></td><td>{new Date(user.createdAt).toLocaleDateString("zh-CN")}</td><td><button className={user.status === "active" ? "table-action danger-text" : "table-action"} disabled={busyId === user.id} onClick={() => onStatus(user)}>{busyId === user.id ? "处理中" : user.status === "active" ? "停用" : "恢复"}</button></td>
  </tr>)}</tbody></table>{users.length === 0 ? <Empty>当前筛选条件下没有用户。</Empty> : null}</div>;
}

export function AdminDashboard() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [section, setSection] = useState<SectionId>("overview");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const [overviewData, userData] = await Promise.all([adminApi.overview(), adminApi.users()]);
      setOverview(overviewData);
      setUsers(userData.items);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "后台数据加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([adminApi.overview(), adminApi.users()])
      .then(([overviewData, userData]) => {
        if (!active) return;
        setOverview(overviewData);
        setUsers(userData.items);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "后台数据加载失败");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filtered = useMemo(() => {
    const matches = (...values: Array<string | null | undefined>) => !deferredQuery || values.some((value) => value?.toLowerCase().includes(deferredQuery));
    return {
      rooms: (overview?.rooms ?? []).filter((room) => matches(room.title, room.hostName, room.topic)),
      reports: (overview?.reports ?? []).filter((report) => matches(report.reporterName, report.reason, report.details, report.targetId)),
      transactions: (overview?.transactions ?? []).filter((transaction) => matches(transaction.id, transaction.userName, transaction.providerReference)),
      users: users.filter((user) => matches(user.displayName, user.phone, user.email, user.city)),
    };
  }, [deferredQuery, overview, users]);

  const mutate = async (id: string, work: () => Promise<unknown>, message: string) => {
    setBusyId(id);
    try { await work(); await load(true); setToast(message); }
    catch (reason) { setToast(reason instanceof Error ? reason.message : "操作失败"); }
    finally { setBusyId(null); }
  };

  const selectSection = (id: SectionId) => { setSection(id); setMobileNav(false); setQuery(""); };
  const currentLabel = navigation.find((item) => item.id === section)?.label ?? "运营总览";

  return <div className="admin-shell">
    <aside className={`admin-sidebar${mobileNav ? " is-open" : ""}`}>
      <div className="admin-brand"><Image src="/media/sada-admin-mark.png" alt="SADA" width={46} height={46} priority/><span><strong>SADA</strong><small>管理后台</small></span></div>
      <nav aria-label="管理后台主导航">{navigation.map((item) => <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => selectSection(item.id)}><AdminIcon name={item.icon}/><span>{item.label}</span></button>)}</nav>
      <div className="sidebar-account"><span>{overview?.operator.name?.slice(0, 1) ?? "A"}</span><p><strong>{overview?.operator.name ?? "管理员"}</strong><small>{overview?.operator.email ?? "安全运营中心"}</small></p></div>
    </aside>

    <main className="admin-main">
      <header className="admin-topbar">
        <button className="mobile-menu" aria-label="展开导航" onClick={() => setMobileNav((value) => !value)}><AdminIcon name="menu"/></button>
        <div className="page-title"><h1>{currentLabel}</h1><p>{sectionDescriptions[section]}</p></div>
        <label className="admin-search"><AdminIcon name="search" size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索用户、房间、订单或内容…" aria-label="全局搜索"/></label>
        <button className="date-control"><AdminIcon name="calendar" size={18}/>最近 7 天</button>
        <button className="icon-button" aria-label="刷新数据" onClick={() => void load()}><AdminIcon name="refresh" size={18}/></button>
        <button className="icon-button notification" aria-label="通知"><AdminIcon name="bell" size={18}/><i/></button>
      </header>

      <div className="admin-content">
        {loading ? <div className="admin-loading"><span/><p>正在同步平台数据…</p></div> : null}
        {error && !loading ? <div className="admin-error"><h2>无法加载管理数据</h2><p>{error}</p><button onClick={() => void load()}>重新加载</button></div> : null}
        {overview && !loading && !error ? <>
          {section === "overview" ? <>
            <section className="metric-strip">
              <article><span className="metric-icon"><AdminIcon name="users"/></span><p>总用户<strong>{compactNumber.format(overview.metrics.totalUsers)}</strong><small>全部注册账户</small></p></article>
              <article><span className="metric-icon"><AdminIcon name="overview"/></span><p>今日活跃<strong>{compactNumber.format(overview.metrics.activeUsers)}</strong><small>过去 24 小时更新</small></p></article>
              <article><span className="metric-icon cyan"><AdminIcon name="rooms"/></span><p>在线房间<strong>{integerNumber.format(overview.metrics.liveRooms)}</strong><small>实时语音场景</small></p></article>
              <article className="attention"><span className="metric-icon gold"><AdminIcon name="safety"/></span><p>待处理举报<strong>{integerNumber.format(overview.metrics.pendingReports)}</strong><small>需运营审核</small></p></article>
            </section>
            <section className="overview-grid"><TrendChart points={overview.trends}/><section className="admin-panel live-panel"><header className="panel-header"><div><h2>实时运营</h2><p><i className="live-dot"/> 当前在线房间</p></div><button onClick={() => selectSection("rooms")}>查看全部 <AdminIcon name="arrow" size={15}/></button></header><RoomTable rooms={filtered.rooms.slice(0, 5)} busyId={busyId} onStatus={(room) => void mutate(room.id, () => adminApi.updateRoom(room.id, room.status === "live" ? "ended" : "live"), room.status === "live" ? "房间已结束" : "房间已恢复")}/></section></section>
            <section className="overview-grid lower"><section className="admin-panel"><header className="panel-header"><div><h2>内容安全审核队列</h2><p>{overview.metrics.pendingReports} 条待处理举报</p></div><button onClick={() => selectSection("safety")}>进入审核台 <AdminIcon name="arrow" size={15}/></button></header><ReportTable reports={filtered.reports.slice(0, 4)} busyId={busyId} onResolve={(report, status) => void mutate(report.id, () => adminApi.updateReport(report.id, status), status === "resolved" ? "举报已处理" : "举报已驳回")}/></section><section className="admin-panel"><header className="panel-header"><div><h2>最近交易订单</h2><p>7 天收入 {currencyNumber.format(overview.metrics.revenuePkr)}</p></div><button onClick={() => selectSection("payments")}>查看全部 <AdminIcon name="arrow" size={15}/></button></header><TransactionTable transactions={filtered.transactions.slice(0, 5)}/></section></section>
          </> : null}

          {section === "users" ? <section className="admin-panel full-panel"><header className="panel-header"><div><h2>用户账号</h2><p>共 {integerNumber.format(overview.metrics.totalUsers)} 个注册账户</p></div><span className="panel-note">当前显示 {filtered.users.length} 条</span></header><UserTable users={filtered.users} busyId={busyId} onStatus={(user) => void mutate(user.id, () => adminApi.updateUser(user.id, user.status === "active" ? "suspended" : "active"), user.status === "active" ? "用户已停用" : "用户已恢复")}/></section> : null}
          {section === "rooms" ? <section className="admin-panel full-panel"><header className="panel-header"><div><h2>语聊房巡检</h2><p>{overview.metrics.liveRooms} 个房间正在直播</p></div><span className="live-summary"><i className="live-dot"/> 实时数据</span></header><RoomTable rooms={filtered.rooms} busyId={busyId} onStatus={(room) => void mutate(room.id, () => adminApi.updateRoom(room.id, room.status === "live" ? "ended" : "live"), room.status === "live" ? "房间已结束" : "房间已恢复")}/></section> : null}
          {section === "safety" ? <section className="admin-panel full-panel"><header className="panel-header"><div><h2>安全审核工作台</h2><p>优先处理未审核及审核中的举报</p></div><span className="panel-note">待处理 {overview.metrics.pendingReports}</span></header><ReportTable reports={filtered.reports} busyId={busyId} onResolve={(report, status) => void mutate(report.id, () => adminApi.updateReport(report.id, status), status === "resolved" ? "举报已处理" : "举报已驳回")}/></section> : null}
          {section === "payments" || section === "economy" ? <><section className="metric-strip compact"><article><span className="metric-icon gold"><AdminIcon name="payments"/></span><p>7 天充值<strong>{currencyNumber.format(overview.metrics.revenuePkr)}</strong><small>成功支付订单</small></p></article><article><span className="metric-icon"><AdminIcon name="economy"/></span><p>交易笔数<strong>{overview.transactions.length}</strong><small>最近订单样本</small></p></article></section><section className="admin-panel full-panel"><header className="panel-header"><div><h2>{section === "economy" ? "平台经济流水" : "支付订单"}</h2><p>充值状态与钻石发放记录</p></div></header><TransactionTable transactions={filtered.transactions}/></section></> : null}
          {section === "campaigns" ? <section className="settings-grid"><article><AdminIcon name="campaigns" size={28}/><h2>任务与签到</h2><p>现有后端已支持任务进度、奖励领取和每日签到。下一步可在此增加任务创建、时间窗口及奖励配置。</p><button onClick={() => setToast("活动配置模块将在下一迭代开放")}>查看规划</button></article><article><AdminIcon name="overview" size={28}/><h2>运营效果</h2><p>接入活动曝光、参与、完成和奖励成本后，将在这里提供完整转化漏斗。</p></article></section> : null}
          {section === "settings" ? <section className="settings-grid"><article><AdminIcon name="safety" size={28}/><h2>管理员访问控制</h2><p>生产环境通过 SADA_ADMIN_EMAILS 或服务令牌授权；未配置时默认拒绝访问。</p><Status value="active"/></article><article><AdminIcon name="settings" size={28}/><h2>运行环境</h2><p>Cloudflare Workers · D1 数据库 · API v1</p><span className="config-value">{overview.operator.email}</span></article></section> : null}
        </> : null}
      </div>
    </main>
    {toast ? <div className="admin-toast" role="status">{toast}</div> : null}
  </div>;
}
