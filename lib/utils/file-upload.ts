export type UploadOptions = {
  category:
    | "kk"
    | "ktp"
    | "kitas"
    | "buku-tabungan"
    | "surat-autodebet"
    | "akta-kematian";
  onProgress?: (progress: number) => void;
};

export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", options.category);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }

  return response.json();
}

export function getFileUrl(path: string | null): string | null {
  if (!path) {
    return null;
  }
  if (path.startsWith("http")) {
    return path;
  }
  return path; // Already relative path
}
