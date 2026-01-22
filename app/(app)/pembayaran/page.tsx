"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCard, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orpc } from "@/lib/orpc/client";
import { formatCurrency } from "@/lib/utils/format";

function calculateTotal(
  amount: string,
  adminFee: string | null,
  penaltyAmount: string | null
): string {
  const a = Number.parseFloat(amount) || 0;
  const af = Number.parseFloat(adminFee || "0") || 0;
  const pa = Number.parseFloat(penaltyAmount || "0") || 0;
  return (a + af + pa).toFixed(2);
}

export default function PaymentListPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [periodYear, setPeriodYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [periodMonth, setPeriodMonth] = useState<string>(
    (new Date().getMonth() + 1).toString()
  );
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isFetching } = useQuery(
    orpc.jkn.payment.list.queryOptions({
      input: {
        periodYear: periodYear ? Number.parseInt(periodYear, 10) : undefined,
        periodMonth: periodMonth ? Number.parseInt(periodMonth, 10) : undefined,
        status: status === "all" ? undefined : status,
        page,
        limit,
      },
    })
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Pembayaran Iuran</h1>
          <p className="text-muted-foreground">
            Kelola pembayaran iuran peserta
          </p>
        </div>
        <Button>
          <CreditCard className="mr-2 h-4 w-4" />
          Input Pembayaran
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari peserta..."
            value={search}
          />
        </div>

        <Select onValueChange={setPeriodYear} value={periodYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Tahun" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Select onValueChange={setPeriodMonth} value={periodMonth}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Bulan" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => {
              const month = i + 1;
              const monthNames = [
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
              return (
                <SelectItem key={month} value={month.toString()}>
                  {monthNames[i]}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Select onValueChange={setStatus} value={status}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAID">Lunas</SelectItem>
            <SelectItem value="FAILED">Gagal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isFetching ? (
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Pembayaran</TableHead>
                <TableHead>Peserta</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Denda</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center" colSpan={9}>
                    Tidak ada data pembayaran
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.paymentNumber}
                    </TableCell>
                    <TableCell>#{payment.participantId}</TableCell>
                    <TableCell>
                      {payment.periodMonth}/{payment.periodYear}
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      {!!payment.penaltyAmount && payment.penaltyAmount !== "0"
                        ? formatCurrency(payment.penaltyAmount)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(
                        calculateTotal(
                          payment.amount,
                          payment.adminFee,
                          payment.penaltyAmount
                        )
                      )}
                    </TableCell>
                    <TableCell>
                      {payment.paymentMethod === "AUTO_DEBIT" && "Auto Debit"}
                      {payment.paymentMethod === "MANUAL" && "Manual"}
                      {payment.paymentMethod === "VIRTUAL_ACCOUNT" && "VA"}
                    </TableCell>
                    <TableCell>
                      {payment.status === "PENDING" && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 font-medium text-xs text-yellow-800">
                          Pending
                        </span>
                      )}
                      {payment.status === "PAID" && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 font-medium text-green-800 text-xs">
                          Lunas
                        </span>
                      )}
                      {payment.status === "FAILED" && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 font-medium text-red-800 text-xs">
                          Gagal
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {(data?.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Halaman {data?.page} dari {data?.totalPages} ({data?.total}{" "}
                data)
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  size="sm"
                  variant="outline"
                >
                  Sebelumnya
                </Button>
                <Button
                  disabled={page === data?.totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(data?.totalPages ?? 1, p + 1))
                  }
                  size="sm"
                  variant="outline"
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
