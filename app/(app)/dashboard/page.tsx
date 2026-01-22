"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, ClipboardCheck, CreditCard, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        ) : (
          <div className="font-bold text-2xl">{value}</div>
        )}
        <p className="text-muted-foreground text-xs">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  // Fetch statistics - all run in parallel
  const { data: participants, isFetching: participantsLoading } = useQuery(
    orpc.jkn.participant.list.queryOptions({
      input: {
        limit: 1,
      },
    })
  );

  const { data: registrations, isFetching: registrationsLoading } = useQuery(
    orpc.jkn.registration.list.queryOptions({
      input: {
        limit: 5,
      },
    })
  );

  const { data: payments, isFetching: paymentsLoading } = useQuery(
    orpc.jkn.payment.list.queryOptions({
      input: {
        limit: 1,
      },
    })
  );

  const { data: changeRequests, isFetching: changesLoading } = useQuery(
    orpc.jkn.changeRequest.list.queryOptions({
      input: {
        limit: 5,
      },
    })
  );

  const totalParticipants = participants?.total ?? 0;
  const pendingRegistrations = registrations?.total ?? 0;
  const pendingPayments = payments?.total ?? 0;
  const pendingChanges = changeRequests?.total ?? 0;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h1 className="font-bold text-3xl">Dashboard JKN</h1>
        <p className="text-muted-foreground">Sistem Informasi BPJS Kesehatan</p>
      </div>

      {/* Statistics Cards - show immediately with individual loading states */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          isLoading={participantsLoading}
          subtitle="Peserta terdaftar aktif"
          title="Total Peserta Aktif"
          value={totalParticipants}
        />
        <StatCard
          icon={ClipboardCheck}
          isLoading={registrationsLoading}
          subtitle="Menunggu verifikasi"
          title="Pendaftaran Pending"
          value={pendingRegistrations}
        />
        <StatCard
          icon={CreditCard}
          isLoading={paymentsLoading}
          subtitle="Menunggu pembayaran"
          title="Pembayaran Pending"
          value={pendingPayments}
        />
        <StatCard
          icon={Activity}
          isLoading={changesLoading}
          subtitle="Permohonan pending"
          title="Perubahan Data"
          value={pendingChanges}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Registrations */}
        <Card>
          <CardHeader>
            <CardTitle>Pendaftaran Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {registrationsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    className="h-12 w-full animate-pulse rounded bg-muted"
                    key={i}
                  />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Pendaftaran</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations?.data.length === 0 ? (
                    <TableRow>
                      <TableCell className="text-center" colSpan={3}>
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  ) : (
                    registrations?.data.slice(0, 5).map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-medium">
                          {reg.applicationNumber}
                        </TableCell>
                        <TableCell>
                          {reg.status === "DRAFT" && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-800 text-xs">
                              Draft
                            </span>
                          )}
                          {reg.status === "VERIFIKASI" && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-800 text-xs">
                              Verifikasi
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(reg.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Change Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Permohonan Perubahan</CardTitle>
          </CardHeader>
          <CardContent>
            {changesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    className="h-12 w-full animate-pulse rounded bg-muted"
                    key={i}
                  />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changeRequests?.data.length === 0 ? (
                    <TableRow>
                      <TableCell className="text-center" colSpan={3}>
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  ) : (
                    changeRequests?.data.slice(0, 5).map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">#{req.id}</TableCell>
                        <TableCell>{req.changeType}</TableCell>
                        <TableCell>
                          {req.status === "PENDING" && (
                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 font-medium text-xs text-yellow-800">
                              Pending
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
