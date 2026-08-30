"use client";

import { useMemo, useState } from "react";
import "./operation-flows.css";

export type FlowTarget = "onboarding" | "userprofile" | "room" | "createroom" | "chat" | "games" | "drama" | "payment" | "store" | "marketplace" | "partner" | "safety";

type FlowStep = {
  title: string;
  action: string;
  response: string;
  rule: string;
  exception: string;
};

type FlowDefinition = {
  id: string;
  group: "User" | "Commerce" | "Partner" | "Governance";
  icon: string;
  title: string;
  outcome: string;
  target: FlowTarget;
  steps: FlowStep[];
};

const step = (title: string, action: string, response: string, rule: string, exception: string): FlowStep => ({ title, action, response, rule, exception });

const flows: FlowDefinition[] = [
  { id:"onboarding", group:"User", icon:"01", title:"New user activation", outcome:"From phone verification to first social relationship", target:"onboarding", steps:[
    step("Choose language and consent","Select English or Urdu, confirm 18+ and open the policies.","SADA stores locale and consent versions before account creation.","Consent is required; notification and contact permissions remain optional.","Under-age selection exits registration and shows the applicable safety notice."),
    step("Verify Pakistan mobile","Enter a +92 number, complete device risk check and submit OTP.","A single account session is created after provider verification.","OTP expires, has a retry limit and cannot be requested in rapid loops.","High-risk devices receive an additional challenge or temporary cooldown."),
    step("Build a safe profile","Add display name, avatar, city, birth year and visibility choices.","Profile preview shows exactly what other users can see.","Names, avatars and bios pass automated moderation before publication.","Rejected content stays private and the user receives an editable reason."),
    step("Choose interests","Select at least three interests such as Ludo, music, poetry or drama.","The home feed prepares rooms, people, games and stories in one set.","Recommendations must preserve language and safety preferences.","The user can skip personalization and receive a neutral starter feed."),
    step("Meet the first crew","Follow suggested people, enter a recommended room and add one friend.","New-user missions update only after effective activity is confirmed.","Self-referrals, same-device accounts and instant exits do not count.","If a request is rejected, the task suggests another person without penalty."),
    step("Claim starter rewards","Finish the guided room, friend, game and store moments.","Bound rewards enter the wallet and collection with expiry labels.","Welcome items are bound, limited and cannot enter the marketplace.","Unfinished tasks remain available for seven days."),
  ]},
  { id:"friend", group:"User", icon:"02", title:"Friendship and private chat", outcome:"Discover, request, accept, chat and play together", target:"userprofile", steps:[
    step("Discover a person","Open a profile from search, a room seat or mutual friends.","The profile shows mutual context, public moments and safety controls.","Private fields and full contact information are never exposed.","Blocked or restricted accounts show a limited profile."),
    step("Send friend request","Tap Add friend and optionally write a short verification message.","The request appears in the receiver's Requests inbox.","Daily limits fall after bulk requests, repeated rejection or reports.","A rejected user cannot send another request for seven days."),
    step("Accept and establish relationship","The receiver accepts from Inbox and both lists update.","A safety tip appears before the first private conversation.","Acceptance is atomic so one side cannot become a friend alone.","Expired requests can be resent after the cooldown."),
    step("Start private chat","Send text, voice, image, gift, room card or game invitation.","Messages display sending, delivered, read or failed state.","Media is safety scanned; stranger messages remain in Requests.","Failed sends can retry with the same idempotency key."),
    step("Deepen the relationship","Join a room or game together and exchange a low-value gift.","Valid interaction increases capped daily intimacy points.","Repeated empty messages and scripted activity do not count.","Either user may mute, remove, report or block at any time."),
  ]},
  { id:"room-listener", group:"User", icon:"03", title:"Voice room listener", outcome:"Enter, interact, speak, gift and leave safely", target:"room", steps:[
    step("Evaluate room","Review language, topic, audience, friends present and room rules.","The entry preview explains whether the room is public or 18+.","Restricted rooms require eligibility before entry.","A full or closed room offers similar alternatives."),
    step("Join as listener","Enter silently and allow audio playback.","Presence appears in the audience list and effective time begins after activity.","Background or idle time is discounted for rewards.","Weak networks switch to low-bandwidth audio and offer reconnect."),
    step("Interact","Follow the host, send room text, invite a friend or request the mic.","Each action produces visible feedback without interrupting audio.","Rate limits protect the room from message and invite spam.","Rejected mic requests return to listener state without public embarrassment."),
    step("Speak on mic","Accept the host invitation and grant microphone permission.","The mic seat shows connection, mute and speaking state.","First-time speakers see a short community safety tip.","Permission denial keeps the user as listener and explains how to enable it."),
    step("Send gift or connect","Select recipient, verify price and send a gift or friend request.","The ledger, room heat and relationship signals update together.","High-value gifts require confirmation and payment timeouts are queried.","Insufficient balance routes to recharge without losing room state."),
    step("Minimize or leave","Keep listening in the room dock or leave completely.","SADA preserves the room state and summarizes valid activity.","Leaving never creates extra reward events.","A closed room returns the user home with a clear reason."),
  ]},
  { id:"room-host", group:"User", icon:"04", title:"Voice room host", outcome:"Create, moderate and close a live room", target:"createroom", steps:[
    step("Configure room","Set title, topic, language, audience and 18+ classification.","A live preview shows host identity, cover and available mic seats.","Title and cover pass moderation before going live.","Rejected details remain editable with a specific reason."),
    step("Go live","Confirm microphone and network quality, then start the room.","Followers receive configured notifications and the room enters discovery.","Risky or restricted accounts cannot create public rooms.","Poor connectivity offers audio-only low bandwidth mode."),
    step("Invite and manage speakers","Invite friends, approve requests, lock seats, mute or move speakers.","Every moderation action is visible to the affected user and audited.","Hosts cannot delete platform evidence or override safety action.","A removed user may appeal from Safety center."),
    step("Manage room health","Pin rules, control chat, review reports and appoint moderators.","Risk signals can reduce discovery or pause new mic requests.","Serious safety events escalate to platform moderation immediately.","Automatic restriction explains the trigger category without exposing reporters."),
    step("Close and review","End the room and view listeners, retention, gifts and unresolved cases.","The room becomes a replay or closed record according to settings.","Gift revenue remains subject to settlement and fraud review.","An interrupted room can recover a draft summary after reconnect."),
  ]},
  { id:"game", group:"User", icon:"05", title:"Social game session", outcome:"Match, play, settle rewards and rematch", target:"games", steps:[
    step("Choose game mode","Open rules, reward range and ticket requirement.","SADA shows quick match, friend room and current service status.","Paid advantages cannot change random odds or opponent strength.","Maintenance or version mismatch disables Start with a reason."),
    step("Create or join match","Invite friends or enter matchmaking.","Tickets are reserved, not consumed, until a valid match begins.","Related accounts and repeated opponents receive reduced rewards.","Match timeout releases the ticket automatically."),
    step("Play valid round","Perform meaningful actions until the match reaches a valid end.","The game records moves, timing and disconnect events.","Minimum duration and effective operations are required for output.","A disconnect offers reconnect before applying exit rules."),
    step("Settle result","View rank, score, mission progress and pending Game Coin.","Risk checks decide released, delayed or invalid reward status.","The result never silently changes after display; later action creates a notice.","Invalid matches explain the category and provide appeal when eligible."),
    step("Continue socially","Rematch, invite the group to a voice room or share the result.","Friend activity and valid missions update once.","Repeated rematches trigger diminishing output, not social penalties.","If a player leaves, the group can replace them or return to lobby."),
  ]},
  { id:"drama", group:"User", icon:"06", title:"Drama discovery and unlock", outcome:"Watch, unlock, follow and discuss a series", target:"drama", steps:[
    step("Discover series","Open a recommendation and inspect synopsis, rating, language and episodes.","Free, paid and unavailable episodes are clearly distinguished.","Age and territory restrictions are checked before playback.","Unavailable titles explain region, date or rights status."),
    step("Watch preview","Select subtitles, quality and start free playback.","Progress synchronizes to the account and Continue watching.","Autoplay respects data-saving and healthy-use preferences.","Playback errors offer retry, quality reduction or support."),
    step("Unlock episode","Review Diamond price and confirm a paid episode.","One idempotent order unlocks the episode account-wide.","Repeated taps cannot create duplicate charges.","Deducted balance without unlock triggers automatic fulfillment repair."),
    step("Follow and discuss","Follow the series, save the episode and join its voice room.","New episode notifications follow the user's settings.","Discussion rooms inherit spoiler and safety rules.","Removed content preserves order and support records."),
    step("Share with a friend","Send a safe episode card through private chat.","The receiver sees availability before opening.","Sharing never grants paid access automatically.","Blocked or age-ineligible recipients cannot open restricted content."),
  ]},
  { id:"payment", group:"Commerce", icon:"07", title:"Recharge and payment recovery", outcome:"Select pack, pay, receive assets and resolve exceptions", target:"payment", steps:[
    step("Select value","Choose a Diamond pack and distinguish purchased from bound bonus value.","PKR total, limits and bonus rules update instantly.","Prices are server-configured and locked after order creation.","Unavailable packs stay visible only when a maintenance explanation exists."),
    step("Select payment method","Use Easypaisa, JazzCash or a tokenized bank card.","Only masked provider details appear in SADA.","Full card or wallet credentials are never stored by the app.","A disabled channel suggests alternatives without changing the amount."),
    step("Review order","Confirm account, amount, tax, fee, bonus and refund terms.","The server creates one order and an idempotency key.","The pay button stays disabled until consent is checked.","Price expiry returns to review with refreshed pricing."),
    step("Authorize provider","Enter OTP or complete provider authorization.","SADA displays processing and queries uncertain results.","Staff will never request the OTP; retries are limited.","Timeout enters Unknown instead of creating a second charge."),
    step("Credit wallet","After signed provider confirmation, write ledger and add Diamonds.","Balance, receipt and payment history update together.","Credit happens once even if the provider repeats callbacks.","Paid but uncredited orders enter automatic reconciliation."),
    step("Refund or dispute","Open the receipt, select reason and submit evidence.","Eligibility, asset use and provider rules determine auto or manual review.","Approved refunds remove unused assets and promotional bonus first.","Chargeback freezes related assets and opens an appeal path."),
  ]},
  { id:"store-vip", group:"Commerce", icon:"08", title:"Store purchase and VIP", outcome:"Preview, recharge if needed, purchase and equip", target:"store", steps:[
    step("Browse with clear labels","Filter gifts, frames, rides, utility and packs.","Every item shows duration, binding, gifting and trading status.","Items with different rights use separate SKUs.","Expired or region-limited items show availability before detail."),
    step("Preview item","Try a frame, entrance effect or profile skin on the current avatar.","Preview never equips or charges the account.","The preview uses the same asset version as fulfillment.","Unsupported devices receive a static fallback."),
    step("Confirm purchase","Review Diamond price, quantity, recipient and final rights.","The order reserves funds and creates a fulfillment task.","High-value gifts and duplicate items require explicit confirmation.","Insufficient balance opens Payments and preserves the intended item."),
    step("Receive and use","The item enters Collection and can be equipped or gifted.","Ledger and inventory share the same order reference.","Bound items cannot be gifted or listed.","Payment success without delivery triggers automatic reissue."),
    step("Activate VIP","Compare levels, confirm cycle and complete payment.","VIP expiry, XP, benefits and monthly pack update together.","VIP never changes game odds or bypasses risk control.","Renewal failure preserves purchased permanent items and shows grace state."),
  ]},
  { id:"marketplace", group:"Commerce", icon:"09", title:"Marketplace trade", outcome:"List, buy, risk-check and settle a collectible", target:"marketplace", steps:[
    step("Check eligibility","Select a tradable item from Collection.","SADA checks binding, cooldown, account age, verification and risk level.","Welcome and official bound rewards cannot be listed.","Ineligible items show the exact condition still required."),
    step("Create listing","Set price within platform range and review fees.","The item is locked and a listing preview is generated.","Reference price, floor, ceiling and settlement delay are visible.","Abnormal pricing requires correction or additional review."),
    step("Place purchase","Buyer reviews item, seller trust, total Coin and settlement terms.","The listing locks briefly while funds are deducted.","Game Coin and Diamond never convert directly.","Failed deduction releases the item immediately."),
    step("Risk and delivery","The item moves to buyer pending inventory and seller funds to pending balance.","Relationship, device, IP and price risk checks run before release.","Suspicious value transfer can be delayed or frozen.","Rejected trades reverse both item and funds with a case reference."),
    step("Complete settlement","Release the item, seller proceeds and platform fee.","Both users receive a permanent trade receipt.","Later enforcement creates a new adjustment record, never edits history.","Either party can open support from the receipt."),
  ]},
  { id:"game-partner", group:"Partner", icon:"10", title:"Game developer publishing", outcome:"Apply, integrate, review, launch and settle", target:"partner", steps:[
    step("Partner verification","Submit company, owner, tax, settlement and security details.","A project workspace opens only after approval and agreement signing.","Team members use role-based access and mandatory audit logs.","Missing or inconsistent documents return with field-level feedback."),
    step("Create game project","Define category, audience, languages, rating and monetization.","The platform issues sandbox credentials scoped to one project.","Partners never receive raw phone, payment or unrelated social data.","Restricted mechanics are blocked before technical review."),
    step("Integrate and test","Upload H5/SDK build and connect login, events, rewards and payments.","Automated compatibility, security and performance tests produce a report.","Platform wallet and payment APIs are mandatory for platform currency.","Failed checks link to logs and allow a new version upload."),
    step("Content review and gray launch","Submit store assets, rules and support contact for review.","Approved builds launch to a controlled cohort with kill switch.","Crash, retention, complaints and economy anomalies are monitored.","Threshold breaches pause distribution without deleting project data."),
    step("Publish and settle","Pass gray metrics, release broadly and enter monthly settlement.","Dashboard shows valid starts, revenue, refunds and developer share.","Only settled net revenue beyond the refund window is payable.","Partners can dispute a settlement line with order-level evidence."),
  ]},
  { id:"drama-partner", group:"Partner", icon:"11", title:"Drama studio publishing", outcome:"Upload rights, episodes, subtitles and release schedule", target:"partner", steps:[
    step("Studio verification","Submit legal entity, rights owner, territories and settlement account.","The studio receives a role-based content workspace.","Rights documents must cover platform, period, language and territory.","Expiring rights create alerts before content becomes unavailable."),
    step("Create series","Add metadata, cast, rating, poster, trailer and episode structure.","A completeness checker validates required fields and language variants.","Public claims and ratings remain subject to review.","Incomplete series can save as draft but cannot submit."),
    step("Upload and process","Upload masters and subtitles, then review transcodes.","SADA reports quality, loudness, subtitle timing and file integrity.","Original masters remain access-controlled.","Failed processing keeps the previous approved version live."),
    step("Configure business model","Choose free preview, paid episodes, bundle and campaign dates.","Revenue simulation shows platform share, refund and tax assumptions.","Pricing must remain inside configured territory ranges.","Conflicting rights or dates block submission."),
    step("Review, schedule and settle","Pass content review, gray release, publish and monitor completion.","The studio sees views, completion, follows, gross and net revenue.","Copyright complaints can immediately restrict affected territories.","Removed episodes preserve viewer receipts and dispute records."),
  ]},
  { id:"safety", group:"Governance", icon:"12", title:"Report, block and appeal", outcome:"Protect the user while preserving due process", target:"safety", steps:[
    step("Choose safety action","Open the menu on a user, room, message, game or content item.","Quick actions offer mute, block and report with clear effects.","Blocking takes effect immediately and is reversible by the user.","Emergency categories are surfaced above general complaints."),
    step("Submit report","Select reason, add details and include necessary context.","A case number and expected response level are returned.","Only relevant evidence is attached; reporter identity stays protected.","Network failure saves a local draft without claiming submission."),
    step("Triage and protect","Automated systems score severity and apply temporary protection if needed.","High-risk cases enter priority human review.","Temporary action is proportionate and auditable.","Insufficient evidence requests more context rather than silently closing."),
    step("Resolve and notify","Reviewer applies no action, warning, restriction, removal or ban.","The reporter receives a privacy-safe outcome and the subject receives a rule basis.","Financial and permanent actions require elevated approval.","Sensitive cases limit details to protect involved users."),
    step("Appeal","The affected user submits one structured appeal with new context.","A different reviewer records uphold, modify or reverse decision.","Appeal deadlines and finality are shown before submission.","Reversed decisions restore eligible access and create audit entries."),
  ]},
  { id:"support", group:"Governance", icon:"13", title:"Customer support case", outcome:"Self-service, ticket, resolution and feedback", target:"safety", steps:[
    step("Find help","Search by feature, order ID or issue description.","Help Center prioritizes relevant localized articles.","Payment, safety and account recovery receive special routing.","No-result searches offer ticket creation immediately."),
    step("Create ticket","Choose category and attach order, screenshot or diagnostic consent.","The system validates required evidence and returns a ticket number.","Sensitive fields are redacted from staff views where possible.","Large uploads retry without duplicating the ticket."),
    step("Triage","Automation assigns priority, ownership and response target.","The user sees status, latest update and expected next step.","Agents cannot alter funds directly from the conversation.","Urgent safety cases bypass the standard queue."),
    step("Resolve","Agent explains the finding and performs an auditable supported action.","The ticket records references to orders, cases or adjustments.","Every financial adjustment requires reason and approval.","Unresolved cases can escalate to specialist or supervisor."),
    step("Close and learn","The user confirms resolution or the case closes after a stated period.","SADA collects satisfaction and tags root cause for product improvement.","Reopening preserves the original history.","Repeated systemic issues create an incident instead of isolated fixes."),
  ]},
];

