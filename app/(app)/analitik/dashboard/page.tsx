"use client";

import { BarChart3, Brain, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ModelStatus {
  modelsReady: boolean;
  hasOutput: boolean;
  images: Record<string, boolean>;
}

export default function DashboardPage() {
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data) => setModelStatus(data))
      .catch(() => setModelStatus(null));
  }, []);

  const hasImage = (imageKey: string) =>
    modelStatus?.images?.[imageKey] && !imageErrors[imageKey];

  const handleImageError = (imageKey: string) => {
    setImageErrors((prev) => ({ ...prev, [imageKey]: true }));
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Dashboard Deteksi Anomali</h1>
          <p className="text-muted-foreground">
            Visualisasi metrik dan statistik deteksi anomali data kepesertaan
          </p>
        </div>
      </div>

      {/* Main Dashboard Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Anomaly Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          {hasImage("anomaly_dashboard.png") ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <Image
                alt="Anomaly Dashboard"
                className="object-contain"
                fill
                onError={() => handleImageError("anomaly_dashboard.png")}
                src="/api/ai/images/dashboard.png"
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
              <div className="text-center">
                <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">
                  Visualisasi belum tersedia
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secondary Visualizations */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Usia: Normal vs Anomali</CardTitle>
          </CardHeader>
          <CardContent>
            {hasImage("age_distribution.png") ? (
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  alt="Age Distribution"
                  className="object-contain"
                  fill
                  onError={() => handleImageError("age_distribution.png")}
                  src="/api/ai/images/age-distribution.png"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center rounded-lg bg-muted">
                <div className="text-center">
                  <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    Visualisasi distribusi usia belum tersedia
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Training History */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Training Model</CardTitle>
          </CardHeader>
          <CardContent>
            {hasImage("ae_training_history.png") ? (
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted">
                <Image
                  alt="Training History"
                  className="object-contain"
                  fill
                  onError={() => handleImageError("ae_training_history.png")}
                  src="/api/ai/images/training-history.png"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center rounded-lg bg-muted">
                <div className="text-center">
                  <Brain className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    Visualisasi riwayat training belum tersedia
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Model Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Model</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground text-sm">
            Sistem deteksi anomali menggunakan kombinasi tiga pendekatan untuk
            akurasi maksimal:
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="mb-2 font-semibold">Autoencoder</h4>
              <p className="text-muted-foreground text-sm">
                Neural network yang belajar merepresentasikan data normal.
                Rekonstruksi error tinggi menunjukkan anomali.
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Isolation Forest</h4>
              <p className="text-muted-foreground text-sm">
                Algoritma unsupervised yang mengisolasi outlier dengan membangun
                decision tree secara acak.
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Business Rules</h4>
              <p className="text-muted-foreground text-sm">
                Aturan domain-specific untuk validasi data seperti konsistensi
                usia-peran dan struktur keluarga.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Rules Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Aturan Validasi Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground text-sm">
            Berikut adalah aturan yang digunakan untuk mendeteksi anomali dalam
            data kepesertaan:
          </p>
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>UMUR_NEGATIF - Usia negatif</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>
                AKTIF_UMUR_{">"}110 - Peserta aktif {">"}110 tahun
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span>KEPALA_KELUARGA_ANAK - Kepala keluarga anak-anak</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span>
                ANAK_TAPI_UMUR_{">"}25 - Anak dengan usia {">"}25 tahun
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span>
                KAWIN_UMUR_{"<"}16 - Menikah di usia {"<"}16 tahun
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span>KELUARGA_BESAR - Anggota keluarga {">"}10 orang</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>TANPA_KEPALA_KELUARGA - Keluarga tanpa kepala</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>RASIO_AKTIF_RENDAH - Rasio anggota aktif rendah</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
