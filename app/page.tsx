"use client";
/* eslint-disable jsx-a11y/no-autofocus */

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ActivityCenterScreen, InventoryCenterScreen, MarketplaceScreen, PartnerCenterScreen, SafetyCenterScreen } from "./systems";
import { SystemHubScreen, SystemModuleScreen, SystemSectionId, SystemSectionScreen } from "./mindmap-systems";
import { CollectionScreen, CreateRoomScreen, GameHistoryScreen, InviteFriendsScreen, ProfileSettingsScreen, SearchScreen, UserProfileScreen, VipBenefitsScreen } from "./prototype-flows";
import { initialPaymentOrders, PaymentCenterScreen, PaymentOrder } from "./payment";
import { FlowTarget, OperationFlowCenterScreen } from "./operation-flows";
import { LatestPrototypeFlowsScreen } from "./latest-prototype-flows";
import { useAppLocalization } from "./localization";
import "./polish.css";
import "./polish-fixes.css";
import "./button-system.css";
import "./spacing-system.css";
import "./typography-system.css";
import "./day-theme.css";
import "./onboarding.css";
import "./video-player.css";
import "./home-banner.css";

type IconName = "search" | "diamond" | "personAdd" | "mic" | "users" | "game" | "play" | "bookmark" | "home" | "discover" | "message" | "profile" | "chevron" | "close";

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.2 4.2"/></>,
    diamond: <><path d="M3 8.2 6.5 4h11L21 8.2 12 20 3 8.2Z"/><path d="m6.5 4 2.1 4.2L12 4l3.4 4.2L17.5 4M3 8.2h18M8.6 8.2 12 20l3.4-11.8"/></>,
    personAdd: <><circle cx="9" cy="8" r="3.2"/><path d="M3.8 19c.4-4 2.2-6 5.2-6 1.3 0 2.3.3 3.1.9M17.5 11v7M14 14.5h7"/></>,
    mic: <><rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></>,
    users: <><circle cx="9" cy="9" r="3"/><path d="M3.5 19c.3-3.7 2.1-5.5 5.5-5.5s5.2 1.8 5.5 5.5M16 7.5a2.5 2.5 0 0 1 0 5M16.2 14.5c2.7.2 4.1 1.7 4.3 4.5"/></>,
    game: <><path d="M7.5 7h9c2.2 0 3.3 1.6 3.8 4.1l.8 4.1c.5 2.7-2.4 4.2-4 2.1l-1.5-1.8H8.4l-1.5 1.8c-1.7 2.1-4.5.6-4-2.1l.8-4.1C4.2 8.6 5.3 7 7.5 7Z"/><path d="M8 10v4M6 12h4M15.5 11.2h.01M18 13.5h.01"/></>,
    play: <path d="m9 7 8 5-8 5V7Z"/>,
    bookmark: <path d="M6.5 4.5h11v15L12 16l-5.5 3.5v-15Z"/>,
    home: <path d="m3.5 10 8.5-7 8.5 7v10h-6v-6h-5v6h-6V10Z"/>,
    discover: <><circle cx="12" cy="12" r="8.5"/><path d="m15.2 8.8-2 4.4-4.4 2 2-4.4 4.4-2Z"/></>,
    message: <path d="M4 5.5h16v11H9l-5 3v-14Z"/>,
    profile: <><circle cx="12" cy="8" r="4"/><path d="M4.8 21c.5-5 2.9-7.5 7.2-7.5s6.7 2.5 7.2 7.5"/></>,
    chevron: <path d="m9 5 7 7-7 7"/>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

const friends = [["Hamza", 0], ["Maira", 1], ["Zayan", 2], ["Noor", 3], ["Adeel", 4], ["Sana", 5]] as const;

const homeBanners = [
  { src: "/media/sada-welcome-banner-v2.png", alt: "SADA میں خوش آمدید — پاکستانی شاہانہ استقبالیہ گروپ", label: "SADA welcome", target: null },
  { src: "/media/sada-banner-ludo.png", alt: "آج رات لڈو کھیلیں — دوستوں کے ساتھ لڈو", label: "Play Ludo tonight", target: "games" },
  { src: "/media/sada-banner-video.png", alt: "آج کی مقبول ویڈیو — پاکستانی مقبول ڈراما", label: "Watch today’s popular video", target: "drama" },
] as const;

const formatVideoTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

type Locale = "en" | "zh" | "ur";

const homeCopy = {
  en: {
    code: "EN", language: "English", selectedToast: "Language changed to English", greeting: "Good evening, Ayaan", friends: "Friends online",
    activityMeta: "Night Society · 3 rewards ready", activityTitle: "Complete tonight’s crew missions",
    liveNow: "Live now", live: "Live", listening: "1.2K listening", join: "Join room",
    playTogether: "Play together", gameTitle: "Ludo Nights", gameMeta: "6 friends playing",
    story: "Tonight’s story", dramaMeta: "Episode 04 · 8 min",
    nav: { Home: "Home", Discover: "Discover", Play: "Play", Inbox: "Inbox", Profile: "Profile" },
  },
  zh: {
    code: "中", language: "中文", selectedToast: "已切换为中文", greeting: "晚上好，Ayaan", friends: "在线好友",
    activityMeta: "夜间社群 · 3 个奖励待领取", activityTitle: "完成今晚的好友任务",
    liveNow: "正在直播", live: "直播", listening: "1.2K 人正在收听", join: "加入房间",
    playTogether: "一起玩", gameTitle: "Ludo 之夜", gameMeta: "6 位好友正在游戏",
    story: "今晚短剧", dramaMeta: "第 04 集 · 8 分钟",
    nav: { Home: "首页", Discover: "发现", Play: "游戏", Inbox: "消息", Profile: "我的" },
  },
  ur: {
    code: "اردو", language: "اردو", selectedToast: "زبان اردو میں تبدیل ہو گئی", greeting: "شام بخیر، ایان", friends: "آن لائن دوست",
    activityMeta: "نائٹ سوسائٹی · 3 انعامات تیار", activityTitle: "آج رات کے گروپ مشن مکمل کریں",
    liveNow: "ابھی لائیو", live: "لائیو", listening: "1.2K سن رہے ہیں", join: "روم میں شامل ہوں",
    playTogether: "ساتھ کھیلیں", gameTitle: "لوڈو نائٹس", gameMeta: "6 دوست کھیل رہے ہیں",
    story: "آج رات کی کہانی", dramaMeta: "قسط 04 · 8 منٹ",
    nav: { Home: "گھر", Discover: "دریافت", Play: "کھیلیں", Inbox: "پیغامات", Profile: "پروفائل" },
  },
} as const;

function Avatar({ index, name, size = "medium", speaking = false }: { index: number; name: string; size?: "small" | "medium" | "large"; speaking?: boolean }) {
  const openProfile = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
    window.dispatchEvent(new CustomEvent("sada:profile-peek", { detail: { name, index } }));
  };
  return <span className={`avatar avatar-${size}${speaking ? " is-speaking" : ""}`} role="button" tabIndex={0} aria-haspopup="dialog" aria-label={`View ${name}'s profile`} data-tip="View profile" onClick={openProfile} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") openProfile(event); }}><span className="avatar-photo" style={{ "--avatar-x": `${(index % 4) * 33.333}%`, "--avatar-y": `${Math.floor(index / 4) * 100}%` } as React.CSSProperties}/>{size !== "small" && <span className="online-dot"/>}</span>;
}

const profilePeekCopy = {
  en: { online:"Online now", mutual:"12 mutual friends", friends:"Friends", followers:"Followers", rooms:"Rooms", message:"Message", view:"View full profile", follow:"Follow", following:"Following", close:"Close player profile", bio:"Late-night stories, Ludo and good chai.", hint:"Tap any player avatar to open this card." },
  zh: { online:"当前在线", mutual:"12 位共同好友", friends:"好友", followers:"粉丝", rooms:"房间", message:"发消息", view:"查看完整资料", follow:"关注", following:"已关注", close:"关闭玩家资料", bio:"喜欢深夜故事、Ludo 和一杯好茶。", hint:"点击任意玩家头像即可打开资料卡。" },
  ur: { online:"ابھی آن لائن", mutual:"12 مشترکہ دوست", friends:"دوست", followers:"فالوورز", rooms:"رومز", message:"پیغام", view:"مکمل پروفائل", follow:"فالو کریں", following:"فالو کیا", close:"پروفائل بند کریں", bio:"رات کی کہانیاں، لوڈو اور اچھی چائے۔", hint:"پروفائل کھولنے کے لیے کسی بھی اوتار پر ٹیپ کریں۔" },
} as const;

