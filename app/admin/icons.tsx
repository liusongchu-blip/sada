import type { ReactNode } from "react";

export type AdminIconName = "overview" | "users" | "rooms" | "safety" | "economy" | "payments" | "campaigns" | "settings" | "search" | "bell" | "calendar" | "arrow" | "refresh" | "menu";

export function AdminIcon({ name, size = 20 }: { name: AdminIconName; size?: number }) {
  const paths: Record<AdminIconName, ReactNode> = {
    overview: <><path d="M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3.5 20c.3-4.2 2.2-6.3 5.5-6.3s5.2 2.1 5.5 6.3M16 6.5a3 3 0 0 1 0 5.8M16.5 14c2.7.4 4 2.4 4 6"/></>,
    rooms: <><path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4"/></>,
    safety: <><path d="M12 3 5 6v5c0 4.7 2.3 8 7 10 4.7-2 7-5.3 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/></>,
    economy: <><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></>,
    payments: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></>,
    campaigns: <><path d="m4 13 12-6v10L4 13Z"/><path d="M7 14v5h4v-3M18 9c1 1 1 5 0 6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7L10.5 2h-3l-.7 2-1.7.7-1.9-.9-2.1 2.1.9 1.9-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7 2-.7Z"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></>,
    bell: <><path d="M6 10a6 6 0 0 1 12 0v5l2 2H4l2-2v-5ZM10 21h4"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    refresh: <><path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
