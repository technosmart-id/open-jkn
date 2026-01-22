"use client";

import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

interface FacilitySelectorProps {
  type: "primary" | "dental";
  value?: number;
  onChange?: (facilityId: number, facilityName: string) => void;
  placeholder?: string;
}

export function FacilitySelector({
  type,
  value,
  onChange,
  placeholder = "Pilih Faskes",
}: FacilitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState<string>("");

  // Call both hooks unconditionally (React hooks rule)
  const { data: healthcareFacilities, isFetching: fetchingHealthcare } =
    useQuery(
      orpc.jkn.facility.listHealthcareFacilities.queryOptions({
        input: {
          search: search || undefined,
          city: city || undefined,
          limit: 50,
        },
      })
    );

  const { data: dentalFacilities, isFetching: fetchingDental } = useQuery(
    orpc.jkn.facility.listDentalFacilities.queryOptions({
      input: {
        search: search || undefined,
        city: city || undefined,
        limit: 50,
      },
    })
  );

  // Select based on type
  const facilities =
    type === "primary" ? healthcareFacilities : dentalFacilities;
  const isFetching = type === "primary" ? fetchingHealthcare : fetchingDental;

  const selectedFacility = facilities?.find((f) => f.id === value);

  const handleSelect = (facilityId: number, facilityName: string) => {
    onChange?.(facilityId, facilityName);
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button className="w-full justify-start" variant="outline">
          {selectedFacility ? (
            <span>{selectedFacility.name}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[600px] p-0">
        <div className="border-b p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau kode faskes..."
                value={search}
              />
            </div>
            <Select onValueChange={setCity} value={city}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Kota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua</SelectItem>
                <SelectItem value="JAKARTA">Jakarta</SelectItem>
                <SelectItem value="BANDUNG">Bandung</SelectItem>
                <SelectItem value="SURABAYA">Surabaya</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
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
                  <TableHead>Kota</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!facilities || facilities.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-center" colSpan={4}>
                      Tidak ada data faskes
                    </TableCell>
                  </TableRow>
                ) : (
                  facilities.map((facility) => (
                    <TableRow key={facility.id}>
                      <TableCell className="font-medium">
                        {facility.code}
                      </TableCell>
                      <TableCell>{facility.name}</TableCell>
                      <TableCell>{facility.city || "-"}</TableCell>
                      <TableCell>
                        <Button
                          onClick={() =>
                            handleSelect(facility.id, facility.name)
                          }
                          size="sm"
                          variant="ghost"
                        >
                          Pilih
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
