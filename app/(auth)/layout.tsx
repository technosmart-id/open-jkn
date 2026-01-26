import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { AuthBackground } from "@/components/auth/auth-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthBackground>
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
    </AuthBackground>
  );
}
