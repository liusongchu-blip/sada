"use client";

import { useState } from "react";
import Image from "next/image";

type Notify = (message: string) => void;

function BackHeader({ eyebrow, title, onBack, action }: { eyebrow: string; title: string; onBack: () => void; action?: React.ReactNode }) {
  return <div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>{eyebrow}</small><h1>{title}</h1></div>{action ?? <span />}</div>;
}

const activityGroups = {
  Daily: [
    { id: "room", icon: "◖", title: "Stay in a voice room", meta: "7 / 10 min", reward: "+40 Coin", progress: 70 },
    { id: "friend", icon: "+", title: "Add a new friend", meta: "1 / 1 complete", reward: "+25 Coin", progress: 100 },
    { id: "game", icon: "◇", title: "Play valid matches", meta: "2 / 3 matches", reward: "+60 Coin", progress: 66 },
    { id: "gift", icon: "✦", title: "Send a room gift", meta: "0 / 1 gift", reward: "+15 Coin", progress: 0 },
  ],
  Social: [
    { id: "squad", icon: "◎", title: "Play with a friend", meta: "0 / 1 match", reward: "Game ticket", progress: 0 },
    { id: "streak", icon: "↗", title: "Three-day friendship streak", meta: "2 / 3 days", reward: "Crew title", progress: 66 },
    { id: "follow", icon: "+", title: "Follow a room host", meta: "1 / 1 complete", reward: "+30 Coin", progress: 100 },
  ],
  Games: [
    { id: "one", icon: "1", title: "Complete one valid match", meta: "1 / 1 complete", reward: "+20 Coin", progress: 100 },
    { id: "three", icon: "3", title: "Complete three matches", meta: "2 / 3 matches", reward: "Mini chest", progress: 66 },
    { id: "five", icon: "5", title: "Complete five matches", meta: "2 / 5 matches", reward: "+80 points", progress: 40 },
    { id: "ten", icon: "10", title: "Complete ten matches", meta: "2 / 10 matches", reward: "Rare fragment", progress: 20 },
  ],
};

