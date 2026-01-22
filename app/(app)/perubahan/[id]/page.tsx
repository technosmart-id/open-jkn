"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  RefreshCw,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/lib/orpc/client";
import { CHANGE_TYPES } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/format";

type StatusType = "PENDING" | "VERIFIED" | "APPROVED" | "REJECTED";

export default function ChangeRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [requestId, setRequestId] = useState<number | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [showNotesInput, setShowNotesInput] = useState(false);

  useEffect(() => {
    const id = Number.parseInt(params.id as string, 10);
    if (!Number.isNaN(id)) {
      setRequestId(id);
    }
  }, [params.id]);

  const { data: request, isFetching } = useQuery(
    orpc.jkn.changeRequest.getById.queryOptions({
      input: { id: requestId! },
      enabled: !!requestId,
    })
  );

  const updateStatus = useMutation(
    orpc.jkn.changeRequest.updateStatus.mutationOptions({
      onSuccess: () => {
        setShowNotesInput(false);
        setVerificationNotes("");
      },
    })
  );

  const approve = useMutation(orpc.jkn.changeRequest.approve.mutationOptions());

  const handleStatusChange = async (status: StatusType) => {
    if (!requestId) {
      return;
    }

    if (status === "VERIFIED" && !showNotesInput) {
      setShowNotesInput(true);
      return;
    }

    try {
      await updateStatus.mutateAsync({
        id: requestId,
        status,
        verificationNotes:
          status === "VERIFIED" ? verificationNotes : undefined,
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Gagal memperbarui status permohonan. Silakan coba lagi.");
    }
  };

  const handleApprove = async () => {
    if (!requestId) {
      return;
    }

    try {
      await approve.mutateAsync({ id: requestId });
    } catch (error) {
      console.error("Failed to approve request:", error);
      alert("Gagal menyetujui permohonan. Silakan coba lagi.");
    }
  };

  if (isFetching || !request) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground">Memuat data permohonan...</div>
      </div>
    );
  }

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "VERIFIED":
        return "bg-blue-100 text-blue-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: StatusType) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "VERIFIED":
        return "Terverifikasi";
      case "APPROVED":
        return "Disetujui";
      case "REJECTED":
        return "Ditolak";
      default:
        return status;
    }
  };

  const canTransitionTo = (newStatus: StatusType): boolean => {
    const currentStatus = request.status as StatusType;
    const transitions: Record<StatusType, StatusType[]> = {
      PENDING: ["VERIFIED", "REJECTED"],
      VERIFIED: ["APPROVED", "REJECTED"],
      APPROVED: [],
      REJECTED: [],
    };

    return transitions[currentStatus]?.includes(newStatus) ?? false;
  };

  const previousData = request.previousData as Record<string, unknown>;
  const newData = request.newData as Record<string, unknown>;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild size="icon" variant="ghost">
            <Link href="/perubahan">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-bold text-2xl">Detail Permohonan Perubahan</h1>
            <p className="text-muted-foreground">
              Informasi lengkap permohonan perubahan data peserta
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={updateStatus.isPending || approve.isPending}
            onClick={() => handleStatusChange("VERIFIED")}
            size="sm"
            variant={request.status === "VERIFIED" ? "default" : "outline"}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Verifikasi
          </Button>
          <Button
            disabled={
              !canTransitionTo("APPROVED") ||
              updateStatus.isPending ||
              approve.isPending
            }
            onClick={handleApprove}
            size="sm"
            variant={request.status === "APPROVED" ? "default" : "outline"}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Setujui & Terapkan
          </Button>
          <Button
            disabled={updateStatus.isPending || approve.isPending}
            onClick={() => handleStatusChange("REJECTED")}
            size="sm"
            variant="destructive"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Tolak
          </Button>
        </div>
      </div>

      {showNotesInput && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">Catatan Verifikasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Tambahkan catatan verifikasi..."
              value={verificationNotes}
            />
            <div className="flex gap-2">
              <Button
                disabled={updateStatus.isPending}
                onClick={() => handleStatusChange("VERIFIED")}
                size="sm"
              >
                {updateStatus.isPending
                  ? "Memproses..."
                  : "Konfirmasi Verifikasi"}
              </Button>
              <Button
                onClick={() => {
                  setShowNotesInput(false);
                  setVerificationNotes("");
                }}
                size="sm"
                variant="outline"
              >
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Request Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status Permohonan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Jenis Perubahan</p>
                <p className="font-medium text-lg">
                  {CHANGE_TYPES[request.changeType] || request.changeType}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 font-medium text-sm ${getStatusColor(request.status as StatusType)}`}
              >
                {getStatusLabel(request.status as StatusType)}
              </span>
            </div>

            <div>
              <p className="text-muted-foreground text-sm">Tgl Permohonan</p>
              <p className="font-medium">{formatDate(request.createdAt)}</p>
            </div>

            {request.verifiedAt && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">
                  Diverifikasi pada {formatDate(request.verifiedAt)}
                </span>
              </div>
            )}

            {request.verificationNotes && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="font-medium text-blue-700 text-sm">
                  Catatan Verifikasi:
                </p>
                <p className="text-blue-600 text-sm">
                  {request.verificationNotes}
                </p>
              </div>
            )}

            {request.status === "REJECTED" && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="font-medium text-red-700 text-sm">
                  Permohonan Ditolak
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Participant Information */}
        {request.participant && (
          <Card>
            <CardHeader>
              <CardTitle>Informasi Peserta</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm">Nama Lengkap</p>
                <p className="font-medium">{request.participant.fullName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Nomor BPJS</p>
                <p className="font-medium">{request.participant.bpjsNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Nomor NIK</p>
                <p className="font-medium">
                  {request.participant.identityNumber}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Segmen</p>
                <p className="font-medium">
                  {request.participant.participantSegment}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Changes Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Perbandingan Data
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-3 font-medium text-red-700">Data Sebelumnya</p>
                <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-4">
                  {Object.entries(previousData).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-muted-foreground text-xs">
                        {formatKeyLabel(key)}
                      </p>
                      <p className="font-medium text-sm">
                        {formatValue(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 font-medium text-green-700">Data Baru</p>
                <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-4">
                  {Object.entries(newData).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-muted-foreground text-xs">
                        {formatKeyLabel(key)}
                      </p>
                      <p className="font-medium text-sm">
                        {formatValue(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supporting Document */}
        {request.supportingDocumentUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Dokumen Pendukung</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link
                  href={request.supportingDocumentUrl}
                  rel="noopener"
                  target="_blank"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Lihat Dokumen Pendukung
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function formatKeyLabel(key: string): string {
  const labels: Record<string, string> = {
    fullName: "Nama Lengkap",
    addressStreet: "Alamat Jalan",
    addressCity: "Kota/Kabupaten",
    addressProvince: "Provinsi",
    addressPostalCode: "Kode Pos",
    phoneNumber: "Nomor Telepon",
    email: "Email",
    treatmentClass: "Kelas Rawat",
    participantSegment: "Segmen Peserta",
    primaryFacilityId: "Faskes Primer",
    dentalFacilityId: "Faskes Gigi",
    institutionName: "Nama Instansi",
    salary: "Gaji",
    grade: "Golongan",
    rank: "Pangkat",
    pensionDate: "Tanggal Pensiun",
    deathDate: "Tanggal Kematian",
  };

  return labels[key] || key;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Ya" : "Tidak";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}
