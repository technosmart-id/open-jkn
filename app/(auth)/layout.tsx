import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const randomSeed = Math.random().toString(36).substring(7);

  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center gap-6 bg-center bg-cover bg-no-repeat p-6 md:p-10"
      style={{
        backgroundImage: `url(https://picsum.photos/seed/${randomSeed}/1920/1080.jpg)`,
      }}
    >
      <div className="absolute inset-0 bg-background/50" />
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
        <Link
          className="flex items-center gap-2 self-center font-medium"
          href="/"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Open JKN
        </Link>
        {children}
      </div>
    </div>
  );
}
