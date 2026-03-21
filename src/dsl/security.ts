import type { oas31 } from "openapi3-ts"
import type { Nameable } from "./nameable.ts"

type QuerySecurity = Readonly<{
  type: "apiKey"
  in: "query"
  name: string
  description?: string
}>

type HeaderSecurity = Readonly<{
  type: "apiKey"
  in: "header"
  name: string
  description?: string
}>

type OAuthScopes = Readonly<Record<string, string>>

type OAuthImplicitFlow = Readonly<{
  authorizationUrl: string
  refreshUrl?: string
  scopes: OAuthScopes
}>

type OAuthPasswordFlow = Readonly<{
  tokenUrl: string
  refreshUrl?: string
  scopes: OAuthScopes
}>

type OAuthClientCredentialsFlow = Readonly<{
  tokenUrl: string
  refreshUrl?: string
  scopes: OAuthScopes
}>

type OAuthAuthorizationCodeFlow = Readonly<{
  authorizationUrl: string
  tokenUrl: string
  refreshUrl?: string
  scopes: OAuthScopes
}>

type OAuth2Flows = Readonly<{
  implicit?: OAuthImplicitFlow
  password?: OAuthPasswordFlow
  clientCredentials?: OAuthClientCredentialsFlow
  authorizationCode?: OAuthAuthorizationCodeFlow
}>

type OAuth2Security<TFlows extends OAuth2Flows = OAuth2Flows> = Readonly<{
  type: "oauth2"
  description?: string
  flows: TFlows
}>

type SecurityScheme = Nameable<QuerySecurity | HeaderSecurity | OAuth2Security>

type OAuth2SecurityScheme = Nameable<OAuth2Security>
type NamedOAuth2SecurityScheme = Nameable<OAuth2Security>
type SecurityOperand = SecurityScheme | oas31.SecurityRequirementObject

type SecurityOperands = readonly [
  SecurityOperand,
  SecurityOperand,
  ...SecurityOperand[],
]

export type Security =
  | SecurityScheme
  | oas31.SecurityRequirementObject
  | readonly oas31.SecurityRequirementObject[]

/*
 * This unwraps {@link Nameable} so scope inference works for both inline
 * objects and named thunks.
 */
type DecodeSecurityScheme<T extends SecurityScheme> =
  T extends () => infer Value ? Value : T

/*
 * OAuth2 scopes can be declared across multiple flows, so this unions the
 * scope keys from every configured flow into one requirement-time scope set.
 */
export type OAuth2ScopeName<T extends OAuth2SecurityScheme> = Extract<
  {
    [K in keyof DecodeSecurityScheme<T>["flows"]]-?: NonNullable<
      DecodeSecurityScheme<T>["flows"][K]
    > extends Readonly<{
      scopes: infer Scopes extends OAuthScopes
    }>
      ? keyof Scopes
      : never
  }[keyof DecodeSecurityScheme<T>["flows"]],
  string
>

export const querySecurity = (param: {
  name: string
  description?: string
}): QuerySecurity => ({
  type: "apiKey",
  in: "query",
  ...param,
})

export const headerSecurity = (param: {
  name: string
  description?: string
}): HeaderSecurity => ({
  type: "apiKey",
  in: "header",
  ...param,
})

export const oauth2Security = <const TFlows extends OAuth2Flows>(param: {
  description?: string
  flows: TFlows
}): OAuth2Security<TFlows> => ({
  type: "oauth2",
  ...param,
})

function getSecuritySchemeName(scheme: SecurityScheme): string {
  if (scheme.name.length === 0) {
    throw new Error(
      "security requirements need a named scheme; use a named function or named()",
    )
  }

  return scheme.name
}

function toSecurityRequirement(
  security: SecurityOperand,
): oas31.SecurityRequirementObject {
  if (typeof security === "function") {
    return { [getSecuritySchemeName(security)]: [] }
  }

  return security
}

export function oauth2Requirement<T extends NamedOAuth2SecurityScheme>(
  scheme: T,
  scopes: readonly OAuth2ScopeName<T>[],
): oas31.SecurityRequirementObject {
  return {
    [getSecuritySchemeName(scheme)]: [...scopes],
  }
}

export const securityAND = (
  ...items: SecurityOperands
): oas31.SecurityRequirementObject => {
  const merged: oas31.SecurityRequirementObject = {}

  for (const item of items) {
    for (const [scheme, scopes] of Object.entries(
      toSecurityRequirement(item),
    )) {
      const existingScopes = merged[scheme] ?? []
      const nextScopes = scopes.filter(scope => !existingScopes.includes(scope))

      merged[scheme] = [...existingScopes, ...nextScopes]
    }
  }

  return merged
}

export const securityOR = (
  ...items: SecurityOperands
): readonly [
  oas31.SecurityRequirementObject,
  oas31.SecurityRequirementObject,
  ...oas31.SecurityRequirementObject[],
] => {
  const [first, second, ...rest] = items

  return [
    toSecurityRequirement(first),
    toSecurityRequirement(second),
    ...rest.map(toSecurityRequirement),
  ]
}
