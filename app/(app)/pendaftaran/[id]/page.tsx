"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
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
import { formatDate } from "@/lib/utils/format";

type StatusType =
  | "DRAFT"
  | "VERIFIKASI"
  | "VIRTUAL_ACCOUNT_DIBUAT"
  | "MENUNGGU_PEMBAYARAN"
  | "AKTIF"
  | "DITOLAK"
  | "DIBATALKAN"
  | "KEDALUWARSA";

export default function RegistrationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [registrationId, setRegistrationId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  useEffect(() => {
    const id = Number.parseInt(params.id as string, 10);
    if (!Number.isNaN(id)) {
      setRegistrationId(id);
    }
  }, [params.id]);

  const { data: registration, isFetching } = useQuery(
    orpc.jkn.registration.getById.queryOptions({
      input: { id: registrationId! },
      enabled: !!registrationId,
    })
  );

  const updateStatus = useMutation(
    orpc.jkn.registration.updateStatus.mutationOptions({
      onSuccess: () => {
        setShowRejectionInput(false);
        setRejectionReason("");
      },
    })
  );

  const handleStatusChange = async (status: StatusType) => {
    if (!registrationId) {
      return;
    }

    if (status === "DITOLAK" && !showRejectionInput) {
      setShowRejectionInput(true);
      return;
    }

    try {
      await updateStatus.mutateAsync({
        id: registrationId,
        status,
        rejectionReason: status === "DITOLAK" ? rejectionReason : undefined,
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Gagal memperbarui status pendaftaran. Silakan coba lagi.");
    }
  };

  if (isFetching || !registration) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground">Memuat data pendaftaran...</div>
      </div>
    );
  }

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      case "VERIFIKASI":
        return "bg-blue-100 text-blue-800";
      case "VIRTUAL_ACCOUNT_DIBUAT":
        return "bg-purple-100 text-purple-800";
      case "MENUNGGU_PEMBAYARAN":
        return "bg-yellow-100 text-yellow-800";
      case "AKTIF":
        return "bg-green-100 text-green-800";
      case "DITOLAK":
        return "bg-red-100 text-red-800";
      case "DIBATALKAN":
        return "bg-gray-200 text-gray-700";
      case "KEDALUWARSA":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: StatusType) => {
    switch (status) {
      case "DRAFT":
        return "Draft";
      case "VERIFIKASI":
        return "Verifikasi";
      case "VIRTUAL_ACCOUNT_DIBUAT":
        return "VA Dibuat";
      case "MENUNGGU_PEMBAYARAN":
        return "Menunggu Pembayaran";
      case "AKTIF":
        return "Aktif";
      case "DITOLAK":
        return "Ditolak";
      case "DIBATALKAN":
        return "Dibatalkan";
      case "KEDALUWARSA":
        return "Kedaluwarsa";
      default:
        return status;
    }
  };

  const canTransitionTo = (newStatus: StatusType): boolean => {
    const currentStatus = registration.status;
    const transitions: Record<StatusType, StatusType[]> = {
      DRAFT: ["VERIFIKASI", "DITOLAK", "DIBATALKAN"],
      VERIFIKASI: ["VIRTUAL_ACCOUNT_DIBUAT", "DITOLAK", "DIBATALKAN"],
      VIRTUAL_ACCOUNT_DIBUAT: ["MENUNGGU_PEMBAYARAN", "DITOLAK", "DIBATALKAN"],
      MENUNGGU_PEMBAYARAN: ["AKTIF", "KEDALUWARSA", "DITOLAK", "DIBATALKAN"],
      AKTIF: [],
      DITOLAK: [],
      DIBATALKAN: [],
      KEDALUWARSA: [],
    };

    return transitions[currentStatus]?.includes(newStatus) ?? false;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild size="icon" variant="ghost">
            <Link href="/pendaftaran">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-bold text-2xl">Detail Pendaftaran</h1>
            <p className="text-muted-foreground">
              Informasi lengkap pendaftaran peserta BPJS Kesehatan
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={updateStatus.isPending}
            onClick={() => handleStatusChange("VERIFIKASI")}
            size="sm"
            variant={
              registration.status === "VERIFIKASI" ? "default" : "outline"
            }
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Verifikasi
          </Button>
          <Button
            disabled={updateStatus.isPending}
            onClick={() => handleStatusChange("VIRTUAL_ACCOUNT_DIBUAT")}
            size="sm"
            variant={
              registration.status === "VIRTUAL_ACCOUNT_DIBUAT"
                ? "default"
                : "outline"
            }
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Buat VA
          </Button>
          <Button
            disabled={updateStatus.isPending}
            onClick={() => handleStatusChange("AKTIF")}
            size="sm"
            variant={registration.status === "AKTIF" ? "default" : "outline"}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Aktifkan
          </Button>
          <Button
            disabled={updateStatus.isPending}
            onClick={() => handleStatusChange("DITOLAK")}
            size="sm"
            variant="destructive"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Tolak
          </Button>
        </div>
      </div>

      {showRejectionInput && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Alasan Penolakan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Jelaskan alasan penolakan pendaftaran..."
              value={rejectionReason}
            />
            <div className="flex gap-2">
              <Button
                disabled={!rejectionReason || updateStatus.isPending}
                onClick={() => handleStatusChange("DITOLAK")}
                size="sm"
                variant="destructive"
              >
                {updateStatus.isPending
                  ? "Memproses..."
                  : "Konfirmasi Penolakan"}
              </Button>
              <Button
                onClick={() => {
                  setShowRejectionInput(false);
                  setRejectionReason("");
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
        {/* Registration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status Pendaftaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">
                  Nomor Pendaftaran
                </p>
                <p className="font-medium text-lg">
                  {registration.applicationNumber || "-"}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 font-medium text-sm ${getStatusColor(registration.status)}`}
              >
                {getStatusLabel(registration.status)}
              </span>
            </div>

            {registration.verifiedAt && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">
                  Diverifikasi pada {formatDate(registration.verifiedAt)}
                </span>
              </div>
            )}

            {registration.virtualAccountCreatedAt && (
              <div className="flex items-center gap-2 text-sm">
                <RefreshCw className="h-4 w-4 text-purple-500" />
                <span className="text-muted-foreground">
                  VA dibuat pada{" "}
                  {formatDate(registration.virtualAccountCreatedAt)}
                </span>
              </div>
            )}

            {registration.firstPaymentDeadline && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-muted-foreground">
                  Batas pembayaran:{" "}
                  {formatDate(registration.firstPaymentDeadline)}
                </span>
              </div>
            )}

            {registration.rejectionReason && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="font-medium text-red-700 text-sm">
                  Alasan Penolakan:
                </p>
                <p className="text-red-600 text-sm">
                  {registration.rejectionReason}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Participant Information */}
        {registration.participant && (
          <Card>
            <CardHeader>
              <CardTitle>Informasi Peserta</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm">Nama Lengkap</p>
                <p className="font-medium">
                  {registration.participant.firstName}
                  {registration.participant.lastName &&
                    ` ${registration.participant.lastName}`}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Nomor BPJS</p>
                <p className="font-medium">
                  {registration.participant.bpjsNumber}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Nomor NIK</p>
                <p className="font-medium">
                  {registration.participant.identityNumber}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Nomor KK</p>
                <p className="font-medium">
                  {registration.participant.familyCardNumber}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detail Pendaftaran</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm">Segmen Peserta</p>
              <p className="font-medium">{registration.participantSegment}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Kelas Rawat</p>
              <p className="font-medium">Kelas {registration.treatmentClass}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Tgl Pendaftaran</p>
              <p className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4" />
                {formatDate(registration.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Terakhir Diupdate</p>
              <p className="font-medium">
                {formatDate(registration.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Dokumen Pendukung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DocumentLink
              label="Kartu Keluarga (KK)"
              url={registration.familyCardDocumentUrl}
            />
            <DocumentLink
              label="Kartu Tanda Penduduk (KTP)"
              url={registration.identityDocumentUrl}
            />
            <DocumentLink
              label="Buku Tabungan"
              url={registration.bankBookDocumentUrl}
            />
            <DocumentLink
              label="Surat Autorisasi Auto Debit"
              url={registration.autodebitLetterDocumentUrl}
            />
          </CardContent>
        </Card>

        {/* Workflow Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Alur Proses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TimelineStep
                completed
                label="Draft"
                status={registration.status === "DRAFT"}
              />
              <TimelineStep
                completed={registration.status !== "DRAFT"}
                label="Verifikasi"
                status={registration.status === "VERIFIKASI"}
              />
              <TimelineStep
                completed={[
                  "VIRTUAL_ACCOUNT_DIBUAT",
                  "MENUNGGU_PEMBAYARAN",
                  "AKTIF",
                ].includes(registration.status)}
                label="VA Dibuat"
                status={registration.status === "VIRTUAL_ACCOUNT_DIBUAT"}
              />
              <TimelineStep
                completed={["AKTIF"].includes(registration.status)}
                label="Menunggu Pembayaran"
                status={registration.status === "MENUNGGU_PEMBAYARAN"}
              />
              <TimelineStep
                completed={registration.status === "AKTIF"}
                label="Aktif"
                status={registration.status === "AKTIF"}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DocumentLink({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-dashed p-3">
        <span className="text-sm">{label}</span>
        <span className="text-muted-foreground text-sm">Tidak diunggah</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <span className="text-sm">{label}</span>
      <Button asChild size="sm" variant="ghost">
        <Link href={url} rel="noopener" target="_blank">
          <FileText className="mr-2 h-4 w-4" />
          Lihat Dokumen
        </Link>
      </Button>
    </div>
  );
}

function TimelineStep({
  completed,
  label,
  status,
}: {
  completed: boolean;
  label: string;
  status: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
          completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted bg-background text-muted-foreground"
        } ${status ? "ring-2 ring-ring ring-offset-2" : ""}`}
      >
        {completed ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
      </div>
      <span className={`font-medium ${status ? "text-primary" : ""}`}>
        {label}
      </span>
    </div>
  );
}
