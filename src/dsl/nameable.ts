/**
 * {@link Nameable} allows lazy thunks, but {@link named} should only wrap
 * concrete values. Callable inputs are therefore rejected by collapsing them
 * to `never`.
 */
type NamedValue<T> = T extends (...args: any[]) => unknown ? never : T

/**
 * this is pretty much core of this DSL. {@link Function.name} is used as
 * $ref in OpenAPI "#/components/.../$name", otherwise the value is inlined.
 *
 * This reuses {@link NamedValue} so callable values are rejected consistently
 * in both raw and thunk-wrapped forms.
 */
type NamedThunk<T> = [NamedValue<T>] extends [never]
  ? never
  : () => NamedValue<T>

export type Nameable<T> = NamedThunk<T> | NamedValue<T>

/**
 * Use this for component keys that are not valid TypeScript identifiers,
 * for example `named("_.xgafv", queryParam(...))`.
 */
export const named = <T>(
  componentName: string,
  value: NamedValue<T>,
): (() => NamedValue<T>) =>
  Object.defineProperty(() => value, "name", {
    configurable: true,
    value: componentName,
  })

const isNamed = <T>(n: Nameable<T>): n is NamedThunk<T> =>
  typeof n === "function"

function _decodeNameable<T>(n: Nameable<T>): {
  name?: string
  value: NamedValue<T>
} {
  if (isNamed(n)) {
    return { name: n.name, value: n() }
  }

  return { value: n }
}
