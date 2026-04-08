"use client";

import {
  Brain,
  ClipboardList,
  CreditCard,
  Home,
  Hospital,
  RefreshCw,
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

// JKN Navigation Data - Flattened for simpler UX
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
  },
  {
    title: "Pendaftaran",
    url: "/pendaftaran",
    icon: ClipboardList,
  },
  {
    title: "Perubahan Data",
    url: "/perubahan",
    icon: Hospital,
  },
  {
    title: "Faskes",
    url: "/faskes",
    icon: Hospital,
  },
  {
    title: "Pembayaran",
    url: "/pembayaran",
    icon: CreditCard,
  },
  {
    title: "Bank & Rekening",
    url: "/bank",
    icon: Wallet,
  },
  {
    title: "Analitik & AI",
    url: "/analitik",
    icon: Brain,
  },
  {
    title: "Sync openIMIS",
    url: "/sync",
    icon: RefreshCw,
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
