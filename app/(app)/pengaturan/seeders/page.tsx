"use client";

import {
  AlertTriangle,
  CreditCard,
  Database,
  Factory,
  FileCheck,
  FileText,
  RotateCcw,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type SeederAction =
  | "all"
  | "facilities"
  | "dental"
  | "participants"
  | "registrations"
  | "payments"
  | "changes"
  | "clear";

type SeederConfig = {
  id: SeederAction;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultCount: number;
  danger?: boolean;
};

const SEEDERS: SeederConfig[] = [
  {
    id: "all",
    label: "Buat Semua Data",
    description:
      "Buat semua data contoh (faskes, peserta, pendaftaran, pembayaran, perubahan)",
    icon: Database,
    defaultCount: 0,
    danger: false,
  },
  {
    id: "facilities",
    label: "Faskes",
    description:
      "Buat data fasilitas kesehatan (Puskesmas, Klinik, Rumah Sakit)",
    icon: Factory,
    defaultCount: 20,
  },
  {
    id: "dental",
    label: "Faskes Gigi",
    description: "Buat data praktek gigi",
    icon: Factory,
    defaultCount: 10,
  },
  {
    id: "participants",
    label: "Peserta",
    description: "Buat data peserta dengan info pekerjaan, keluarga, dan bank",
    icon: Users,
    defaultCount: 50,
  },
  {
    id: "registrations",
    label: "Pendaftaran",
    description: "Buat data aplikasi pendaftaran",
    icon: FileCheck,
    defaultCount: 30,
  },
  {
    id: "payments",
    label: "Pembayaran",
    description: "Buat data pembayaran",
    icon: CreditCard,
    defaultCount: 100,
  },
  {
    id: "changes",
    label: "Permohonan Perubahan",
    description: "Buat data permohonan perubahan data",
    icon: FileText,
    defaultCount: 20,
  },
  {
    id: "clear",
    label: "Hapus Semua Data",
    description: "Hapus semua data JKN dari database",
    icon: RotateCcw,
    defaultCount: 0,
    danger: true,
  },
];

export default function SeedersPage() {
  const [loading, setLoading] = useState<SeederAction | null>(null);
  const [counts, setCounts] = useState<Record<string, string>>({});

  const getCount = (seeder: SeederConfig) => {
    if (counts[seeder.id]) {
      return Number.parseInt(counts[seeder.id], 10);
    }
    return seeder.defaultCount;
  };

  const showError = (error: unknown) => {
    console.error("Seeding error:", error);
    const message =
      error instanceof Error ? error.message : "Gagal membuat data";
    toast.error(message);
  };

  const showStats = (stats: Record<string, number>) => {
    if (Object.keys(stats).length === 0) {
      return;
    }
    const statsText = Object.entries(stats)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    toast.info(`Statistik: ${statsText}`);
  };

  const executeSeed = async (seeder: SeederConfig) => {
    const count = getCount(seeder);
    const body = {
      action: seeder.id,
      count: seeder.id !== "all" && seeder.id !== "clear" ? count : undefined,
    };

    const response = await fetch("/api/admin/seed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Gagal membuat data");
    }

    return response.json();
  };

  const handleSeed = async (seeder: SeederConfig) => {
    setLoading(seeder.id);

    try {
      const result = await executeSeed(seeder);
      toast.success(result.message);
      showStats(result.stats);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(null);
    }
  };

  const getButtonText = (seeder: SeederConfig, isLoading: boolean) => {
    if (isLoading) {
      return "Memproses...";
    }
    return `Jalankan ${seeder.label}`;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h1 className="font-bold text-3xl">Database Seeders</h1>
        <p className="text-muted-foreground">
          Buat data contoh untuk pengembangan dan pengujian
        </p>
      </div>

      <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-5 w-5" />
            Peringatan
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-yellow-700 dark:text-yellow-300">
          Alat ini hanya untuk tujuan pengembangan. Data dibuat menggunakan
          Faker.js dengan data Indonesia palsu. Tindakan &quot;Hapus Semua
          Data&quot; akan menghapus permanen semua data JKN dari database.
          Gunakan dengan hati-hati!
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {SEEDERS.map((seeder) => {
          const Icon = seeder.icon;
          const isLoading = loading === seeder.id;
          const showCountInput = seeder.id !== "all" && seeder.id !== "clear";

          return (
            <Card
              className={seeder.danger ? "border-red-500" : undefined}
              key={seeder.id}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {seeder.label}
                </CardTitle>
                <CardDescription>{seeder.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  {showCountInput && (
                    <Field>
                      <FieldLabel>Jumlah</FieldLabel>
                      <Input
                        disabled={isLoading}
                        max={1000}
                        min={1}
                        onChange={(e) =>
                          setCounts({ ...counts, [seeder.id]: e.target.value })
                        }
                        placeholder={seeder.defaultCount.toString()}
                        type="number"
                        value={counts[seeder.id] || ""}
                      />
                      <FieldDescription>
                        Default: {seeder.defaultCount}
                      </FieldDescription>
                    </Field>
                  )}
                  <Button
                    className="w-full"
                    disabled={isLoading}
                    onClick={() => handleSeed(seeder)}
                    variant={seeder.danger ? "destructive" : "default"}
                  >
                    {isLoading ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        {getButtonText(seeder, true)}
                      </>
                    ) : (
                      getButtonText(seeder, false)
                    )}
                  </Button>
                </FieldGroup>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
