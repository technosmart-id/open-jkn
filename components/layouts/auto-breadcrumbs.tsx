"use client";

import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Custom labels for specific path segments
const pathLabels: Record<string, string> = {
  dashboard: "Dashboard",
  settings: "Pengaturan",
  profile: "Profil",
  dev: "Developer",
  "objek-pajak": "Objek Pajak",
  sppt: "SPPT",
  pembayaran: "Pembayaran",
  laporan: "Laporan",
};

function formatSegment(segment: string): string {
  // Check for custom label first
  if (pathLabels[segment]) {
    return pathLabels[segment];
  }
  // Convert kebab-case or snake_case to Title Case
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function AutoBreadcrumbs() {
  const pathname = usePathname();

  // Split path and filter empty segments
  const segments = pathname.split("/").filter(Boolean);

  // Don't render if we're at root or only have one segment
  if (segments.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const label = formatSegment(segment);

          return (
            <Fragment key={href}>
              {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
