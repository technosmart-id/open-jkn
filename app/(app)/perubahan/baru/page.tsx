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
import { CHANGE_TYPES } from "@/lib/utils/constants";

type ChangeType =
  | "ALAMAT"
  | "TEMPAT_KERJA"
  | "GOLONGAN_KEPANGKATAN"
  | "GAJI"
  | "FASKES"
  | "PENSIUN"
  | "KEMATIAN"
  | "DATA_KELUARGA"
  | "NAMA";

export default function NewChangeRequestPage() {
  const router = useRouter();
  const [step, setStep] = useState<"select" | "form" | "success">("select");
  const [participantId, setParticipantId] = useState<number>();
  const [participantSearch, setParticipantSearch] = useState("");
  const [changeType, setChangeType] = useState<ChangeType>();

  // Form fields based on change type
  const [addressStreet, setAddressStreet] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressProvince, setAddressProvince] = useState("");

  const [fullName, setFullName] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [salary, setSalary] = useState("");
  const [grade, setGrade] = useState("");
  const [pensionDate, setPensionDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [deathCertificateNumber, setDeathCertificateNumber] = useState("");

  const [primaryFacilityId, setPrimaryFacilityId] = useState<number>();
  const [dentalFacilityId, setDentalFacilityId] = useState<number>();

  // Documents
  const [supportingDocumentUrl, setSupportingDocumentUrl] = useState("");
  const [deathCertificateDocumentUrl, setDeathCertificateDocumentUrl] =
    useState("");

  const { data: participants } = useQuery(
    orpc.jkn.participant.list.queryOptions({
      input: {
        search: participantSearch || undefined,
        limit: 20,
      },
    })
  );

  const { data: participant } = useQuery(
    orpc.jkn.participant.getById.queryOptions({
      input: { id: participantId! },
      enabled: !!participantId,
    })
  );

  const { data: healthcareFacilities } = useQuery(
    orpc.jkn.facility.listHealthcareFacilities.queryOptions({
      input: { limit: 50 },
    })
  );

  const { data: dentalFacilities } = useQuery(
    orpc.jkn.facility.listDentalFacilities.queryOptions({
      input: { limit: 50 },
    })
  );

  const createChangeRequest = useMutation(
    orpc.jkn.changeRequest.create.mutationOptions()
  );

  const handleSubmit = async () => {
    if (!(participantId && changeType && participant)) {
      return;
    }

    try {
      const previousData: Record<string, unknown> = {};
      const newData: Record<string, unknown> = {};

      // Set previous and new data based on change type
      switch (changeType) {
        case "ALAMAT":
          previousData.addressStreet = participant.addressStreet;
          previousData.addressCity = participant.addressCity;
          previousData.addressProvince = participant.addressProvince;
          newData.addressStreet = addressStreet;
          newData.addressCity = addressCity;
          newData.addressProvince = addressProvince;
          break;
        case "NAMA":
          previousData.fullName = participant.firstName
            ? participant.lastName
              ? `${participant.firstName} ${participant.lastName}`
              : participant.firstName
            : "";
          newData.fullName = fullName;
          break;
        case "TEMPAT_KERJA":
          if (participant.employmentIdentity) {
            previousData.institutionName =
              participant.employmentIdentity.institutionName;
          }
          newData.institutionName = institutionName;
          break;
        case "GAJI":
          if (participant.employmentIdentity) {
            previousData.baseSalary = participant.employmentIdentity.baseSalary;
          }
          newData.baseSalary = salary;
          break;
        case "GOLONGAN_KEPANGKATAN":
          if (participant.employmentIdentity) {
            previousData.grade = participant.employmentIdentity.grade;
          }
          newData.grade = grade;
          break;
        case "FASKES": {
          // Get current facilities
          const currentFacilities = participant.healthcareFacilities?.[0];
          if (currentFacilities) {
            previousData.primaryFacilityId =
              currentFacilities.primaryFacilityId;
            previousData.dentalFacilityId = currentFacilities.dentalFacilityId;
          }
          newData.primaryFacilityId = primaryFacilityId;
          newData.dentalFacilityId = dentalFacilityId;
          break;
        }
        case "PENSIUN":
          newData.pensionDate = pensionDate;
          break;
        case "KEMATIAN":
          newData.deathDate = deathDate;
          break;
        case "DATA_KELUARGA":
          // Family data changes - supporting document required
          newData.notes = "Perubahan data keluarga";
          break;
      }

      await createChangeRequest.mutateAsync({
        participantId,
        changeType,
        previousData,
        newData,
        supportingDocumentUrl: supportingDocumentUrl || undefined,
        deathCertificateNumber:
          changeType === "KEMATIAN" ? deathCertificateNumber : undefined,
        deathCertificateDocumentUrl:
          changeType === "KEMATIAN" ? deathCertificateDocumentUrl : undefined,
      });
      setStep("success");
    } catch (error) {
      console.error("Failed to create change request:", error);
      alert("Gagal membuat permohonan perubahan. Silakan coba lagi.");
    }
  };

  if (step === "success") {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <div>
            <h1 className="font-bold text-2xl">Permohonan Berhasil Dibuat!</h1>
            <p className="mt-2 text-muted-foreground">
              Permohonan perubahan data telah berhasil dikirim dan akan
              diproses.
            </p>
          </div>
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/perubahan">Kembali ke Daftar</Link>
            </Button>
            <Button
              onClick={() => {
                setStep("select");
                setParticipantId(undefined);
                setChangeType(undefined);
              }}
            >
              Buat Permohonan Lain
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isFormValid = () => {
    if (!(participantId && changeType)) {
      return false;
    }

    switch (changeType) {
      case "ALAMAT":
        return addressStreet && addressCity && addressProvince;
      case "NAMA":
        return fullName;
      case "TEMPAT_KERJA":
        return institutionName;
      case "GAJI":
        return salary;
      case "GOLONGAN_KEPANGKATAN":
        return grade;
      case "FASKES":
        return primaryFacilityId;
      case "PENSIUN":
        return pensionDate;
      case "KEMATIAN":
        return (
          deathDate && deathCertificateNumber && deathCertificateDocumentUrl
        );
      case "DATA_KELUARGA":
        return supportingDocumentUrl;
      default:
        return false;
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center gap-4">
        <Button asChild size="icon" variant="ghost">
          <Link href="/perubahan">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-bold text-2xl">Permohonan Perubahan Data</h1>
          <p className="text-muted-foreground">
            Formulir permohonan perubahan data peserta
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl space-y-6">
        {/* Step 1: Select Participant & Change Type */}
        {step === "select" && (
          <>
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
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    placeholder="Cari berdasarkan nama, nomor BPJS, atau NIK..."
                    value={participantSearch}
                  />
                  <div className="mt-2 max-h-[200px] space-y-2 overflow-y-auto">
                    {participants?.data.map((p) => (
                      <button
                        className={`w-full rounded-lg border p-3 text-left ${
                          participantId === p.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-muted"
                        }`}
                        key={p.id}
                        onClick={() => setParticipantId(p.id)}
                        type="button"
                      >
                        <p className="font-medium">
                          {p.firstName}
                          {p.lastName && ` ${p.lastName}`}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {p.bpjsNumber} • {p.participantSegment}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Jenis Perubahan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block font-medium text-sm">
                    Pilih Jenis Perubahan
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <Select
                    onValueChange={(v) => setChangeType(v as ChangeType)}
                    value={changeType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis perubahan" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CHANGE_TYPES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                disabled={!(participantId && changeType)}
                onClick={() => setStep("form")}
              >
                Selanjutnya
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Form Based on Change Type */}
        {step === "form" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>
                  3. Detail Perubahan - {changeType && CHANGE_TYPES[changeType]}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {changeType === "ALAMAT" && (
                  <>
                    <div>
                      <label className="mb-2 block font-medium text-sm">
                        Alamat Baru
                        <span className="ml-1 text-red-500">*</span>
                      </label>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        onChange={(e) => setAddressStreet(e.target.value)}
                        placeholder="Alamat lengkap baru"
                        value={addressStreet}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block font-medium text-sm">
                          Kota/Kabupaten
                          <span className="ml-1 text-red-500">*</span>
                        </label>
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          onChange={(e) => setAddressCity(e.target.value)}
                          placeholder="Kota/Kabupaten baru"
                          value={addressCity}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block font-medium text-sm">
                          Provinsi
                          <span className="ml-1 text-red-500">*</span>
                        </label>
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          onChange={(e) => setAddressProvince(e.target.value)}
                          placeholder="Provinsi baru"
                          value={addressProvince}
                        />
                      </div>
                    </div>
                  </>
                )}

                {changeType === "NAMA" && (
                  <div>
                    <label className="mb-2 block font-medium text-sm">
                      Nama Lengkap Baru
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nama lengkap baru"
                      value={fullName}
                    />
                    <p className="mt-2 text-muted-foreground text-sm">
                      Nama saat ini:{" "}
                      <strong>
                        {participant?.firstName}
                        {participant?.lastName && ` ${participant.lastName}`}
                      </strong>
                    </p>
                  </div>
                )}

                {changeType === "TEMPAT_KERJA" && (
                  <div>
                    <label className="mb-2 block font-medium text-sm">
                      Nama Instansi Baru
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(e) => setInstitutionName(e.target.value)}
                      placeholder="Nama instansi kerja baru"
                      value={institutionName}
                    />
                  </div>
                )}

                {changeType === "GAJI" && (
                  <div>
                    <label className="mb-2 block font-medium text-sm">
                      Gaji Baru
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="Contoh: 5000000"
                      type="number"
                      value={salary}
                    />
                  </div>
                )}

                {changeType === "GOLONGAN_KEPANGKATAN" && (
                  <div>
                    <label className="mb-2 block font-medium text-sm">
                      Golongan/Grade Baru
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <Select onValueChange={setGrade} value={grade}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih golongan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="I">I</SelectItem>
                        <SelectItem value="II">II</SelectItem>
                        <SelectItem value="III">III</SelectItem>
                        <SelectItem value="IV">IV</SelectItem>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {changeType === "FASKES" && (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block font-medium text-sm">
                        Faskes Primer Baru
                        <span className="ml-1 text-red-500">*</span>
                      </label>
                      <Select
                        onValueChange={(v) =>
                          setPrimaryFacilityId(Number.parseInt(v, 10))
                        }
                        value={primaryFacilityId?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih faskes primer" />
                        </SelectTrigger>
                        <SelectContent>
                          {healthcareFacilities?.map((facility) => (
                            <SelectItem
                              key={facility.id}
                              value={facility.id.toString()}
                            >
                              {facility.code} - {facility.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-2 block font-medium text-sm">
                        Faskes Gigi Baru
                      </label>
                      <Select
                        onValueChange={(v) =>
                          setDentalFacilityId(Number.parseInt(v, 10))
                        }
                        value={dentalFacilityId?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih faskes gigi" />
                        </SelectTrigger>
                        <SelectContent>
                          {dentalFacilities?.map((facility) => (
                            <SelectItem
                              key={facility.id}
                              value={facility.id.toString()}
                            >
                              {facility.code} - {facility.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {changeType === "PENSIUN" && (
                  <div>
                    <label className="mb-2 block font-medium text-sm">
                      Tanggal Pensiun
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(e) => setPensionDate(e.target.value)}
                      type="date"
                      value={pensionDate}
                    />
                  </div>
                )}

                {changeType === "KEMATIAN" && (
                  <>
                    <div>
                      <label className="mb-2 block font-medium text-sm">
                        Tanggal Meninggal
                        <span className="ml-1 text-red-500">*</span>
                      </label>
                      <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        onChange={(e) => setDeathDate(e.target.value)}
                        type="date"
                        value={deathDate}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block font-medium text-sm">
                        Nomor Surat Keterangan Kematian
                        <span className="ml-1 text-red-500">*</span>
                      </label>
                      <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        onChange={(e) =>
                          setDeathCertificateNumber(e.target.value)
                        }
                        placeholder="Nomor surat keterangan"
                        value={deathCertificateNumber}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block font-medium text-sm">
                        Dokumen Surat Keterangan Kematian
                        <span className="ml-1 text-red-500">*</span>
                      </label>
                      <DocumentUpload
                        category="akta-kematian"
                        label="Dokumen Surat Keterangan Kematian"
                        onChange={setDeathCertificateDocumentUrl}
                        required
                        value={deathCertificateDocumentUrl}
                      />
                    </div>
                  </>
                )}

                {changeType === "DATA_KELUARGA" && (
                  <div>
                    <p className="mb-4 text-muted-foreground text-sm">
                      Silakan unggah dokumen pendukung yang menjelaskan
                      perubahan data keluarga (seperti surat nikah, akta
                      kelahiran, dll.)
                    </p>
                    <DocumentUpload
                      category="kk"
                      label="Dokumen Pendukung"
                      onChange={setSupportingDocumentUrl}
                      required
                      value={supportingDocumentUrl}
                    />
                  </div>
                )}

                {/* Supporting Document for other types */}
                {changeType !== "KEMATIAN" &&
                  changeType !== "DATA_KELUARGA" && (
                    <div>
                      <label className="mb-2 block font-medium text-sm">
                        Dokumen Pendukung
                      </label>
                      <DocumentUpload
                        category="ktp"
                        label="Unggah dokumen pendukung (opsional)"
                        onChange={setSupportingDocumentUrl}
                        value={supportingDocumentUrl}
                      />
                    </div>
                  )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button onClick={() => setStep("select")} variant="outline">
                Sebelumnya
              </Button>
              <Button
                disabled={!isFormValid() || createChangeRequest.isPending}
                onClick={handleSubmit}
              >
                {createChangeRequest.isPending
                  ? "Memproses..."
                  : "Kirim Permohonan"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
