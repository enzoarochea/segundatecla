/**
 * Stand-ins for the Next.js runtime so server code runs under vitest:
 * a cookie jar per test, redirect/notFound that throw like Next does, and no-op cache calls.
 */
import { beforeEach, vi } from "vitest";

export const jar = new Map<string, string>();

export class Redirect extends Error {
  constructor(public url: string) {
    super(`NEXT_REDIRECT ${url}`);
  }
}

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined),
    set: (name: string, value: string) => void jar.set(name, value),
    delete: (name: string) => void jar.delete(name),
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Redirect(url);
  },
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

vi.mock("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  updateTag: vi.fn(),
}));

beforeEach(() => jar.clear());
