import { unknown } from "./schema.ts"
import { scope } from "./scope.ts"

const op = {
  res: {
    200: unknown(),
  },
}

scope({
  GET: op,
  POST: op,
})

// @ts-expect-error pure scopes must declare at least two HTTP methods
scope({
  GET: op,
})

scope({
  // @ts-expect-error wrapped pure scopes must declare at least two HTTP methods
  routes: {
    GET: op,
  },
})
