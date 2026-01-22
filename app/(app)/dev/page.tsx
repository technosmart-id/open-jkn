"use client";

import { Bell, Mail, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCommand } from "@/components/providers/command-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function DevPage() {
  const { setOpen } = useCommand();

  // Email test state
  const [emailTo, setEmailTo] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  // Notification test state
  const [notifTitle, setNotifTitle] = useState("");
  const [notifDescription, setNotifDescription] = useState("");
  const [notifType, setNotifType] = useState<string>("info");
  const [notifSending, setNotifSending] = useState(false);

  const handleSendTestEmail = async () => {
    setEmailSending(true);
    try {
      const response = await fetch("/api/dev/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo || undefined,
          message: emailMessage || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to send email");
      }

      toast.success(data.message);
      setEmailTo("");
      setEmailMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setEmailSending(false);
    }
  };

  const handleCreateNotification = async () => {
    if (!notifTitle) {
      toast.error("Judul notifikasi wajib diisi");
      return;
    }

    setNotifSending(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: notifTitle,
          description: notifDescription || undefined,
          type: notifType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create notification");
      }

      toast.success(
        "Notifikasi berhasil dibuat! Lihat icon lonceng di header."
      );
      setNotifTitle("");
      setNotifDescription("");
      setNotifType("info");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create notification"
      );
    } finally {
      setNotifSending(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Email Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5" />
              Test Email (Resend)
            </CardTitle>
            <CardDescription>
              Kirim email test untuk memverifikasi konfigurasi Resend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-to">Email Tujuan (opsional)</Label>
              <Input
                id="email-to"
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="Kosongkan untuk email akun Anda"
                type="email"
                value={emailTo}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-message">Pesan (opsional)</Label>
              <Textarea
                id="email-message"
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Pesan tambahan dalam email"
                rows={3}
                value={emailMessage}
              />
            </div>
            <Button
              className="w-full"
              disabled={emailSending}
              onClick={handleSendTestEmail}
            >
              <Send className="mr-2 size-4" />
              {emailSending ? "Mengirim..." : "Kirim Test Email"}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5" />
              Test Notifikasi
            </CardTitle>
            <CardDescription>
              Buat notifikasi untuk menguji sistem notifikasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notif-title">Judul</Label>
              <Input
                id="notif-title"
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="Judul notifikasi"
                value={notifTitle}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notif-description">Deskripsi (opsional)</Label>
              <Textarea
                id="notif-description"
                onChange={(e) => setNotifDescription(e.target.value)}
                placeholder="Deskripsi notifikasi"
                rows={2}
                value={notifDescription}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notif-type">Tipe</Label>
              <Select onValueChange={setNotifType} value={notifType}>
                <SelectTrigger id="notif-type">
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              disabled={notifSending}
              onClick={handleCreateNotification}
            >
              <Bell className="mr-2 size-4" />
              {notifSending ? "Membuat..." : "Buat Notifikasi"}
            </Button>
          </CardContent>
        </Card>

        {/* Toast Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Toast (Sonner)</CardTitle>
            <CardDescription>
              Notifikasi toast dengan berbagai tipe
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              onClick={() => toast.success("Operasi berhasil!")}
              size="sm"
            >
              Success
            </Button>
            <Button
              onClick={() => toast.error("Terjadi kesalahan!")}
              size="sm"
              variant="destructive"
            >
              Error
            </Button>
            <Button
              onClick={() => toast.info("Informasi penting")}
              size="sm"
              variant="outline"
            >
              Info
            </Button>
            <Button
              onClick={() => toast.warning("Perhatian!")}
              size="sm"
              variant="secondary"
            >
              Warning
            </Button>
            <Button
              onClick={() =>
                toast.promise(
                  new Promise((resolve) => setTimeout(resolve, 2000)),
                  {
                    loading: "Memproses...",
                    success: "Selesai!",
                    error: "Gagal!",
                  }
                )
              }
              size="sm"
              variant="outline"
            >
              Promise
            </Button>
          </CardContent>
        </Card>

        {/* Command Palette Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Command Palette</CardTitle>
            <CardDescription>Buka dengan ⌘K atau Ctrl+K</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setOpen(true)} variant="outline">
              Buka Command Palette
            </Button>
          </CardContent>
        </Card>

        {/* Button Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>Berbagai varian tombol</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm">Default</Button>
            <Button size="sm" variant="secondary">
              Secondary
            </Button>
            <Button size="sm" variant="destructive">
              Destructive
            </Button>
            <Button size="sm" variant="outline">
              Outline
            </Button>
            <Button size="sm" variant="ghost">
              Ghost
            </Button>
            <Button size="sm" variant="link">
              Link
            </Button>
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
            <CardDescription>Status konfigurasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">RESEND_API_KEY</span>
              <span>
                {process.env.NEXT_PUBLIC_HAS_RESEND ? "Set" : "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Node Env</span>
              <span>{process.env.NODE_ENV}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
