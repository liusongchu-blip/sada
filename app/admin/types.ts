export type TrendPoint = {
  day: string;
  newUsers: number;
  roomsCreated: number;
  revenue: number;
};

export type AdminRoom = {
  id: string;
  title: string;
  topic: string;
  status: "live" | "ended" | "suspended";
  listenerCount: number;
  hostName: string;
  updatedAt: string;
};

export type AdminReport = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  details: string;
  status: "received" | "reviewing" | "resolved" | "dismissed";
  reporterName: string;
  createdAt: string;
};

export type AdminTransaction = {
  id: string;
  userName: string;
  amountPkr: number;
  diamonds: number;
  status: string;
  providerReference: string | null;
  createdAt: string;
};

export type AdminUser = {
  id: string;
  displayName: string;
  phone: string | null;
  email: string | null;
  city: string;
  locale: string;
  vipLevel: number;
  status: "active" | "suspended";
  diamonds: number | null;
  boundDiamonds: number | null;
  gameCoins: number | null;
  createdAt: string;
};

export type OverviewData = {
  operator: { email: string; name: string };
  metrics: {
    totalUsers: number;
    activeUsers: number;
    liveRooms: number;
    pendingReports: number;
    revenuePkr: number;
  };
  trends: TrendPoint[];
  rooms: AdminRoom[];
  reports: AdminReport[];
  transactions: AdminTransaction[];
  generatedAt: string;
};

export type SectionId = "overview" | "users" | "rooms" | "safety" | "economy" | "payments" | "campaigns" | "settings";