function PlayerQuickCard({ player, locale, onClose, onMessage, onView }: { player:{name:string;index:number}; locale:Locale; onClose:()=>void; onMessage:()=>void; onView:()=>void }) {
  const [following, setFollowing] = useState(false);
  const labels = profilePeekCopy[locale];
  return <div className="profile-peek-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="profile-peek" role="dialog" aria-modal="true" aria-label={`${player.name} player profile`}>
      <button className="profile-peek-close" onClick={onClose} aria-label={labels.close}>×</button>
      <div className="profile-peek-identity"><Avatar name={player.name} index={player.index} size="large"/><span><i/>{labels.online}</span><h2>{player.name} Khan</h2><p>@{player.name.toLowerCase()} · Karachi</p><small>VIP {3 + player.index % 3} · Lv.{28 + player.index}</small></div>
      <p className="profile-peek-bio">{labels.bio}</p>
      <div className="profile-peek-stats"><span><b>{128 + player.index * 13}</b><small>{labels.friends}</small></span><span><b>{(1.8 + player.index * .4).toFixed(1)}K</b><small>{labels.followers}</small></span><span><b>{16 + player.index}</b><small>{labels.rooms}</small></span></div>
      <div className="profile-peek-mutual"><span>{[0,1,3].map(index => <Avatar key={index} name={friends[index][0]} index={index} size="small"/>)}</span><small>{labels.mutual}</small></div>
      <div className="profile-peek-actions"><button onClick={() => setFollowing(value => !value)} className={following ? "selected" : ""}>{following ? labels.following : labels.follow}</button><button className="primary" onClick={onMessage}>{labels.message}</button></div>
      <button className="profile-peek-full" onClick={onView}>{labels.view}<b>›</b></button>
      <small className="profile-peek-hint">{labels.hint}</small>
    </section>
  </div>;
}

function VoiceRoom({ onJoin, copy }: { onJoin: () => void; copy: (typeof homeCopy)[Locale] }) {
  const seats = useMemo(() => [
    { name: "Maira", index: 1, className: "seat seat-top" },
    { name: "Hamza", index: 0, className: "seat seat-left", speaking: true },
    { name: "Noor", index: 3, className: "seat seat-right", speaking: true },
    { name: "Adeel", index: 4, className: "seat seat-bottom-left" },
    { name: "Sana", index: 5, className: "seat seat-bottom-right", speaking: true },
  ], []);
  return <section className="voice-card" aria-labelledby="room-title">
    <div className="voice-card-top"><span className="live-label"><i/>{copy.live}</span><span className="listener-count"><Icon name="users" size={18}/>12</span></div>
    <div className="voice-stage"><div className="wave wave-a"/><div className="wave wave-b"/><div className="voice-orbit orbit-one"/><div className="voice-orbit orbit-two"/><span className="stage-mic"><Icon name="mic" size={34}/></span>
      {seats.map(seat => <span key={seat.name} className={seat.className}><Avatar name={seat.name} index={seat.index} speaking={seat.speaking}/>{seat.speaking && <i className="voice-bars"><b/><b/><b/><b/></i>}</span>)}
    </div>
    <div className="room-copy"><h2 id="room-title">Karachi Night Chai</h2><p>{copy.listening}</p></div>
    <button className="join-button" onClick={onJoin}><Icon name="mic" size={20}/>{copy.join}</button>
  </section>;
}

function MediaRow({ kind, title, meta, onClick }: { kind: "game" | "drama"; title: string; meta: string; onClick: () => void }) {
  return <button className={`media-row media-${kind}`} onClick={onClick}><span className="media-image" aria-hidden="true"/><span className="media-content"><span className="media-icon"><Icon name={kind === "game" ? "game" : "play"} size={19}/></span><strong>{title}</strong><small>{meta}</small>{kind === "game" && <span className="playing-friends">{[0,1,2,3,4].map(i => <Avatar key={i} name={friends[i][0]} index={friends[i][1]} size="small"/>)}</span>}</span><span className="row-action">{kind === "drama" ? <Icon name="bookmark" size={22}/> : <Icon name="chevron" size={21}/>}</span></button>;
}

function AccountFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<"welcome" | "phone" | "otp" | "profile" | "interests" | "permissions" | "suggestions" | "tasks">("welcome");
  const [phone, setPhone] = useState("+92 ");
  const [otp, setOtp] = useState("");
  const [displayName, setDisplayName] = useState("Ayaan Khan");
  const [city, setCity] = useState("Karachi");
  const [interests, setInterests] = useState<string[]>(["Ludo", "Music", "Drama"]);
  const [permissions, setPermissions] = useState({ notifications:true, microphone:true, contacts:false });
  const [following, setFollowing] = useState<string[]>(["Maira", "Hamza"]);
  const [tasks, setTasks] = useState([false, false, false, false, false]);
  const done = tasks.filter(Boolean).length;
  const sequence=["phone","otp","profile","interests","permissions","suggestions","tasks"] as const;
  const current=Math.max(0,sequence.indexOf(step as (typeof sequence)[number]));
  const progress=<div className="account-progress"><span>{current+1} / {sequence.length}</span><i><b style={{width:`${(current+1)/sequence.length*100}%`}}/></i></div>;
  const back=()=>setStep(current<=0?"welcome":sequence[current-1]);
  if (step === "welcome") return <div className="account-screen"><div className="account-brand">SADA</div><div className="account-hero"><span className="account-mark">S</span><h1>Find your people.</h1><p>Live conversations, playful nights and stories worth sharing.</p></div><div className="account-actions"><button className="join-button" onClick={() => setStep("phone")}>Continue with phone</button><button className="text-button" onClick={onComplete}>I already have an account</button><small>By continuing, you confirm you are 18+ and agree to our Terms, Privacy Policy and Community Rules.</small></div></div>;
  if (step === "phone") return <div className="account-screen">{progress}<button className="screen-back" onClick={back} aria-label="Back">‹</button><div className="account-form"><small className="account-kicker">Secure account</small><h1>Welcome to SADA</h1><p>Enter your Pakistan mobile number. We’ll send a secure verification code.</p><label>Phone number<input aria-label="Phone number" value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel"/></label><button className="join-button" disabled={phone.replace(/\D/g,"").length < 10} onClick={() => setStep("otp")}>Send code</button><small>Standard carrier messaging rates may apply.</small></div></div>;
  if (step === "otp") return <div className="account-screen">{progress}<button className="screen-back" onClick={back} aria-label="Back">‹</button><div className="account-form"><small className="account-kicker">Verify +92 mobile</small><h1>Enter the 6-digit code</h1><p>We sent a one-time code to {phone}. SADA staff will never ask for it.</p><label>One-time code<input autoFocus aria-label="One-time code" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} inputMode="numeric" placeholder="000000"/><small>{otp.length} / 6 · Demo code 482915</small></label><button className="join-button" disabled={otp.length!==6} onClick={() => setStep("profile")}>Verify and continue</button><button className="text-button" onClick={()=>setOtp("482915")}>Use demo code</button></div></div>;
  if (step === "profile") return <div className="account-screen">{progress}<button className="screen-back" onClick={back} aria-label="Back">‹</button><div className="account-form onboarding-form"><small className="account-kicker">Your public identity</small><h1>Build your profile</h1><p>Choose what people will see in rooms, games and chat.</p><div className="onboard-avatar-row">{["A","K","S","M"].map((letter,index)=><button key={letter} className={index===0?"selected":""} aria-label={`Avatar ${index+1}`}>{letter}</button>)}</div><label>Display name<input value={displayName} onChange={e=>setDisplayName(e.target.value)} maxLength={30}/></label><label>City<select value={city} onChange={e=>setCity(e.target.value)}><option>Karachi</option><option>Lahore</option><option>Islamabad</option><option>Other</option></select></label><button className="join-button" disabled={!displayName.trim()} onClick={() => setStep("interests")}>Save profile</button><small>Names and photos are checked against Community Rules before publication.</small></div></div>;
  if (step === "interests") return <div className="account-screen">{progress}<button className="screen-back" onClick={back} aria-label="Back">‹</button><div className="account-form onboarding-form"><small className="account-kicker">Personalize SADA</small><h1>What brings you here?</h1><p>Pick at least three. You can change these any time.</p><div className="interest-grid">{["Ludo","Cricket","Music","Poetry","Drama","Open chat","Carrom","Comedy"].map(item=><button key={item} className={interests.includes(item)?"selected":""} onClick={()=>setInterests(values=>values.includes(item)?values.filter(value=>value!==item):[...values,item])}>{interests.includes(item)?"✓ ":""}{item}</button>)}</div><button className="join-button" disabled={interests.length<3} onClick={() => setStep("permissions")}>Continue with {interests.length} interests</button></div></div>;
  if (step === "permissions") return <div className="account-screen">{progress}<button className="screen-back" onClick={back} aria-label="Back">‹</button><div className="account-form onboarding-form"><small className="account-kicker">You stay in control</small><h1>Choose permissions</h1><p>These are optional. SADA asks the device only when a feature needs access.</p><div className="permission-list">{([['notifications','Notifications','Room, friend and safety updates'],['microphone','Microphone','Speak in rooms and voice chat'],['contacts','Contacts','Privately find people you know']] as const).map(([key,title,meta])=><button key={key} onClick={()=>setPermissions(values=>({...values,[key]:!values[key]}))}><span><strong>{title}</strong><small>{meta}</small></span><b className={permissions[key]?"toggle on":"toggle"}><i/></b></button>)}</div><button className="join-button" onClick={() => setStep("suggestions")}>Continue</button><small>Contact matching uses protected comparison and never publishes your address book.</small></div></div>;
  if (step === "suggestions") return <div className="account-screen">{progress}<button className="screen-back" onClick={back} aria-label="Back">‹</button><div className="account-form onboarding-form"><small className="account-kicker">Recommended for {city}</small><h1>Meet your first crew</h1><p>Follow people who share your interests. Following is not the same as becoming friends.</p><div className="onboard-people">{[["Maira",1,"Music · Drama"],["Hamza",0,"Ludo · Cricket"],["Noor",3,"Poetry · Open chat"],["Sana",5,"Carrom · Comedy"]].map(([name,index,meta])=><button key={name} onClick={()=>setFollowing(values=>values.includes(String(name))?values.filter(value=>value!==name):[...values,String(name)])}><Avatar name={String(name)} index={Number(index)}/><span><strong>{name}</strong><small>{meta}</small></span><b>{following.includes(String(name))?"Following":"Follow"}</b></button>)}</div><button className="join-button" onClick={() => setStep("tasks")}>Continue with {following.length} follows</button></div></div>;
  return <div className="account-screen">{progress}<button className="screen-back" onClick={back} aria-label="Back">‹</button><div className="task-progress"><span>{done} / 5 complete</span><b><i style={{width:`${done / 5 * 100}%`}}/></b></div><div className="account-form tasks-form"><small className="account-kicker">Seven-day welcome journey</small><h1>Start with your crew.</h1><p>Five guided moments unlock your 80 Diamond welcome pack.</p>{["Enter a recommended voice room","Speak or follow the host","Add your first friend","Play one Ludo round","Browse the SADA Store"].map((label,index) => <button key={label} className={`onboard-task${tasks[index]?" done":""}`} onClick={() => setTasks(items => items.map((value,i) => i === index ? !value : value))}><span>{tasks[index]?"✓":index+1}</span><b>{label}</b><small>{tasks[index]?"Complete":"Tap to complete demo"}</small></button>)}<button className="join-button" disabled={done < 5} onClick={onComplete}>Claim reward & enter SADA</button></div></div>;
}

