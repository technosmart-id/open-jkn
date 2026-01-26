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
          Open JKN
        </Link>
        {children}
      </div>
    </AuthBackground>
  );
}
