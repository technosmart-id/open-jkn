"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
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
import { formatBpjsNumber, formatDate } from "@/lib/utils/format";

type SegmentType =
  | "all"
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

export default function ParticipantListPage() {
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<SegmentType>("all");
  const [status, setStatus] = useState<"active" | "inactive" | "all">("all");
  const [page, setPage] = useState(1);

  const { data, isPending } = useQuery(
    orpc.jkn.participant.list.queryOptions({
      input: {
        search: search || undefined,
        segment:
          segment === "all" ? undefined : (segment as ParticipantSegment),
        status,
        page,
        limit: 10,
      },
    })
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on new search
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Peserta JKN</h1>
          <p className="text-muted-foreground">
            Kelola data peserta BPJS Kesehatan
          </p>
        </div>
        <Link href="/peserta/baru">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Peserta
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
            placeholder="Cari berdasarkan nama, nomor BPJS, atau NIK..."
            value={search}
          />
        </div>

        <Select
          onValueChange={(v) => setSegment(v as SegmentType)}
          value={segment}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Segmen Peserta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Segmen</SelectItem>
            <SelectItem value="PU_PNS_PUSAT">PNS Pusat</SelectItem>
            <SelectItem value="PU_PNS_DAERAH">PNS Daerah</SelectItem>
            <SelectItem value="PU_TNI_AD">TNI AD</SelectItem>
            <SelectItem value="PU_TNI_AL">TNI AL</SelectItem>
            <SelectItem value="PU_TNI_AU">TNI AU</SelectItem>
            <SelectItem value="PU_POLRI">POLRI</SelectItem>
            <SelectItem value="PU_BUMN">BUMN</SelectItem>
            <SelectItem value="PU_SWASTA">Swasta</SelectItem>
            <SelectItem value="PBPU">PBPU</SelectItem>
            <SelectItem value="BP">Bukan Pekerja</SelectItem>
            <SelectItem value="PENSIUNAN_PNS">Pensiunan PNS</SelectItem>
            <SelectItem value="PBI_APBN">PBI APBN</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(v: "active" | "inactive" | "all") => setStatus(v)}
          value={status}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Tidak Aktif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isPending ? (
        <div className="flex items-center justify-center p-8">
          <Spinner />
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. BPJS</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>NIK</TableHead>
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
                  <TableCell className="text-center" colSpan={8}>
                    Tidak ada data peserta
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">
                      {formatBpjsNumber(participant.bpjsNumber)}
                    </TableCell>
                    <TableCell>
                      {participant.firstName}
                      {participant.lastName && ` ${participant.lastName}`}
                    </TableCell>
                    <TableCell>{participant.identityNumber}</TableCell>
                    <TableCell>{participant.participantSegment}</TableCell>
                    <TableCell>Kelas {participant.treatmentClass}</TableCell>
                    <TableCell>
                      {participant.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 font-medium text-green-800 text-xs">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 font-medium text-red-800 text-xs">
                          Tidak Aktif
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(participant.createdAt)}</TableCell>
                    <TableCell>
                      <Link href={`/peserta/${participant.id}`}>
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
          {!!data && data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Halaman {data.page} dari {data.totalPages} ({data.total} data)
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
                  disabled={page === data.totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(data.totalPages, p + 1))
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