export function ActivityCenterScreen({ onBack, notify }: { onBack: () => void; notify: Notify }) {
  const [tab, setTab] = useState<keyof typeof activityGroups>("Daily");
  const [claimed, setClaimed] = useState<string[]>([]);
  const [checkInDay, setCheckInDay] = useState(3);
  const [onlineClaims, setOnlineClaims] = useState([5, 15]);
  const [activityPanel,setActivityPanel]=useState<"rules"|"phase"|"leaderboard"|null>(null);
  const [phaseIndex,setPhaseIndex]=useState(1);
  const claim = (id: string, reward: string) => {
    if (claimed.includes(id)) return;
    setClaimed((items) => [...items, id]);
    notify(`${reward} claimed`);
  };

  return <div className="feature-screen activity-screen">
    <BackHeader eyebrow="Season 01 · Night Society" title="Activity center" onBack={onBack} action={<span className="points-badge">1,280 pts</span>} />
    <section className="campaign-hero">
      <div><small>New member journey</small><h2>Tonight belongs to your crew.</h2><p>Complete voice, friend and game moments to unlock the Emerald Welcome Frame.</p></div>
      <div className="campaign-progress"><span><b>3</b> of 5 milestones</span><i><b style={{ width: "60%" }} /></i></div>
    </section>
    <div className="section-heading compact"><h2>Seven-day check-in</h2><button onClick={() => setActivityPanel("rules")}>Rules</button></div>
    <div className="checkin-track">{[1,2,3,4,5,6,7].map((day) => <button key={day} className={`${day < checkInDay ? "done" : ""}${day === checkInDay ? " current" : ""}`} onClick={() => { if (day === checkInDay) { setCheckInDay((value) => Math.min(7, value + 1)); notify(`Day ${day} reward claimed`); } }}><span>{day < checkInDay ? "✓" : day === 7 ? "♛" : day}</span><small>D{day}</small></button>)}</div>
    <div className="section-heading compact"><h2>Effective online time</h2><small>18 min today</small></div>
    <div className="online-rewards">{[5,15,30,60,120].map((minutes) => { const ready = minutes <= 18; const claimedAlready = onlineClaims.includes(minutes); return <button key={minutes} className={ready ? "ready" : ""} disabled={!ready || claimedAlready} onClick={() => { setOnlineClaims((items) => [...items, minutes]); notify(`${minutes} minute reward claimed`); }}><b>{claimedAlready ? "✓" : `${minutes}m`}</b><small>{claimedAlready ? "Claimed" : ready ? "Claim" : "Locked"}</small></button>; })}</div>
    <div className="filter-row activity-tabs">{Object.keys(activityGroups).map((name) => <button key={name} className={tab === name ? "active" : ""} onClick={() => setTab(name as keyof typeof activityGroups)}>{name}</button>)}</div>
    <div className="mission-list">{activityGroups[tab].map((mission) => { const isClaimed = claimed.includes(mission.id); const ready = mission.progress === 100; return <article key={mission.id}><span className="mission-icon">{mission.icon}</span><div><strong>{mission.title}</strong><small>{mission.meta}</small><i><b style={{ width: `${mission.progress}%` }} /></i></div><button disabled={!ready || isClaimed} onClick={() => claim(mission.id, mission.reward)}>{isClaimed ? "Claimed" : mission.reward}</button></article>; })}</div>
    <div className="section-heading compact"><h2>30-day launch journey</h2><small>Day 9</small></div>
    <div className="season-phases">{[["D1–7","Cold start","Complete"],["D8–14","Habit building","Active"],["D15–30","Economy & content","Next"]].map(([days,name,status],index)=><button key={days} className={index===1?"active":index===0?"done":""} onClick={()=>{setPhaseIndex(index);setActivityPanel("phase")}}><span>{index===0?"✓":index+1}</span><b>{days}</b><strong>{name}</strong><small>{status}</small></button>)}</div>
    <div className="section-heading compact"><h2>Crew leaderboard</h2><button onClick={()=>setActivityPanel("leaderboard")}>Top 20</button></div>
    <div className="leaderboard">{[["Maira","2,480",1],["Ayaan","2,120",2],["Hamza","1,940",3]].map(([name,score,rank])=><article key={name}><b>#{rank}</b><span><strong>{name}</strong><small>Night Society</small></span><em>{score} pts</em></article>)}</div>
    <p className="system-note">Only effective activity counts. Background idling, repeated matches and suspicious multi-account behavior are excluded.</p>
    {activityPanel?<div className="system-sheet activity-sheet" role="dialog" aria-label="Activity detail"><button className="sheet-close" onClick={()=>setActivityPanel(null)} aria-label="Close">×</button>{activityPanel==="rules"?<><small>Fair reward policy</small><h2>Check-in rules</h2><div className="detail-rule-list">{["Check in once per calendar day","Missing a day resets the streak","Day 7 chest is bound and non-tradable","Suspicious device clusters receive manual review"].map((item,index)=><article key={item}><span>{index+1}</span><strong>{item}</strong></article>)}</div><button className="sheet-primary" onClick={()=>setActivityPanel(null)}>Understood</button></>:activityPanel==="phase"?<><small>{["D1–7","D8–14","D15–30"][phaseIndex]}</small><h2>{["Cold-start plan","Habit-building plan","Economy and content plan"][phaseIndex]}</h2><div className="phase-task-list">{([[
      "Claim the welcome pack","Complete the first voice-room milestone","Add a friend and finish a valid match"],["Finish online-time missions","Team up with friends in daily games","Follow a room and a drama series"],["Complete the first store purchase","Create a marketplace listing","Join a partner launch event"]][phaseIndex]).map(item=><button key={item} onClick={event=>event.currentTarget.classList.toggle("done")}><span>○</span><strong>{item}</strong></button>)}</div><button className="sheet-primary" onClick={()=>setActivityPanel(null)}>Save phase progress</button></>:<><small>Night Society · Weekly</small><h2>Top 20 crews</h2><div className="leaderboard full">{[["Maira","2,480"],["Ayaan","2,120"],["Hamza","1,940"],["Noor","1,720"],["Zayan","1,610"],["Sana","1,540"]].map(([name,score],index)=><article key={name}><b>#{index+1}</b><span><strong>{name}</strong><small>{index<3?"Prize tier unlocked":"Keep climbing"}</small></span><em>{score} pts</em></article>)}</div></>}</div>:null}
  </div>;
}

const marketItems = [
  { id: "multan", name: "Multan Voice Frame", price: 680, range: "480–920", image: "/media/frames/multan-voice.png", seller: "Hira · VIP 5", tag: "Tradable" },
  { id: "royal", name: "Royal Voice Crest", price: 1240, range: "900–1,600", image: "/media/frames/royal-voice.png", seller: "Zayan · VIP 7", tag: "Rare" },
  { id: "festival", name: "Festival Crown", price: 860, range: "620–1,100", image: "/media/frames/festival-crown.png", seller: "Noor · VIP 4", tag: "Limited" },
];

export function MarketplaceScreen({ onBack, notify }: { onBack: () => void; notify: Notify }) {
  const [tab, setTab] = useState("Market");
  const [coin, setCoin] = useState(8420);
  const [selected, setSelected] = useState<(typeof marketItems)[number] | null>(null);
  const [listingOpen, setListingOpen] = useState(false);
  const [orders, setOrders] = useState<string[]>([]);
  const [listings,setListings]=useState<{name:string;price:number;status:string}[]>([]);
  const [listingPrice,setListingPrice]=useState("540");
  const purchase = () => {
    if (!selected || coin < selected.price) return;
    setCoin((value) => value - selected.price);
    setOrders((items) => [selected.name, ...items]);
    notify(`${selected.name} purchased · settlement pending`);
    setSelected(null);
  };

  return <div className="feature-screen marketplace-screen">
    <BackHeader eyebrow="Player-to-player exchange" title="Marketplace" onBack={onBack} action={<span className="coin-balance">◈ {coin.toLocaleString()}</span>} />
    <div className="market-guard"><span>✓</span><p><strong>Trading unlocked</strong><small>Account age 18 days · 12 valid matches · standard fee 6%</small></p></div>
    <div className="filter-row">{["Market","My listings","Orders"].map((name) => <button key={name} className={tab === name ? "active" : ""} onClick={() => setTab(name)}>{name}</button>)}</div>
    {tab === "Market" ? <div className="market-grid">{marketItems.map((item) => <button key={item.id} onClick={() => setSelected(item)}><span className="market-image"><Image src={item.image} width={140} height={140} alt="" /><i>{item.tag}</i></span><strong>{item.name}</strong><small>{item.seller}</small><b>◈ {item.price.toLocaleString()}</b></button>)}</div> : tab === "My listings" ? <>{listings.length?<div className="order-list">{listings.map(item=><article key={item.name}><span>◇</span><div><strong>{item.name}</strong><small>{item.status} · standard fee 6%</small></div><b>◈ {item.price}</b></article>)}</div>:<div className="empty-market"><span>◇</span><h2>Your collection can travel.</h2><p>List eligible frames, fragments and limited gifts. Bound rewards cannot be traded.</p></div>}<button className="market-list-cta" onClick={() => setListingOpen(true)}>+ List an item</button></> : <div className="order-list">{orders.length ? orders.map((name, index) => <article key={`${name}-${index}`}><span>✓</span><div><strong>{name}</strong><small>Pending release · approximately 12 min</small></div><b>Purchased</b></article>) : <div className="empty-market"><span>↗</span><h2>No market orders yet.</h2><p>Completed, pending and risk-reviewed orders will appear here.</p></div>}</div>}
    <p className="system-note">Game Coin and Diamond never convert directly. Suspicious pricing, repeated transfers and high-value orders may be delayed or reviewed.</p>
    {selected ? <div className="system-sheet" role="dialog" aria-label="Marketplace item detail"><button className="sheet-close" onClick={() => setSelected(null)} aria-label="Close">×</button><div className="detail-frame"><Image src={selected.image} width={210} height={210} alt={selected.name} /></div><small>{selected.tag} · Permanent</small><h2>{selected.name}</h2><p>Seller: {selected.seller}<br />Allowed price range: ◈ {selected.range}<br />Platform fee is paid by the seller.</p><button className="sheet-primary" onClick={purchase}>Buy for ◈ {selected.price.toLocaleString()}</button></div> : null}
    {listingOpen ? <div className="system-sheet" role="dialog" aria-label="Create listing"><button className="sheet-close" onClick={() => setListingOpen(false)} aria-label="Close">×</button><small>Eligible inventory</small><h2>List Emerald Crescent</h2><label>Price in Game Coin<input aria-label="Listing price" value={listingPrice} onChange={event=>setListingPrice(event.target.value.replace(/\D/g,""))} inputMode="numeric" /></label><p>Allowed range ◈ 420–780 · estimated fee 6%</p><button className="sheet-primary" disabled={Number(listingPrice)<420||Number(listingPrice)>780} onClick={() => { setListings(items=>[{name:"Emerald Crescent",price:Number(listingPrice),status:"Under review"},...items]);setListingOpen(false);setTab("My listings");notify("Listing submitted for review");}}>Submit listing</button></div> : null}
  </div>;
}

export function SafetyCenterScreen({ onBack, notify }: { onBack: () => void; notify: Notify }) {
  const [privateAccount, setPrivateAccount] = useState(false);
  const [messageProtection, setMessageProtection] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState("Harassment or hate");
  const [submitted, setSubmitted] = useState(false);
  const [safetyPanel,setSafetyPanel]=useState<"blocked"|"appeals"|"wellbeing"|"settlement"|null>(null);
  const [breakReminder,setBreakReminder]=useState(true);
  return <div className="feature-screen safety-screen">
    <BackHeader eyebrow="Account & community" title="Safety center" onBack={onBack} action={<span className="safety-status">Protected</span>} />
    <section className="safety-hero"><span>✓</span><div><h2>Your account is protected.</h2><p>Recent sign-in, payment and trading checks show no action required.</p></div></section>
    <div className="section-heading compact"><h2>Privacy controls</h2></div>
    <div className="control-list"><button onClick={() => setPrivateAccount((value) => !value)}><span><strong>Private account</strong><small>Approve new followers manually</small></span><b className={privateAccount ? "toggle on" : "toggle"}><i /></b></button><button onClick={() => setMessageProtection((value) => !value)}><span><strong>Message protection</strong><small>Filter suspicious links and abuse</small></span><b className={messageProtection ? "toggle on" : "toggle"}><i /></b></button><button onClick={() => setSafetyPanel("blocked")}><span><strong>Blocked accounts</strong><small>3 accounts</small></span><em>›</em></button></div>
    <div className="section-heading compact"><h2>Help & reporting</h2></div>
    <div className="safety-actions"><button onClick={() => setReportOpen(true)}><span>!</span><strong>Report content or a user</strong><small>Room, message, profile, game or drama</small></button><button onClick={() => setSafetyPanel("appeals")}><span>↗</span><strong>Appeals & case status</strong><small>Evidence and decisions remain available</small></button><button onClick={() => setSafetyPanel("wellbeing")}><span>◎</span><strong>Age and wellbeing</strong><small>18+ controls, time reminders and support</small></button></div>
    <div className="risk-notice"><b>Marketplace protection</b><p>High-value trades, unusual prices and repeated transfers may be delayed. Frozen funds remain visible in Wallet with a clear reason and appeal path.</p></div>
    <div className="section-heading compact"><h2>Reward controls</h2><small>Live limits</small></div>
    <div className="risk-limits">{[["Daily output","420 / 600 Coin","70%"],["Hourly output","84 / 120 Coin","70%"],["Valid matches","7 / 10 matches","70%"],["Reward rate","100% · matches 1–5","100%"]].map(([name,value,width])=><article key={name}><span><strong>{name}</strong><small>{value}</small></span><i><b style={{width}}/></i></article>)}</div>
    <div className="section-heading compact"><h2>Settlement queue</h2><button onClick={()=>setSafetyPanel("settlement")}>Rules</button></div>
    <div className="settlement-list">{[["Ludo mission","+240 Coin","Releases in 12 min","pending"],["New member reward","+80 Coin","Releases tomorrow","review"],["Marketplace sale","+640 Coin","Standard review","ready"]].map(([name,amount,status,state])=><article key={name}><span className={state}>{state==="ready"?"✓":"◷"}</span><div><strong>{name}</strong><small>{status}</small></div><b>{amount}</b></article>)}</div>
    {reportOpen ? <div className="system-sheet" role="dialog" aria-label="Submit a safety report"><button className="sheet-close" onClick={() => setReportOpen(false)} aria-label="Close">×</button>{submitted ? <div className="report-success"><span>✓</span><h2>Report received</h2><p>Case SADA-4821 was created. Evidence is preserved and status updates will appear in Inbox.</p><button className="sheet-primary" onClick={() => { setReportOpen(false); setSubmitted(false); }}>Done</button></div> : <><small>Confidential report</small><h2>What happened?</h2><div className="report-options">{["Harassment or hate","Sexual or violent content","Scam or payment issue","Copyright concern"].map((type) => <button key={type} className={reportType === type ? "active" : ""} onClick={() => setReportType(type)}>{type}</button>)}</div><label>Details<textarea aria-label="Report details" placeholder="Add useful context without sharing private information…" /></label><button className="sheet-primary" onClick={() => { setSubmitted(true); notify("Safety report submitted"); }}>Submit report</button></>}</div> : null}
    {safetyPanel?<div className="system-sheet safety-detail-sheet" role="dialog" aria-label="Safety detail"><button className="sheet-close" onClick={()=>setSafetyPanel(null)} aria-label="Close">×</button>{safetyPanel==="blocked"?<><small>Privacy controls</small><h2>Blocked accounts</h2><div className="blocked-list">{["Usman_77","PromoKing","NightBot12"].map(name=><article key={name}><span>{name[0]}</span><strong>{name}</strong><button onClick={event=>{event.currentTarget.textContent="Unblocked";notify(`${name} unblocked`)}}>Unblock</button></article>)}</div></>:safetyPanel==="appeals"?<><small>Evidence and decisions</small><h2>Cases & appeals</h2><div className="case-list"><article><span>✓</span><div><strong>SADA-4821</strong><small>Report received · Under review</small></div><b>Open</b></article><article><span>✓</span><div><strong>SADA-4692</strong><small>Marketplace appeal · Resolved</small></div><b>Closed</b></article></div></>:safetyPanel==="wellbeing"?<><small>Age and wellbeing</small><h2>Healthy-use controls</h2><div className="control-list compact"><button onClick={()=>setBreakReminder(value=>!value)}><span><strong>Break reminder</strong><small>Remind me after 60 minutes</small></span><b className={breakReminder?"toggle on":"toggle"}><i/></b></button><button><span><strong>Quiet hours</strong><small>23:00–08:00</small></span><em>›</em></button></div><div className="wellbeing-time"><strong>42 min</strong><small>Today on SADA · 18 min below your average</small></div></>:<><small>Transparent release timing</small><h2>Settlement rules</h2><div className="detail-rule-list">{["Normal rewards release within 5–30 minutes","New-member rewards may release next day","Risk reviews can hold funds for 24 hours","Every hold remains visible with an appeal path"].map((item,index)=><article key={item}><span>{index+1}</span><strong>{item}</strong></article>)}</div></>}</div>:null}
  </div>;
}

const partnerSteps = ["Identity", "Rights", "Sandbox", "Review", "Limited release"];

export function PartnerCenterScreen({ onBack, notify }: { onBack: () => void; notify: Notify }) {
  const [type, setType] = useState<"Games" | "Drama">("Games");
  const [step, setStep] = useState(2);
  const [submitted, setSubmitted] = useState(false);
  const data = type === "Games" ? { title: "Ludo Nights", metric: "12.8K", label: "valid matches", secondary: "D7 24.6%", share: "Developer 60%" } : { title: "Dil Se Door", metric: "68%", label: "completion", secondary: "4.2K follows", share: "Studio 65%" };
  return <div className="feature-screen partner-screen">
    <BackHeader eyebrow="Invite-only ecosystem" title="Partner center" onBack={onBack} action={<span className="partner-grade">Grade A</span>} />
    <div className="filter-row">{(["Games","Drama"] as const).map((name) => <button key={name} className={type === name ? "active" : ""} onClick={() => setType(name)}>{name}</button>)}</div>
    <section className="partner-hero"><small>{type === "Games" ? "H5 · WebView · SADA SDK" : "Vertical series · Urdu / English"}</small><h2>{data.title}</h2><p>{type === "Games" ? "Unified login, friend invites, payments, task events and anti-cheat." : "Rights chain, subtitles, release calendar, social rooms and paid unlocks."}</p><div><span><strong>{data.metric}</strong><small>{data.label}</small></span><span><strong>{data.secondary}</strong><small>quality signal</small></span></div></section>
    <div className="section-heading compact"><h2>Release pipeline</h2><small>Step {step + 1} / 5</small></div>
    <div className="partner-pipeline">{partnerSteps.map((name, index) => <button key={name} className={`${index < step ? "done" : ""}${index === step ? " active" : ""}`} onClick={() => { if (index <= step) setStep(index); }}><span>{index < step ? "✓" : index + 1}</span><small>{name}</small></button>)}</div>
    <section className="pipeline-detail"><span>{step+1}</span><div><small>Current workspace</small><h2>{partnerSteps[step]}</h2><p>{[
      "Verify the company, finance contact and authorized team members.",
      "Upload copyright, music, talent and distribution evidence.",
      "Test login, payments, rewards and data events with sandbox accounts.",
      "Complete function, performance, content and safety review.",
      "Release to a controlled audience and monitor quality thresholds."
    ][step]}</p></div><button onClick={()=>{if(step<4){setStep(value=>value+1);notify(`${partnerSteps[step]} step completed`)}}} disabled={step>=4}>{step>=4?"Ready":"Complete step"}</button></section>
    <div className="partner-cards"><article><small>Revenue share</small><strong>{data.share}</strong><p>Calculated from verified net revenue after refunds, tax and invalid activity.</p></article><article><small>Next settlement</small><strong>Sep 15</strong><p>PKR 482,000 eligible · PKR 18,600 risk hold.</p></article></div>
    <div className="section-heading compact"><h2>Required controls</h2></div>
    <div className="requirement-list">{(type === "Games" ? ["Probability and purchase disclosure","Valid match and reward events","Crash rate below release threshold","Platform payment only"] : ["Series, music and talent rights","Urdu subtitles complete","Culture and minor-safety review","Paid-user takedown protection"]).map((name, index) => <div key={name}><span>{index < 3 ? "✓" : "○"}</span><p><strong>{name}</strong><small>{index < 3 ? "Verified" : "Action required before release"}</small></p></div>)}</div>
    <button className="partner-submit" disabled={submitted} onClick={() => { setSubmitted(true); notify("Version submitted for limited-release review"); }}>{submitted ? "Review submitted" : "Submit for limited release"}</button>
    <p className="system-note">Partners receive only necessary anonymized data. SADA retains control of accounts, payments, ranking, moderation and enforcement.</p>
  </div>;
}

const inventoryItems = [
  { id:"crescent", name:"Emerald Crescent", kind:"Frames", symbol:"◈", tags:["Tradable","Giftable","Permanent"], action:"Equipped" },
  { id:"bubble", name:"Night Chai Bubble", kind:"Items", symbol:"◌", tags:["Bound","30 days"], action:"Use" },
  { id:"rose", name:"Emerald Rose", kind:"Gifts", symbol:"✦", tags:["Giftable","Recyclable"], action:"Gift" },
  { id:"ticket", name:"Ludo Game Ticket", kind:"Items", symbol:"◇", tags:["Bound","7 days"], action:"Use" },
  { id:"fragment", name:"Festival Fragment", kind:"Items", symbol:"◆", tags:["Tradable","Recyclable"], action:"Combine" },
  { id:"falcon", name:"Royal Falcon", kind:"Gifts", symbol:"⌁", tags:["Giftable","Limited"], action:"Gift" },
] as const;

export function InventoryCenterScreen({ onBack, notify, onMarketplace }: { onBack:()=>void; notify:Notify; onMarketplace:()=>void }) {
  const [tab,setTab]=useState("All");
  const [selected,setSelected]=useState<(typeof inventoryItems)[number]|null>(null);
  const [equipped,setEquipped]=useState("crescent");
  const [removed,setRemoved]=useState<string[]>([]);
  const [gifting,setGifting]=useState(false);
  const items=inventoryItems.filter(item=>!removed.includes(item.id)&&(tab==="All"||item.kind===tab));
  return <div className="feature-screen inventory-screen">
    <BackHeader eyebrow="Owned items & status" title="My collection" onBack={onBack} action={<span className="coin-balance">{items.length} items</span>}/>
    <div className="inventory-summary"><div><small>Tradable value</small><strong>◈ 1,860</strong></div><div><small>Bound rewards</small><strong>3</strong></div><div><small>Expiring soon</small><strong>2</strong></div></div>
    <div className="filter-row">{["All","Frames","Gifts","Items"].map(name=><button key={name} className={tab===name?"active":""} onClick={()=>setTab(name)}>{name}</button>)}</div>
    <div className="inventory-grid">{items.map(item=><button key={item.id} onClick={()=>setSelected(item)}><span>{item.symbol}</span><strong>{item.name}</strong><small>{item.kind}</small><em>{equipped===item.id?"Equipped":item.action}</em><i>{item.tags.slice(0,2).map(tag=><b key={tag}>{tag}</b>)}</i></button>)}</div>
    <button className="inventory-market" onClick={onMarketplace}>Open player marketplace <span>›</span></button>
    {selected&&!gifting?<div className="system-sheet" role="dialog" aria-label="Inventory item detail"><button className="sheet-close" onClick={()=>setSelected(null)} aria-label="Close">×</button><div className="inventory-detail-symbol">{selected.symbol}</div><small>{selected.kind} · Owned</small><h2>{selected.name}</h2><div className="item-tags">{selected.tags.map(tag=><b key={tag}>{tag}</b>)}</div><p>{(selected.tags as readonly string[]).includes("Bound")?"This reward is bound to your account and cannot be traded.":"This item can move through eligible gifting or marketplace flows."}</p><div className="sheet-actions"><button onClick={()=>{if((selected.tags as readonly string[]).includes("Recyclable")){setRemoved(values=>[...values,selected.id]);setSelected(null);notify(selected.name + " recycled into 18 fragments")}else notify("This item cannot be recycled")}}>Recycle</button><button className="sheet-primary" onClick={()=>{if(selected.kind==="Gifts")setGifting(true);else{setEquipped(selected.id);setSelected(null);notify(selected.name + " equipped")}}}>{selected.kind==="Gifts"?"Send gift":"Equip / use"}</button></div></div>:null}
    {selected&&gifting?<div className="system-sheet" role="dialog" aria-label="Choose gift recipient"><button className="sheet-close" onClick={()=>setGifting(false)} aria-label="Close">×</button><small>Send {selected.name}</small><h2>Choose a friend</h2><div className="gift-recipient-list">{["Maira","Hamza","Noor","Sana"].map((name,index)=><button key={name} onClick={()=>{setRemoved(values=>[...values,selected.id]);setGifting(false);setSelected(null);notify(`${selected.name} sent to ${name}`)}}><span>{name[0]}</span><div><strong>{name}</strong><small>{index<2?"Online now":"Recently active"}</small></div><b>Send</b></button>)}</div></div>:null}
  </div>;
}
