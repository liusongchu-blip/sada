import type { AdminUser, OverviewData } from "./types";

type Envelope<T> = { data: T } | { error: { message: string } };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1/admin${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  const payload = (await response.json()) as Envelope<T>;
  if (!response.ok || "error" in payload) {
    throw new Error("error" in payload ? payload.error.message : "请求失败，请稍后重试");
  }
  return payload.data;
}

export const adminApi = {
  overview: () => request<OverviewData>("/overview"),
  users: () => request<{ items: AdminUser[] }>("/users?limit=50"),
  updateUser: (id: string, status: AdminUser["status"]) => request<{ id: string; status: string }>(`/users/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  updateRoom: (id: string, status: "live" | "ended" | "suspended") => request<{ id: string; status: string }>(`/rooms/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  updateReport: (id: string, status: "reviewing" | "resolved" | "dismissed") => request<{ id: string; status: string }>(`/reports/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
};
