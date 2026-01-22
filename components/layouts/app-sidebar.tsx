"use client";

import {
  ClipboardList,
  CreditCard,
  Home,
  Hospital,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import type * as React from "react";

import { AppSwitcher } from "@/components/layouts/app-switcher";
import { NavMain } from "@/components/layouts/nav-main";
import { NavUser } from "@/components/layouts/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth/client";

// JKN Navigation Data
const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Peserta",
    url: "/peserta",
    icon: Users,
    items: [
      { title: "Daftar Peserta", url: "/peserta" },
      { title: "Tambah Peserta", url: "/peserta/baru" },
      { title: "Cari Peserta", url: "/peserta/cari" },
    ],
  },
  {
    title: "Pendaftaran",
    url: "/pendaftaran",
    icon: ClipboardList,
    items: [
      { title: "Daftar Pendaftaran", url: "/pendaftaran" },
      { title: "Pendaftaran Baru", url: "/pendaftaran/baru" },
      { title: "Verifikasi", url: "/pendaftaran/verifikasi" },
    ],
  },
  {
    title: "Perubahan Data",
    url: "/perubahan",
    icon: Settings,
    items: [
      { title: "Daftar Permohonan", url: "/perubahan" },
      { title: "Buat Permohonan", url: "/perubahan/baru" },
    ],
  },
  {
    title: "Faskes",
    url: "/faskes",
    icon: Hospital,
    items: [
      { title: "Faskes Utama", url: "/faskes" },
      { title: "Faskes Gigi", url: "/faskes/gigi" },
      { title: "Faskes Peserta", url: "/faskes/peserta" },
    ],
  },
  {
    title: "Pembayaran",
    url: "/pembayaran",
    icon: CreditCard,
    items: [
      { title: "Daftar Pembayaran", url: "/pembayaran" },
      { title: "Input Pembayaran", url: "/pembayaran/input" },
      { title: "Laporan", url: "/pembayaran/laporan" },
    ],
  },
  {
    title: "Bank & Rekening",
    url: "/bank",
    icon: Wallet,
  },
  {
    title: "Pengaturan",
    url: "/pengaturan",
    icon: Settings,
    items: [
      { title: "Database Seeders", url: "/pengaturan/seeders" },
      { title: "Profil", url: "/settings/profile" },
      { title: "Pengguna", url: "/settings/users" },
      { title: "Sistem", url: "/settings/system" },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const userData = {
    name: session?.user?.name ?? "Admin JKN",
    email: session?.user?.email ?? "admin@jkn.go.id",
    avatar: session?.user?.image ?? "",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