function VoiceRoomsScreen({ onBack, onOpenRoom, onSearch, onCreate }: { onBack: () => void; onOpenRoom: () => void; onSearch:()=>void; onCreate:()=>void }) {
  const [filter, setFilter] = useState("For you");
  const rooms = [
    ["Karachi Night Chai","Stories · Open mic","1.2K",1],
    ["Lahore Music House","Music · Requests","836",3],
    ["Islamabad Game Night","Ludo · Friendly","522",0],
    ["Urdu Poetry Circle","Poetry · Culture","318",5],
  ] as const;
  return <div className="feature-screen"><div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>Live conversations</small><h1>Voice rooms</h1></div><button className="icon-button" onClick={onSearch} aria-label="Search rooms"><Icon name="search"/></button></div><div className="filter-row">{["For you","Music","Games","New"].map(item => <button key={item} className={filter===item?"active":""} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="room-list">{rooms.map(([name,meta,count,index],roomIndex) => <button className="room-list-item" key={name} onClick={onOpenRoom}><span className="room-cover"><Avatar name={name} index={index}/><i className={roomIndex===0?"speaking":""}/></span><span><strong>{name}</strong><small>{meta}</small><em>{roomIndex===0?"Friends are here":"Live now"}</em></span><span className="room-count"><Icon name="users" size={16}/>{count}</span></button>)}</div><button className="create-room-button" onClick={onCreate}>+ Start a room</button></div>;
}

function RoomDetailScreen({ onBack, onJoin, notify }: { onBack: () => void; onJoin: (joined: boolean) => void; notify: (message: string) => void }) {
  const [muted, setMuted] = useState(false);
  const [following, setFollowing] = useState(false);
  const [message, setMessage] = useState("");
  const [giftOpen, setGiftOpen] = useState(false);
  const [roomPanel,setRoomPanel]=useState<"invite"|"menu"|null>(null);
  const [giftBalance, setGiftBalance] = useState(1250);
  const [chat, setChat] = useState(["Noor: That story was beautiful ✨","Hamza: Who wants the mic next?","Maira: Salaam everyone!"]);
  const leave = () => { onJoin(false); onBack(); };
  const send = () => { if (!message.trim()) return; setChat(items => [...items,`You: ${message.trim()}`]); setMessage(""); };
  const sendGift=(name:string,price:number)=>{if(giftBalance<price){notify("Not enough Diamonds");return}setGiftBalance(value=>value-price);setGiftOpen(false);setChat(items=>[...items,`You sent ${name} to Ayaan ✦`]);notify(`${name} sent to Ayaan`)};
  return <div className="room-detail"><div className="room-detail-head"><button className="screen-back" onClick={leave} aria-label="Leave room">‹</button><div><h1>Karachi Night Chai</h1><span><i/>Live · 1.2K listening</span></div><button className="icon-button" onClick={()=>setRoomPanel("menu")} aria-label="More options">•••</button></div><div className="host-line"><Avatar name="Host Ayaan" index={2}/><span><strong>Ayaan</strong><small>Host · Karachi</small></span><button onClick={() => setFollowing(value => !value)}>{following?"Following":"Follow"}</button></div><div className="room-orbit"><div className="voice-orbit orbit-one"/><div className="voice-orbit orbit-two"/>{[[1,"orbit-a"],[0,"orbit-b"],[3,"orbit-c"],[4,"orbit-d"],[5,"orbit-e"]].map(([index,className],i) => <span className={String(className)} key={String(className)}><Avatar name={`Speaker ${i+1}`} index={Number(index)} speaking={i===1||i===3}/><small>{["Maira","Hamza","Noor","Adeel","Sana"][i]}</small></span>)}<span className="center-host"><Avatar name="Ayaan" index={2} size="large" speaking/></span></div><div className="room-chat"><div className="chat-scroll">{chat.map((line,index) => <p key={`${line}-${index}`}>{line}</p>)}</div><div className="chat-input"><input aria-label="Room message" placeholder="Say salaam…" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => { if(e.key==="Enter") send(); }}/><button onClick={send}>Send</button></div></div><div className="voice-dock"><button onClick={()=>setRoomPanel("invite")}><Icon name="personAdd"/><span>Invite</span></button><button className={`main-mic${muted?" muted":""}`} onClick={() => { setMuted(value=>!value); onJoin(true); }}><Icon name="mic" size={30}/><span>{muted?"Unmute":"Mute"}</span></button><button className="gift-action" onClick={() => setGiftOpen(true)}>◇<span>Gift</span></button><button onClick={leave}><Icon name="close"/><span>Leave</span></button></div>{giftOpen?<div className="system-sheet gift-sheet" role="dialog" aria-label="Send a room gift"><button className="sheet-close" onClick={()=>setGiftOpen(false)} aria-label="Close">×</button><small>To Ayaan · ◆ {giftBalance}</small><h2>Send a moment</h2><div className="gift-grid">{[["Chai for Two",80,"♨"],["Emerald Rose",120,"✦"],["Moon Lantern",240,"◐"],["Royal Falcon",680,"◆"]].map(([name,price,symbol])=><button key={name} onClick={()=>sendGift(String(name),Number(price))}><span>{symbol}</span><strong>{name}</strong><small>◆ {price}</small></button>)}</div><p>Gift animation stays brief and never blocks the room controls.</p></div>:null}{roomPanel?<div className="system-sheet room-action-sheet" role="dialog" aria-label={roomPanel==="invite"?"Invite speakers":"Room options"}><button className="sheet-close" onClick={()=>setRoomPanel(null)}>×</button><small>{roomPanel==="invite"?"Friends online":"Room controls"}</small><h2>{roomPanel==="invite"?"Invite to the room":"Karachi Night Chai"}</h2>{roomPanel==="invite"?<div className="room-invite-list">{friends.slice(0,4).map(([name,index])=><button key={name} onClick={()=>{notify(`${name} invited`);setRoomPanel(null)}}><Avatar name={name} index={index}/><strong>{name}</strong><b>Invite</b></button>)}</div>:<div className="room-menu-list"><button onClick={()=>{notify("Room link copied");setRoomPanel(null)}}>↗ <span><strong>Share room</strong><small>Copy a private room link</small></span></button><button onClick={()=>{notify("Room notifications updated");setRoomPanel(null)}}>♧ <span><strong>Room notifications</strong><small>Following this room</small></span></button><button onClick={()=>{notify("Report form opened");setRoomPanel(null)}}>! <span><strong>Report room</strong><small>Safety and community rules</small></span></button></div>}</div>:null}</div>;
}

function DiscoverScreen({ onBack, onOpenDrama, onSearch, onOpenProfile }: { onBack: () => void; onOpenDrama: () => void; onSearch:()=>void; onOpenProfile:(name:string,index:number)=>void }) {
  const [tabName,setTabName]=useState("For you");
  return <div className="feature-screen discover-screen"><div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>Made for your night</small><h1>Discover</h1></div><button className="icon-button" onClick={onSearch} aria-label="Search discover"><Icon name="search"/></button></div><div className="filter-row">{["For you","Drama","People","Rooms"].map(item=><button key={item} className={tabName===item?"active":""} onClick={()=>setTabName(item)}>{item}</button>)}</div><button className="featured-drama" onClick={onOpenDrama}><span><small>Tonight’s premiere</small><strong>Dil Se Door</strong><em>Episode 04 · Secrets after sunset</em><b><Icon name="play" size={16}/> Watch now</b></span></button><div className="section-heading compact"><h2>Continue watching</h2></div><div className="content-rail"><button onClick={onOpenDrama}><span className="thumb drama-thumb"/><strong>Dil Se Door</strong><small>5:18 left</small><i><b style={{width:"62%"}}/></i></button><button onClick={onOpenDrama}><span className="thumb alt-thumb"/><strong>Ishq-e-Lahore</strong><small>Episode 02</small><i><b style={{width:"18%"}}/></i></button></div><div className="section-heading compact"><h2>People you may like</h2></div><div className="people-list">{[["Zoya",7],["Rayan",6],["Hiba",5]].map(([name,index])=><button key={name} onClick={()=>onOpenProfile(String(name),Number(index))}><Avatar name={String(name)} index={Number(index)}/><span><strong>{name}</strong><small>3 mutual friends</small></span><b>View</b></button>)}</div></div>;
}

function DramaPlayerScreen({ onBack, notify, poster }: { onBack:()=>void; notify:(message:string)=>void; poster:string }) {
  const videoRef=useRef<HTMLVideoElement>(null);const [playing,setPlaying]=useState(false);const [saved,setSaved]=useState(false);const [progress,setProgress]=useState(0);const [currentTime,setCurrentTime]=useState(0);const [duration,setDuration]=useState(0);const [unlocked,setUnlocked]=useState([1,2,3]);
  const togglePlayback=async()=>{const video=videoRef.current;if(!video)return;if(video.paused){try{await video.play()}catch{notify("Video playback could not start")}}else video.pause()};
  const restartPlayback=async()=>{const video=videoRef.current;if(!video)return;video.currentTime=0;try{await video.play()}catch{notify("Video playback could not start")}};
  const openEpisode=(episode:number)=>{if(!unlocked.includes(episode)){setUnlocked(items=>[...items,episode]);notify(`Episode ${episode} unlocked · ◆ 25`)}else{void restartPlayback();notify(`Episode ${episode} playing`)}};
  const seekVideo=(event:React.MouseEvent<HTMLButtonElement>)=>{const video=videoRef.current;if(!video||!duration)return;const rect=event.currentTarget.getBoundingClientRect();const ratio=Math.min(1,Math.max(0,(event.clientX-rect.left)/rect.width));video.currentTime=duration*ratio};
  return <div className="drama-player"><div className="drama-stage"><video ref={videoRef} className="drama-video" src="/media/sample-flower.mp4" poster={poster} preload="metadata" playsInline onLoadedMetadata={event=>setDuration(event.currentTarget.duration)} onTimeUpdate={event=>{const video=event.currentTarget;setCurrentTime(video.currentTime);setProgress(video.duration?video.currentTime/video.duration*100:0)}} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)}><track kind="captions" src="/media/sample-flower.vtt" srcLang="en" label="English" default/>Your browser does not support HTML video.</video><div className="drama-stage-top"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><button className="icon-button" onClick={()=>notify("Episode shared to your crew")} aria-label="Share episode">↗</button></div><button className={`big-play${playing?" is-playing":""}`} onClick={()=>void togglePlayback()} aria-label={playing?"Pause episode":"Play episode"}><Icon name="play" size={32}/></button><div className="drama-overlay"><small>Test video · MDN public sample</small><h1>Dil Se Door</h1><p>Public flower time-lapse inserted for playback testing.</p><button className="video-progress" onClick={seekVideo} aria-label="Seek video"><i style={{width:`${progress}%`}}/></button><span>{playing?"Playing":"Paused"} · {formatVideoTime(currentTime)} / {formatVideoTime(duration)}</span></div></div><div className="drama-info"><div><h2>Secrets after sunset</h2><p>This public sample clip lets the team verify playback, pause, seeking, progress and packaged desktop media.</p><div className="drama-actions"><button onClick={()=>notify("Discussion room joined")}>Join discussion room</button><button onClick={()=>notify("Following Dil Se Door")}>Follow series</button></div></div><button className={saved?"saved":""} onClick={()=>{setSaved(value=>!value);notify(saved?"Removed from your list":"Saved to your list");}}><Icon name="bookmark"/><span>{saved?"Saved":"Save"}</span></button></div><div className="episode-list"><h2>Episodes</h2>{["A quiet arrival","The unopened letter","Between two homes","Secrets after sunset","The return"].map((title,index)=>{const episode=index+1;const open=unlocked.includes(episode);return <button key={title} onClick={()=>openEpisode(episode)}><span>{String(episode).padStart(2,"0")}</span><strong>{title}</strong><small>{open?`${7+index} min`:"◆ 25"}</small><b className={open?"episode-open":"episode-lock"}>{open?"▶":"Locked"}</b></button>})}</div></div>;
}

