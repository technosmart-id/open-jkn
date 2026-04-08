"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

// Mock data for demonstration
const mockAnomalies = [
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
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysisComplete(false);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setProgress(0);

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

    // Simulate API call
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 3500);
  };

  const anomalyCount = mockAnomalies.length;
  const ruleBasedCount = mockAnomalies.filter(
    (a) => a.anomaly_source === "rule_only" || a.anomaly_source === "model+rule"
  ).length;
  const modelBasedCount = mockAnomalies.filter(
    (a) =>
      a.anomaly_source === "model_only" || a.anomaly_source === "model+rule"
  ).length;

  const getReasonBadges = (reason: string) =>
    reason.split("; ").map((r) => (
      <Badge
        className="mr-1 mb-1 whitespace-nowrap text-xs"
        key={r}
        variant="outline"
      >
        {r.replace(/_/g, " ")}
      </Badge>
    ));

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="font-bold text-3xl tracking-tight">
          Deteksi Anomali Kepesertaan
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload data kepesertaan BPJS untuk mendeteksi pola anomali menggunakan
          Machine Learning
        </p>
      </div>

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Data</CardTitle>
          <CardDescription>
            Unggah file data kepesertaan dalam format .csv atau .dta (Stata)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            <div className="w-full flex-1">
              <label
                className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 transition-colors hover:bg-muted"
                htmlFor="file-upload"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      <FileSpreadsheet className="mb-2 h-8 w-8 text-green-600" />
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground text-sm">
                        <span className="font-semibold">Klik untuk upload</span>{" "}
                        atau drag and drop
                      </p>
                      <p className="text-muted-foreground text-xs">
                        CSV atau DTA (MAX 100MB)
                      </p>
                    </>
                  )}
                </div>
                <input
                  accept=".csv,.dta"
                  className="hidden"
                  disabled={isAnalyzing}
                  id="file-upload"
                  onChange={handleFileChange}
                  type="file"
                />
              </label>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto">
              <Button
                className="w-full sm:w-auto"
                disabled={!file || isAnalyzing}
                onClick={handleAnalyze}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Analisis Data
                  </>
                )}
              </Button>
              {file && (
                <Button
                  className="w-full sm:w-auto"
                  disabled={isAnalyzing}
                  onClick={() => {
                    setFile(null);
                    setAnalysisComplete(false);
                    setProgress(0);
                  }}
                  variant="outline"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {isAnalyzing && (
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-sm">
                <span>Memproses data...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Model Info */}
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Tentang Model Deteksi</AlertTitle>
        <AlertDescription className="text-sm">
          Sistem menggunakan hybrid approach: <strong>Autoencoder</strong> (deep
          learning) untuk mendeteksi pola tidak wajar,{" "}
          <strong>Isolation Forest</strong> untuk outlier detection, dan{" "}
          <strong>Business Rules</strong> untuk validasi aturan domain-specific.
        </AlertDescription>
      </Alert>

      {/* Results Section */}
      {analysisComplete && (
        <>
          {/* Summary Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-medium text-muted-foreground text-sm">
                  Total Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl">15,234</div>
                <p className="mt-1 text-muted-foreground text-xs">
                  Data diproses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-medium text-muted-foreground text-sm">
                  Anomalies Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl text-red-600">
                  {anomalyCount}
                </div>
                <p className="mt-1 text-muted-foreground text-xs">
                  {((anomalyCount / 15_234) * 100).toFixed(2)}% dari total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-medium text-muted-foreground text-sm">
                  Rule-Based
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl text-orange-600">
                  {ruleBasedCount}
                </div>
                <p className="mt-1 text-muted-foreground text-xs">
                  Business rules violations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-medium text-muted-foreground text-sm">
                  Model-Based
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-2xl text-blue-600">
                  {modelBasedCount}
                </div>
                <p className="mt-1 text-muted-foreground text-xs">
                  ML-detected anomalies
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
                  <CardDescription>
                    Daftar kepesertaan yang terdeteksi anomali
                  </CardDescription>
                </div>
                <Button size="sm" variant="outline">
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
                    Rule Only (
                    {
                      mockAnomalies.filter(
                        (a) => a.anomaly_source === "rule_only"
                      ).length
                    }
                    )
                  </TabsTrigger>
                  <TabsTrigger value="model">
                    Model Only (
                    {
                      mockAnomalies.filter(
                        (a) => a.anomaly_source === "model_only"
                      ).length
                    }
                    )
                  </TabsTrigger>
                  <TabsTrigger value="hybrid">
                    Both (
                    {
                      mockAnomalies.filter(
                        (a) => a.anomaly_source === "model+rule"
                      ).length
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
                          <TableHead>Score</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Alasan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockAnomalies.map((anomaly) => (
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
                                {anomaly.anomaly_source}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap">
                                {getReasonBadges(anomaly.reason)}
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
                        {mockAnomalies
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
                                  {getReasonBadges(anomaly.reason)}
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
                          <TableHead>Score</TableHead>
                          <TableHead>Top Features</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockAnomalies
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
                                umur(0.234), jml_keluarga(0.189),
                                rasio_aktif(0.145)
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
                          <TableHead>Score</TableHead>
                          <TableHead>Alasan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockAnomalies
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
                                  {getReasonBadges(anomaly.reason)}
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
      {!(analysisComplete || file) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">
              Belum ada data dianalisis
            </h3>
            <p className="max-w-md text-center text-muted-foreground text-sm">
              Upload file data kepesertaan untuk memulai analisis deteksi
              anomali. Sistem akan otomatis mendeteksi pola yang mencurigakan.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
