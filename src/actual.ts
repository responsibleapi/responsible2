import { oas30 } from "openapi3-ts"
import type { Mime, Response } from "./responsible.ts"
import type { Schema } from "./schema.ts"

interface ScopeReq {
  mime: Mime
}

interface StatusMatch {
  mime: Mime
  headers: Record<string, Schema>
}

interface ScopeRes {
  match: Record<string, StatusMatch>
  add: Record<number, Response>
}

interface RealReq {}

interface RealRes {}

export interface Route {
  id?: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  req: ScopeReq
  res: ScopeRes
}

type ScopeOrRoute = Route | Scope

type Routes = Record<`/${string}`, ScopeOrRoute>

interface ScopeOpts {
  req: ScopeReq
  res: ScopeRes
}

interface Scope {
  opts: ScopeOpts
  routes: Routes
}

export const scope = (opts: ScopeOpts, routes: Routes): Scope => ({
  opts,
  routes,
})

function scopeToPaths(s: Scope): oas30.PathsObject {
  throw new Error("TODO")
}

export function responsibleAPI(
  doc: Partial<oas30.OpenAPIObject>,
  opts: ScopeOpts,
  routes: Routes,
): oas30.OpenAPIObject {
  const s = scope(opts, routes)

  return {
    ...doc,
    paths: scopeToPaths(s),
  }
}