function GameLobbyScreen({ onBack, onPlay, onHistory }: { onBack:()=>void; onPlay:()=>void; onHistory:()=>void }) {
  return <div className="feature-screen game-lobby"><div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>Play together</small><h1>Game lounge</h1></div><button className="icon-button" onClick={onHistory} aria-label="Game history">↻</button></div><button className="game-feature" onClick={onPlay}><span><small>6 friends are playing</small><strong>Ludo Nights</strong><p>Classic rules · 2–4 players</p><b><Icon name="play" size={16}/> Play now</b></span></button><div className="section-heading compact"><h2>Quick games</h2></div><div className="quick-games">{[["Carrom Club","2–4 players","◎"],["Quiz Bazaar","Fast trivia","?"],["Cricket Dash","Live challenge","⌁"]].map(([name,meta,symbol])=><button key={name} onClick={onPlay}><span>{symbol}</span><strong>{name}</strong><small>{meta}</small></button>)}</div><div className="section-heading compact"><h2>Friends playing</h2></div><div className="playing-now">{friends.slice(0,4).map(([name,index])=><button key={name} onClick={onPlay}><Avatar name={name} index={index}/><span><strong>{name}</strong><small>Ludo · Round 3</small></span><b>Join</b></button>)}</div></div>;
}

function LudoGameScreen({ onBack, notify }: { onBack:()=>void; notify:(message:string)=>void }) {
  const [dice,setDice]=useState(1);const [turn,setTurn]=useState(0);const [scores,setScores]=useState([18,12,9,6]);const [rolling,setRolling]=useState(false);
  const roll=()=>{setRolling(true);const next=(dice*5+turn*3)%6+1;window.setTimeout(()=>{setDice(next);setScores(values=>values.map((value,index)=>index===turn?value+next:value));setTurn(value=>(value+1)%4);setRolling(false);notify(`You rolled ${next}`);},350)};
  const reset=()=>{setDice(1);setTurn(0);setScores([18,12,9,6]);};
  return <div className="ludo-game"><div className="game-top"><button className="screen-back" onClick={onBack} aria-label="Leave game">‹</button><div><h1>Ludo Nights</h1><small>Friendly match · Round {turn+1}</small></div><button className="icon-button" onClick={reset} aria-label="Restart game">↻</button></div><div className="score-strip">{[["You",0],["Maira",1],["Hamza",2],["Noor",3]].map(([name,index])=><span key={name} className={turn===index?"active":""}><Avatar name={String(name)} index={Number(index)} size="small"/><b>{name}</b><small>{scores[Number(index)]} pts</small></span>)}</div><div className="ludo-board" aria-label="Ludo board"><div className="home-zone red"/><div className="home-zone green"/><div className="home-zone blue"/><div className="home-zone gold"/><div className="board-cross"/><span className="piece p1"/><span className="piece p2"/><span className="piece p3"/><span className="piece p4"/></div><div className="turn-copy"><small>{turn===0?"Your turn":["","Maira’s turn","Hamza’s turn","Noor’s turn"][turn]}</small><h2>{turn===0?"Roll the dice":"Waiting for the next move"}</h2></div><button className={`dice-button${rolling?" rolling":""}`} onClick={roll} disabled={rolling} aria-label="Roll dice"><span>{dice}</span><b>{rolling?"Rolling…":"Roll dice"}</b></button><button className="game-chat" onClick={()=>notify("Game chat opened")}><Icon name="message" size={18}/> Nice move!</button></div>;
}

