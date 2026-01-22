"use client";

import { useQuery } from "@tanstack/react-query";
import { FileEdit } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { CHANGE_TYPES } from "@/lib/utils/constants";
import { formatDate } from "@/lib/utils/format";

export default function ChangeRequestListPage() {
  const [changeType, setChangeType] = useState<
    | "all"
    | "ALAMAT"
    | "TEMPAT_KERJA"
    | "GOLONGAN_KEPANGKATAN"
    | "GAJI"
    | "FASKES"
    | "PENSIUN"
    | "KEMATIAN"
    | "DATA_KELUARGA"
    | "NAMA"
  >("all");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isFetching } = useQuery(
    orpc.jkn.changeRequest.list.queryOptions({
      input: {
        changeType:
          changeType === "all"
            ? undefined
            : (changeType as
                | "ALAMAT"
                | "TEMPAT_KERJA"
                | "GOLONGAN_KEPANGKATAN"
                | "GAJI"
                | "FASKES"
                | "PENSIUN"
                | "KEMATIAN"
                | "DATA_KELUARGA"
                | "NAMA"),
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
          <h1 className="font-bold text-2xl">Perubahan Data Peserta</h1>
          <p className="text-muted-foreground">
            Kelola permohonan perubahan data peserta
          </p>
        </div>
        <Link href="/perubahan/baru">
          <Button>
            <FileEdit className="mr-2 h-4 w-4" />
            Buat Permohonan
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select
          onValueChange={(v) => setChangeType(v as typeof changeType)}
          value={changeType}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Jenis Perubahan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Jenis</SelectItem>
            {Object.entries(CHANGE_TYPES).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setStatus} value={status}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
            <SelectItem value="APPROVED">Disetujui</SelectItem>
            <SelectItem value="REJECTED">Ditolak</SelectItem>
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
                <TableHead>ID Peserta</TableHead>
                <TableHead>Jenis Perubahan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tgl Permohonan</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center" colSpan={5}>
                    Tidak ada data permohonan
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      #{request.participantId}
                    </TableCell>
                    <TableCell>
                      {CHANGE_TYPES[request.changeType] || request.changeType}
                    </TableCell>
                    <TableCell>
                      {request.status === "PENDING" && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 font-medium text-xs text-yellow-800">
                          Pending
                        </span>
                      )}
                      {request.status === "VERIFIED" && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-800 text-xs">
                          Terverifikasi
                        </span>
                      )}
                      {request.status === "APPROVED" && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 font-medium text-green-800 text-xs">
                          Disetujui
                        </span>
                      )}
                      {request.status === "REJECTED" && (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 font-medium text-red-800 text-xs">
                          Ditolak
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                    <TableCell>
                      <Link href={`/perubahan/${request.id}`}>
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
