"use client";

import { ChevronsUpDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type App = {
  name: string;
  description: string;
  href: string;
};

const apps: App[] = [
  {
    name: "Open JKN",
    description: "Simulasi JKN untuk edukasi",
    href: "/dashboard",
  },
  // TODO: Enable for future release
  // {
  //   name: "BPHTB",
  //   description: "Bea Perolehan Hak atas Tanah dan Bangunan",
  //   href: "/bphtb",
  // },
];

export function AppSwitcher() {
  const { isMobile } = useSidebar();
  // TODO: Get active app from URL or context
  const activeApp = apps[0];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activeApp.name}</span>
                <span className="truncate text-muted-foreground text-xs">
                  {activeApp.description}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Aplikasi
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {apps.map((app) => (
              <DropdownMenuItem asChild className="gap-2 p-2" key={app.name}>
                <a href={app.href}>
                  <div className="flex flex-col">
                    <span className="font-medium">{app.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {app.description}
                    </span>
                  </div>
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
