"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, Wallet } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function BankListPage() {
  const [search, setSearch] = useState("");

  const { data: banks, isFetching } = useQuery(
    orpc.jkn.participant.list.queryOptions({
      input: {
        search: search || undefined,
        limit: 100,
      },
    })
  );

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Bank & Rekening</h1>
          <p className="text-muted-foreground">
            Kelola informasi rekening bank dan virtual account peserta
          </p>
        </div>
        <Button>
          <Wallet className="mr-2 h-4 w-4" />
          Tambah Rekening
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari peserta..."
            value={search}
          />
        </div>
      </div>

      {/* Table */}
      {isFetching ? (
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Peserta</TableHead>
              <TableHead>No. BPJS</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>No. Rekening</TableHead>
              <TableHead>Atas Nama</TableHead>
              <TableHead>No. VA</TableHead>
              <TableHead>Auto Debit</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banks?.data.length === 0 ? (
              <TableRow>
                <TableCell className="text-center" colSpan={8}>
                  Tidak ada data rekening
                </TableCell>
              </TableRow>
            ) : (
              banks?.data.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-medium">
                    {participant.fullName}
                  </TableCell>
                  <TableCell>{participant.bpjsNumber}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-800 text-xs">
                      Tidak Aktif
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">
                      Kelola
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
