"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { orpc } from "@/lib/orpc/client";
import {
  BLOOD_TYPES,
  GENDERS,
  MARITAL_STATUS,
  RELIGIONS,
  TREATMENT_CLASSES,
} from "@/lib/utils/constants";
import {
  formatBpjsNumber,
  formatDate,
  formatNik,
  formatPhoneNumber,
} from "@/lib/utils/format";

export default function ParticipantDetailPage() {
  const params = useParams();
  const [participantId, setParticipantId] = useState<number | null>(null);

  useEffect(() => {
    const id = Number.parseInt(params.id as string, 10);
    if (!Number.isNaN(id)) {
      setParticipantId(id);
    }
  }, [params.id]);

  const { data: participant, isFetching } = useQuery(
    orpc.jkn.participant.getById.queryOptions({
      input: { id: participantId! },
      enabled: !!participantId,
    })
  );

  if (isFetching || !participant) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild size="icon" variant="ghost">
            <Link href="/peserta">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-bold text-2xl">Detail Peserta</h1>
            <p className="text-muted-foreground">
              Informasi lengkap peserta BPJS Kesehatan
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/peserta/${participant.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm">Nomor BPJS</p>
              <p className="font-medium">
                {formatBpjsNumber(participant.bpjsNumber)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Nama Lengkap</p>
              <p className="font-medium">{participant.fullName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Nama di Kartu</p>
              <p className="font-medium">{participant.nameOnCard || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Nomor NIK</p>
              <p className="font-medium">
                {formatNik(participant.identityNumber)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Nomor KK</p>
              <p className="font-medium">
                {formatNik(participant.familyCardNumber)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Jenis Kelamin</p>
              <p className="font-medium">{GENDERS[participant.gender]}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Golongan Darah</p>
              <p className="font-medium">
                {BLOOD_TYPES[participant.bloodType || "UNKNOWN"] || "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Tempat Lahir</p>
              <p className="font-medium">{participant.birthPlace}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Tanggal Lahir</p>
              <p className="font-medium">{formatDate(participant.birthDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Agama</p>
              <p className="font-medium">{RELIGIONS[participant.religion]}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Status Perkawinan</p>
              <p className="font-medium">
                {MARITAL_STATUS[participant.maritalStatus]}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Status Peserta</p>
              <p className="font-medium">
                {participant.isActive ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 font-medium text-green-800 text-xs">
                    Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 font-medium text-red-800 text-xs">
                    Tidak Aktif
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Kontak</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm">Nomor Telepon</p>
              <p className="flex items-center gap-2 font-medium">
                <Phone className="h-4 w-4" />
                {formatPhoneNumber(participant.phoneNumber) || "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Email</p>
              <p className="font-medium">{participant.email || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="mb-1 text-muted-foreground text-sm">Alamat</p>
              <p className="flex items-start gap-2 font-medium">
                <MapPin className="mt-1 h-4 w-4" />
                {[
                  participant.addressStreet,
                  participant.addressRt && `RT ${participant.addressRt}`,
                  participant.addressRw && `RW ${participant.addressRw}`,
                  participant.addressVillage,
                  participant.addressDistrict,
                  participant.addressCity,
                  participant.addressProvince,
                  participant.addressPostalCode,
                ]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* BPJS Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi BPJS</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm">Segmen Peserta</p>
              <p className="font-medium">{participant.participantSegment}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Kelas Rawat</p>
              <p className="font-medium">
                {TREATMENT_CLASSES[participant.treatmentClass]}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Tanggal Daftar</p>
              <p className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4" />
                {formatDate(participant.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">
                Anggota Seumur Hidup
              </p>
              <p className="font-medium">
                {participant.isLifetimeMember ? "Ya" : "Tidak"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Employment Identity (if available) */}
        {participant.employmentIdentity && (
          <Card>
            <CardHeader>
              <CardTitle>Identitas Pekerja (PPU)</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm">Nama Instansi</p>
                <p className="font-medium">
                  {participant.employmentIdentity.institutionName || "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Kode Instansi</p>
                <p className="font-medium">
                  {participant.employmentIdentity.institutionCode || "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">
                  NIP / NIK / No. Pegawai Lama
                </p>
                <p className="font-medium">
                  {participant.employmentIdentity.oldEmployeeId || "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">
                  No. Pegawai Baru
                </p>
                <p className="font-medium">
                  {participant.employmentIdentity.newEmployeeId || "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Golongan</p>
                <p className="font-medium">
                  {participant.employmentIdentity.grade || "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Pangkat</p>
                <p className="font-medium">
                  {participant.employmentIdentity.rank || "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">
                  Status Kepegawaian
                </p>
                <p className="font-medium">
                  {participant.employmentIdentity.employeeStatus || "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Healthcare Facilities */}
        {participant.healthcareFacilities &&
          participant.healthcareFacilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Fasilitas Kesehatan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {participant.healthcareFacilities.map((phf) => (
                  <div className="grid gap-4 md:grid-cols-2" key={phf.id}>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Faskes Primer
                      </p>
                      <p className="font-medium">
                        {phf.primaryFacility?.name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Faskes Gigi
                      </p>
                      <p className="font-medium">
                        {phf.dentalFacility?.name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Kelas Rawat
                      </p>
                      <p className="font-medium">{phf.treatmentClass}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Tanggal Efektif
                      </p>
                      <p className="font-medium">
                        {formatDate(phf.effectiveDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

        {/* Bank Information (if available) */}
        {participant.bankInformation && (
          <Card>
            <CardHeader>
              <CardTitle>Informasi Bank</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-sm">Nama Bank</p>
                  <p className="font-medium">
                    {participant.bankInformation.bankName}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Nomor Rekening
                  </p>
                  <p className="font-medium">
                    {participant.bankInformation.accountNumber}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Atas Nama</p>
                  <p className="font-medium">
                    {participant.bankInformation.accountHolderName}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Nomor Virtual Account
                  </p>
                  <p className="font-medium">
                    {participant.bankInformation.virtualAccountNumber || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Auto Debit</p>
                  <p className="font-medium">
                    {participant.bankInformation.autoDebitAuthorized
                      ? "Aktif"
                      : "Tidak Aktif"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deactivation Info (if applicable) */}
        {!participant.isActive && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Info Deaktivasi</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm">
                  Tanggal Deaktivasi
                </p>
                <p className="font-medium">
                  {formatDate(participant.deactivatedAt)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Alasan</p>
                <p className="font-medium">
                  {participant.deactivationReason || "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
