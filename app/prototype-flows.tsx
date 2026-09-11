"use client";
/* eslint-disable jsx-a11y/no-autofocus */

import { useMemo, useState } from "react";
import "./prototype-flows.css";
import "./prototype-flows-addon.css";

function FlowHeader({ title, meta, onBack }: { title:string; meta:string; onBack:()=>void }) {
  return <div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>{meta}</small><h1>{title}</h1></div><span/></div>;
}

function PersonMark({ name, index=0 }: { name:string; index?:number }) {
  return <span className={`person-mark mark-${index%6}`}>{name.slice(0,1)}</span>;
}

export function SearchScreen({ onBack, onOpenRoom, onOpenProfile, onOpenGame, onOpenDrama }: { onBack:()=>void; onOpenRoom:()=>void; onOpenProfile:(name:string,index:number)=>void; onOpenGame:()=>void; onOpenDrama:()=>void }) {
  const [query,setQuery]=useState("");
  const [tab,setTab]=useState("All");
  const people=[["Maira",1,"Karachi · 12 mutual friends"],["Hamza",0,"Lahore · 8 mutual friends"],["Noor",3,"Islamabad · 5 mutual friends"]] as const;
  const normalized=query.trim().toLowerCase();
  const matches=(value:string)=>!normalized||value.toLowerCase().includes(normalized);
  return <div className="feature-screen flow-screen"><FlowHeader title="Search SADA" meta="People, rooms and moments" onBack={onBack}/><label className="flow-search"><span>⌕</span><input autoFocus value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search people, rooms, games or drama"/><button onClick={()=>setQuery("")} aria-label="Clear search">×</button></label><div className="filter-row">{["All","People","Rooms","Play","Drama"].map(item=><button key={item} className={tab===item?"active":""} onClick={()=>setTab(item)}>{item}</button>)}</div>{(tab==="All"||tab==="People")&&<section className="flow-section"><div className="section-heading compact"><h2>People</h2><small>{people.filter(item=>matches(item[0])).length} results</small></div><div className="flow-list">{people.filter(item=>matches(item[0])).map(([name,index,meta])=><button key={name} onClick={()=>onOpenProfile(name,index)}><PersonMark name={name} index={index}/><span><strong>{name}</strong><small>{meta}</small></span><em>View ›</em></button>)}</div></section>}{(tab==="All"||tab==="Rooms")&&matches("Karachi Night Chai")&&<section className="flow-section"><div className="section-heading compact"><h2>Live rooms</h2></div><button className="search-feature" onClick={onOpenRoom}><span>◉</span><div><strong>Karachi Night Chai</strong><small>Stories · 1.2K listening</small></div><b>Join</b></button></section>}{(tab==="All"||tab==="Play")&&matches("Ludo Nights")&&<section className="flow-section"><div className="section-heading compact"><h2>Games</h2></div><button className="search-feature" onClick={onOpenGame}><span>⌘</span><div><strong>Ludo Nights</strong><small>6 friends playing</small></div><b>Play</b></button></section>}{(tab==="All"||tab==="Drama")&&matches("Dil Se Door")&&<section className="flow-section"><div className="section-heading compact"><h2>Drama</h2></div><button className="search-feature" onClick={onOpenDrama}><span>▶</span><div><strong>Dil Se Door</strong><small>Episode 04 · 8 min</small></div><b>Watch</b></button></section>}</div>;
}

