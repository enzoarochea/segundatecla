"use client";
import Image from "next/image";
import { useActionState } from "react";
import {
  makeCoverAction,
  removePhotoAction,
  updateAltAction,
  uploadPhotosAction,
  type PhotoState,
} from "@/app/admin/actions";
import { MAX_PHOTOS } from "@/lib/validation";
import { ConfirmForm, SubmitButton } from "./controls";

type Photo = { id: string; url: string; alt: string };

function Status({ state, id }: { state: PhotoState; id: string }) {
  return <p id={id} role="status" className={state.error ? "error" : "hint mt-1.5"}>{state.message}</p>;
}

function AltForm({ photo }: { photo: Photo }) {
  const [state, action] = useActionState<PhotoState, FormData>(updateAltAction, { n: 0 });
  const fid = `alt-${photo.id}`;
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="imageId" value={photo.id} />
      <label className="label mb-0" htmlFor={fid}>Descripción de la foto</label>
      <input key={state.n} id={fid} name="alt" className="input" maxLength={160} defaultValue={photo.alt}
        aria-describedby={`${fid}-msg`} aria-invalid={state.error || undefined} />
      <div><SubmitButton className="btn btn-secondary btn-sm">Guardar descripción</SubmitButton></div>
      <Status state={state} id={`${fid}-msg`} />
    </form>
  );
}

export function PhotoManager({ laptopId, photos }: { laptopId: string; photos: Photo[] }) {
  const [state, upload] = useActionState<PhotoState, FormData>(uploadPhotosAction, { n: 0 });
  const full = photos.length >= MAX_PHOTOS;
  return (
    <section aria-labelledby="fotos" className="panel grid gap-6 p-5 sm:p-6">
      <div>
        <h2 id="fotos" className="text-title">Fotos</h2>
        <p className="hint mt-1">
          {photos.length} de {MAX_PHOTOS}. La primera es la portada. Sin fotos, la tienda muestra la ilustración.
        </p>
      </div>

      {photos.length > 0 && (
        <ul className="grid gap-5 sm:grid-cols-2">
          {photos.map((p, i) => (
            <li key={p.id} className="grid gap-3">
              <div className="thumb relative aspect-[4/3] overflow-hidden">
                <Image src={p.url} alt={p.alt || "Foto sin descripción"} fill sizes="(min-width: 640px) 40vw, 100vw" className="object-cover" />
              </div>
              {i === 0 ? (
                <p className="tag tag-accent w-fit">Portada</p>
              ) : null}
              <AltForm photo={p} />
              <div className="flex flex-wrap gap-2">
                {i > 0 && (
                  <form action={makeCoverAction}>
                    <input type="hidden" name="imageId" value={p.id} />
                    <SubmitButton className="btn btn-secondary btn-sm" pendingText="Cambiando">Usar como portada</SubmitButton>
                  </form>
                )}
                <ConfirmForm action={removePhotoAction} fields={{ imageId: p.id }} question="¿Quitar esta foto? No se puede deshacer." pendingText="Quitando">
                  Quitar foto
                </ConfirmForm>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form action={upload} className="grid gap-4 border-t border-rule pt-5">
        <input type="hidden" name="id" value={laptopId} />
        <div>
          <label className="label" htmlFor="photos">Subir fotos</label>
          <input id="photos" name="photos" type="file" multiple accept="image/jpeg,image/png,image/webp" className="input py-2"
            disabled={full} aria-describedby="photos-hint upload-msg" />
          <p id="photos-hint" className="hint mt-1.5">JPG, PNG o WebP, hasta 5 MB cada una. Fotos reales del equipo, con buena luz.</p>
        </div>
        <div>
          <label className="label" htmlFor="new-alt">Descripción para las fotos nuevas</label>
          <input id="new-alt" name="alt" className="input" maxLength={160} placeholder="Tapa cerrada, vista de frente" disabled={full} />
        </div>
        <div><SubmitButton className="btn btn-secondary" pendingText="Subiendo">{full ? "Llegaste al máximo" : "Subir fotos"}</SubmitButton></div>
        <Status state={state} id="upload-msg" />
      </form>
    </section>
  );
}
