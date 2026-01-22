"use client";

import {
  Calculator,
  Code,
  CreditCard,
  FileText,
  Home,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Objek Pajak", href: "/objek-pajak", icon: Search },
  { name: "SPPT", href: "/sppt", icon: FileText },
  { name: "Pembayaran", href: "/pembayaran", icon: CreditCard },
  { name: "Laporan", href: "/laporan", icon: Calculator },
];

const settingsItems = [
  { name: "Profil", href: "/settings/profile", icon: User },
  { name: "Pengaturan", href: "/settings", icon: Settings },
  { name: "Developer", href: "/dev", icon: Code },
];

type CommandContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CommandContext = createContext<CommandContextValue | null>(null);

export function useCommand() {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error("useCommand must be used within CommandProvider");
  }
  return context;
}

export function CommandProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput placeholder="Cari menu atau NOP..." />
        <CommandList>
          <CommandEmpty>Tidak ditemukan.</CommandEmpty>
          <CommandGroup heading="Navigasi">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => runCommand(() => router.push(item.href))}
              >
                <item.icon className="mr-2" />
                <span>{item.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Pengaturan">
            {settingsItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => runCommand(() => router.push(item.href))}
              >
                <item.icon className="mr-2" />
                <span>{item.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </CommandContext.Provider>
  );
}
