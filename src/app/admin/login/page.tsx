import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="mx-auto grid max-w-sm gap-6 py-6 sm:py-12">
      <div>
        <h1 className="text-section">Entrar a la administración</h1>
        <p className="mt-2 text-ink-2">Usá el correo y la contraseña del archivo .env.</p>
      </div>
      <LoginForm />
    </div>
  );
}
