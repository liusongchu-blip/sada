"use client";

import { useState } from "react";
import "./mindmap-systems.css";

export type SystemSectionId = "growth" | "economy" | "ecosystem" | "governance";

type Module = {
  id: string;
  title: string;
  summary: string;
  metric: string;
  groups: { title: string; items: string[] }[];
};

type Section = {
  id: SystemSectionId;
  icon: string;
  eyebrow: string;
  title: string;
  summary: string;
  metric: string;
  modules: Module[];
};

export const systemSections: Section[] = [
  { id:"growth", icon:"↗", eyebrow:"Social & retention loop", title:"Growth and activity", summary:"First-day activation, recurring missions, 30-day operations and retention measurement.", metric:"D7 · 24.6%", modules:[
    { id:"new-user", title:"New-user journey", summary:"Registration to reward claim", metric:"5 steps", groups:[{title:"First day",items:["Register and receive the welcome pack","Enter a recommended voice room","Speak, follow or take a mic seat","Add one friend and finish one game","Claim rewards and browse the store"]},{title:"First three days",items:["Lower Game Coin output cap","Part of rewards remain pending","Welcome items are bound or time-limited","Explain Diamond and Game Coin separately"]}]},
    { id:"activities", title:"Activity system", summary:"Six recurring activity families", metric:"6 families", groups:[{title:"Reward programs",items:["New-member pack","5 / 15 / 30 / 60 / 120-minute rewards","Seven-day check-in","Friend interaction missions"]},{title:"Valid participation",items:["Voice-room stay, follow and mic tasks","Daily 1 / 3 / 5 / 10 valid matches","Background idling receives reduced weight","Repeated scripted activity is excluded"]}]},
    { id:"cadence", title:"30-day cadence", summary:"Cold start to economy pilot", metric:"3 phases", groups:[{title:"D1–7 · Cold start",items:["Welcome pack and seven-day check-in","First room, friend and game milestones","Internal partner-game testing"]},{title:"D8–14 · Habit building",items:["Online-time and daily game challenges","Friend and room missions","1–2 games and one drama in gray release"]},{title:"D15–30 · Economy & content",items:["First store purchase and marketplace listing","New-game launch","Drama follow-up and discussion rooms","Joint events and leaderboards"]}]},
    { id:"growth-metrics", title:"Growth metrics", summary:"Activation and healthy retention", metric:"8 KPIs", groups:[{title:"Activation",items:["First-day path completion","First-day friend-add rate","Voice-room stay and mic rate","Valid match and team-up rate"]},{title:"Retention & content",items:["D1 / D3 / D7 retention","Effective online time","Drama play and completion","Follow-series rate"]}]},
  ]},
  { id:"economy", icon:"◆", eyebrow:"Monetization loop", title:"Economy, store and VIP", summary:"Clear currency boundaries, tagged items, player exchange and fair prestige benefits.", metric:"VIP 1–10", modules:[
    { id:"currencies", title:"Dual currencies", summary:"Recharge and earned value stay separate", metric:"2 wallets", groups:[{title:"Diamond / Gem",items:["Obtained by recharge and paid packs","Used for store, gifts, styles and premium packs","Not produced in large quantity by games","Official grants are bound and non-tradable"]},{title:"Game Coin / Token",items:["Earned from valid matches, missions and check-ins","Used for marketplace, fees and low-value exchange","Daily, hourly and mode caps apply","Cannot directly convert into Diamond"]}]},
    { id:"store-system", title:"Store catalog", summary:"Launch and expansion inventory", metric:"5 types", groups:[{title:"P0 launch",items:["Low, medium and high-value gifts","Frames, bubbles, entrances, rides and profile styles","Rename cards, broadcast, fee coupons and game tickets","Welcome and daily packs"]},{title:"P1 expansion",items:["Mic-seat effects and room themes","Match boost and pin cards","Style fragments and event packs","Raffle tickets and title upgrades"]},{title:"Item labels",items:["Bound or tradable","Time-limited or permanent","Giftable","Recyclable"]}]},
    { id:"exchange", title:"Player marketplace", summary:"Price bands, fees and eligibility", metric:"5–15% fee", groups:[{title:"Eligible items",items:["Selected styles and event fragments","Rare frames and limited gifts","Special mini-game items"]},{title:"Controls",items:["Player-defined price inside platform bands","Standard fee 5%–10%","High-value fee 8%–15%","New-account and high-value restrictions"]},{title:"Coin sinks",items:["Listing and repricing fees","Mode tickets and event registration","Item synthesis and title upgrades","Friend gifts and room decoration"]}]},
    { id:"vip-system", title:"VIP 1–10", summary:"Identity, convenience and service", metric:"10 levels", groups:[{title:"VIP 1–4",items:["Identity badge and basic frame","Daily pack and 2% store discount","Entrance effect and chat bubble","More listings and 1% fee reduction"]},{title:"VIP 5–8",items:["Premium frame, ride and weekly pack","Priority support and 5% store discount","Animated profile, room style and event priority","2%–3% fee reduction"]},{title:"VIP 9–10",items:["Top identity suite and server notice","Dedicated customer care","8%–10% store discount","Fees and risk controls still apply"]}]},
  ]},
  { id:"ecosystem", icon:"◎", eyebrow:"Content ecosystem loop", title:"Open partner ecosystem", summary:"Invite-only game and drama supply with staged review, data and settlement.", metric:"3 pilots", modules:[
    { id:"game-partners", title:"Game developers", summary:"H5, WebView, SDK and native access", metric:"5-stage release", groups:[{title:"Platform capabilities",items:["SADA login and friend graph","Team-up, room and score sharing","Diamond payments and mission events","Data dashboard and anti-cheat"]},{title:"Release process",items:["Entity and copyright verification","Sandbox accounts and test currency","Function, performance, content and safety tests","Small-traffic gray release","Recommendation and event operations"]},{title:"Removal triggers",items:["Crash or complaint threshold exceeded","Misleading recharge or false probability","Scripted rewards and abnormal trading","Bypassing platform payments","Service shutdown without purchased-rights protection"]}]},
    { id:"drama-partners", title:"Drama studios", summary:"Vertical series and social viewing", metric:"1–5 min", groups:[{title:"Monetization",items:["Free with ads","First 3–5 episodes free","Single episode or full-series unlock","Weekly, monthly and theatre passes","Gifts and brand collaborations"]},{title:"Social linkage",items:["Friend, group and voice-room sharing","Story discussion rooms","Actor and creator events","Follow-up missions","IP frames, gifts and mini-games"]},{title:"Compliance",items:["Complete series, music and talent rights","Urdu subtitles with optional English","Religion, culture, violence and minor review","Complaint, takedown and paid-user protection","Fake views excluded from settlement"]}]},
    { id:"partner-console", title:"Partner console", summary:"Content, versions and finance", metric:"8 workspaces", groups:[{title:"Workspace",items:["Entity, contract, team and permissions","SDK, keys, sandbox and version review","Games, episodes, subtitles and schedule","Campaign and recommendation applications"]},{title:"Analytics & finance",items:["Traffic, retention, completion and payment","Risk and complaint data","Invoices, tax and frozen amount","Net-revenue settlement"]}]},
    { id:"platform-boundary", title:"Platform control boundary", summary:"SADA retains critical controls", metric:"5 controls", groups:[{title:"Platform-owned",items:["User accounts, friend graph and data","Recharge, payment, refunds and virtual currency","Recommendation, placements and rankings","Moderation, anti-cheat and enforcement"]},{title:"Partner access",items:["Only necessary anonymized data","No direct control of user accounts","No payment bypass","High grade never bypasses review"]}]},
  ]},
  { id:"governance", icon:"✓", eyebrow:"Safety and execution loop", title:"Risk, governance and data", summary:"Output controls, transaction review, content safety and observable enforcement.", metric:"Live controls", modules:[
    { id:"game-risk", title:"Game output controls", summary:"Caps, validity and diminishing rewards", metric:"4 cap layers", groups:[{title:"Output caps",items:["Daily cap","Hourly cap","Game-mode cap","Lower cap for new accounts","Dynamic reduction for risk accounts"]},{title:"Valid match",items:["Minimum duration reached","Meaningful player operations exist","No fixed route or extremely short finish","Same-device and same-IP account loops restricted"]},{title:"Diminishing rewards",items:["Matches 1–5: 100%","Matches 6–10: 80%","Matches 11–20: 50%","Above 20: 20% or stopped"]}]},
    { id:"trade-risk", title:"Trade and payment risk", summary:"Detect concentration and abnormal pricing", metric:"6 signals", groups:[{title:"Detection",items:["Multiple accounts on one IP","Small accounts concentrating value","Abnormal prices and rapid relisting","Suspicious balance freeze","Manual review for high-value trades","Refund, chargeback and cheating deduction"]}]},
    { id:"settlement", title:"Settlement control", summary:"Visible release and appeal timing", metric:"5–30 min", groups:[{title:"Release rules",items:["Normal rewards release in 5–30 minutes","New-user rewards may release next day","Risk users may wait 24 hours","Partners settle on verified net revenue","Tax, refunds and minimum payout are explicit"]}]},
    { id:"content-safety", title:"Content safety", summary:"Games, drama and cultural review", metric:"4 review lanes", groups:[{title:"Games",items:["Copyright and probability disclosure","No inducive payment or unfair play","Minor protection","Failure, shutdown and purchased-rights handling"]},{title:"Drama",items:["Series, music and talent rights","Religion, culture and community risk","Violence, sexual, hate and advertising review","Complaint, takedown and evidence preservation"]}]},
    { id:"partner-governance", title:"Partner governance", summary:"Certification, rating and removal", metric:"A–D grade", groups:[{title:"Lifecycle",items:["Enterprise, payment and tax certification","Sandbox and gray-release testing","Monthly or quarterly quality rating","Rating affects traffic, events and settlement","Violations lead to downrank, takedown or removal"]}]},
    { id:"data-monitor", title:"Data monitoring", summary:"Product, economy and safety health", metric:"18 signals", groups:[{title:"Product & content",items:["New users, D1 / D7 and online time","Valid matches, teams and abnormal matches","Completion, follows, shares and complaints"]},{title:"Economy & ecosystem",items:["Coin output, sinks and trading scale","First purchase, ARPPU and partner revenue","Frozen balance, copyright cases and bans"]}]},
  ]},
];

