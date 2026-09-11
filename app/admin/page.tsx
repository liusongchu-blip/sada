import type { Metadata } from "next";
import { AdminDashboard } from "./admin-dashboard";
import "./admin.css";

export const metadata: Metadata = {
  title: "SADA 管理后台",
  description: "SADA 平台运营、内容安全与交易管理后台",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
