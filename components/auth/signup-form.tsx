"use client";

import Link from "next/link";
import { useState } from "react";
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { signUp } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string>();

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(undefined);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsPending(false);
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsPending(false);
      return;
    }

    const response = await signUp.email({
      email,
      password,
      name,
      callbackURL: "/dashboard",
    });

    setIsPending(false);

    if (response.error) {
      setError(response.error.message || "Failed to create account");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Buat Akun Admin JKN</CardTitle>
          <CardDescription>
            Masukkan email Anda untuk membuat akun admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignUp}>
            <FieldGroup>
              {error !== undefined && (
                <FieldDescription className="text-center text-destructive">
                  {error}
                </FieldDescription>
              )}
              <Field>
                <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>
                <Input
                  disabled={isPending}
                  id="name"
                  name="name"
                  placeholder="Nama Lengkap"
                  required
                  type="text"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  disabled={isPending}
                  id="email"
                  name="email"
                  placeholder="admin@jkn.local"
                  required
                  type="email"
                />
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      disabled={isPending}
                      id="password"
                      name="password"
                      required
                      type="password"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Konfirmasi Password
                    </FieldLabel>
                    <Input
                      disabled={isPending}
                      id="confirm-password"
                      name="confirm-password"
                      required
                      type="password"
                    />
                  </Field>
                </Field>
                <FieldDescription>Minimal 8 karakter.</FieldDescription>
              </Field>
              <Field>
                <Button className="w-full" disabled={isPending} type="submit">
                  {isPending ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Creating account...
                    </>
                  ) : (
                    "Buat Akun"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  Sudah punya akun?{" "}
                  <Link className="underline underline-offset-4" href="/login">
                    Masuk
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Dengan melanjutkan, Anda menyetujui{" "}
        <Link className="underline underline-offset-4" href="/terms">
          Syarat & Ketentuan
        </Link>{" "}
        dan{" "}
        <Link className="underline underline-offset-4" href="/privacy">
          Kebijakan Privasi
        </Link>
        .
      </FieldDescription>
    </div>
  );
}
