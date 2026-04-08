"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  Info,
  Loader2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalysisResult {
  id_peserta: string;
  id_keluarga: string;
  umur: number;
  jml_keluarga?: number;
  rasio_aktif?: number;
  hybrid_score: number;
  anomaly_source: "model_only" | "rule_only" | "model+rule" | "normal";
  reason?: string;
  top_ae_features?: string;
}

interface AnalysisSummary {
  totalRecords: number;
  anomaliesCount: number;
  anomalyRate: number;
  ruleBased: number;
  modelBased: number;
}

interface AnalysisResponse {
  success: boolean;
  source?: string;
  summary: AnalysisSummary;
  scoredData: AnalysisResult[] | null;
  anomalies: AnalysisResult[] | null;
}

// Mock data for demonstration
const mockAnomalies: AnalysisResult[] = [
  {
    id_peserta: "12345678",
    id_keluarga: "K001",
    umur: 8,
    jml_keluarga: 12,
    rasio_aktif: 0.25,
    hybrid_score: 0.992,
    anomaly_source: "model+rule",
    reason: "KEPALA_KELUARGA_ANAK; KELUARGA_BESAR",
  },
  {
    id_peserta: "23456789",
    id_keluarga: "K002",
    umur: 115,
    jml_keluarga: 3,
    rasio_aktif: 1.0,
    hybrid_score: 0.985,
    anomaly_source: "rule_only",
    reason: "AKTIF_UMUR_>110",
  },
  {
    id_peserta: "34567890",
    id_keluarga: "K003",
    umur: 28,
    jml_keluarga: 5,
    rasio_aktif: 0.6,
    hybrid_score: 0.978,
    anomaly_source: "model_only",
    reason: "ANAK_TAPI_UMUR_>25",
  },
  {
    id_peserta: "45678901",
    id_keluarga: "K004",
    umur: -5,
    jml_keluarga: 4,
    rasio_aktif: 0.75,
    hybrid_score: 0.995,
    anomaly_source: "rule_only",
    reason: "UMUR_NEGATIF",
  },
  {
    id_peserta: "56789012",
    id_keluarga: "K005",
    umur: 14,
    jml_keluarga: 2,
    rasio_aktif: 0.5,
    hybrid_score: 0.965,
    anomaly_source: "rule_only",
    reason: "KAWIN_UMUR_<16; KEPALA_KELUARGA_ANAK",
  },
];

