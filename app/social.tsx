"use client";
/* eslint-disable jsx-a11y/no-autofocus */

import { useEffect, useMemo, useState } from "react";
import {
  sadaApi,
  type ApiConversation,
  type ApiRoom,
  type ApiSocialMessage,
  type ApiUser,
} from "./api-client";

type Notify = (message: string) => void;
type Peer = { id: string; name: string; index: number; conversationId?: string };

function PersonMark({ name, index = 0 }: { name: string; index?: number }) {
  return <span className={`person-mark mark-${index % 6}`}>{name.slice(0, 1)}</span>;
}

function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="flow-success"><span>!</span><h2>Could not load this screen</h2><p>{message}</p>{retry ? <button onClick={retry}>Try again</button> : null}</div>;
}

function SignInState({ onSignIn }: { onSignIn: () => void }) {
  return <div className="flow-success"><span>↗</span><h2>Sign in to continue</h2><p>Your rooms, messages and follows stay linked to your SADA account.</p><button onClick={onSignIn}>Sign in securely</button></div>;
}

export function SocialRoomsScreen({ onBack, onOpenRoom, onSearch, onCreate }: {
  onBack: () => void;
  onOpenRoom: (room: ApiRoom) => void;
  onSearch: () => void;
  onCreate: () => void;
}) {
  const [filter, setFilter] = useState<"For you" | ApiRoom["topic"]>("For you");
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = async () => {
    setLoading(true); setError(null);
    try { setRooms((await sadaApi.social.rooms(filter === "For you" ? undefined : filter)).items); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Live rooms are unavailable"); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    let active = true;
    sadaApi.social.rooms(filter === "For you" ? undefined : filter)
      .then(page => { if (active) setRooms(page.items); })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : "Live rooms are unavailable"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filter]);
  return <div className="feature-screen"><div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>Live conversations</small><h1>Voice rooms</h1></div><button className="icon-button" onClick={onSearch} aria-label="Search rooms">⌕</button></div><div className="filter-row">{(["For you", "Stories", "Music", "Games", "Poetry"] as const).map(item => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>{loading ? <div className="flow-success"><p>Loading live rooms…</p></div> : error ? <ErrorState message={error} retry={() => void load()}/> : rooms.length ? <div className="room-list">{rooms.map((room, index) => <button className="room-list-item" key={room.id} onClick={() => onOpenRoom(room)}><span className="room-cover"><PersonMark name={room.hostName ?? room.title} index={index}/><i className={index === 0 ? "speaking" : ""}/></span><span><strong>{room.title}</strong><small>{room.topic} · Hosted by {room.hostName ?? "SADA member"}</small><em>Live now</em></span><span className="room-count">♟ {room.listenerCount}</span></button>)}</div> : <div className="flow-success"><span>◉</span><h2>No live rooms yet</h2><p>Start the first conversation for this topic.</p></div>}<button className="create-room-button" onClick={onCreate}>+ Start a room</button></div>;
}

export function SocialRoomScreen({ room, authenticated, currentUserId, onBack, onJoined, onSignIn, notify }: {
  room: ApiRoom;
  authenticated: boolean;
  currentUserId?: string;
  onBack: () => void;
  onJoined: (joined: boolean) => void;
  onSignIn: () => void;
  notify: Notify;
}) {
  const [detail, setDetail] = useState(room);
  const [messages, setMessages] = useState<ApiSocialMessage[]>([]);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [following, setFollowing] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<"harassment" | "sexual_or_violent" | "scam_or_payment" | "copyright" | "other">("harassment");
  const [reportDetails, setReportDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    Promise.all([sadaApi.social.room(room.id), sadaApi.social.roomMessages(room.id), sadaApi.social.joinRoom(room.id)])
      .then(([nextRoom, page]) => { if (active) { setDetail(nextRoom); setMessages(page.items.toReversed()); onJoined(true); } })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : "Room connection failed"); });
    return () => { active = false; };
  }, [authenticated, onJoined, room.id]);
  if (!authenticated) return <div className="feature-screen"><div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>{room.topic}</small><h1>{room.title}</h1></div><span/></div><SignInState onSignIn={onSignIn}/></div>;
  const leave = async () => {
    setPending(true);
    try { await sadaApi.social.leaveRoom(room.id); onJoined(false); onBack(); }
    catch (cause) { notify(cause instanceof Error ? cause.message : "Could not leave the room"); }
    finally { setPending(false); }
  };
  const send = async () => {
    const body = message.trim(); if (!body || pending) return;
    setPending(true); setError(null);
    try { const sent = await sadaApi.social.sendRoomMessage(room.id, body); setMessages(items => [...items, { ...sent, senderName: "You" }]); setMessage(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Message could not be sent"); }
    finally { setPending(false); }
  };
  const toggleFollow = async () => {
    if (!detail.hostId || detail.hostId === currentUserId) return;
    try { const result = await sadaApi.social.followUser(detail.hostId, !following); setFollowing(result.following); notify(result.following ? `Following ${detail.hostName}` : `Unfollowed ${detail.hostName}`); }
    catch (cause) { notify(cause instanceof Error ? cause.message : "Follow could not be updated"); }
  };
  const sendGift = async (catalogItemId: string, name: string) => {
    setPending(true);
    try { const result = await sadaApi.social.sendRoomGift(room.id, catalogItemId); notify(`${name} sent · ${result.spentDiamonds} Diamonds`); }
    catch (cause) { notify(cause instanceof Error ? cause.message : "Gift could not be sent"); }
    finally { setPending(false); }
  };
  const submitReport = async () => {
    setPending(true);
    try { await sadaApi.social.report({ targetType: "room", targetId: room.id, reason: reportReason, details: reportDetails }); setReportOpen(false); setReportDetails(""); notify("Confidential report submitted"); }
    catch (cause) { notify(cause instanceof Error ? cause.message : "Report could not be submitted"); }
    finally { setPending(false); }
  };
  return <div className="room-detail"><div className="room-detail-head"><button className="screen-back" onClick={() => void leave()} disabled={pending} aria-label="Leave room">‹</button><div><h1>{detail.title}</h1><span><i/>Live · {detail.listenerCount} listening</span></div><button className="icon-button" onClick={() => setReportOpen(true)} aria-label="Report room">!</button></div><div className="host-line"><PersonMark name={detail.hostName ?? "Host"} index={2}/><span><strong>{detail.hostName ?? "SADA host"}</strong><small>Host · {detail.topic}</small></span>{detail.hostId !== currentUserId ? <button onClick={() => void toggleFollow()}>{following ? "Following" : "Follow"}</button> : <small>Your room</small>}</div><div className="room-orbit"><div className="voice-orbit orbit-one"/><div className="voice-orbit orbit-two"/><span className="center-host"><PersonMark name={detail.hostName ?? "Host"} index={2}/></span></div><div className="room-chat"><div className="chat-scroll">{messages.length ? messages.map(item => <p key={item.id}>{item.senderId === currentUserId ? "You" : item.senderName ?? "Member"}: {item.body}</p>) : <p>Be the first to say salaam.</p>}</div><div className="chat-input"><input aria-label="Room message" placeholder="Say salaam…" value={message} onChange={event => setMessage(event.target.value)} onKeyDown={event => { if (event.key === "Enter") void send(); }}/><button disabled={pending || !message.trim()} onClick={() => void send()}>Send</button></div>{error ? <p role="alert">{error}</p> : null}</div><div className="voice-dock"><button onClick={() => void sendGift("gift-rose", "Emerald Rose")} disabled={pending}>🌹<span>Rose</span></button><button className="main-mic" onClick={() => notify("Microphone control is ready for the realtime voice provider")}>●<span>Mic</span></button><button className="gift-action" onClick={() => void sendGift("gift-crown", "Royal Crown")} disabled={pending}>♛<span>Crown</span></button><button onClick={() => void leave()} disabled={pending}>×<span>Leave</span></button></div>{reportOpen ? <div className="system-sheet" role="dialog" aria-label="Report room"><button className="sheet-close" onClick={() => setReportOpen(false)} aria-label="Close">×</button><small>Confidential report</small><h2>What happened?</h2><label>Reason<select value={reportReason} onChange={event => setReportReason(event.target.value as typeof reportReason)}><option value="harassment">Harassment or hate</option><option value="sexual_or_violent">Sexual or violent content</option><option value="scam_or_payment">Scam or payment issue</option><option value="copyright">Copyright concern</option><option value="other">Other</option></select></label><label>Details<textarea value={reportDetails} onChange={event => setReportDetails(event.target.value)} maxLength={2000}/></label><button className="sheet-primary" disabled={pending} onClick={() => void submitReport()}>{pending ? "Submitting…" : "Submit report"}</button></div> : null}</div>;
}

export function SocialInboxScreen({ authenticated, onBack, onChat, onNewMessage, onSignIn }: {
  authenticated: boolean;
  onBack: () => void;
  onChat: (peer: Peer) => void;
  onNewMessage: () => void;
  onSignIn: () => void;
}) {
  const [items, setItems] = useState<ApiConversation[]>([]);
  const [loading, setLoading] = useState(authenticated);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    sadaApi.social.conversations().then(result => { if (active) setItems(result.items); }).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : "Inbox unavailable"); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authenticated]);
  return <div className="feature-screen inbox-screen"><div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>Your circle</small><h1>Inbox</h1></div><button className="icon-button" onClick={onNewMessage} aria-label="New message">+</button></div>{!authenticated ? <SignInState onSignIn={onSignIn}/> : loading ? <div className="flow-success"><p>Loading conversations…</p></div> : error ? <ErrorState message={error}/> : items.length ? <div className="conversation-list">{items.map((item, index) => <button key={item.id} onClick={() => onChat({ id: item.memberId, name: item.memberName, index, conversationId: item.id })}><PersonMark name={item.memberName} index={index}/><span><strong>{item.memberName}</strong><small>{item.lastMessage ?? "Start the conversation"}</small></span><em>{new Date(item.updatedAt).toLocaleDateString()}</em></button>)}</div> : <div className="flow-success"><span>✦</span><h2>Your inbox is ready</h2><p>Find a member and send the first message.</p><button onClick={onNewMessage}>Find people</button></div>}</div>;
}

