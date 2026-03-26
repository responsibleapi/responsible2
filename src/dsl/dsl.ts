import type { oas31 } from "openapi3-ts"
import type { Routes, ScopeOpts } from "./scope.ts"

/**
 * See other @dsl JSDocs to understand why we omit `#/components/`
 *
 * @dsl
 */
type PartialDoc = Partial<Omit<oas31.OpenAPIObject, "components">>

interface ResponsibleAPI {
  partialDoc: PartialDoc
  forAll: ScopeOpts
  routes: Routes
}

export function responsibleAPI(_api: ResponsibleAPI): oas31.OpenAPIObject {
  throw new Error("TODO")
}