function InboxScreen({ onBack, onChat, onNewMessage }: { onBack:()=>void; onChat:(name:string,index:number)=>void; onNewMessage:()=>void }) {
  const [tabName,setTabName]=useState("Messages");
  const [accepted,setAccepted]=useState<string[]>([]);
  const chats=[["Maira",1,"That room was so fun ✨","2m",2],["Hamza",0,"Ludo rematch tonight?","18m",1],["Noor",3,"Sent you a voice note","1h",0],["Sana",5,"Salaam Ayaan!","Yesterday",0]] as const;
  return <div className="feature-screen inbox-screen"><div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>Your circle</small><h1>Inbox</h1></div><button className="icon-button" onClick={onNewMessage} aria-label="New message">+</button></div><div className="filter-row">{["Messages","Requests","Activity"].map(item=><button key={item} className={tabName===item?"active":""} onClick={()=>setTabName(item)}>{item}</button>)}</div>{tabName==="Messages"?<div className="conversation-list">{chats.map(([name,index,last,time,unread])=><button key={name} onClick={()=>onChat(name,index)}><Avatar name={name} index={index}/><span><strong>{name}</strong><small>{last}</small></span><em>{time}{unread>0&&<b>{unread}</b>}</em></button>)}</div>:tabName==="Requests"?<div className="request-list">{[["Zoya",7,"Met in Urdu Poetry Circle"],["Rayan",6,"3 mutual friends"]].map(([name,index,meta])=><article key={name}><Avatar name={String(name)} index={Number(index)}/><span><strong>{name}</strong><small>{meta}</small></span><button disabled={accepted.includes(String(name))} onClick={()=>setAccepted(items=>[...items,String(name)])}>{accepted.includes(String(name))?"Added":"Accept"}</button></article>)}</div>:<div className="activity-feed">{[["◇","Marketplace order pending","Multan Voice Frame · 12 min"],["✓","Mission reward ready","Follow a room host · +30 Coin"],["!","Security check complete","No action required"],["✦","Maira sent you a gift","Chai for Two"]].map(([icon,title,meta])=><article key={title}><span>{icon}</span><div><strong>{title}</strong><small>{meta}</small></div></article>)}</div>}</div>;
}

function ChatScreen({ name, avatarIndex, onBack, notify }: { name:string; avatarIndex:number; onBack:()=>void; notify:(message:string)=>void }) {
  const [text,setText]=useState("");const [messages,setMessages]=useState([{mine:false,text:"That room was so fun ✨"},{mine:true,text:"It really was. Same time tomorrow?"},{mine:false,text:"Absolutely — I’ll invite the crew."}]);
  const send=()=>{if(!text.trim())return;setMessages(items=>[...items,{mine:true,text:text.trim()}]);setText("")};
  return <div className="chat-screen"><div className="chat-head"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><Avatar name={name} index={avatarIndex}/><span><strong>{name}</strong><small>Online now</small></span><button className="icon-button" onClick={()=>notify("Voice call started")} aria-label="Start voice call"><Icon name="mic"/></button></div><div className="message-stream"><div className="chat-day">Today</div>{messages.map((message,index)=><p key={index} className={message.mine?"mine":"theirs"}>{message.text}<small>{message.mine?"Read":""}</small></p>)}</div><div className="message-composer"><button onClick={()=>notify("Gift sent to Maira")} aria-label="Send quick gift">◇</button><input aria-label="Message" placeholder="Message…" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send()}}/><button onClick={send} aria-label="Send message">↑</button></div></div>;
}

function ProfileScreen({ balance, onBack, onOpen, onPayments, onActivity, onInventory, onMarketplace, onSafety, onPartner, onSystems, onFlows, onAccount, onSettings }: { balance:number; onBack:()=>void; onOpen:(screen:"store"|"vip"|"wallet")=>void; onPayments:()=>void; onActivity:()=>void; onInventory:()=>void; onMarketplace:()=>void; onSafety:()=>void; onPartner:()=>void; onSystems:()=>void; onFlows:()=>void; onAccount:()=>void; onSettings:()=>void }) {
  const [notifications,setNotifications]=useState(true);
  return <div className="feature-screen profile-screen"><div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>Your SADA</small><h1>Profile</h1></div><button className="icon-button" onClick={onSettings} aria-label="Profile settings">⚙</button></div><div className="profile-hero"><Avatar name="Ayaan" index={2} size="large"/><h2>Ayaan Khan</h2><p>@ayaan · Karachi</p><span><b>128</b> Friends <b>1.8K</b> Followers <b>VIP 3</b></span><button onClick={onSettings}>Edit profile</button></div><div className="profile-actions"><button onClick={onFlows}><span>↳</span><strong>Complete operation flows</strong><small>16 latest prototype journeys</small><Icon name="chevron"/></button><button onClick={onSystems}><span>▦</span><strong>Platform systems</strong><small>All mind-map modules</small><Icon name="chevron"/></button><button onClick={onActivity}><span>✓</span><strong>Activity center</strong><small>3 rewards are ready</small><Icon name="chevron"/></button><button onClick={onInventory}><span>◌</span><strong>My collection</strong><small>Items, tags and equipment</small><Icon name="chevron"/></button><button onClick={()=>onOpen("wallet")}><span>◆</span><strong>Wallet</strong><small>{balance.toLocaleString()} Diamonds</small><Icon name="chevron"/></button><button onClick={onPayments}><span>PKR</span><strong>Payments & billing</strong><small>Recharge, receipts and refunds</small><Icon name="chevron"/></button><button onClick={()=>onOpen("store")}><span>◇</span><strong>Store</strong><small>Gifts & styles</small><Icon name="chevron"/></button><button onClick={onMarketplace}><span>◈</span><strong>Marketplace</strong><small>Trade eligible collectibles</small><Icon name="chevron"/></button><button onClick={()=>onOpen("vip")}><span>V</span><strong>VIP membership</strong><small>Level 3 · 620 XP</small><Icon name="chevron"/></button></div><div className="settings-list"><button onClick={()=>setNotifications(value=>!value)}><span>Notifications</span><b className={notifications?"toggle on":"toggle"}><i/></b></button><button onClick={onSafety}><span>Safety & privacy</span><small>Protected ›</small></button><button onClick={onPartner}><span>Partner center</span><small>Grade A ›</small></button><button onClick={onAccount}><span>Preview onboarding</span><Icon name="chevron" size={18}/></button><button onClick={onSettings}><span>Language & preferences</span><small>English ›</small></button></div></div>;
}

