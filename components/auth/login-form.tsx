"use client";

import { AlertCircle, CheckCircle2, Database, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { signIn } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

const DEMO_CREDENTIALS = {
  email: "admin@jkn.go.id",
  password: "admin123456",
} as const;

type SeedStatus =
  | "idle"
  | "migrations"
  | "admin"
  | "facilities"
  | "dental"
  | "participants"
  | "registrations"
  | "payments"
  | "changes"
  | "complete"
  | "error";

const SEED_STEPS: Array<{ key: SeedStatus; label: string }> = [
  { key: "migrations", label: "Running migrations..." },
  { key: "admin", label: "Creating admin user..." },
  { key: "facilities", label: "Seeding healthcare facilities..." },
  { key: "dental", label: "Seeding dental facilities..." },
  { key: "participants", label: "Seeding participants..." },
  { key: "registrations", label: "Seeding registrations..." },
  { key: "payments", label: "Seeding payments..." },
  { key: "changes", label: "Seeding change requests..." },
];

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isPending, setIsPending] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<SeedStatus>("idle");
  const [seedError, setSeedError] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSocialSignIn = async (provider: "google") => {
    setIsPending(true);
    setError(undefined);
    const response = await signIn.social({
      provider,
      callbackURL: "/dashboard",
    });

    setIsPending(false);

    if (response.error) {
      setError(response.error.message || "Failed to sign in");
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(undefined);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const response = await signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });

    setIsPending(false);

    if (response.error) {
      setError(response.error.message || "Invalid email or password");
    }
  };

  const fillDemoCredentials = () => {
    if (emailRef.current) {
      emailRef.current.value = DEMO_CREDENTIALS.email;
    }
    if (passwordRef.current) {
      passwordRef.current.value = DEMO_CREDENTIALS.password;
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedError(null);
    setSeedStatus("migrations");

    try {
      // Simulate progress by polling or streaming
      const response = await fetch("/api/admin/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "all" }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Seeding failed");
      }

      // For now, show each step with a delay to simulate progress
      // In a real implementation, this could use Server-Sent Events for real-time updates
      for (const step of SEED_STEPS) {
        setSeedStatus(step.key);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setSeedStatus("complete");

      // Auto-fill demo credentials after successful seeding
      setTimeout(() => {
        fillDemoCredentials();
        setIsSeeding(false);
        setSeedStatus("idle");
      }, 1000);
    } catch (err) {
      setSeedStatus("error");
      setSeedError(
        err instanceof Error ? err.message : "Failed to seed database"
      );
      setIsSeeding(false);
    }
  };

  const getCurrentStepLabel = () => {
    const step = SEED_STEPS.find((s) => s.key === seedStatus);
    return step?.label || "";
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Open JKN</CardTitle>
          <CardDescription>Aplikasi Simulasi JKN untuk edukasi</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignIn}>
            <FieldGroup>
              {/* Intentionally hidden for future use */}
              <Field className="hidden">
                <Button
                  disabled={isPending || isSeeding}
                  onClick={() => handleSocialSignIn("google")}
                  type="button"
                  variant="outline"
                >
                  <svg
                    aria-label="Google logo"
                    className="mr-2 h-4 w-4"
                    role="img"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </Button>
              </Field>
              {/* Intentionally hidden for future use */}
              <FieldSeparator className="hidden *:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              {error !== undefined && (
                <FieldDescription className="text-center text-destructive">
                  {error}
                </FieldDescription>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  disabled={isPending || isSeeding}
                  id="email"
                  name="email"
                  placeholder="admin@jkn.local"
                  ref={emailRef}
                  required
                  type="email"
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                    href="/forgot-password"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  disabled={isPending || isSeeding}
                  id="password"
                  name="password"
                  ref={passwordRef}
                  required
                  type="password"
                />
              </Field>
              <Field>
                <Button
                  className="w-full"
                  disabled={isPending || isSeeding}
                  type="submit"
                >
                  {isPending ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link className="underline underline-offset-4" href="/signup">
                    Sign up
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>

          {/* Seed Database Section */}
          <div className="mt-6 rounded-lg border bg-muted/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Database Setup</span>
            </div>

            {seedStatus === "complete" ? (
              <div className="flex items-center gap-2 text-green-600 text-sm dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Database seeded successfully!</span>
              </div>
            ) : seedStatus === "error" ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{seedError || "Seeding failed"}</span>
                </div>
                <Button
                  className="h-8 text-xs"
                  onClick={handleSeedDatabase}
                  size="sm"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            ) : isSeeding ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{getCurrentStepLabel()}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
                  <div
                    className="h-full animate-pulse bg-primary transition-all duration-300"
                    style={{
                      width: `${((SEED_STEPS.findIndex((s) => s.key === seedStatus) + 1) / SEED_STEPS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs">
                  Seed sample data for development and testing. This will create
                  facilities, participants, registrations, and payments.
                </p>
                <Button
                  className="h-8 w-full text-xs"
                  disabled={isPending}
                  onClick={handleSeedDatabase}
                  size="sm"
                  variant="outline"
                >
                  <Database className="mr-2 h-3 w-3" />
                  Seed Sample Data
                </Button>
              </div>
            )}
          </div>

          {/* Demo Credentials */}
          <div className="flex flex-col items-center gap-2">
            <Button
              className="cursor-pointer text-xs"
              disabled={isPending || isSeeding}
              onClick={fillDemoCredentials}
              size="sm"
              variant="ghost"
            >
              Demo: admin@jkn.go.id / admin123456
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Intentionally hidden for future use */}
      <FieldDescription className="hidden px-6 text-center">
        By clicking continue, you agree to our{" "}
        <Link className="underline underline-offset-4" href="/terms">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link className="underline underline-offset-4" href="/privacy">
          Privacy Policy
        </Link>
        .
      </FieldDescription>
    </div>
  );
}
