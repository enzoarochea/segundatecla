"use client";
/** Create / edit form. Validation runs on the server (saveLaptopAction); this only shows its answers. */
import { useActionState, type ReactNode } from "react";
import { grades, uses, type Grade, type Use } from "@/config/brand";
import { saveLaptopAction, type LaptopFormState } from "@/app/admin/actions";
import { ART_VARIANTS, STORAGE_TYPES, type LaptopFormValues } from "@/lib/validation";
import { SubmitButton } from "./controls";

const ART_LABELS: Record<(typeof ART_VARIANTS)[number], string> = {
  clasica: "Clásica",
  ultrabook: "Ultradelgada",
  convertible: "Convertible",
  gamer: "Para juegos",
};

type Props = { id?: string; initial: LaptopFormValues; notice?: string };

export function LaptopForm({ id, initial, notice }: Props) {
  const [state, action] = useActionState<LaptopFormState, FormData>(saveLaptopAction, { n: 0, message: notice, ok: Boolean(notice) });
  const v = state.values ?? initial;
  const err = state.errors ?? {};

  // Field wrapper: label, control, hint and the server's error wired with aria.
  const field = (name: keyof LaptopFormValues, label: string, control: (a: Aria) => ReactNode, hint?: string, wide?: boolean) => {
    const e = err[name];
    const describedBy = [hint && `${name}-hint`, e && `${name}-error`].filter(Boolean).join(" ") || undefined;
    return (
      <div className={wide ? "sm:col-span-2" : undefined}>
        <label className="label" htmlFor={name}>{label}</label>
        {control({ id: name, name, "aria-invalid": e ? true : undefined, "aria-describedby": describedBy })}
        {hint && <p id={`${name}-hint`} className="hint mt-1.5">{hint}</p>}
        {e && <p id={`${name}-error`} className="error">{e}</p>}
      </div>
    );
  };
  const text = (name: keyof LaptopFormValues, label: string, opts: { hint?: string; numeric?: boolean; required?: boolean; wide?: boolean; placeholder?: string } = {}) =>
    field(name, label, (a) => (
      <input {...a} className={opts.numeric ? "input num" : "input"} defaultValue={String(v[name])}
        inputMode={opts.numeric ? "decimal" : undefined} required={opts.required} placeholder={opts.placeholder} />
    ), opts.hint, opts.wide);
  const area = (name: keyof LaptopFormValues, label: string, hint?: string) =>
    field(name, label, (a) => <textarea {...a} className="input" rows={4} defaultValue={String(v[name])} />, hint, true);

  return (
    <form action={action} className="grid gap-8" noValidate>
      {id && <input type="hidden" name="id" value={id} />}
      <div role="status" aria-live="polite">
        {state.message && <p className={state.ok ? "tag tag-accent" : "error mt-0 font-semibold"}>{state.message}</p>}
      </div>

      {/* key: React resets a form after its action; remounting restores what the server sent back. */}
      <div key={state.n} className="grid gap-8">
        <fieldset className="panel grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <legend className="px-1 text-title">El equipo</legend>
          {text("brand", "Marca", { required: true, placeholder: "Lenovo" })}
          {text("model", "Modelo", { required: true, placeholder: "ThinkPad T480" })}
          {text("cpu", "Procesador", { required: true, placeholder: "Intel Core i5-8350U", wide: true })}
          {text("ramGb", "RAM (GB)", { numeric: true, required: true })}
          {text("storageGb", "Almacenamiento (GB)", { numeric: true, required: true })}
          {field("storageType", "Tipo de almacenamiento", (a) => (
            <select {...a} className="input" defaultValue={v.storageType}>
              {STORAGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          ))}
          {text("screenIn", "Pantalla (pulgadas)", { numeric: true, required: true, placeholder: "14" })}
          {text("gpu", "Tarjeta gráfica", { hint: "Dejalo vacío si es la integrada." })}
          {text("os", "Sistema operativo", { required: true })}
          {text("year", "Año", { numeric: true, hint: "Opcional." })}
        </fieldset>

        <fieldset className="panel grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <legend className="px-1 text-title">Estado y venta</legend>
          {text("priceGtq", "Precio (Q)", { numeric: true, required: true, hint: "En quetzales, sin decimales." })}
          {text("stock", "Unidades en stock", { numeric: true, required: true, hint: "Con 0 se muestra como agotada." })}
          {field("grade", "Grado estético", (a) => (
            <select {...a} className="input" defaultValue={v.grade} required>
              <option value="" disabled>Elegí un grado</option>
              {(Object.keys(grades) as Grade[]).map((g) => <option key={g} value={g}>{g}: {grades[g].label}</option>)}
            </select>
          ))}
          {text("batteryHealth", "Salud de batería (%)", { numeric: true, required: true, hint: "Capacidad actual frente a la original." })}
          <fieldset className="sm:col-span-2" aria-describedby={err.uses ? "uses-error" : undefined}>
            <legend className="label">Usos recomendados</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(uses) as Use[]).map((u) => (
                <label key={u} className="pill">
                  <input type="checkbox" name="uses" value={u} defaultChecked={v.uses.includes(u)} />
                  <span className="tick" aria-hidden="true">
                    <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5.2 4.1 7.3 8 3" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
                  </span>
                  {uses[u].label}
                </label>
              ))}
            </div>
            {err.uses && <p id="uses-error" className="error">{err.uses}</p>}
          </fieldset>
          {area("includes", "Qué incluye", "Una cosa por línea, por ejemplo: Cargador original.")}
          {area("cosmeticNotes", "Notas del estado", "Lo que alguien vería al tenerla en la mano.")}
          {area("description", "Descripción")}
        </fieldset>

        <fieldset className="panel grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <legend className="px-1 text-title">Publicación</legend>
          {field("artVariant", "Ilustración mientras no haya fotos", (a) => (
            <select {...a} className="input" defaultValue={v.artVariant}>
              {ART_VARIANTS.map((k) => <option key={k} value={k}>{ART_LABELS[k]}</option>)}
            </select>
          ))}
          <label className="flex items-center gap-3 self-end py-2">
            <input type="checkbox" name="hidden" defaultChecked={v.hidden} className="size-5 accent-accent" />
            <span>Oculta (no aparece en la tienda)</span>
          </label>
        </fieldset>
      </div>

      <div className="flex flex-wrap gap-3">
        <SubmitButton>{id ? "Guardar cambios" : "Crear laptop"}</SubmitButton>
      </div>
    </form>
  );
}

type Aria = { id: string; name: string; "aria-invalid"?: true; "aria-describedby"?: string };