export default function AnomaliPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzingDatabase, setIsAnalyzingDatabase] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<{
    summary: AnalysisSummary | null;
    anomalies: AnalysisResult[];
  }>({ summary: null, anomalies: [] });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysisComplete(false);
      setError(null);
    }
  };

  const handleAnalyzeFile = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setProgress(0);
    setError(null);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ai/anomaly", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || "Failed to analyze file");
      }

      const data = (await response.json()) as AnalysisResponse;

      clearInterval(interval);
      setProgress(100);

      setAnalysisResults({
        summary: data.summary,
        anomalies: (data.anomalies as AnalysisResult[]) || [],
      });
      setAnalysisComplete(true);
    } catch (err) {
      clearInterval(interval);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menganalisis data."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeDatabase = async () => {
    setIsAnalyzingDatabase(true);
    setProgress(0);
    setAnalysisComplete(false);
    setError(null);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const response = await fetch("/api/ai/analyze-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: true,
          limit: 50_000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || "Failed to analyze database");
      }

      const data = (await response.json()) as AnalysisResponse;

      clearInterval(interval);
      setProgress(100);

      setAnalysisResults({
        summary: data.summary,
        anomalies: (data.anomalies as AnalysisResult[]) || [],
      });
      setAnalysisComplete(true);
    } catch (err) {
      clearInterval(interval);
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menganalisis database."
      );
    } finally {
      setIsAnalyzingDatabase(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysisComplete(false);
    setProgress(0);
    setError(null);
    setAnalysisResults({ summary: null, anomalies: [] });
  };

  // Use analysis results if available, otherwise use mock data
  const summary = analysisResults.summary;
  const anomalies =
    analysisResults.anomalies.length > 0
      ? analysisResults.anomalies
      : mockAnomalies;
  const anomalyCount = anomalies.length;
  const ruleBasedCount =
    summary?.ruleBased ||
    anomalies.filter(
      (a) =>
        a.anomaly_source === "rule_only" || a.anomaly_source === "model+rule"
    ).length;
  const modelBasedCount =
    summary?.modelBased ||
    anomalies.filter(
      (a) =>
        a.anomaly_source === "model_only" || a.anomaly_source === "model+rule"
    ).length;
  const totalData = summary?.totalRecords || 15_234;

  const getReasonBadges = (reason: string | undefined | null) => {
    if (!reason) return null;
    return reason.split("; ").map((r, idx) => (
      <Badge
        className="mr-1 mb-1 whitespace-nowrap text-xs"
        key={`${r}-${idx}`}
        variant="outline"
      >
        {r.replace(/_/g, " ")}
      </Badge>
    ));
  };

  const isProcessing = isAnalyzing || isAnalyzingDatabase;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h1 className="font-bold text-2xl">Deteksi Anomali Kepesertaan</h1>
        <p className="text-muted-foreground">
          Analisis data kepesertaan BPJS untuk mendeteksi pola anomali
        </p>
      </div>

      {/* Analysis Options */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Sumber Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* File Upload Option */}
            <div className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Upload File</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Upload file CSV atau DTA untuk analisis data kepesertaan.
              </p>
              <label
                className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed bg-muted/50 transition-colors hover:bg-muted"
                htmlFor="file-upload"
              >
                <div className="flex flex-col items-center justify-center">
                  {file ? (
                    <>
                      <FileSpreadsheet className="mb-1 h-6 w-6 text-green-600" />
                      <p className="font-medium text-xs">{file.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="mb-1 h-6 w-6 text-muted-foreground" />
                      <p className="text-muted-foreground text-xs">
                        Klik untuk upload CSV/DTA
                      </p>
                    </>
                  )}
                </div>
                <input
                  accept=".csv,.dta"
                  className="hidden"
                  disabled={isProcessing}
                  id="file-upload"
                  onChange={handleFileChange}
                  type="file"
                />
              </label>
              <Button
                className="w-full"
                disabled={!file || isProcessing}
                onClick={handleAnalyzeFile}
                variant={file ? "default" : "outline"}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Analisis File
                  </>
                )}
              </Button>
            </div>

            {/* Database Option */}
            <div className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Database OpenJKN</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Analisis langsung data kepesertaan yang tersimpan di database
                OpenJKN.
              </p>
              <div className="flex h-24 w-full items-center justify-center rounded-md border-2 border-dashed bg-muted/50">
                <div className="text-center">
                  <Database className="mx-auto mb-1 h-8 w-8 text-blue-600" />
                  <p className="text-muted-foreground text-xs">
                    Data Peserta &amp; Keluarga
                  </p>
                </div>
              </div>
              <Button
                className="w-full"
                disabled={isProcessing}
                onClick={handleAnalyzeDatabase}
                variant="default"
              >
                {isAnalyzingDatabase ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Analisis Database
                  </>
                )}
              </Button>
            </div>
          </div>

          {isProcessing && (
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-sm">
                <span>
                  {isAnalyzing ? "Memproses file..." : "Mengquery database..."}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Analisis Gagal</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Model Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Tentang Deteksi Anomali</AlertTitle>
        <AlertDescription className="text-sm">
          Sistem menggunakan kombinasi tiga pendekatan:{" "}
          <strong>Autoencoder</strong> (deep learning) untuk pola tidak wajar,{" "}
          <strong>Isolation Forest</strong> untuk outlier detection, dan{" "}
          <strong>Business Rules</strong> untuk validasi aturan domain JKN.
        </AlertDescription>
      </Alert>

      {/* Results Section */}
      {analysisComplete && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-medium text-muted-foreground text-sm">
                  Total Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">
                  {totalData.toLocaleString()}
                </div>
                <p className="mt-1 text-muted-foreground text-xs">
                  Data diproses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-medium text-muted-foreground text-sm">
                  Anomali Terdeteksi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl text-red-600">
                  {anomalyCount}
                </div>
                <p className="mt-1 text-muted-foreground text-xs">
                  {summary?.anomalyRate
                    ? `${summary.anomalyRate.toFixed(2)}% dari total`
                    : `${((anomalyCount / totalData) * 100).toFixed(2)}% dari total`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-medium text-muted-foreground text-sm">
                  Business Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl text-orange-600">
                  {ruleBasedCount}
                </div>
                <p className="mt-1 text-muted-foreground text-xs">
                  Pelanggaran aturan
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-medium text-muted-foreground text-sm">
                  Model ML
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl text-blue-600">
                  {modelBasedCount}
                </div>
                <p className="mt-1 text-muted-foreground text-xs">
                  Deteksi Machine Learning
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Anomaly Details Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Detail Anomali</CardTitle>
                </div>
                <Button onClick={handleReset} size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs className="w-full" defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Semua ({anomalyCount})</TabsTrigger>
                  <TabsTrigger value="rule">
                    Aturan (
                    {
                      anomalies.filter((a) => a.anomaly_source === "rule_only")
                        .length
                    }
                    )
                  </TabsTrigger>
                  <TabsTrigger value="model">
                    ML Model (
                    {
                      anomalies.filter((a) => a.anomaly_source === "model_only")
                        .length
                    }
                    )
                  </TabsTrigger>
                  <TabsTrigger value="hybrid">
                    Keduanya (
                    {
                      anomalies.filter((a) => a.anomaly_source === "model+rule")
                        .length
                    }
                    )
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID Peserta</TableHead>
                          <TableHead>ID Keluarga</TableHead>
                          <TableHead>Usia</TableHead>
                          <TableHead>Skor</TableHead>
                          <TableHead>Sumber</TableHead>
                          <TableHead>Alasan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {anomalies.map((anomaly) => (
                          <TableRow key={anomaly.id_peserta}>
                            <TableCell className="font-medium">
                              {anomaly.id_peserta}
                            </TableCell>
                            <TableCell>{anomaly.id_keluarga}</TableCell>
                            <TableCell>
                              <span
                                className={
                                  anomaly.umur < 0 || anomaly.umur > 110
                                    ? "font-semibold text-red-600"
                                    : ""
                                }
                              >
                                {anomaly.umur} th
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  anomaly.hybrid_score > 0.98
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {anomaly.hybrid_score.toFixed(3)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className="flex w-fit gap-1"
                                variant={
                                  anomaly.anomaly_source === "model+rule"
                                    ? "destructive"
                                    : anomaly.anomaly_source === "rule_only"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {anomaly.anomaly_source === "model+rule" && (
                                  <AlertCircle className="h-3 w-3" />
                                )}
                                {anomaly.anomaly_source === "rule_only" && (
                                  <CheckCircle2 className="h-3 w-3" />
                                )}
                                {anomaly.anomaly_source === "model_only" && (
                                  <AlertTriangle className="h-3 w-3" />
                                )}
                                {anomaly.anomaly_source === "model+rule"
                                  ? "Keduanya"
                                  : anomaly.anomaly_source === "rule_only"
                                    ? "Aturan"
                                    : "ML Model"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap">
                                {getReasonBadges(anomaly.reason) || (
                                  <span className="text-muted-foreground text-xs">
                                    -
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="rule">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID Peserta</TableHead>
                          <TableHead>ID Keluarga</TableHead>
                          <TableHead>Usia</TableHead>
                          <TableHead>Alasan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {anomalies
                          .filter((a) => a.anomaly_source === "rule_only")
                          .map((anomaly) => (
                            <TableRow key={anomaly.id_peserta}>
                              <TableCell className="font-medium">
                                {anomaly.id_peserta}
                              </TableCell>
                              <TableCell>{anomaly.id_keluarga}</TableCell>
                              <TableCell>{anomaly.umur} th</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap">
                                  {getReasonBadges(anomaly.reason) || (
                                    <span className="text-muted-foreground text-xs">
                                      -
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="model">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID Peserta</TableHead>
                          <TableHead>ID Keluarga</TableHead>
                          <TableHead>Skor</TableHead>
                          <TableHead>Fitur Teratas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {anomalies
                          .filter((a) => a.anomaly_source === "model_only")
                          .map((anomaly) => (
                            <TableRow key={anomaly.id_peserta}>
                              <TableCell className="font-medium">
                                {anomaly.id_peserta}
                              </TableCell>
                              <TableCell>{anomaly.id_keluarga}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {anomaly.hybrid_score.toFixed(3)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {anomaly.top_ae_features ||
                                  "umur, jml_keluarga"}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="hybrid">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID Peserta</TableHead>
                          <TableHead>ID Keluarga</TableHead>
                          <TableHead>Usia</TableHead>
                          <TableHead>Skor</TableHead>
                          <TableHead>Alasan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {anomalies
                          .filter((a) => a.anomaly_source === "model+rule")
                          .map((anomaly) => (
                            <TableRow key={anomaly.id_peserta}>
                              <TableCell className="font-medium">
                                {anomaly.id_peserta}
                              </TableCell>
                              <TableCell>{anomaly.id_keluarga}</TableCell>
                              <TableCell>{anomaly.umur} th</TableCell>
                              <TableCell>
                                <Badge variant="destructive">
                                  {anomaly.hybrid_score.toFixed(3)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap">
                                  {getReasonBadges(anomaly.reason) || (
                                    <span className="text-muted-foreground text-xs">
                                      -
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!(analysisComplete || file || isAnalyzingDatabase) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">
              Belum ada data dianalisis
            </h3>
            <p className="max-w-md text-center text-muted-foreground text-sm">
              Pilih sumber data untuk memulai analisis deteksi anomali. Upload
              file CSV/DTA atau analisis langsung dari database OpenJKN.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