export function UserProfileScreen({ name, index, onBack, onMessage, onOpenRoom }: { name:string; index:number; onBack:()=>void; onMessage:()=>void; onOpenRoom:()=>void }) {
  const [following,setFollowing]=useState(false);
  return <div className="feature-screen flow-screen"><FlowHeader title={name} meta="SADA profile" onBack={onBack}/><section className="public-profile"><PersonMark name={name} index={index}/><h2>{name} Khan</h2><p>@{name.toLowerCase()} · Karachi</p><div><span><b>284</b> friends</span><span><b>4.2K</b> followers</span><span><b>VIP 4</b> member</span></div><div className="profile-cta"><button className={following?"selected":""} onClick={()=>setFollowing(value=>!value)}>{following?"Following":"Follow"}</button><button onClick={onMessage}>Message</button></div></section><div className="section-heading compact"><h2>Together on SADA</h2></div><button className="shared-room" onClick={onOpenRoom}><span>◉</span><div><small>Live together now</small><strong>Karachi Night Chai</strong><em>12 mutual friends are listening</em></div><b>Join ›</b></button><div className="section-heading compact"><h2>Recent moments</h2></div><div className="moment-grid"><button><span>♪</span><strong>Urdu poetry night</strong><small>Voice moment · Yesterday</small></button><button><span>♟</span><strong>Ludo win streak</strong><small>Game moment · 2 days ago</small></button></div></div>;
}

export function InviteFriendsScreen({ onBack, notify }: { onBack:()=>void; notify:(message:string)=>void }) {
  const contacts=useMemo(()=>[["Areeba","Phone contacts"],["Bilal","Phone contacts"],["Dua","Suggested from Karachi"],["Farhan","3 mutual friends"]],[]);
  const [selected,setSelected]=useState<string[]>([]);
  const [sent,setSent]=useState(false);
  const toggle=(name:string)=>setSelected(items=>items.includes(name)?items.filter(item=>item!==name):[...items,name]);
  return <div className="feature-screen flow-screen"><FlowHeader title="Invite friends" meta="Bring your people to SADA" onBack={onBack}/>{sent?<div className="flow-success"><span>✓</span><h2>Invites sent</h2><p>{selected.length} friends received your private SADA invite.</p><button onClick={onBack}>Done</button></div>:<><div className="invite-link"><span><small>Your invite link</small><strong>sada.app/i/ayaan</strong></span><button onClick={()=>notify("Invite link copied")}>Copy</button></div><div className="section-heading compact"><h2>Suggested contacts</h2><small>{selected.length} selected</small></div><div className="select-list">{contacts.map(([name,meta],index)=><button key={name} className={selected.includes(name)?"selected":""} onClick={()=>toggle(name)}><PersonMark name={name} index={index}/><span><strong>{name}</strong><small>{meta}</small></span><b>{selected.includes(name)?"✓":"+"}</b></button>)}</div><button className="flow-primary" disabled={!selected.length} onClick={()=>setSent(true)}>Send {selected.length||""} invite{selected.length===1?"":"s"}</button></>}</div>;
}

export function CreateRoomScreen({ onBack, onCreated }: { onBack:()=>void; onCreated:()=>void }) {
  const [step,setStep]=useState<"details"|"preview">("details");
  const [title,setTitle]=useState("My night room");
  const [topic,setTopic]=useState("Stories");
  const [privacy,setPrivacy]=useState("Public");
  return <div className="feature-screen flow-screen"><FlowHeader title={step==="details"?"Create a room":"Room preview"} meta={step==="details"?"Start a live conversation":"Ready to go live"} onBack={step==="preview"?()=>setStep("details"):onBack}/>{step==="details"?<div className="room-form"><label>Room title<input value={title} onChange={event=>setTitle(event.target.value)} maxLength={40}/><small>{title.length}/40</small></label><fieldset><legend>Topic</legend><div className="option-grid">{["Stories","Music","Games","Poetry"].map(item=><button type="button" key={item} className={topic===item?"selected":""} onClick={()=>setTopic(item)}>{item}</button>)}</div></fieldset><fieldset><legend>Who can join</legend><div className="option-grid two">{["Public","Friends only"].map(item=><button type="button" key={item} className={privacy===item?"selected":""} onClick={()=>setPrivacy(item)}>{item}</button>)}</div></fieldset><button className="flow-primary" disabled={!title.trim()} onClick={()=>setStep("preview")}>Preview room</button></div>:<div className="room-preview"><span>◉</span><small>{topic} · {privacy}</small><h2>{title}</h2><p>You will be the host. Invite speakers after the room opens.</p><div className="preview-seats">{["You","+","+","+"].map((item,index)=><i key={index}>{item}</i>)}</div><button className="flow-primary" onClick={onCreated}>Go live</button></div>}</div>;
}

