/**
 * {@link Nameable} allows lazy thunks, but {@link named} should only wrap
 * concrete values. Callable inputs are therefore rejected by collapsing them
 * to `never`.
 */
type NonFunction<T> = T extends (...args: any[]) => unknown ? never : T

/**
 * {@link Function.name} becomes `$ref` in OpenAPI
 *
 * @dsl
 */
export type NamedThunk<T> = [NonFunction<T>] extends [never]
  ? never
  : () => NonFunction<T>

export type Nameable<T> = NamedThunk<T> | NonFunction<T>

/**
 * Creates a named function on the fly. Used for illegal names like "_.xgafv"
 */
export const named = <T>(name: string, value: NonFunction<T>): NamedThunk<T> =>
  Object.defineProperty(() => value, "name", {
    configurable: true,
    value: name,
  }) as NamedThunk<T>

const isNamed = <T>(n: Nameable<T>): n is NamedThunk<T> =>
  typeof n === "function"

const _isNonFunction = <T>(n: Nameable<T>): n is NonFunction<T> =>
  typeof n !== "function"

export function decodeNameable<T>(n: Nameable<T>): {
  name?: string
  value: NonFunction<T>
} {
  if (isNamed(n)) {
    return { name: n.name, value: n() }
  }

  return { value: n }
}
