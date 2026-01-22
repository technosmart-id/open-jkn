import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

// Top-level regex patterns for performance
const BPJS_NUMBER_REGEX = /(\d{4})(\d{4})(\d{4})/u;
const PHONE_NUMBER_REGEX = /(\d{4})(\d{4})(\d{4})/u;
const NIK_REGEX = /(\d{16})/u;

// Format date to Indonesian locale
export function formatDate(date: Date | string | null): string {
  if (!date) {
    return "-";
  }
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "dd MMMM yyyy", { locale: id });
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) {
    return "-";
  }
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "dd MMMM yyyy HH:mm", { locale: id });
}

// Format currency to IDR
export function formatCurrency(amount: number | string | null): string {
  if (amount === null || amount === undefined) {
    return "Rp 0";
  }
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// Format BPJS number with spaces
export function formatBpjsNumber(bpjsNumber: string | null): string {
  if (!bpjsNumber) {
    return "-";
  }
  // Format: 1234 5678 9012
  return bpjsNumber.replace(BPJS_NUMBER_REGEX, "$1 $2 $3");
}

// Format NIK (Indonesian ID number)
export function formatNik(nik: string): string {
  if (!nik) {
    return "-";
  }
  return nik.replace(NIK_REGEX, "$1");
}

// Format phone number
export function formatPhoneNumber(phone: string | null): string {
  if (!phone) {
    return "-";
  }
  // Format: 0812-3456-7890
  return phone.replace(PHONE_NUMBER_REGEX, "$1-$2-$3");
}
