"use client";

import { AlertTriangle, BarChart3, Brain, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ModelStatus {
  modelsReady: boolean;
  hasOutput: boolean;
  images: Record<string, boolean>;
}

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data) => setModelStatus(data))
      .catch(() => setModelStatus(null));
  }, []);

  const hasImage = (imageKey: string) => modelStatus?.images?.[imageKey] && !imageErrors[imageKey];

  const handleImageError = (imageKey: string) => {
    setImageErrors((prev) => ({ ...prev, [imageKey]: true }));
  };

  if (!modelStatus?.hasOutput) {
    return (
      <div className="container max-w-7xl py-8">
        <div className="mb-8">
          <h1 className="font-bold text-3xl tracking-tight">
            Dashboard Deteksi Anomali
          </h1>
          <p className="mt-2 text-muted-foreground">
            Visualisasi metrik dan statistik deteksi anomali data kepesertaan
          </p>
        </div>

        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="font-semibold text-sm">
            Belum Ada Data Visualisasi
          </AlertTitle>
          <AlertDescription className="text-xs">
            Jalankan training script terlebih dahulu untuk menghasilkan visualisasi:{" "}
            <code className="rounded bg-black/10 px-1 py-0.5 dark:bg-white/10">
              cd ai && python run_train.py
            </code>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl tracking-tight">
              Dashboard Deteksi Anomali
            </h1>
            <p className="mt-2 text-muted-foreground">
              Visualisasi metrik dan statistik deteksi anomali data kepesertaan
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={modelStatus.modelsReady ? "default" : "secondary"}>
              {modelStatus.modelsReady ? "Model Ready" : "Need Train"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Dashboard Visualization */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Anomaly Dashboard</CardTitle>
          <CardDescription>
            Visualisasi lengkap hasil deteksi anomali
          </CardDescription>
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
                <p className="text-muted-foreground">
                  Dashboard visualization not available
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secondary Visualizations */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Usia: Normal vs Anomali</CardTitle>
            <CardDescription>
              Perbandingan distribusi usia antara data normal dan anomali
            </CardDescription>
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
                    Age distribution visualization not available
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Training History */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Training Autoencoder</CardTitle>
            <CardDescription>
              Loss curve selama proses training model
            </CardDescription>
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
                    Training history visualization not available
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Model Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Model Information</CardTitle>
          <CardDescription>
            Konfigurasi dan parameter model deteksi anomali
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h4 className="mb-2 font-semibold">Autoencoder</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Encoding Dim</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Epochs</span>
                  <span className="font-medium">50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batch Size</span>
                  <span className="font-medium">256</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Learning Rate</span>
                  <span className="font-medium">0.001</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-semibold">Isolation Forest</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contamination</span>
                  <span className="font-medium">1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimators</span>
                  <span className="font-medium">200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Threshold</span>
                  <span className="font-medium">P99</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 font-semibold">Business Rules</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Rules</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hard Rules</span>
                  <span className="font-medium">4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Soft Rules</span>
                  <span className="font-medium">4</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detected Anomalies Summary */}
          <div className="mt-6 border-t pt-6">
            <h4 className="mb-3 font-semibold">Business Rules Deteksi</h4>
            <div className="grid gap-2 text-sm md:grid-cols-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span>UMUR_NEGATIF - Usia negatif</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span>AKTIF_UMUR_>110 - Peserta aktif &gt;110 tahun</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span>KEPALA_KELUARGA_ANAK - Kepala keluarga anak-anak</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span>ANAK_TAPI_UMUR_>25 - Anak dengan usia &gt;25 tahun</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span>KAWIN_UMUR_<16 - Menikah di usia &lt;16 tahun</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span>KELUARGA_BESAR - Anggota keluarga &gt;10 orang</span>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
