/**
 * {@link Nameable} allows lazy thunks, but {@link named} should only wrap
 * concrete values. Callable inputs are therefore rejected by collapsing them
 * to `never`.
 */
type NonFunction<T> = T extends (...args: any[]) => unknown ? never : T

/**
 * In DSL positions that accept {@link Nameable}, the thunk itself is the
 * reusable component reference.
 *
 * Its {@link Function.name} becomes the OpenAPI component key, so pass the
 * thunk directly, for example `req.body: apply`, not `req.body: apply()`.
 * Calling the thunk materializes the underlying value and therefore forces an
 * inline schema instead of a `$ref`.
 *
 * @dsl
 */
export type NamedThunk<T> = [NonFunction<T>] extends [never]
  ? never
  : () => NonFunction<T>

export type Nameable<T> = NamedThunk<T> | NonFunction<T>

/**
 * Creates a named thunk for component reuse in DSL positions that accept
 * {@link Nameable}. Pass the returned thunk itself when you want a `$ref`.
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
