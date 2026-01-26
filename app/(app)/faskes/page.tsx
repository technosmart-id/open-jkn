"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
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

export default function FacilityListPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [city, setCity] = useState<string>("all");

  const { data: healthcareFacilities, isFetching } = useQuery(
    orpc.jkn.facility.listHealthcareFacilities.queryOptions({
      input: {
        search: search || undefined,
        type: type === "all" ? undefined : type,
        city: city === "all" ? undefined : city,
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
          <h1 className="font-bold text-2xl">Fasilitas Kesehatan</h1>
          <p className="text-muted-foreground">
            Kelola data fasilitas kesehatan primer
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Faskes
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari berdasarkan nama atau kode faskes..."
            value={search}
          />
        </div>

        <Select onValueChange={setCity} value={city}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Kota/Kabupaten" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kota</SelectItem>
            <SelectItem value="JAKARTA">Jakarta</SelectItem>
            <SelectItem value="BANDUNG">Bandung</SelectItem>
            <SelectItem value="SURABAYA">Surabaya</SelectItem>
            {/* Add more cities as needed */}
          </SelectContent>
        </Select>

        <Select onValueChange={setType} value={type}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tipe Faskes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tipe</SelectItem>
            <SelectItem value="PUSKESMAS">Puskesmas</SelectItem>
            <SelectItem value="KLINIK_PRATAMA">Klinik Pratama</SelectItem>
            <SelectItem value="KLINIK_UTAMA">Klinik Utama</SelectItem>
            <SelectItem value="RS_KELAS_D">RS Kelas D</SelectItem>
            <SelectItem value="RS_KELAS_C">RS Kelas C</SelectItem>
            <SelectItem value="RS_KELAS_B">RS Kelas B</SelectItem>
            <SelectItem value="RS_KELAS_A">RS Kelas A</SelectItem>
          </SelectContent>
        </Select>
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
              <TableHead>Kode</TableHead>
              <TableHead>Nama Faskes</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Kota/Kab</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {healthcareFacilities?.length === 0 ? (
              <TableRow>
                <TableCell className="text-center" colSpan={7}>
                  Tidak ada data faskes
                </TableCell>
              </TableRow>
            ) : (
              healthcareFacilities?.map((facility) => (
                <TableRow key={facility.id}>
                  <TableCell className="font-medium">{facility.code}</TableCell>
                  <TableCell>{facility.name}</TableCell>
                  <TableCell>{facility.type}</TableCell>
                  <TableCell>{facility.city || "-"}</TableCell>
                  <TableCell>{facility.address || "-"}</TableCell>
                  <TableCell>
                    {facility.isActive ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 font-medium text-green-800 text-xs">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 font-medium text-red-800 text-xs">
                        Tidak Aktif
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
      )}
    </div>
  );
}
