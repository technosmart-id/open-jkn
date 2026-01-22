"use client";

import { Upload } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { uploadFile } from "@/lib/utils/file-upload";

interface DocumentUploadProps {
  category:
    | "kk"
    | "ktp"
    | "kitas"
    | "buku-tabungan"
    | "surat-autodebet"
    | "akta-kematian";
  label: string;
  value?: string;
  onChange?: (url: string) => void;
  required?: boolean;
}

export function DocumentUpload({
  category,
  label,
  value,
  onChange,
  required = false,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadFile(file, { category });
      onChange?.(result.url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload gagal. Silakan coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">
              {label}
              {required && <span className="ml-1 text-red-500">*</span>}
            </p>
            {value && (
              <p className="mt-1 text-muted-foreground text-xs">
                Dokumen telah diunggah
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              disabled={uploading}
              id={`${category}-upload`}
              onChange={handleFileChange}
              type="file"
            />
            <label htmlFor={`${category}-upload`}>
              <Button
                asChild
                disabled={uploading}
                size="sm"
                type="button"
                variant={value ? "outline" : "default"}
              >
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Mengunggah..." : value ? "Ganti" : "Unggah"}
                </span>
              </Button>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