function Header({ eyebrow, title, onBack }: { eyebrow:string; title:string; onBack:()=>void }) {
  return <div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>{eyebrow}</small><h1>{title}</h1></div><span/></div>;
}

export function SystemHubScreen({ onBack, onOpen }: { onBack:()=>void; onOpen:(id:SystemSectionId)=>void }) {
  return <div className="feature-screen system-hub"><Header eyebrow="Mind-map implementation" title="Platform systems" onBack={onBack}/><section className="system-hub-hero"><small>Complete product map</small><h2>Four loops, one operating system.</h2><p>Every branch from the SADA plan is available as a drill-down prototype.</p><div><span><b>4</b> loops</span><span><b>18</b> modules</span><span><b>70+</b> rules</span></div></section><div className="system-hub-grid">{systemSections.map(section=><button key={section.id} onClick={()=>onOpen(section.id)}><span>{section.icon}</span><small>{section.eyebrow}</small><strong>{section.title}</strong><p>{section.summary}</p><b>{section.metric} <em>›</em></b></button>)}</div></div>;
}

export function SystemSectionScreen({ sectionId, onBack, onOpen }: { sectionId:SystemSectionId; onBack:()=>void; onOpen:(moduleId:string)=>void }) {
  const section=systemSections.find(item=>item.id===sectionId)!;
  return <div className="feature-screen system-section"><Header eyebrow={section.eyebrow} title={section.title} onBack={onBack}/><div className="system-section-summary"><span>{section.icon}</span><p>{section.summary}</p><b>{section.metric}</b></div><div className="section-heading compact"><h2>System modules</h2><small>{section.modules.length} modules</small></div><div className="system-module-list">{section.modules.map((module,index)=><button key={module.id} onClick={()=>onOpen(module.id)}><span>{String(index+1).padStart(2,"0")}</span><div><strong>{module.title}</strong><small>{module.summary}</small></div><b>{module.metric}</b><em>›</em></button>)}</div></div>;
}

