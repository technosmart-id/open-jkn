"use client";

import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Bell, Check, Search } from "lucide-react";
import { useEffect } from "react";
import { AutoBreadcrumbs } from "@/components/layouts/auto-breadcrumbs";
import { ModeToggle } from "@/components/layouts/mode-toggle";
import { useCommand } from "@/components/providers/command-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNotifications } from "@/lib/hooks/use-notifications";

export function AppHeader() {
  const { setOpen } = useCommand();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-2 px-4">
        {/* Left: Sidebar trigger + Breadcrumbs */}
        <SidebarTrigger className="-ml-1" />
        <Separator
          className="mr-2 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />
        <div className="flex-1">
          <AutoBreadcrumbs />
        </div>

        {/* Right: Search + Notifications */}
        <div className="flex items-center gap-1">
          {/* Search trigger */}
          <Button
            className="hidden h-9 w-40 justify-between text-muted-foreground sm:flex"
            onClick={() => setOpen(true)}
            variant="outline"
          >
            <span className="flex items-center gap-2">
              <Search className="size-4" />
              <span>Cari...</span>
            </span>
            <Kbd>⌘K</Kbd>
          </Button>
          <Button
            aria-label="Cari"
            className="size-9 sm:hidden"
            onClick={() => setOpen(true)}
            size="icon"
            variant="ghost"
          >
            <Search className="size-4" />
          </Button>

          {/* Theme toggle */}
          <ModeToggle />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Notifications"
                className="relative size-9"
                size="icon"
                variant="ghost"
              >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <Badge className="-top-1 -right-1 absolute size-5 p-0 text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifikasi</span>
                {unreadCount > 0 && (
                  <Button
                    className="h-auto p-0 text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      markAllAsRead();
                    }}
                    variant="link"
                  >
                    <Check className="mr-1 size-3" />
                    Tandai semua dibaca
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isLoading === true && (
                <div className="py-4 text-center text-muted-foreground text-sm">
                  Memuat...
                </div>
              )}
              {isLoading === false && notifications.length === 0 && (
                <div className="py-4 text-center text-muted-foreground text-sm">
                  Tidak ada notifikasi
                </div>
              )}
              {isLoading === false &&
                notifications.length > 0 &&
                notifications.slice(0, 5).map((notification) => (
                  <DropdownMenuItem
                    className="flex cursor-pointer flex-col items-start gap-1 p-3"
                    key={notification.id}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <span className="font-medium">{notification.title}</span>
                      {!notification.read && (
                        <span className="size-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>
                    {Boolean(notification.description) && (
                      <span className="text-muted-foreground text-xs">
                        {notification.description}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground/60">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </span>
                  </DropdownMenuItem>
                ))}
              {notifications.length > 5 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center text-sm">
                    Lihat semua notifikasi
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