export function SocialChatScreen({ peer, authenticated, currentUserId, onBack, onSignIn, notify }: {
  peer: Peer;
  authenticated: boolean;
  currentUserId?: string;
  onBack: () => void;
  onSignIn: () => void;
  notify: Notify;
}) {
  const [conversationId, setConversationId] = useState(peer.conversationId ?? null);
  const [messages, setMessages] = useState<ApiSocialMessage[]>([]);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(authenticated);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    const prepare = async () => {
      const id = peer.conversationId ?? (await sadaApi.social.createConversation(peer.id)).id;
      const page = await sadaApi.social.conversationMessages(id);
      if (active) { setConversationId(id); setMessages(page.items.toReversed()); }
    };
    prepare().catch(cause => { if (active) setError(cause instanceof Error ? cause.message : "Conversation unavailable"); }).finally(() => { if (active) setPending(false); });
    return () => { active = false; };
  }, [authenticated, peer.conversationId, peer.id]);
  const send = async () => {
    const body = text.trim(); if (!body || !conversationId || pending) return;
    setPending(true); setError(null);
    try { const sent = await sadaApi.social.sendConversationMessage(conversationId, body); setMessages(items => [...items, sent]); setText(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Message could not be sent"); }
    finally { setPending(false); }
  };
  return <div className="chat-screen"><div className="chat-head"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><PersonMark name={peer.name} index={peer.index}/><span><strong>{peer.name}</strong><small>Direct conversation</small></span><button className="icon-button" onClick={() => notify("Voice calls require the realtime voice provider")}>●</button></div>{!authenticated ? <SignInState onSignIn={onSignIn}/> : <><div className="message-stream"><div className="chat-day">Conversation</div>{pending && !conversationId ? <p>Loading messages…</p> : messages.length ? messages.map(item => <p key={item.id} className={item.senderId === currentUserId ? "mine" : "theirs"}>{item.body}<small>{item.senderId === currentUserId ? "Sent" : item.senderName ?? peer.name}</small></p>) : <p className="theirs">Start with a friendly salaam.</p>}{error ? <p role="alert">{error}</p> : null}</div><div className="message-composer"><input aria-label="Message" placeholder="Message…" value={text} onChange={event => setText(event.target.value)} onKeyDown={event => { if (event.key === "Enter") void send(); }}/><button disabled={pending || !text.trim()} onClick={() => void send()} aria-label="Send message">↑</button></div></>}</div>;
}

export function SocialSearchScreen({ authenticated, onBack, onOpenRoom, onOpenProfile, onOpenGame, onOpenDrama, onSignIn }: {
  authenticated: boolean;
  onBack: () => void;
  onOpenRoom: (room: ApiRoom) => void;
  onOpenProfile: (user: ApiUser, index: number) => void;
  onOpenGame: () => void;
  onOpenDrama: () => void;
  onSignIn: () => void;
}) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [rooms, setRooms] = useState<ApiRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const normalized = query.trim().toLowerCase();
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      Promise.all([sadaApi.social.rooms(), authenticated ? sadaApi.social.users(query.trim()) : Promise.resolve({ items: [], nextCursor: null })])
        .then(([roomPage, userPage]) => { if (active) { setRooms(roomPage.items); setUsers(userPage.items); } })
        .catch(() => { if (active) { setRooms([]); setUsers([]); } })
        .finally(() => { if (active) setLoading(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [authenticated, query]);
  const visibleRooms = useMemo(() => rooms.filter(room => !normalized || `${room.title} ${room.topic}`.toLowerCase().includes(normalized)), [normalized, rooms]);
  return <div className="feature-screen flow-screen"><div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>People and live rooms</small><h1>Search SADA</h1></div><span/></div><label className="flow-search"><span>⌕</span><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search people or rooms"/><button onClick={() => setQuery("")} aria-label="Clear search">×</button></label>{loading ? <p>Searching…</p> : null}<section className="flow-section"><div className="section-heading compact"><h2>People</h2><small>{authenticated ? `${users.length} results` : "Sign in required"}</small></div>{authenticated ? <div className="flow-list">{users.map((user, index) => <button key={user.id} onClick={() => onOpenProfile(user, index)}><PersonMark name={user.displayName} index={index}/><span><strong>{user.displayName}</strong><small>{user.city} · VIP {user.vipLevel}</small></span><em>{user.following ? "Following" : "View ›"}</em></button>)}</div> : <button className="flow-primary" onClick={onSignIn}>Sign in to find people</button>}</section><section className="flow-section"><div className="section-heading compact"><h2>Live rooms</h2><small>{visibleRooms.length} results</small></div><div className="flow-list">{visibleRooms.map(room => <button key={room.id} onClick={() => onOpenRoom(room)}><span>◉</span><span><strong>{room.title}</strong><small>{room.topic} · {room.listenerCount} listening</small></span><em>Join ›</em></button>)}</div></section>{(!normalized || "ludo nights".includes(normalized)) ? <button className="search-feature" onClick={onOpenGame}><span>⌘</span><div><strong>Ludo Nights</strong><small>Game prototype</small></div><b>Play</b></button> : null}{(!normalized || "dil se door".includes(normalized)) ? <button className="search-feature" onClick={onOpenDrama}><span>▶</span><div><strong>Dil Se Door</strong><small>Drama prototype</small></div><b>Watch</b></button> : null}</div>;
}

export function SocialUserProfileScreen({ user, index, authenticated, onBack, onMessage, onOpenRoom, onSignIn, notify }: {
  user: ApiUser;
  index: number;
  authenticated: boolean;
  onBack: () => void;
  onMessage: (peer: Peer) => void;
  onOpenRoom: () => void;
  onSignIn: () => void;
  notify: Notify;
}) {
  const [following, setFollowing] = useState(Boolean(user.following));
  const toggleFollow = async () => {
    if (!authenticated) { onSignIn(); return; }
    try { const result = await sadaApi.social.followUser(user.id, !following); setFollowing(result.following); notify(result.following ? `Following ${user.displayName}` : `Unfollowed ${user.displayName}`); }
    catch (cause) { notify(cause instanceof Error ? cause.message : "Follow could not be updated"); }
  };
  return <div className="feature-screen flow-screen"><div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>SADA profile</small><h1>{user.displayName}</h1></div><span/></div><section className="public-profile"><PersonMark name={user.displayName} index={index}/><h2>{user.displayName}</h2><p>{user.city}</p><p>{user.bio || "Ready to meet people on SADA."}</p><div><span><b>VIP {user.vipLevel}</b> member</span></div><div className="profile-cta"><button className={following ? "selected" : ""} onClick={() => void toggleFollow()}>{following ? "Following" : "Follow"}</button><button onClick={() => authenticated ? onMessage({ id: user.id, name: user.displayName, index }) : onSignIn()}>Message</button></div></section><button className="shared-room" onClick={onOpenRoom}><span>◉</span><div><small>Live rooms</small><strong>Find a conversation together</strong></div><b>Browse ›</b></button></div>;
}

export function SocialCreateRoomScreen({ authenticated, onBack, onCreated, onSignIn, notify }: {
  authenticated: boolean;
  onBack: () => void;
  onCreated: (room: ApiRoom) => void;
  onSignIn: () => void;
  notify: Notify;
}) {
  const [step, setStep] = useState<"details" | "preview">("details");
  const [title, setTitle] = useState("My night room");
  const [topic, setTopic] = useState<ApiRoom["topic"]>("Stories");
  const [privacy, setPrivacy] = useState<ApiRoom["privacy"]>("public");
  const [pending, setPending] = useState(false);
  if (!authenticated) return <div className="feature-screen"><div className="feature-header"><button className="screen-back" onClick={onBack} aria-label="Back">‹</button><div><small>Start a live conversation</small><h1>Create a room</h1></div><span/></div><SignInState onSignIn={onSignIn}/></div>;
  const create = async () => {
    setPending(true);
    try { onCreated(await sadaApi.social.createRoom({ title: title.trim(), topic, privacy })); }
    catch (cause) { notify(cause instanceof Error ? cause.message : "Room could not be created"); }
    finally { setPending(false); }
  };
  return <div className="feature-screen flow-screen"><div className="feature-header"><button className="screen-back" onClick={step === "preview" ? () => setStep("details") : onBack} aria-label="Back">‹</button><div><small>{step === "details" ? "Start a live conversation" : "Ready to go live"}</small><h1>{step === "details" ? "Create a room" : "Room preview"}</h1></div><span/></div>{step === "details" ? <div className="room-form"><label>Room title<input value={title} onChange={event => setTitle(event.target.value)} maxLength={80}/><small>{title.length}/80</small></label><fieldset><legend>Topic</legend><div className="option-grid">{(["Stories", "Music", "Games", "Poetry"] as const).map(item => <button type="button" key={item} className={topic === item ? "selected" : ""} onClick={() => setTopic(item)}>{item}</button>)}</div></fieldset><fieldset><legend>Who can join</legend><div className="option-grid two"><button type="button" className={privacy === "public" ? "selected" : ""} onClick={() => setPrivacy("public")}>Public</button><button type="button" className={privacy === "friends" ? "selected" : ""} onClick={() => setPrivacy("friends")}>Friends only</button></div></fieldset><button className="flow-primary" disabled={!title.trim()} onClick={() => setStep("preview")}>Preview room</button></div> : <div className="room-preview"><span>◉</span><small>{topic} · {privacy === "public" ? "Public" : "Friends only"}</small><h2>{title}</h2><p>You will be the host and the room will be written to SADA immediately.</p><button className="flow-primary" disabled={pending} onClick={() => void create()}>{pending ? "Creating…" : "Go live"}</button></div>}</div>;
}
