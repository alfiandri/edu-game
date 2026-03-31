"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateChildSchema, type CreateChildInput } from "@/lib/types";
import { getAgeTier } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useTranslation } from "@/lib/i18n";

export default function NewChildPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateChildInput>({
    display_name: "",
    date_of_birth: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateChildInput, string>>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setErrors({});

    const result = CreateChildSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setServerError(data.error || t.parent.notAuthenticated);
      setLoading(false);
      return;
    }

    router.push("/parent/dashboard");
    router.refresh();
  };

  // Calculate preview age tier
  let previewTier = "";
  if (form.date_of_birth && /^\d{4}-\d{2}-\d{2}$/.test(form.date_of_birth)) {
    previewTier = getAgeTier(new Date(form.date_of_birth)).replace("_", " ");
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <span className="text-5xl block mb-3">👶</span>
        <h1 className="text-2xl font-bold text-gray-800">{t.parent.addChildProfile}</h1>
        <p className="text-gray-500 mt-1">
          {t.parent.createChildDesc}
        </p>
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
          id="display_name"
          label={t.parent.childName}
          placeholder={t.parent.childNamePlaceholder}
          value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          error={errors.display_name}
        />

        <Input
          id="date_of_birth"
          label={t.parent.dateOfBirth}
          type="date"
          value={form.date_of_birth}
          onChange={(e) =>
            setForm({ ...form, date_of_birth: e.target.value })
          }
          error={errors.date_of_birth}
        />

        {previewTier && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
            <p className="text-sm text-purple-700">
              <span className="font-bold">{t.parent.ageTier}:</span>{" "}
              <span className="capitalize">{previewTier}</span> — {t.parent.contentTailored}
            </p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? t.parent.creating : t.parent.createProfile}
        </Button>
      </form>
    </div>
  );
}
