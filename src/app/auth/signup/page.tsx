import Link from "next/link";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { tServer } from "@/lib/preferences";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <div className="card space-y-5 p-6">
      <div>
        <h2 className="heading-display text-xl">{tServer("auth.signup.title")}</h2>
        <p className="mt-1 text-sm text-ink-400">
          {tServer("auth.signup.description")}
        </p>
      </div>

      <SignUpForm
        labels={{
          username: tServer("auth.field.username"),
          email: tServer("auth.field.email"),
          password: tServer("auth.field.password"),
          displayName: tServer("auth.field.displayName"),
          displayNameOptional: tServer("auth.field.displayNameHint"),
          submit: tServer("auth.signup.submit"),
          submitting: tServer("auth.signup.submitting"),
          passwordHint: tServer("auth.signup.passwordHint"),
        }}
      />

      <p className="text-center text-sm text-ink-400">
        {tServer("auth.signup.haveAccount")}{" "}
        <Link href="/auth/signin" className="text-rune-300 hover:text-rune-400">
          {tServer("auth.signup.signinLink")}
        </Link>
      </p>
    </div>
  );
}
