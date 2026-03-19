export type Assert<T extends true> = T

/**
 * `One` extends `Two`
 */
export type IsSubtypeOf<One, Two> = [One] extends [Two] ? true : false

/*
 * This compares types by checking whether they behave identically across all
 * possible generic inputs, which avoids conflating subtype checks with exact
 * equality.
 */
export type IsEqual<One, Two> =
  (<T>() => T extends One ? 1 : 2) extends <T>() => T extends Two ? 1 : 2
    ? (<T>() => T extends Two ? 1 : 2) extends <T>() => T extends One ? 1 : 2
      ? true
      : false
    : false

/*
 * This is useful for compile-time assertions that a rejected type-level branch
 * collapsed to `never`.
 */
export type IsNever<T> = [T] extends [never] ? true : false
