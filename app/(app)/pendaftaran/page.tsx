"use client";

import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Search } from "lucide-react";
import Link from "next/link";
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
import { formatDate } from "@/lib/utils/format";

type RegistrationStatus =
  | "all"
  | "DRAFT"
  | "VERIFIKASI"
  | "VIRTUAL_ACCOUNT_DIBUAT"
  | "MENUNGGU_PEMBAYARAN"
  | "AKTIF"
  | "DITOLAK"
  | "DIBATALKAN"
  | "KEDALUWARSA";

type RegistrationStatusEnum =
  | "DRAFT"
  | "VERIFIKASI"
  | "VIRTUAL_ACCOUNT_DIBUAT"
  | "MENUNGGU_PEMBAYARAN"
  | "AKTIF"
  | "DITOLAK"
  | "DIBATALKAN"
  | "KEDALUWARSA";

export default function RegistrationListPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RegistrationStatus>("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isFetching } = useQuery(
    orpc.jkn.registration.list.queryOptions({
      input: {
        search: search || undefined,
        status:
          status === "all" ? undefined : (status as RegistrationStatusEnum),
        page,
        limit,
      },
    })
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Pendaftaran Peserta</h1>
          <p className="text-muted-foreground">
            Kelola pendaftaran peserta BPJS Kesehatan baru
          </p>
        </div>
        <Link href="/pendaftaran/baru">
          <Button>
            <ClipboardList className="mr-2 h-4 w-4" />
            Pendaftaran Baru
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari nomor pendaftaran..."
            value={search}
          />
        </div>

        <Select
          onValueChange={(v) => setStatus(v as RegistrationStatus)}
          value={status}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="VERIFIKASI">Verifikasi</SelectItem>
            <SelectItem value="VIRTUAL_ACCOUNT_DIBUAT">VA Dibuat</SelectItem>
            <SelectItem value="MENUNGGU_PEMBAYARAN">
              Menunggu Pembayaran
            </SelectItem>
            <SelectItem value="AKTIF">Aktif</SelectItem>
            <SelectItem value="DITOLAK">Ditolak</SelectItem>
            <SelectItem value="KEDALUWARSA">Kedaluwarsa</SelectItem>
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
                <TableHead>No. Pendaftaran</TableHead>
                <TableHead>ID Peserta</TableHead>
                <TableHead>Segmen</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tgl Daftar</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center" colSpan={7}>
                    Tidak ada data pendaftaran
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">
                      {registration.applicationNumber}
                    </TableCell>
                    <TableCell>#{registration.participantId}</TableCell>
                    <TableCell>{registration.participantSegment}</TableCell>
                    <TableCell>Kelas {registration.treatmentClass}</TableCell>
                    <TableCell>
                      {registration.status === "DRAFT" && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-800 text-xs">
                          Draft
                        </span>
                      )}
                      {registration.status === "VERIFIKASI" && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-800 text-xs">
                          Verifikasi
                        </span>
                      )}
                      {registration.status === "VIRTUAL_ACCOUNT_DIBUAT" && (
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 font-medium text-purple-800 text-xs">
                          VA Dibuat
                        </span>
                      )}
                      {registration.status === "MENUNGGU_PEMBAYARAN" && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 font-medium text-xs text-yellow-800">
                          Menunggu Pembayaran
                        </span>
                      )}
                      {registration.status === "AKTIF" && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 font-medium text-green-800 text-xs">
                          Aktif
                        </span>
                      )}
                      {registration.status === "DITOLAK" && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 font-medium text-red-800 text-xs">
                          Ditolak
                        </span>
                      )}
                      {registration.status === "KEDALUWARSA" && (
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 font-medium text-orange-800 text-xs">
                          Kedaluwarsa
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(registration.createdAt)}</TableCell>
                    <TableCell>
                      <Link href={`/pendaftaran/${registration.id}`}>
                        <Button size="sm" variant="ghost">
                          Detail
                        </Button>
                      </Link>
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