export function SystemModuleScreen({ sectionId, moduleId, onBack, notify }: { sectionId:SystemSectionId; moduleId:string; onBack:()=>void; notify:(message:string)=>void }) {
  const section=systemSections.find(item=>item.id===sectionId)!;
  const currentModule=section.modules.find(item=>item.id===moduleId)!;
  const total=currentModule.groups.reduce((sum,group)=>sum+group.items.length,0);
  const [checked,setChecked]=useState<string[]>([]);
  const toggle=(item:string)=>setChecked(values=>values.includes(item)?values.filter(value=>value!==item):[...values,item]);
  return <div className="feature-screen system-module"><Header eyebrow={section.title} title={currentModule.title} onBack={onBack}/><div className="module-status"><span>{section.icon}</span><div><small>Prototype coverage</small><strong>{checked.length} / {total} reviewed</strong><i><b style={{width:(checked.length/total*100)+"%"}}/></i></div><b>{currentModule.metric}</b></div>{currentModule.groups.map(group=><section className="module-group" key={group.title}><div className="section-heading compact"><h2>{group.title}</h2><small>{group.items.length} controls</small></div>{group.items.map(item=><button key={item} className={checked.includes(item)?"checked":""} onClick={()=>toggle(item)}><span>{checked.includes(item)?"✓":"○"}</span><strong>{item}</strong></button>)}</section>)}<button className="module-action" onClick={()=>{setChecked(currentModule.groups.flatMap(group=>group.items));notify(currentModule.title+" review completed")}}>{checked.length===total?"Review complete":"Run full module review"}</button></div>;
}
