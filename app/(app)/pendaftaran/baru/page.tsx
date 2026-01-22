"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DocumentUpload } from "@/components/jkn/registration/document-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orpc } from "@/lib/orpc/client";
import { PARTICIPANT_SEGMENTS } from "@/lib/utils/constants";

type ParticipantSegment =
  | "PU_PNS_PUSAT"
  | "PU_PNS_DAERAH"
  | "PU_PNS_POLRI"
  | "PU_PNS_TNI_AD"
  | "PU_PNS_TNI_AL"
  | "PU_PNS_TNI_AU"
  | "PU_PNS_MABES_TNI"
  | "PU_PNS_KEMHAN"
  | "PU_TNI_AD"
  | "PU_TNI_AL"
  | "PU_TNI_AU"
  | "PU_POLRI"
  | "PU_PPNPN"
  | "PU_BUMN"
  | "PU_BUMD"
  | "PU_SWASTA"
  | "PBPU"
  | "BP"
  | "INVESTOR"
  | "PEMBERI_KERJA"
  | "PENSIUNAN_PNS"
  | "PENSIUNAN_TNI_POLRI"
  | "PENSIUNAN_BUMN"
  | "PENSIUNAN_SWASTA"
  | "PBI_APBN"
  | "PBI_APBD";

export default function NewRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "success">("form");
  const [search, setSearch] = useState("");
  const [selectedParticipantId, setSelectedParticipantId] = useState<
    number | undefined
  >();
  const [participantSegment, setParticipantSegment] = useState<
    ParticipantSegment | ""
  >("");
  const [treatmentClass, setTreatmentClass] = useState<"I" | "II" | "III">(
    "III"
  );
  const [documents, setDocuments] = useState({
    familyCardDocumentUrl: "",
    identityDocumentUrl: "",
    bankBookDocumentUrl: "",
    autodebitLetterDocumentUrl: "",
  });

  const { data: participants } = useQuery(
    orpc.jkn.participant.list.queryOptions({
      input: {
        search: search || undefined,
        limit: 20,
      },
    })
  );

  const createRegistration = useMutation(
    orpc.jkn.registration.create.mutationOptions()
  );

  const handleSubmit = async () => {
    try {
      await createRegistration.mutateAsync({
        participantId: selectedParticipantId,
        participantSegment: participantSegment as ParticipantSegment,
        treatmentClass,
        ...documents,
      });
      setStep("success");
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Pendaftaran gagal. Silakan coba lagi.");
    }
  };

  if (step === "success") {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <div>
            <h1 className="font-bold text-2xl">Pendaftaran Berhasil!</h1>
            <p className="mt-2 text-muted-foreground">
              Pendaftaran peserta baru telah berhasil dibuat. Nomor pendaftaran
              akan dikirim melalui email.
            </p>
          </div>
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/pendaftaran">Kembali ke Daftar</Link>
            </Button>
            <Button asChild>
              <Link href="/pendaftaran/baru">Buat Pendaftaran Baru</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isValid =
    selectedParticipantId &&
    participantSegment &&
    treatmentClass &&
    documents.familyCardDocumentUrl &&
    documents.identityDocumentUrl;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center gap-4">
        <Button asChild size="icon" variant="ghost">
          <Link href="/pendaftaran">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-bold text-2xl">Pendaftaran Peserta Baru</h1>
          <p className="text-muted-foreground">
            Formulir pendaftaran peserta BPJS Kesehatan
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl space-y-6">
        {/* Participant Selection */}
        <Card>
          <CardHeader>
            <CardTitle>1. Pilih Peserta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block font-medium text-sm">
                Cari Peserta
                <span className="ml-1 text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari berdasarkan nama, nomor BPJS, atau NIK..."
                  value={search}
                />
                <div className="max-h-[200px] space-y-2 overflow-y-auto">
                  {participants?.data.map((participant) => (
                    <button
                      className={`w-full rounded-lg border p-3 text-left ${
                        selectedParticipantId === participant.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted"
                      }`}
                      key={participant.id}
                      onClick={() => setSelectedParticipantId(participant.id)}
                      type="button"
                    >
                      <p className="font-medium">{participant.fullName}</p>
                      <p className="text-muted-foreground text-sm">
                        {participant.bpjsNumber} •{" "}
                        {participant.participantSegment}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Segment & Class */}
        <Card>
          <CardHeader>
            <CardTitle>2. Segmen & Kelas Rawat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block font-medium text-sm">
                Segmen Peserta
                <span className="ml-1 text-red-500">*</span>
              </label>
              <Select
                onValueChange={(v) =>
                  setParticipantSegment(v as ParticipantSegment)
                }
                value={participantSegment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih segmen peserta" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PARTICIPANT_SEGMENTS).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block font-medium text-sm">
                Kelas Rawat
                <span className="ml-1 text-red-500">*</span>
              </label>
              <Select
                onValueChange={(v) =>
                  setTreatmentClass(v as "I" | "II" | "III")
                }
                value={treatmentClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas rawat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">Kelas 1</SelectItem>
                  <SelectItem value="II">Kelas 2</SelectItem>
                  <SelectItem value="III">Kelas 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>3. Dokumen Pendukung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DocumentUpload
              category="kk"
              label="Kartu Keluarga (KK)"
              onChange={(url) =>
                setDocuments({ ...documents, familyCardDocumentUrl: url })
              }
              required
              value={documents.familyCardDocumentUrl}
            />
            <DocumentUpload
              category="ktp"
              label="Kartu Tanda Penduduk (KTP)"
              onChange={(url) =>
                setDocuments({ ...documents, identityDocumentUrl: url })
              }
              required
              value={documents.identityDocumentUrl}
            />
            <DocumentUpload
              category="buku-tabungan"
              label="Buku Tabungan"
              onChange={(url) =>
                setDocuments({ ...documents, bankBookDocumentUrl: url })
              }
              value={documents.bankBookDocumentUrl}
            />
            <DocumentUpload
              category="surat-autodebet"
              label="Surat Autorisasi Auto Debit"
              onChange={(url) =>
                setDocuments({ ...documents, autodebitLetterDocumentUrl: url })
              }
              value={documents.autodebitLetterDocumentUrl}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button asChild variant="outline">
            <Link href="/pendaftaran">Batal</Link>
          </Button>
          <Button
            disabled={!isValid || createRegistration.isPending}
            onClick={handleSubmit}
          >
            {createRegistration.isPending
              ? "Menyimpan..."
              : "Simpan Pendaftaran"}
          </Button>
        </div>
      </div>
    </div>
  );
}