function EconomyScreen({ mode, balance, onBalanceChange, onBack, onPayment, onSearch, onCollection, onBenefits, notify }: { mode:"store"|"vip"|"wallet"; balance:number; onBalanceChange:(balance:number)=>void; onBack:()=>void; onPayment:()=>void; onSearch:()=>void; onCollection:()=>void; onBenefits:(category?:string)=>void; notify:(message:string)=>void }) {
  const [vip,setVip]=useState(3);
  const [previewLevel,setPreviewLevel]=useState(3);
  const [category,setCategory]=useState("Featured");
  const [product,setProduct]=useState<{name:string;price:number;image:string;meta:string}|null>(null);
  const buy=(name:string,price:number)=>{if(balance<price){notify("Recharge required to complete this purchase");onPayment();return}onBalanceChange(balance-price);setProduct(null);notify(`${name} purchased · ${price} Diamonds`)};
  if(mode==="wallet")return <div className="feature-screen economy-screen">
    <div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>Clear and protected</small><h1>Wallet</h1></div><button className="icon-button" onClick={onPayment} aria-label="Payment history">↻</button></div>
    <div className="wallet-hero"><small>Diamond balance</small><strong>◆ {balance.toLocaleString()}</strong><p>Recharge currency · Store, gifts and premium experiences</p><button onClick={onPayment}>Recharge securely</button></div>
    <div className="wallet-breakdown">{[["Game Coin","8,420","Earned"],["Pending","240","12 min"],["Frozen","0","Protected"],["VIP XP","620","Growth"]].map(([name,value,meta])=><div key={name}><small>{name}</small><strong>{value}</strong><span>{meta}</span></div>)}</div>
    <div className="currency-boundary"><b>Two currencies, separate purposes</b><p>Diamonds are purchased for premium experiences. Game Coin is earned through valid activity and powers the player marketplace. They cannot be directly exchanged.</p></div>
    <div className="section-heading compact"><h2>Recent activity</h2><button onClick={()=>notify("Ledger filter opened")}>All</button></div>
    <div className="ledger">{[["Welcome reward","+80 Coin","Released · Today"],["Emerald Rose","−120 Diamond","Store · Today"],["Ludo mission","+240 Coin","Pending · 12 min"],["VIP monthly pack","+500 Diamond","Aug 27"]].map(([name,amount,date])=><div key={name}><span><strong>{name}</strong><small>{date}</small></span><b className={amount.startsWith("+")?"plus":""}>{amount}</b></div>)}</div>
  </div>;
  if(mode==="vip"){
    const tierBenefits=previewLevel<3?["Identity badge","Daily pack","2% store discount"]:previewLevel<5?["Entrance effect","More listings","Fee −1%"]:previewLevel<7?["Premium frame","Priority support","Fee −2%"]:previewLevel<9?["Room theme","Event priority","Fee −3%"]:["Signature suite","Dedicated care","10% store discount"];
    return <div className="feature-screen economy-screen"><div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>Prestige benefits</small><h1>SADA VIP</h1></div><span className="vip-crown">V</span></div>
      <div className="vip-panel"><small>{previewLevel===vip?"Current status":"Benefit preview"}</small><strong>VIP {previewLevel}</strong><p>{vip===3?"620 / 1,000 XP to VIP 4":"Level upgraded"}</p><i><b style={{width:vip===3?"62%":"100%"}}/></i><button onClick={()=>{if(previewLevel===4){setVip(4);notify("VIP 4 activated for demo")}else notify(`VIP ${previewLevel} benefit preview`)}}>{previewLevel===4&&vip===3?"Upgrade to VIP 4":previewLevel===vip?`VIP ${vip} active`:"Preview selected"}</button></div>
      <div className="vip-level-rail" aria-label="VIP levels">{[1,2,3,4,5,6,7,8,9,10].map(level=><button key={level} className={`${previewLevel===level?"active ":""}${level<=vip?"reached":""}`} onClick={()=>setPreviewLevel(level)}>{level}</button>)}</div>
      <div className="section-heading compact"><h2>VIP {previewLevel} benefits</h2><button onClick={()=>onBenefits()}>View all</button></div><div className="benefit-grid">{tierBenefits.map((name,index)=><button key={name} onClick={()=>onBenefits(index===0?"Identity":index===1?"Service":"Marketplace")}><span>{["✦","◇","◈"][index]}</span><strong>{name}</strong><small>{index===0?"Identity and recognition":index===1?"Service and convenience":"Fair marketplace value"}</small></button>)}</div>
      <button className="vip-view-benefits" onClick={()=>onBenefits()}>View benefits</button><p className="fair-note">VIP improves identity, service and convenience. It never changes game odds, grants unlimited Coin or bypasses risk control.</p></div>;
  }
  const products=[
    {name:"Emerald Crescent",category:"Frames",price:360,image:"/media/frames/emerald-crescent.png",meta:"Permanent · Giftable · Tradable"},
    {name:"Multan Voice",category:"Frames",price:520,image:"/media/frames/multan-voice.png",meta:"30 days · Giftable · Bound"},
    {name:"Royal Voice",category:"Frames",price:680,image:"/media/frames/royal-voice.png",meta:"Permanent · Giftable · Tradable"},
    {name:"Festival Crown",category:"Frames",price:820,image:"/media/frames/festival-crown.png",meta:"14 days · Giftable · Limited"},
    {name:"Chai for Two",category:"Gifts",price:80,image:"/media/frames/multan-voice.png",meta:"Giftable · Room animation · Recyclable"},
    {name:"Emerald Rose",category:"Gifts",price:120,image:"/media/frames/emerald-crescent.png",meta:"Giftable · Profile moment · Recyclable"},
    {name:"Royal Falcon",category:"Gifts",price:680,image:"/media/frames/royal-voice.png",meta:"Giftable · High value · Limited"},
    {name:"Game Ticket Pack",category:"Utility",price:160,image:"/media/frames/festival-crown.png",meta:"5 tickets · Bound · 14 days"},
    {name:"Rename Card",category:"Utility",price:240,image:"/media/frames/emerald-crescent.png",meta:"Single use · Bound · Permanent"},
    {name:"Listing Slot",category:"Utility",price:300,image:"/media/frames/multan-voice.png",meta:"+1 marketplace slot · 30 days"},
    {name:"Karachi Night Ride",category:"Rides",price:960,image:"/media/frames/royal-voice.png",meta:"Entrance ride · 30 days · Giftable"},
    {name:"Emerald Caravan",category:"Rides",price:1480,image:"/media/frames/festival-crown.png",meta:"Premium ride · Permanent · Tradable"},
    {name:"New Member Pack",category:"Packs",price:120,image:"/media/frames/emerald-crescent.png",meta:"Frame · Bubble · 3 gifts · Bound"},
    {name:"Daily Social Pack",category:"Packs",price:220,image:"/media/frames/multan-voice.png",meta:"Tickets · Gifts · Fragments · 24 hours"},
  ];
  const filteredProducts=category==="Featured"?products.slice(0,4):products.filter(item=>item.category===category);
  const showcase=filteredProducts[0];
  return <div className="feature-screen economy-screen"><div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>Curated for you</small><h1>SADA Store</h1></div><span className="store-head-actions"><button onClick={onSearch} aria-label="Search store"><Icon name="search" size={17}/></button><button onClick={onCollection} aria-label="My collection">▣</button></span></div>
    <div className="filter-row">{["Featured","Frames","Gifts","Utility","Rides","Packs"].map(item=><button key={item} className={category===item?"active":""} onClick={()=>setCategory(item)}>{item}</button>)}</div>
    <button className="store-showcase" onClick={()=>setProduct(showcase)}><Image src={showcase.image} width={240} height={240} alt={showcase.name}/><span><small>{category==="Featured"?"Featured collection":category}</small><strong>{showcase.name}</strong><em>{showcase.meta}</em><b>View piece</b></span></button>
    <div className="store-product-grid">{filteredProducts.slice(1).map(item=><button key={item.name} onClick={()=>setProduct(item)}><Image src={item.image} width={180} height={180} alt=""/><strong>{item.name}</strong><small>{item.meta}</small><b>◆ {item.price}</b></button>)}</div>
    {product?<div className="system-sheet product-sheet" role="dialog" aria-label="Store item detail"><button className="sheet-close" onClick={()=>setProduct(null)} aria-label="Close">×</button><div className="detail-frame"><span className="preview-avatar"><Avatar name="Ayaan" index={2} size="large"/></span><Image src={product.image} width={210} height={210} alt={product.name}/></div><small>Emerald Collection</small><h2>{product.name}</h2><p>{product.meta}<br/>Eligible items show trading and gifting status before purchase.</p><div className="sheet-actions"><button onClick={()=>notify(`${product.name} preview applied`)}>Try</button><button className="sheet-primary" onClick={()=>buy(product.name,product.price)}>Get · ◆ {product.price}</button></div></div>:null}
  </div>;
}

