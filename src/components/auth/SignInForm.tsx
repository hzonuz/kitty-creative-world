"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export function SignInForm({
  callbackUrl,
  initialError,
  labels,
}: {
  callbackUrl: string;
  initialError: string | null;
  labels: {
    identifier: string;
    password: string;
    submit: string;
    submitting: string;
  };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(initialError);
  const [pending, start] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const identifier = String(data.get("identifier") ?? "").trim();
    const password = String(data.get("password") ?? "");

    start(async () => {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
        callbackUrl,
      });
      if (!result || result.error) {
        setError("Invalid username or password.");
        return;
      }
      router.push(result.url ?? callbackUrl);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="signin-id">
          {labels.identifier}
        </label>
        <input
          id="signin-id"
          name="identifier"
          autoComplete="username"
          required
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="signin-password">
          {labels.password}
        </label>
        <input
          id="signin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="input"
        />
      </div>

      {error ? (
        <p className="rounded-md border border-ember-500/40 bg-ember-500/10 px-3 py-2 text-sm text-ember-200">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
