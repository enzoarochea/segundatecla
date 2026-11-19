"use client";
import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";
import { SubmitButton } from "./controls";

export function LoginForm() {
  const [state, action] = useActionState<LoginState, FormData>(loginAction, {});
  const invalid = state.error ? true : undefined;
  return (
    <form action={action} className="panel grid gap-5 p-5 sm:p-6">
      <div>
        <label className="label" htmlFor="email">Correo</label>
        <input key={state.email} id="email" name="email" type="email" autoComplete="username" className="input" required
          defaultValue={state.email} aria-invalid={invalid} aria-describedby={invalid && "login-error"} />
      </div>
      <div>
        <label className="label" htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password" className="input" required
          aria-invalid={invalid} aria-describedby={invalid && "login-error"} />
      </div>
      <div role="alert">{state.error && <p id="login-error" className="error mt-0">{state.error}</p>}</div>
      <SubmitButton pendingText="Entrando">Entrar</SubmitButton>
    </form>
  );
}
