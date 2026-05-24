"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signupAction, type SignupState } from "@/app/actions/auth";

const initialState: SignupState = { ok: true };

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}

export function SignUpForm({
  labels,
}: {
  labels: {
    username: string;
    email: string;
    password: string;
    displayName: string;
    displayNameOptional: string;
    submit: string;
    submitting: string;
    passwordHint: string;
  };
}) {
  const [state, formAction] = useFormState(signupAction, initialState);
  const error = state.ok ? null : state.error;

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="signup-username">
          {labels.username}
        </label>
        <input
          id="signup-username"
          name="username"
          autoComplete="username"
          required
          minLength={3}
          maxLength={32}
          pattern="^[a-zA-Z0-9_]+$"
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="signup-email">
          {labels.email}
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input"
        />
      </div>
      <div>
        <label className="label" htmlFor="signup-password">
          {labels.password}
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="input"
        />
        <p className="mt-1 text-xs text-ink-400">{labels.passwordHint}</p>
      </div>
      <div>
        <label className="label" htmlFor="signup-display-name">
          {labels.displayName}
        </label>
        <input
          id="signup-display-name"
          name="displayName"
          maxLength={64}
          className="input"
          placeholder={labels.displayNameOptional}
        />
      </div>

      {error ? (
        <p className="rounded-md border border-ember-500/40 bg-ember-500/10 px-3 py-2 text-sm text-ember-200">
          {error}
        </p>
      ) : null}

      <SubmitButton label={labels.submit} pendingLabel={labels.submitting} />
    </form>
  );
}
