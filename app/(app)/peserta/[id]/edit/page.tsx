"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orpc } from "@/lib/orpc/client";

export default function EditParticipantPage() {
  const params = useParams();
  const router = useRouter();
  const [participantId, setParticipantId] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressVillage, setAddressVillage] = useState("");
  const [addressDistrict, setAddressDistrict] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressProvince, setAddressProvince] = useState("");
  const [addressPostalCode, setAddressPostalCode] = useState("");

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

  // Populate form when participant data loads
  useEffect(() => {
    if (participant) {
      const fullName = participant.firstName
        ? participant.lastName
          ? `${participant.firstName} ${participant.lastName}`
          : participant.firstName
        : "";
      setFullName(fullName);
      setPhoneNumber(participant.phoneNumber ?? "");
      setEmail(participant.email ?? "");
      setAddressStreet(participant.addressStreet ?? "");
      setAddressVillage(participant.addressVillage ?? "");
      setAddressDistrict(participant.addressDistrict ?? "");
      setAddressCity(participant.addressCity ?? "");
      setAddressProvince(participant.addressProvince ?? "");
      setAddressPostalCode(participant.addressPostalCode ?? "");
    }
  }, [participant]);

  const updateParticipant = useMutation(
    orpc.jkn.participant.update.mutationOptions()
  );

  const handleSubmit = async () => {
    if (!participantId) {
      return;
    }

    try {
      await updateParticipant.mutateAsync({
        id: participantId,
        data: {
          fullName: fullName || undefined,
          phoneNumber: phoneNumber || undefined,
          email: email || undefined,
          addressStreet: addressStreet || undefined,
          addressVillage: addressVillage || undefined,
          addressDistrict: addressDistrict || undefined,
          addressCity: addressCity || undefined,
          addressProvince: addressProvince || undefined,
          addressPostalCode: addressPostalCode || undefined,
        },
      });
      setSuccess(true);
    } catch (error) {
      console.error("Failed to update participant:", error);
      alert("Gagal memperbarui data peserta. Silakan coba lagi.");
    }
  };

  if (isFetching || !participant) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground">Memuat data peserta...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <div>
            <h1 className="font-bold text-2xl">Data Berhasil Diperbarui!</h1>
            <p className="mt-2 text-muted-foreground">
              Perubahan data peserta telah berhasil disimpan.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                setSuccess(false);
              }}
              variant="outline"
            >
              Edit Lagi
            </Button>
            <Button asChild>
              <Link href={`/peserta/${participantId}`}>Kembali ke Detail</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isFormValid =
    fullName || phoneNumber || email || addressStreet || addressCity;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center gap-4">
        <Button asChild size="icon" variant="ghost">
          <Link href={`/peserta/${participantId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-bold text-2xl">Edit Data Peserta</h1>
          <p className="text-muted-foreground">
            Perbarui informasi dasar peserta BPJS Kesehatan
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block font-medium text-sm">
                Nama Lengkap
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap sesuai KTP"
                value={fullName}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-sm">
                  Nomor Telepon
                </label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  value={phoneNumber}
                />
              </div>
              <div>
                <label className="mb-2 block font-medium text-sm">Email</label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  type="email"
                  value={email}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alamat Domisili</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block font-medium text-sm">
                Alamat Jalan
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                onChange={(e) => setAddressStreet(e.target.value)}
                placeholder="Nama jalan, nomor rumah"
                value={addressStreet}
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-sm">
                Kelurahan/Desa
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                onChange={(e) => setAddressVillage(e.target.value)}
                placeholder="Nama kelurahan"
                value={addressVillage}
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-sm">
                Kecamatan
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                onChange={(e) => setAddressDistrict(e.target.value)}
                placeholder="Nama kecamatan"
                value={addressDistrict}
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-sm">
                Kota/Kabupaten
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                onChange={(e) => setAddressCity(e.target.value)}
                placeholder="Nama kota/kabupaten"
                value={addressCity}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-sm">
                  Provinsi
                </label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  onChange={(e) => setAddressProvince(e.target.value)}
                  placeholder="Nama provinsi"
                  value={addressProvince}
                />
              </div>
              <div>
                <label className="mb-2 block font-medium text-sm">
                  Kode Pos
                </label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  onChange={(e) => setAddressPostalCode(e.target.value)}
                  placeholder="5 digit kode pos"
                  value={addressPostalCode}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button asChild variant="outline">
            <Link href={`/peserta/${participantId}`}>Batal</Link>
          </Button>
          <Button
            disabled={!isFormValid || updateParticipant.isPending}
            onClick={handleSubmit}
          >
            {updateParticipant.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <p className="font-medium text-sm">
            Catatan: Untuk perubahan data sensitif (seperti NIK, Nomor BPJS,
            segmen peserta, dll.), silakan gunakan formulir{" "}
            <Link className="text-primary underline" href="/perubahan/baru">
              Permohonan Perubahan Data
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