type NavKey = keyof (typeof homeCopy)["en"]["nav"];
const navItems: { label: NavKey; icon: IconName }[] = [{ label: "Home", icon: "home" }, { label: "Discover", icon: "discover" }, { label: "Play", icon: "play" }, { label: "Inbox", icon: "message" }, { label: "Profile", icon: "profile" }];

export default function Home({ theme = "night" }: { theme?: "night" | "day" }) {
  const [accountOpen, setAccountOpen] = useState(false);
  const [appScreen, setAppScreen] = useState<"home"|"rooms"|"room"|"discover"|"drama"|"games"|"ludo"|"inbox"|"chat"|"profile"|"economy"|"payment"|"activity"|"inventory"|"marketplace"|"safety"|"partner"|"systemhub"|"systemsection"|"systemmodule"|"operationflows"|"latestflows"|"search"|"userprofile"|"invite"|"createroom"|"collection"|"vipbenefits"|"profilesettings"|"gamehistory">("home");
  const [systemSection,setSystemSection]=useState<SystemSectionId>("growth");
  const [systemModule,setSystemModule]=useState("new-user");
  const [economyMode,setEconomyMode]=useState<"store"|"vip"|"wallet">("store");
  const [chatPerson,setChatPerson]=useState({name:"Maira",index:1});
  const [selectedPerson,setSelectedPerson]=useState({name:"Maira",index:1});
  const [vipCategory,setVipCategory]=useState("All");
  const [diamondBalance,setDiamondBalance]=useState(1250);
  const [paymentOrders,setPaymentOrders]=useState<PaymentOrder[]>(initialPaymentOrders);
  const [activeNav, setActiveNav] = useState<NavKey>("Home");
  const [toast, setToast] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [profilePeek, setProfilePeek] = useState<{name:string;index:number} | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const copy = homeCopy[locale];
  useAppLocalization(locale);
  useEffect(() => {
    const open = (event: Event) => setProfilePeek((event as CustomEvent<{name:string;index:number}>).detail);
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setProfilePeek(null); };
    window.addEventListener("sada:profile-peek", open);
    window.addEventListener("keydown", closeOnEscape);
    return () => { window.removeEventListener("sada:profile-peek", open); window.removeEventListener("keydown", closeOnEscape); };
  }, []);
  useEffect(() => {
    if (theme !== "day" || appScreen !== "home" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => setBannerIndex(index => (index + 1) % homeBanners.length), 5000);
    return () => window.clearInterval(interval);
  }, [appScreen, bannerIndex, theme]);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 2200); };
  const joinRoom = () => { setJoined(true); notify("You joined Karachi Night Chai"); };
  const launchFlowTarget = (target: FlowTarget) => {
    if (target === "onboarding") { setAccountOpen(true); return; }
    if (target === "store") { setEconomyMode("store"); setAppScreen("economy"); return; }
    setAppScreen(target);
  };
  const activeBanner = homeBanners[bannerIndex];
  const openActiveBanner = () => {
    if (activeBanner.target === "games") { setActiveNav("Play"); setAppScreen("games"); }
    if (activeBanner.target === "drama") { setActiveNav("Discover"); setAppScreen("drama"); }
  };
  return <main className={`site-shell theme-${theme}`} data-theme={theme}><div className="app-frame" lang={locale === "ur" ? "ur-PK" : locale === "zh" ? "zh-CN" : "en-PK"} dir={locale === "ur" ? "rtl" : "ltr"}>
    {accountOpen ? <AccountFlow onComplete={() => { setAccountOpen(false); notify("Welcome to SADA · 80 Diamonds claimed"); }}/> : <>
    {appScreen === "home" ? <>
    <header className="app-header"><button className={`wordmark${theme === "day" ? " wordmark-image" : ""}`} aria-label="Open account setup" onClick={() => setAccountOpen(true)}>{theme === "day" ? <Image src="/media/sada-logo-bright.png" width={1983} height={793} sizes="116px" priority alt=""/> : "SADA"}</button><div className="header-actions"><button className="icon-button" onClick={()=>setAppScreen("search")} aria-label="Search SADA"><Icon name="search" size={19}/></button><button className="balance" onClick={() => {setEconomyMode("wallet");setAppScreen("economy")}}><Icon name="diamond" size={19}/>{diamondBalance.toLocaleString()}</button><button className="icon-button language-toggle" aria-label="Language" aria-expanded={languageOpen} onClick={() => setLanguageOpen(value => !value)}>{copy.code}</button></div></header>
    {languageOpen ? <div className="language-menu" role="menu" aria-label="Choose language">{(["en","zh","ur"] as const).map(item => <button key={item} role="menuitem" className={locale === item ? "active" : ""} onClick={() => { setLocale(item); setLanguageOpen(false); notify(homeCopy[item].selectedToast); }}><span>{homeCopy[item].code}</span><strong>{homeCopy[item].language}</strong>{locale === item ? <b>✓</b> : null}</button>)}</div> : null}
    <div className="app-scroll" id="top">
      {theme === "day" ? <section className="home-welcome-banner" aria-roledescription="carousel" aria-label="SADA featured banners">
        {activeBanner.target ? <button key={activeBanner.src} className="home-banner-slide home-banner-link" aria-label={activeBanner.label} onClick={openActiveBanner}><Image src={activeBanner.src} width={2172} height={724} sizes="(max-width: 699px) calc(100vw - 40px), 390px" priority alt={activeBanner.alt}/></button> : <div key={activeBanner.src} className="home-banner-slide"><Image src={activeBanner.src} width={2172} height={724} sizes="(max-width: 699px) calc(100vw - 40px), 390px" priority alt={activeBanner.alt}/></div>}
        <div className="home-banner-dots" aria-label="Choose featured banner">{homeBanners.map((banner,index) => <button key={banner.src} className={index === bannerIndex ? "active" : ""} aria-label={`Show banner ${index + 1}: ${banner.label}`} aria-current={index === bannerIndex ? "true" : undefined} onClick={() => setBannerIndex(index)}/>)}</div>
      </section> : null}
      <h1>{copy.greeting}</h1>
      <section className="friends-section" aria-labelledby="friends-title"><h2 id="friends-title">{copy.friends}</h2><div className="friend-rail">{friends.map(([name,index]) => <button key={name} aria-label={`Open ${name}'s profile`} onClick={() => {setSelectedPerson({name,index});setAppScreen("userprofile")}}><Avatar name={name} index={index}/></button>)}<button className="add-friend" aria-label="Invite a friend" onClick={() => setAppScreen("invite")}><Icon name="personAdd" size={24}/></button></div></section>
      <button className="home-activity" onClick={() => setAppScreen("activity")}><span><small>{copy.activityMeta}</small><strong>{copy.activityTitle}</strong><i aria-hidden="true"><b/></i></span><b>60%</b></button>
      <div className="section-heading"><h2>{copy.liveNow}</h2><button aria-label="See all live rooms" onClick={() => setAppScreen("rooms")}><Icon name="chevron" size={18}/></button></div><VoiceRoom copy={copy} onJoin={() => { joinRoom(); setAppScreen("room"); }}/>
      <div className="home-shortcuts"><section><div className="section-heading compact"><h2>{copy.playTogether}</h2><button aria-label="See all games" onClick={() => {setActiveNav("Play");setAppScreen("games");}}><Icon name="chevron" size={20}/></button></div><MediaRow kind="game" title={copy.gameTitle} meta={copy.gameMeta} onClick={() => setAppScreen("ludo")}/></section><section><div className="section-heading compact"><h2>{copy.story}</h2><button aria-label="See all stories" onClick={() => {setActiveNav("Discover");setAppScreen("discover");}}><Icon name="chevron" size={20}/></button></div><MediaRow kind="drama" title="Dil Se Door" meta={copy.dramaMeta} onClick={() => setAppScreen("drama")}/></section></div>
    </div></>
    : appScreen === "rooms" ? <VoiceRoomsScreen onBack={()=>setAppScreen("home")} onOpenRoom={()=>setAppScreen("room")} onSearch={()=>setAppScreen("search")} onCreate={()=>setAppScreen("createroom")}/>
    : appScreen === "room" ? <RoomDetailScreen onBack={()=>setAppScreen("rooms")} onJoin={setJoined} notify={notify}/>
    : appScreen === "discover" ? <DiscoverScreen onBack={()=>{setActiveNav("Home");setAppScreen("home")}} onOpenDrama={()=>setAppScreen("drama")} onSearch={()=>setAppScreen("search")} onOpenProfile={(name,index)=>{setSelectedPerson({name,index});setAppScreen("userprofile")}}/>
    : appScreen === "drama" ? <DramaPlayerScreen onBack={()=>setAppScreen("discover")} notify={notify} poster={theme === "day" ? "/media/sada-banner-video.png" : "/media/sada-drama.png"}/>
    : appScreen === "games" ? <GameLobbyScreen onBack={()=>{setActiveNav("Home");setAppScreen("home")}} onPlay={()=>setAppScreen("ludo")} onHistory={()=>setAppScreen("gamehistory")}/>
    : appScreen === "ludo" ? <LudoGameScreen onBack={()=>setAppScreen("games")} notify={notify}/>
    : appScreen === "inbox" ? <InboxScreen onBack={()=>setAppScreen("home")} onNewMessage={()=>setAppScreen("search")} onChat={(name,index)=>{setChatPerson({name,index});setAppScreen("chat")}}/>
    : appScreen === "chat" ? <ChatScreen name={chatPerson.name} avatarIndex={chatPerson.index} onBack={()=>setAppScreen("inbox")} notify={notify}/>
    : appScreen === "search" ? <SearchScreen onBack={()=>setAppScreen("home")} onOpenRoom={()=>setAppScreen("room")} onOpenProfile={(name,index)=>{setSelectedPerson({name,index});setAppScreen("userprofile")}} onOpenGame={()=>setAppScreen("games")} onOpenDrama={()=>setAppScreen("drama")}/>
    : appScreen === "userprofile" ? <UserProfileScreen {...selectedPerson} onBack={()=>setAppScreen("home")} onMessage={()=>{setChatPerson(selectedPerson);setAppScreen("chat")}} onOpenRoom={()=>setAppScreen("room")}/>
    : appScreen === "invite" ? <InviteFriendsScreen onBack={()=>setAppScreen("home")} notify={notify}/>
    : appScreen === "createroom" ? <CreateRoomScreen onBack={()=>setAppScreen("rooms")} onCreated={()=>{joinRoom();setAppScreen("room")}}/>
    : appScreen === "collection" ? <CollectionScreen onBack={()=>setAppScreen("economy")} notify={notify}/>
    : appScreen === "vipbenefits" ? <VipBenefitsScreen category={vipCategory} onBack={()=>setAppScreen("economy")} notify={notify}/>
    : appScreen === "profilesettings" ? <ProfileSettingsScreen onBack={()=>setAppScreen("profile")} notify={notify}/>
    : appScreen === "gamehistory" ? <GameHistoryScreen onBack={()=>setAppScreen("games")} onPlay={()=>setAppScreen("ludo")}/>
    : appScreen === "payment" ? <PaymentCenterScreen balance={diamondBalance} orders={paymentOrders} onBalanceChange={setDiamondBalance} onOrdersChange={setPaymentOrders} onBack={()=>{setEconomyMode("wallet");setAppScreen("economy")}} notify={notify}/>
    : appScreen === "activity" ? <ActivityCenterScreen onBack={()=>setAppScreen("profile")} notify={notify}/>
    : appScreen === "inventory" ? <InventoryCenterScreen onBack={()=>setAppScreen("profile")} onMarketplace={()=>setAppScreen("marketplace")} notify={notify}/>
    : appScreen === "marketplace" ? <MarketplaceScreen onBack={()=>setAppScreen("profile")} notify={notify}/>
    : appScreen === "safety" ? <SafetyCenterScreen onBack={()=>setAppScreen("profile")} notify={notify}/>
    : appScreen === "partner" ? <PartnerCenterScreen onBack={()=>setAppScreen("profile")} notify={notify}/>
    : appScreen === "systemhub" ? <SystemHubScreen onBack={()=>setAppScreen("profile")} onOpen={id=>{setSystemSection(id);setAppScreen("systemsection")}}/>
    : appScreen === "systemsection" ? <SystemSectionScreen sectionId={systemSection} onBack={()=>setAppScreen("systemhub")} onOpen={moduleId=>{setSystemModule(moduleId);setAppScreen("systemmodule")}}/>
    : appScreen === "systemmodule" ? <SystemModuleScreen sectionId={systemSection} moduleId={systemModule} onBack={()=>setAppScreen("systemsection")} notify={notify}/>
    : appScreen === "operationflows" ? <OperationFlowCenterScreen onBack={()=>setAppScreen("profile")} onLaunch={launchFlowTarget} notify={notify}/>
    : appScreen === "latestflows" ? <LatestPrototypeFlowsScreen onBack={()=>setAppScreen("profile")} notify={notify}/>
    : appScreen === "profile" ? <ProfileScreen balance={diamondBalance} onBack={()=>setAppScreen("home")} onOpen={mode=>{setEconomyMode(mode);setAppScreen("economy")}} onPayments={()=>setAppScreen("payment")} onActivity={()=>setAppScreen("activity")} onInventory={()=>setAppScreen("inventory")} onMarketplace={()=>setAppScreen("marketplace")} onSafety={()=>setAppScreen("safety")} onPartner={()=>setAppScreen("partner")} onSystems={()=>setAppScreen("systemhub")} onFlows={()=>setAppScreen("latestflows")} onAccount={()=>setAccountOpen(true)} onSettings={()=>setAppScreen("profilesettings")}/>
    : <EconomyScreen mode={economyMode} balance={diamondBalance} onBalanceChange={setDiamondBalance} onBack={()=>setAppScreen("profile")} onPayment={()=>setAppScreen("payment")} onSearch={()=>setAppScreen("search")} onCollection={()=>setAppScreen("collection")} onBenefits={category=>{setVipCategory(category||"All");setAppScreen("vipbenefits")}} notify={notify}/>} 
    {!(["room","drama","ludo","chat","economy","payment","systemhub","systemsection","systemmodule","operationflows","latestflows","search","userprofile","invite","createroom","collection","vipbenefits","profilesettings","gamehistory"] as string[]).includes(appScreen) && <nav className="bottom-nav" aria-label="Primary navigation">{navItems.map(item => <button key={item.label} className={activeNav === item.label ? "active" : ""} onClick={() => { setActiveNav(item.label); if(item.label === "Home") setAppScreen("home"); else if(item.label === "Discover") setAppScreen("discover"); else if(item.label === "Play") setAppScreen("games"); else if(item.label === "Inbox") setAppScreen("inbox"); else if(item.label === "Profile") setAppScreen("profile"); }}><span className="nav-icon"><Icon name={item.icon} size={23}/>{item.label === "Inbox" && <i className="unread-dot"/>}</span><span>{copy.nav[item.label]}</span></button>)}</nav>}
    {joined && <div className="room-dock"><span><i className="pulse-dot"/><b>Karachi Night Chai</b><small>Connected · listening</small></span><button aria-label="Leave room" onClick={() => { setJoined(false); notify("You left the room"); }}><Icon name="close" size={19}/></button></div>}
    </>}
    {profilePeek ? <PlayerQuickCard player={profilePeek} locale={locale} onClose={()=>setProfilePeek(null)} onMessage={()=>{setChatPerson(profilePeek);setProfilePeek(null);setAppScreen("chat")}} onView={()=>{setSelectedPerson(profilePeek);setProfilePeek(null);setAppScreen("userprofile")}}/> : null}
    <div className={`toast${toast ? " show" : ""}`} role="status">{toast}</div>
  </div></main>;
}
