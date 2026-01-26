import { AuthBackground } from "@/components/auth/auth-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthBackground>
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-6">
        {children}
      </div>
    </AuthBackground>
  );
}
