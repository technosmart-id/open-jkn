"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calculator, CheckCircle2, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

type BankName =
  | "LAINNYA"
  | "MANDIRI"
  | "BRI"
  | "BNI"
  | "BCA"
  | "BCA_SYARIAH"
  | "BRI_SYARIAH"
  | "BNI_SYARIAH"
  | "BTN"
  | "JATENG"
  | "JATIM"
  | "JB"
  | "SUMUT";

export default function PaymentInputPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [paymentNumber, setPaymentNumber] = useState("");

  // Form state
  const [participantId, setParticipantId] = useState<number>();
  const [participantSearch, setParticipantSearch] = useState("");
  const [periodMonth, setPeriodMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [periodYear, setPeriodYear] = useState<number>(
    new Date().getFullYear()
  );
  const [amount, setAmount] = useState("");
  const [adminFee, setAdminFee] = useState("");

  const { data: participants } = useQuery(
    orpc.jkn.participant.list.queryOptions({
      input: {
        search: participantSearch || undefined,
        limit: 20,
      },
    })
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "AUTO_DEBIT" | "MANUAL" | "VIRTUAL_ACCOUNT"
  >("MANUAL");
  const [bankName, setBankName] = useState<BankName | "">("");
  const [virtualAccountNumber, setVirtualAccountNumber] = useState("");

  // Calculate penalty
  const calculatePenalty = () => {
    if (!amount) {
      return { monthsInArrears: 0, penaltyAmount: 0, totalAmount: 0 };
    }

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const dayOfMonth = today.getDate();

    let monthsInArrears = 0;

    if (
      periodYear < currentYear ||
      (periodYear === currentYear && periodMonth < currentMonth)
    ) {
      const yearDiff = currentYear - periodYear;
      monthsInArrears = yearDiff * 12 + (currentMonth - periodMonth);
    }

    const amountNum = Number.parseFloat(amount);
    const penaltyAmount = amountNum * (0.025 * monthsInArrears);
    const totalAmount =
      amountNum + penaltyAmount + Number.parseFloat(adminFee || "0");

    return {
      monthsInArrears,
      penaltyAmount,
      totalAmount,
    };
  };

  const { monthsInArrears, penaltyAmount, totalAmount } = calculatePenalty();

  const createPayment = useMutation(orpc.jkn.payment.create.mutationOptions());

  const handleSubmit = async () => {
    if (!participantId) {
      alert("Silakan pilih peserta terlebih dahulu");
      return;
    }

    try {
      const result = await createPayment.mutateAsync({
        participantId,
        periodMonth,
        periodYear,
        amount,
        adminFee: adminFee || undefined,
        paymentMethod,
        bankName:
          paymentMethod !== "AUTO_DEBIT" && bankName
            ? (bankName as BankName)
            : undefined,
        virtualAccountNumber:
          paymentMethod === "VIRTUAL_ACCOUNT"
            ? virtualAccountNumber
            : undefined,
      });

      setPaymentNumber(result.paymentNumber || "");
      setSuccess(true);
    } catch (error) {
      console.error("Failed to create payment:", error);
      alert("Gagal menyimpan pembayaran. Silakan coba lagi.");
    }
  };

  const isFormValid =
    participantId && periodMonth && periodYear && amount && paymentMethod;

  if (success) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <div>
            <h1 className="font-bold text-2xl">Pembayaran Berhasil!</h1>
            <p className="mt-2 text-muted-foreground">
              Pembayaran kontribusi telah berhasil dicatat.
            </p>
            {paymentNumber && (
              <p className="mt-2 font-medium font-mono text-lg">
                {paymentNumber}
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/pembayaran">Kembali ke Daftar</Link>
            </Button>
            <Button
              onClick={() => {
                setSuccess(false);
                setPaymentNumber("");
                setParticipantId(undefined);
                setAmount("");
                setAdminFee("");
                setBankName("");
                setVirtualAccountNumber("");
              }}
            >
              Input Pembayaran Lain
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center gap-4">
        <Button asChild size="icon" variant="ghost">
          <Link href="/pembayaran">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-bold text-2xl">Input Pembayaran</h1>
          <p className="text-muted-foreground">
            Catat pembayaran kontribusi peserta BPJS Kesehatan
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
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                onChange={(e) => setParticipantSearch(e.target.value)}
                placeholder="Cari berdasarkan nama, nomor BPJS, atau NIK..."
                value={participantSearch}
              />
              <div className="mt-2 max-h-[200px] space-y-2 overflow-y-auto">
                {participants?.data.map((participant) => (
                  <button
                    className={`w-full rounded-lg border p-3 text-left ${
                      participantId === participant.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-muted"
                    }`}
                    key={participant.id}
                    onClick={() => setParticipantId(participant.id)}
                    type="button"
                  >
                    <p className="font-medium">
                      {participant.firstName}
                      {participant.lastName && ` ${participant.lastName}`}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {participant.bpjsNumber} •{" "}
                      {participant.participantSegment}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Period & Amount */}
        <Card>
          <CardHeader>
            <CardTitle>2. Periode & Jumlah</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-sm">
                  Bulan Pembayaran
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <Select
                  onValueChange={(v) => setPeriodMonth(Number.parseInt(v, 10))}
                  value={periodMonth.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month, index) => (
                      <SelectItem key={month} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-sm">
                  Tahun Pembayaran
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <Select
                  onValueChange={(v) => setPeriodYear(Number.parseInt(v, 10))}
                  value={periodYear.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="mb-2 block font-medium text-sm">
                Jumlah Kontribusi (Rp)
                <span className="ml-1 text-red-500">*</span>
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 25000"
                type="number"
                value={amount}
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-sm">
                Biaya Admin (Rp)
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                onChange={(e) => setAdminFee(e.target.value)}
                placeholder="Contoh: 2500"
                type="number"
                value={adminFee}
              />
            </div>
          </CardContent>
        </Card>

        {/* Penalty Calculation */}
        {monthsInArrears > 0 && (
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Calculator className="h-5 w-5" />
                Keterlambatan Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Info className="h-4 w-4 text-orange-500" />
                <span className="text-muted-foreground">
                  Pembayaran terlambat {monthsInArrears} bulan
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Denda (2.5% per bulan):
                </span>
                <span className="font-medium text-orange-700">
                  Rp {penaltyAmount.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>3. Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block font-medium text-sm">
                Metode Pembayaran
                <span className="ml-1 text-red-500">*</span>
              </label>
              <Select
                onValueChange={(v) =>
                  setPaymentMethod(
                    v as "AUTO_DEBIT" | "MANUAL" | "VIRTUAL_ACCOUNT"
                  )
                }
                value={paymentMethod}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih metode pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL">
                    Manual (Tunai/Transfer)
                  </SelectItem>
                  <SelectItem value="AUTO_DEBIT">Auto Debit</SelectItem>
                  <SelectItem value="VIRTUAL_ACCOUNT">
                    Virtual Account
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod !== "AUTO_DEBIT" && (
              <div>
                <label className="mb-2 block font-medium text-sm">
                  Nama Bank
                </label>
                <Select
                  onValueChange={(v) => setBankName(v as BankName)}
                  value={bankName}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BCA">BCA</SelectItem>
                    <SelectItem value="MANDIRI">Mandiri</SelectItem>
                    <SelectItem value="BRI">BRI</SelectItem>
                    <SelectItem value="BNI">BNI</SelectItem>
                    <SelectItem value="BTN">BTN</SelectItem>
                    <SelectItem value="BCA_SYARIAH">BCA Syariah</SelectItem>
                    <SelectItem value="BRI_SYARIAH">BRI Syariah</SelectItem>
                    <SelectItem value="BNI_SYARIAH">BNI Syariah</SelectItem>
                    <SelectItem value="JATENG">Bank Jateng</SelectItem>
                    <SelectItem value="JATIM">Bank Jatim</SelectItem>
                    <SelectItem value="JB">Bank JB</SelectItem>
                    <SelectItem value="SUMUT">Bank Sumut</SelectItem>
                    <SelectItem value="LAINNYA">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {paymentMethod === "VIRTUAL_ACCOUNT" && (
              <div>
                <label className="mb-2 block font-medium text-sm">
                  Nomor Virtual Account
                </label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  onChange={(e) => setVirtualAccountNumber(e.target.value)}
                  placeholder="Contoh: VA1234567890"
                  value={virtualAccountNumber}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Jumlah Kontribusi:</span>
              <span className="font-medium">Rp {amount || "0"}</span>
            </div>
            {adminFee && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Biaya Admin:</span>
                <span className="font-medium">Rp {adminFee}</span>
              </div>
            )}
            {monthsInArrears > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Denda Keterlambatan:
                </span>
                <span className="font-medium text-orange-700">
                  Rp {penaltyAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-3">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-lg">
                Rp {totalAmount.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button asChild variant="outline">
            <Link href="/pembayaran">Batal</Link>
          </Button>
          <Button
            disabled={!isFormValid || createPayment.isPending}
            onClick={handleSubmit}
          >
            {createPayment.isPending ? "Menyimpan..." : "Simpan Pembayaran"}
          </Button>
        </div>
      </div>
    </div>
  );
}
