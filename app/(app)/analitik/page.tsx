"use client";

import {
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle2,
  Upload,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  canTrain: boolean;
  canScore: boolean;
}

export default function AnalitikPage() {
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data) => {
        setModelStatus(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl tracking-tight">Analitik & AI</h1>
        <p className="mt-2 text-muted-foreground">
          Deteksi anomali dan analisis data kepesertaan JKN menggunakan Machine
          Learning
        </p>
      </div>

      {/* Model Status Alert */}
      {!isLoading && modelStatus && (
        <Alert
          className={
            modelStatus.modelsReady
              ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
              : "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950"
          }
        >
          {modelStatus.modelsReady ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-orange-600" />
          )}
          <AlertTitle className="font-semibold text-sm">
            Status Model:{" "}
            {modelStatus.modelsReady ? "Siap Digunakan" : "Perlu Training"}
          </AlertTitle>
          <AlertDescription className="text-xs">
            {modelStatus.modelsReady
              ? "Model AI telah dilatih dan siap untuk mendeteksi anomali pada data baru."
              : "Model belum dilatih. Jalankan training script terlebih dahulu: 'cd ai && python run_train.py'"}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Anomaly Detection Card */}
        <Card className="group transition-shadow hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle>Deteksi Anomali</CardTitle>
                  <CardDescription>
                    Analisis data kepesertaan untuk mendeteksi pola yang
                    mencurigakan
                  </CardDescription>
                </div>
              </div>
              {!isLoading && modelStatus && (
                <Badge
                  className="shrink-0"
                  variant={modelStatus.canScore ? "default" : "secondary"}
                >
                  {modelStatus.canScore ? "Ready" : "Need Train"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground text-sm">
              Menggunakan hybrid model Autoencoder + Isolation Forest untuk
              mengidentifikasi anomali dalam data pendaftaran BPJS.
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 font-medium text-red-700 text-xs ring-1 ring-red-600/20 ring-inset dark:bg-red-900/20 dark:text-red-400">
                Autoencoder
              </span>
              <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 font-medium text-orange-700 text-xs ring-1 ring-orange-600/20 ring-inset dark:bg-orange-900/20 dark:text-orange-400">
                Isolation Forest
              </span>
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700 text-xs ring-1 ring-blue-600/20 ring-inset dark:bg-blue-900/20 dark:text-blue-400">
                Business Rules
              </span>
            </div>
            <Button
              asChild
              className="w-full"
              disabled={
                !isLoading && modelStatus !== null && !modelStatus.canScore
              }
            >
              <Link href="/analitik/anomali">
                <Upload className="mr-2 h-4 w-4" />
                Upload & Analisis Data
              </Link>
            </Button>
            {!isLoading && modelStatus && !modelStatus.canScore && (
              <p className="mt-2 text-center text-muted-foreground text-xs">
                Model belum siap. Jalankan training terlebih dahulu.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Dashboard Card */}
        <Card className="group transition-shadow hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>Dashboard Data</CardTitle>
                  <CardDescription>
                    Visualisasi metrik dan statistik data kepesertaan
                  </CardDescription>
                </div>
              </div>
              {!isLoading && modelStatus && (
                <Badge
                  className="shrink-0"
                  variant={modelStatus.hasOutput ? "default" : "secondary"}
                >
                  {modelStatus.hasOutput ? "Hasil Ready" : "No Data"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground text-sm">
              Lihat visualisasi distribusi anomali, pola usia, dan metrik
              kualitas data lainnya dari hasil analisis.
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 font-medium text-purple-700 text-xs ring-1 ring-purple-600/20 ring-inset dark:bg-purple-900/20 dark:text-purple-400">
                Distribusi Usia
              </span>
              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 font-medium text-green-700 text-xs ring-1 ring-green-600/20 ring-inset dark:bg-green-900/20 dark:text-green-400">
                Score Distribution
              </span>
              <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 font-medium text-xs text-yellow-700 ring-1 ring-yellow-600/20 ring-inset dark:bg-yellow-900/20 dark:text-yellow-400">
                Anomaly Reasons
              </span>
            </div>
            <Button
              asChild
              className="w-full"
              disabled={
                !isLoading && modelStatus !== null && !modelStatus.hasOutput
              }
              variant="outline"
            >
              <Link href="/analitik/dashboard">
                <BarChart3 className="mr-2 h-4 w-4" />
                Lihat Dashboard
              </Link>
            </Button>
            {!isLoading && modelStatus && !modelStatus.hasOutput && (
              <p className="mt-2 text-center text-muted-foreground text-xs">
                Belum ada data hasil analisis.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Model Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle>Tentang Model AI</CardTitle>
                <CardDescription>
                  Teknologi dan metodologi yang digunakan
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                  Algoritma unsupervised yang mengisolasi outlier dengan
                  membangun decision tree secara acak.
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
            {!isLoading && modelStatus && !modelStatus.modelsReady && (
              <div className="mt-4 rounded-lg bg-muted p-4">
                <p className="mb-2 font-semibold text-sm">
                  Menjalankan Training:
                </p>
                <code className="block rounded bg-black/5 p-2 text-xs dark:bg-white/5">
                  cd ai && python run_train.py
                </code>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