export function CollectionScreen({ onBack, notify }: { onBack:()=>void; notify:(message:string)=>void }) {
  const [tab,setTab]=useState("Owned");
  const [equipped,setEquipped]=useState("Emerald Crescent");
  const items=[["Emerald Crescent","Frame","Permanent"],["Multan Voice","Frame","30 days"],["Chai for Two","Gift","12 owned"],["Game Ticket Pack","Utility","5 tickets"]];
  return <div className="feature-screen flow-screen"><FlowHeader title="My collection" meta="Store bag and purchased items" onBack={onBack}/><div className="filter-row">{["Owned","Saved","History"].map(item=><button key={item} className={tab===item?"active":""} onClick={()=>setTab(item)}>{item}</button>)}</div>{tab==="History"?<div className="order-history">{[["Emerald Crescent","Purchased · Aug 29","◆ 360"],["Chai for Two","Gifted · Aug 28","◆ 80"]].map(row=><article key={row[0]}><span>◇</span><div><strong>{row[0]}</strong><small>{row[1]}</small></div><b>{row[2]}</b></article>)}</div>:<div className="collection-grid">{items.slice(0,tab==="Saved"?2:4).map(([name,type,meta],index)=><button key={name} onClick={()=>{setEquipped(name);notify(`${name} equipped`)}}><span>{["◇","▣","✦","⌘"][index]}</span><small>{type}</small><strong>{name}</strong><em>{meta}</em><b>{equipped===name?"Equipped":"Use"}</b></button>)}</div>}</div>;
}

export function VipBenefitsScreen({ category="All", onBack, notify }: { category?:string; onBack:()=>void; notify:(message:string)=>void }) {
  const [active,setActive]=useState(category);
  const [confirm,setConfirm]=useState(false);
  const [upgraded,setUpgraded]=useState(false);
  const benefits=[["Identity","Signature frame","Animated badge, profile glow and entrance identity"],["Service","Priority support","Faster support, weekly pack and event priority"],["Marketplace","Lower fees","More listings and 2% lower standard trading fees"],["Room","Host presence","Exclusive room theme and mic-seat effects"]];
  const visible=active==="All"?benefits:benefits.filter(item=>item[0]===active);
  return <div className="feature-screen flow-screen"><FlowHeader title="VIP benefits" meta="Prestige without unfair advantage" onBack={onBack}/><div className="vip-level-card"><small>Current level</small><strong>VIP 3</strong><span>620 / 1,000 XP</span><i><b style={{width:"62%"}}/></i></div><div className="filter-row">{["All","Identity","Service","Marketplace","Room"].map(item=><button key={item} className={active===item?"active":""} onClick={()=>setActive(item)}>{item}</button>)}</div><div className="benefit-list">{visible.map(([type,title,description],index)=><article key={title}><span>{["♙","♜","◇","◉"][index%4]}</span><div><small>{type}</small><strong>{title}</strong><p>{description}</p></div><b>VIP 4</b></article>)}</div><button className="vip-upgrade" onClick={()=>setConfirm(true)}>Upgrade to VIP 4</button>{confirm&&<div className="system-sheet" role="dialog" aria-label="Confirm VIP upgrade"><button className="sheet-close" onClick={()=>setConfirm(false)}>×</button>{upgraded?<div className="mini-success"><span>✓</span><h2>VIP 4 activated</h2><p>Your new identity and service benefits are ready.</p><button onClick={()=>{setConfirm(false);notify("VIP 4 benefits activated")}}>View benefits</button></div>:<><small>Secure membership upgrade</small><h2>Activate VIP 4</h2><div className="checkout-row"><span>VIP 4 · 30 days</span><b>PKR 2,490</b></div><p>Includes identity, service and marketplace benefits. Game odds never change.</p><button className="flow-primary" onClick={()=>setUpgraded(true)}>Confirm upgrade</button></>}</div>}</div>;
}

