"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoginSchema, type LoginInput } from "@/lib/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useTranslation } from "@/lib/i18n";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [form, setForm] = useState<LoginInput>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setErrors({});

    const result = LoginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setServerError(data.error || "Login failed");
      setLoading(false);
      return;
    }

    router.push("/parent/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-4xl">🎓</span>
            <span className="text-3xl font-bold text-purple-700">{t.common.eduGame}</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{t.auth.welcomeBack}</h1>
          <p className="text-gray-500 mt-1">{t.auth.signInToAccount}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-xl p-8 space-y-5"
        >
          {serverError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {serverError}
            </div>
          )}

          <Input
            id="email"
            label={t.common.email}
            type="email"
            placeholder={t.auth.emailPlaceholder}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />

          <Input
            id="password"
            label={t.common.password}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? t.auth.signingIn : t.auth.signInButton}
          </Button>

          <p className="text-center text-sm text-gray-500">
            {t.auth.noAccount}{" "}
            <Link
              href="/auth/register"
              className="font-bold text-purple-600 hover:text-purple-700"
            >
              {t.common.signUp}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
