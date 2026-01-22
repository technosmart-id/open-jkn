"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FacilitySelector } from "@/components/jkn/facilities/facility-selector";
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
import {
  BLOOD_TYPES,
  MARITAL_STATUS,
  PARTICIPANT_SEGMENTS,
  RELIGIONS,
} from "@/lib/utils/constants";

export default function NewParticipantPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);

  // Personal Information
  const [fullName, setFullName] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [familyCardNumber, setFamilyCardNumber] = useState("");
  const [gender, setGender] = useState<"LAKI_LAKI" | "PEREMPUAN">();
  const [bloodType, setBloodType] = useState<keyof typeof BLOOD_TYPES>();
  const [birthPlace, setBirthPlace] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [religion, setReligion] = useState<keyof typeof RELIGIONS>();
  const [maritalStatus, setMaritalStatus] =
    useState<keyof typeof MARITAL_STATUS>();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  // Address
  const [addressStreet, setAddressStreet] = useState("");
  const [addressRt, setAddressRt] = useState("");
  const [addressRw, setAddressRw] = useState("");
  const [addressVillage, setAddressVillage] = useState("");
  const [addressDistrict, setAddressDistrict] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressProvince, setAddressProvince] = useState("");
  const [addressPostalCode, setAddressPostalCode] = useState("");
  const [mailingAddressSame, setMailingAddressSame] = useState(true);

  // BPJS Info
  const [participantSegment, setParticipantSegment] =
    useState<keyof typeof PARTICIPANT_SEGMENTS>();
  const [treatmentClass, setTreatmentClass] = useState<"I" | "II" | "III">(
    "III"
  );
  const [isLifetimeMember, setIsLifetimeMember] = useState(true);

  // Facilities
  const [primaryFacilityId, setPrimaryFacilityId] = useState<number>();
  const [dentalFacilityId, setDentalFacilityId] = useState<number>();

  // Family Members
  const [familyMembers, setFamilyMembers] = useState<
    Array<{
      identityNumber: string;
      fullName: string;
      relationship: string;
      gender: "LAKI_LAKI" | "PEREMPUAN";
      birthPlace: string;
      birthDate: string;
    }>
  >([]);

  const createParticipant = useMutation(
    orpc.jkn.participant.create.mutationOptions()
  );

  const addFamilyMember = () => {
    setFamilyMembers([
      ...familyMembers,
      {
        identityNumber: "",
        fullName: "",
        relationship: "",
        gender: "LAKI_LAKI",
        birthPlace: "",
        birthDate: "",
      },
    ]);
  };

  const updateFamilyMember = (index: number, field: string, value: string) => {
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFamilyMembers(updated);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      await createParticipant.mutateAsync({
        // Personal info
        familyCardNumber,
        identityNumber,
        fullName,
        nameOnCard,
        gender,
        bloodType,
        birthPlace,
        birthDate,
        religion,
        maritalStatus,
        phoneNumber,
        email,
        addressStreet,
        addressRt,
        addressRw,
        addressVillage,
        addressDistrict,
        addressCity,
        addressProvince,
        addressPostalCode,
        mailingAddressSame,
        mailingAddressStreet: mailingAddressSame ? undefined : addressStreet,
        mailingAddressRt: mailingAddressSame ? undefined : addressRt,
        mailingAddressRw: mailingAddressSame ? undefined : addressRw,
        mailingAddressVillage: mailingAddressSame ? undefined : addressVillage,
        mailingAddressDistrict: mailingAddressSame
          ? undefined
          : addressDistrict,
        mailingAddressCity: mailingAddressSame ? undefined : addressCity,
        mailingAddressProvince: mailingAddressSame
          ? undefined
          : addressProvince,
        mailingAddressPostalCode: mailingAddressSame
          ? undefined
          : addressPostalCode,
        participantSegment: participantSegment!,
        treatmentClass,
        isLifetimeMember,
        // Facilities
        primaryFacilityId,
        dentalFacilityId,
        // Family members
        familyMembers: familyMembers.length > 0 ? familyMembers : undefined,
      } as any);
      setSuccess(true);
    } catch (error) {
      console.error("Failed to create participant:", error);
      alert("Gagal menyimpan data peserta. Silakan coba lagi.");
    }
  };

  if (success) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <div>
            <h1 className="font-bold text-2xl">Peserta Berhasil Dibuat!</h1>
            <p className="mt-2 text-muted-foreground">
              Data peserta baru telah berhasil disimpan ke dalam sistem.
            </p>
          </div>
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/peserta">Kembali ke Daftar</Link>
            </Button>
            <Button
              onClick={() => {
                setSuccess(false);
                setStep(1);
              }}
            >
              Tambah Peserta Lain
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isStepValid = () => {
    if (step === 1) {
      return (
        fullName &&
        identityNumber?.length === 16 &&
        familyCardNumber?.length === 16 &&
        gender &&
        birthPlace &&
        birthDate &&
        religion &&
        maritalStatus
      );
    }
    if (step === 2) {
      return addressStreet && addressCity && addressProvince;
    }
    if (step === 3) {
      return participantSegment && treatmentClass;
    }
    if (step === 4) {
      return primaryFacilityId;
    }
    return true;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center gap-4">
        <Button asChild size="icon" variant="ghost">
          <Link href="/peserta">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-bold text-2xl">Tambah Peserta Baru</h1>
          <p className="text-muted-foreground">
            Formulir pendaftaran peserta BPJS Kesehatan
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 flex items-center justify-center">
          {[1, 2, 3, 4, 5].map((s) => (
            <div className="flex items-center" key={s}>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium text-sm ${
                  step >= s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted bg-background text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 5 && (
                <div
                  className={`h-0.5 w-16 ${
                    step > s ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Informasi Pribadi"}
              {step === 2 && "Alamat"}
              {step === 3 && "Informasi BPJS"}
              {step === 4 && "Fasilitas Kesehatan"}
              {step === 5 && "Anggota Keluarga"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-medium text-sm">
                      Nama Lengkap
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nama lengkap sesuai KTP"
                      value={fullName}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-medium text-sm">
                      Nama di Kartu
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(e) => setNameOnCard(e.target.value)}
                      placeholder="Nama yang tercetak di kartu (jika berbeda)"
                      value={nameOnCard}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-medium text-sm">
                      Nomor NIK
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      maxLength={16}
                      onChange={(e) => setIdentityNumber(e.target.value)}
                      placeholder="16 digit NIK"
                      value={identityNumber}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-medium text-sm">
                      Nomor KK
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      maxLength={16}
                      onChange={(e) => setFamilyCardNumber(e.target.value)}
                      placeholder="16 digit Nomor KK"
                      value={familyCardNumber}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-medium text-sm">
                      Jenis Kelamin
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <Select
                      onValueChange={(v) =>
                        setGender(v as "LAKI_LAKI" | "PEREMPUAN")
                      }
                      value={gender}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
                        <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-2 block font-medium text-sm">
                      Golongan Darah
                    </label>
                    <Select
                      onValueChange={(v) =>
                        setBloodType(v as keyof typeof BLOOD_TYPES)
                      }
                      value={bloodType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih golongan darah" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(BLOOD_TYPES).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-2 block font-medium text-sm">
                      Tempat Lahir
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(e) => setBirthPlace(e.target.value)}
                      placeholder="Kota kelahiran"
                      value={birthPlace}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-medium text-sm">
                      Tanggal Lahir
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(e) => setBirthDate(e.target.value)}
                      type="date"
                      value={birthDate}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-medium text-sm">
                      Agama
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <Select
                      onValueChange={(v) =>
                        setReligion(v as keyof typeof RELIGIONS)
                      }
                      value={religion}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih agama" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(RELIGIONS).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-2 block font-medium text-sm">
                      Status Perkawinan
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <Select
                      onValueChange={(v) =>
                        setMaritalStatus(v as keyof typeof MARITAL_STATUS)
                      }
                      value={maritalStatus}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status perkawinan" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(MARITAL_STATUS).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                    <label className="mb-2 block font-medium text-sm">
                      Email
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      type="email"
                      value={email}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Address */}
            {step === 2 && (
              <>
                <div>
                  <label className="mb-2 block font-medium text-sm">
                    Alamat Jalan
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    onChange={(e) => setAddressStreet(e.target.value)}
                    placeholder="Nama jalan, nomor rumah"
                    value={addressStreet}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block font-medium text-sm">RT</label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(e) => setAddressRt(e.target.value)}
                      placeholder="001"
                      value={addressRt}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-medium text-sm">RW</label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(e) => setAddressRw(e.target.value)}
                      placeholder="002"
                      value={addressRw}
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
                </div>
                <div className="grid gap-4 md:grid-cols-2">
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
                      <span className="ml-1 text-red-500">*</span>
                    </label>
                    <input
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      onChange={(e) => setAddressCity(e.target.value)}
                      placeholder="Nama kota/kabupaten"
                      value={addressCity}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-medium text-sm">
                      Provinsi
                      <span className="ml-1 text-red-500">*</span>
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
                <div className="flex items-center gap-2">
                  <input
                    checked={mailingAddressSame}
                    className="h-4 w-4"
                    id="mailing-same"
                    onChange={(e) => setMailingAddressSame(e.target.checked)}
                    type="checkbox"
                  />
                  <label className="text-sm" htmlFor="mailing-same">
                    Alamat surat sama dengan alamat domisili
                  </label>
                </div>
              </>
            )}

            {/* Step 3: BPJS Information */}
            {step === 3 && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-medium text-sm">
                    Segmen Peserta
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <Select
                    onValueChange={(v) =>
                      setParticipantSegment(
                        v as keyof typeof PARTICIPANT_SEGMENTS
                      )
                    }
                    value={participantSegment}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih segmen peserta" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PARTICIPANT_SEGMENTS).map(
                        ([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        )
                      )}
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
                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    checked={isLifetimeMember}
                    className="h-4 w-4"
                    id="lifetime"
                    onChange={(e) => setIsLifetimeMember(e.target.checked)}
                    type="checkbox"
                  />
                  <label className="text-sm" htmlFor="lifetime">
                    Anggota Seumur Hidup
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Healthcare Facilities */}
            {step === 4 && (
              <div className="space-y-4">
                <FacilitySelector
                  onChange={(id) => setPrimaryFacilityId(id)}
                  placeholder="Pilih Faskes Primer"
                  type="primary"
                  value={primaryFacilityId}
                />
                <FacilitySelector
                  onChange={(id) => setDentalFacilityId(id)}
                  placeholder="Pilih Faskes Gigi (opsional)"
                  type="dental"
                  value={dentalFacilityId}
                />
              </div>
            )}

            {/* Step 5: Family Members */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={addFamilyMember} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Anggota Keluarga
                  </Button>
                </div>
                {familyMembers.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    Tidak ada anggota keluarga ditambahkan
                  </p>
                ) : (
                  familyMembers.map((member, index) => (
                    <Card key={index}>
                      <CardContent className="space-y-4 pt-6">
                        <div className="flex justify-between">
                          <p className="font-medium text-sm">
                            Anggota Keluarga #{index + 1}
                          </p>
                          <Button
                            onClick={() => removeFamilyMember(index)}
                            size="icon"
                            type="button"
                            variant="ghost"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block font-medium text-sm">
                              Nama Lengkap
                            </label>
                            <input
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              onChange={(e) =>
                                updateFamilyMember(
                                  index,
                                  "fullName",
                                  e.target.value
                                )
                              }
                              placeholder="Nama lengkap"
                              value={member.fullName}
                            />
                          </div>
                          <div>
                            <label className="mb-2 block font-medium text-sm">
                              Nomor NIK
                            </label>
                            <input
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              maxLength={16}
                              onChange={(e) =>
                                updateFamilyMember(
                                  index,
                                  "identityNumber",
                                  e.target.value
                                )
                              }
                              placeholder="16 digit NIK"
                              value={member.identityNumber}
                            />
                          </div>
                          <div>
                            <label className="mb-2 block font-medium text-sm">
                              Hubungan Keluarga
                            </label>
                            <Select
                              onValueChange={(v) =>
                                updateFamilyMember(index, "relationship", v)
                              }
                              value={member.relationship}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih hubungan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SUAMI">Suami</SelectItem>
                                <SelectItem value="ISTRI">Istri</SelectItem>
                                <SelectItem value="ANAK_TANGGUNGAN">
                                  Anak Tanggungan
                                </SelectItem>
                                <SelectItem value="ANAK_TIDAK_TANGGUNGAN">
                                  Anak Tidak Tanggungan
                                </SelectItem>
                                <SelectItem value="ORANG_TUA">
                                  Orang Tua
                                </SelectItem>
                                <SelectItem value="FAMILY_LAIN">
                                  Keluarga Lain
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="mb-2 block font-medium text-sm">
                              Jenis Kelamin
                            </label>
                            <Select
                              onValueChange={(v) =>
                                updateFamilyMember(index, "gender", v)
                              }
                              value={member.gender}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis kelamin" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LAKI_LAKI">
                                  Laki-laki
                                </SelectItem>
                                <SelectItem value="PEREMPUAN">
                                  Perempuan
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="mb-2 block font-medium text-sm">
                              Tempat Lahir
                            </label>
                            <input
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              onChange={(e) =>
                                updateFamilyMember(
                                  index,
                                  "birthPlace",
                                  e.target.value
                                )
                              }
                              placeholder="Kota kelahiran"
                              value={member.birthPlace}
                            />
                          </div>
                          <div>
                            <label className="mb-2 block font-medium text-sm">
                              Tanggal Lahir
                            </label>
                            <input
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              onChange={(e) =>
                                updateFamilyMember(
                                  index,
                                  "birthDate",
                                  e.target.value
                                )
                              }
                              type="date"
                              value={member.birthDate}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            variant="outline"
          >
            Sebelumnya
          </Button>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/peserta">Batal</Link>
            </Button>
            {step < 5 ? (
              <Button
                disabled={!isStepValid()}
                onClick={() => setStep(step + 1)}
              >
                Selanjutnya
              </Button>
            ) : (
              <Button
                disabled={!isStepValid() || createParticipant.isPending}
                onClick={handleSubmit}
              >
                {createParticipant.isPending
                  ? "Menyimpan..."
                  : "Simpan Peserta"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
