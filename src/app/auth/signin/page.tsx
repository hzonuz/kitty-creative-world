import Link from "next/link";
import { SignInForm } from "@/components/auth/SignInForm";
import { tServer } from "@/lib/preferences";

export const dynamic = "force-dynamic";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; registered?: string; error?: string };
}) {
  const callbackUrl = searchParams.callbackUrl ?? "/";
  const justRegistered = searchParams.registered === "1";
  const error = searchParams.error
    ? tServer("auth.signin.failed")
    : null;

  return (
    <div className="card space-y-5 p-6">
      <div>
        <h2 className="heading-display text-xl">{tServer("auth.signin.title")}</h2>
        <p className="mt-1 text-sm text-ink-400">
          {tServer("auth.signin.description")}
        </p>
      </div>

      {justRegistered ? (
        <p className="rounded-md border border-rune-500/40 bg-rune-500/10 px-3 py-2 text-sm text-rune-200">
          {tServer("auth.signin.registered")}
        </p>
      ) : null}

      <SignInForm
        callbackUrl={callbackUrl}
        initialError={error}
        labels={{
          identifier: tServer("auth.field.identifier"),
          password: tServer("auth.field.password"),
          submit: tServer("auth.signin.submit"),
          submitting: tServer("auth.signin.submitting"),
        }}
      />

      <p className="text-center text-sm text-ink-400">
        {tServer("auth.signin.noAccount")}{" "}
        <Link href="/auth/signup" className="text-rune-300 hover:text-rune-400">
          {tServer("auth.signin.createAccount")}
        </Link>
      </p>
    </div>
  );
}