function FlowHeader({ title, meta, onBack }: { title:string; meta:string; onBack:()=>void }) {
  return <div className="feature-header flow-map-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>{meta}</small><h1>{title}</h1></div><span/></div>;
}

export function OperationFlowCenterScreen({ onBack, onLaunch, notify }: { onBack:()=>void; onLaunch:(target:FlowTarget)=>void; notify:(message:string)=>void }) {
  const [group,setGroup]=useState<"All"|FlowDefinition["group"]>("All");
  const [selectedId,setSelectedId]=useState<string | null>(null);
  const [stepIndex,setStepIndex]=useState(0);
  const [completed,setCompleted]=useState(false);
  const [exceptionsOpen,setExceptionsOpen]=useState(false);
  const selected=flows.find(flow=>flow.id===selectedId) ?? null;
  const visible=useMemo(()=>group==="All"?flows:flows.filter(flow=>flow.group===group),[group]);
  const start=(flow:FlowDefinition)=>{setSelectedId(flow.id);setStepIndex(0);setCompleted(false);setExceptionsOpen(false)};
  const leaveDetail=()=>{setSelectedId(null);setStepIndex(0);setCompleted(false);setExceptionsOpen(false)};

  if(!selected) return <div className="feature-screen operation-flow-screen"><FlowHeader title="Complete operation flows" meta="13 end-to-end product journeys" onBack={onBack}/><section className="flow-map-summary"><div><small>Prototype coverage</small><strong>13</strong><span>complete flows</span></div><div><small>Operation steps</small><strong>{flows.reduce((sum,flow)=>sum+flow.steps.length,0)}</strong><span>with system feedback</span></div><div><small>Every step includes</small><strong>4</strong><span>action, response, rule, exception</span></div></section><div className="filter-row flow-map-filters">{(["All","User","Commerce","Partner","Governance"] as const).map(item=><button key={item} className={group===item?"active":""} onClick={()=>setGroup(item)}>{item}</button>)}</div><div className="flow-map-list">{visible.map(flow=><button key={flow.id} onClick={()=>start(flow)}><span className="flow-map-number">{flow.icon}</span><span><small>{flow.group} flow</small><strong>{flow.title}</strong><em>{flow.outcome}</em></span><b>{flow.steps.length} steps ›</b></button>)}</div><aside className="flow-map-legend"><strong>How to review this prototype</strong><p>Open a flow to step through user action, SADA response, business rule and exception handling. The final button opens the corresponding interactive product screen.</p></aside></div>;

  const current=selected.steps[stepIndex];
  const progress=completed?100:((stepIndex+1)/selected.steps.length)*100;
  return <div className="feature-screen operation-flow-screen flow-walkthrough"><FlowHeader title={selected.title} meta={`${selected.group} flow · ${selected.steps.length} steps`} onBack={leaveDetail}/><div className="flow-progress"><span><b>{completed?"Complete":`Step ${stepIndex+1}`}</b><small>{selected.outcome}</small></span><em>{Math.round(progress)}%</em><i><b style={{width:`${progress}%`}}/></i></div>{completed?<section className="flow-complete"><span>✓</span><small>End-to-end path reviewed</small><h2>{selected.title}</h2><p>Primary flow, product response, control rule and exception branches have been covered.</p><div><button onClick={()=>{setStepIndex(0);setCompleted(false)}}>Review again</button><button className="primary" onClick={()=>onLaunch(selected.target)}>Open interactive screen</button></div></section>:<><section className="flow-step-card"><header><span>{String(stepIndex+1).padStart(2,"0")}</span><div><small>Current product moment</small><h2>{current.title}</h2></div></header><div className="flow-step-detail user-action"><span>A</span><div><small>User action</small><p>{current.action}</p></div></div><div className="flow-step-detail system-response"><span>S</span><div><small>SADA response</small><p>{current.response}</p></div></div><div className="flow-step-detail control-rule"><span>R</span><div><small>Business and safety rule</small><p>{current.rule}</p></div></div><div className="flow-step-detail exception-state"><span>!</span><div><small>Exception branch</small><p>{current.exception}</p></div></div></section><div className="flow-step-nav"><button disabled={stepIndex===0} onClick={()=>setStepIndex(index=>Math.max(0,index-1))}>‹ Previous</button><button className="primary" onClick={()=>{if(stepIndex===selected.steps.length-1){setCompleted(true);notify(`${selected.title} flow complete`)}else setStepIndex(index=>index+1)}}>{stepIndex===selected.steps.length-1?"Complete flow":"Next step ›"}</button></div><button className="all-exceptions" onClick={()=>setExceptionsOpen(true)}>View all exception branches</button></>}{exceptionsOpen?<div className="system-sheet flow-exception-sheet" role="dialog" aria-label="Exception branches"><button className="sheet-close" onClick={()=>setExceptionsOpen(false)} aria-label="Close">×</button><small>{selected.title}</small><h2>Exception and recovery paths</h2><div>{selected.steps.map((item,index)=><article key={item.title}><span>{index+1}</span><p><strong>{item.title}</strong><small>{item.exception}</small></p></article>)}</div><button className="flow-exception-done" onClick={()=>setExceptionsOpen(false)}>Done</button></div>:null}</div>;
}
