export function typesafeLowercase<S extends string>(s: S): Lowercase<S> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return s.toLowerCase() as Lowercase<S>
}
