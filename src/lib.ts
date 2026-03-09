export function typesafeLowercase<S extends string>(s: S): Lowercase<S> {
  return s.toLowerCase() as Lowercase<S>
}
