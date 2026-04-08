"use client";

import {
  AlertTriangle,
  BarChart3,
  Brain,
  FileSearch,
  Info,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalitikPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h1 className="font-bold text-2xl">Analitik & AI</h1>
        <p className="text-muted-foreground">
          Deteksi anomali dan analisis data kepesertaan JKN
        </p>
      </div>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Tentang Fitur Analitik
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="text-muted-foreground">
            Fitur analitik menggunakan Machine Learning untuk mendeteksi pola
            tidak wajar dalam data kepesertaan JKN. Hal ini berguna untuk
            mengidentifikasi potensi kesalahan data, kecurangan, atau anomali
            yang memerlukan verifikasi lebih lanjut.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Anomaly Detection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              Deteksi Anomali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground text-sm">
              Analisis data kepesertaan untuk mendeteksi pola yang mencurigakan
              menggunakan kombinasi algoritma Machine Learning.
            </p>
            <div className="mb-4 grid gap-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <span>
                  <strong>Autoencoder:</strong> Neural network yang mendeteksi
                  data yang berbeda dari pola normal
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                <span>
                  <strong>Isolation Forest:</strong> Algoritma yang mengisolasi
                  outlier secara efisien
                </span>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>
                  <strong>Business Rules:</strong> Validasi berdasarkan aturan
                  domain JKN
                </span>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/analitik/anomali">
                <FileSearch className="mr-2 h-4 w-4" />
                Analisis Data
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Dashboard Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Dashboard Visualisasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground text-sm">
              Lihat visualisasi metrik dan statistik data kepesertaan untuk
              pemahaman yang lebih baik.
            </p>
            <div className="mb-4 grid gap-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
                <span>Distribusi usia peserta normal vs anomali</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                <span>Distribusi skor anomali</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500" />
                <span>Alasan deteksi anomali</span>
              </div>
            </div>
            <Button asChild className="w-full" variant="outline">
              <Link href="/analitik/dashboard">
                <BarChart3 className="mr-2 h-4 w-4" />
                Lihat Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Cara Kerja Deteksi Anomali
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-semibold">1. Feature Extraction</h4>
              <p className="text-muted-foreground text-sm">
                Sistem mengekstrak fitur dari data kepesertaan seperti usia,
                segmen, status keaktifan, hubungan keluarga, dan pola
                pendaftaran.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">2. Hybrid Detection</h4>
              <p className="text-muted-foreground text-sm">
                Tiga pendekatan digunakan: Autoencoder Neural Network, Isolation
                Forest algorithm, dan Business Rules untuk validasi domain.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">3. Scoring & Labeling</h4>
              <p className="text-muted-foreground text-sm">
                Setiap data mendapatkan skor anomali (0-1) dan label yang
                menjelaskan alasan mengapa data tersebut dianggap anomali.
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
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <span className="font-bold text-red-600 text-xs">!</span>
              </div>
              <div>
                <p className="font-medium text-sm">Usia Negatif</p>
                <p className="text-muted-foreground text-xs">
                  Data dengan usia negatif (invalid)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <span className="font-bold text-red-600 text-xs">!</span>
              </div>
              <div>
                <p className="font-medium text-sm">Usia {">"} 110 Tahun</p>
                <p className="text-muted-foreground text-xs">
                  Peserta aktif dengan usia tidak wajar
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                <span className="font-bold text-orange-600 text-xs">⚠</span>
              </div>
              <div>
                <p className="font-medium text-sm">Kepala Keluarga Anak</p>
                <p className="text-muted-foreground text-xs">
                  Anak-anak yang terdaftar sebagai kepala keluarga
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                <span className="font-bold text-orange-600 text-xs">⚠</span>
              </div>
              <div>
                <p className="font-medium text-sm">Anak Dewasa</p>
                <p className="text-muted-foreground text-xs">
                  Anak dengan usia lebih dari 25 tahun
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <span className="font-bold text-xs text-yellow-600">i</span>
              </div>
              <div>
                <p className="font-medium text-sm">Menikah Muda</p>
                <p className="text-muted-foreground text-xs">
                  Status kawin di usia kurang dari 16 tahun
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <span className="font-bold text-xs text-yellow-600">i</span>
              </div>
              <div>
                <p className="font-medium text-sm">Keluarga Besar</p>
                <p className="text-muted-foreground text-xs">
                  Anggota keluarga lebih dari 10 orang
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <span className="font-bold text-blue-600 text-xs">?</span>
              </div>
              <div>
                <p className="font-medium text-sm">Tanpa Kepala Keluarga</p>
                <p className="text-muted-foreground text-xs">
                  Keluarga tanpa kepala keluarga terdaftar
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <span className="font-bold text-blue-600 text-xs">?</span>
              </div>
              <div>
                <p className="font-medium text-sm">Rasio Aktif Rendah</p>
                <p className="text-muted-foreground text-xs">
                  Rasio anggota keluarga aktif sangat rendah
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