export function ProfileSettingsScreen({ theme, onThemeChange, onBack, notify }: { theme:"night"|"day"; onThemeChange:(theme:"night"|"day")=>void; onBack:()=>void; notify:(message:string)=>void }) {
  const [name,setName]=useState("Ayaan Khan");
  const [bio,setBio]=useState("Late-night stories, Ludo and good chai.");
  const [saved,setSaved]=useState(false);
  return <div className="feature-screen flow-screen">
    <FlowHeader title="Settings" meta="Appearance and profile" onBack={onBack}/>
    <section className="appearance-settings" aria-labelledby="appearance-title">
      <div className="appearance-heading"><small>Appearance</small><h2 id="appearance-title">Color theme</h2><p>Choose how SADA looks on this device.</p></div>
      <div className="theme-choice" role="group" aria-label="Color theme">
        <button className={theme==="night"?"active":""} aria-pressed={theme==="night"} onClick={()=>onThemeChange("night")}>
          <span className="theme-preview theme-preview-emerald" aria-hidden="true"><i/><i/><i/></span><span><strong>Emerald</strong><small>Deep green · dark gold</small></span>{theme==="night"?<b>Default · Active</b>:<b>Default</b>}
        </button>
        <button className={theme==="day"?"active":""} aria-pressed={theme==="day"} onClick={()=>onThemeChange("day")}>
          <span className="theme-preview theme-preview-bright" aria-hidden="true"><i/><i/><i/></span><span><strong>Bright</strong><small>Ivory · vivid gradient</small></span>{theme==="day"?<b>Active</b>:<b>Choose</b>}
        </button>
      </div>
    </section>
    <section className="profile-edit-settings" aria-labelledby="profile-edit-title">
      <div className="appearance-heading"><small>Profile</small><h2 id="profile-edit-title">Edit profile</h2></div>
      <div className="edit-avatar"><PersonMark name={name} index={2}/><button onClick={()=>notify("Photo picker opened")}>Change photo</button></div>
      <div className="room-form"><label>Display name<input value={name} onChange={event=>{setName(event.target.value);setSaved(false)}}/></label><label>Bio<textarea value={bio} onChange={event=>{setBio(event.target.value);setSaved(false)}} maxLength={120}/><small>{bio.length}/120</small></label><label>City<select defaultValue="Karachi"><option>Karachi</option><option>Lahore</option><option>Islamabad</option></select></label><button className="flow-primary" onClick={()=>{setSaved(true);notify("Profile saved")}}>{saved?"Saved ✓":"Save changes"}</button></div>
    </section>
  </div>;
}

export function GameHistoryScreen({ onBack, onPlay }: { onBack:()=>void; onPlay:()=>void }) {
  return <div className="feature-screen flow-screen"><FlowHeader title="Game history" meta="Recent matches and performance" onBack={onBack}/><div className="history-summary"><span><b>24</b><small>matches</small></span><span><b>15</b><small>wins</small></span><span><b>62%</b><small>win rate</small></span></div><div className="order-history">{[["Ludo Nights","Won · +120 pts","Today"],["Carrom Club","2nd · +45 pts","Yesterday"],["Ludo Nights","Won · +95 pts","Aug 27"]].map(([name,result,date])=><article key={result+date}><span>⌘</span><div><strong>{name}</strong><small>{result}</small></div><b>{date}</b></article>)}</div><button className="flow-primary" onClick={onPlay}>Play again</button></div>;
}
