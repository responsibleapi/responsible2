# ResponsibleAPI

TypeScript [DSL](src/dsl/) that [compiles](src/compiler/) to OpenAPI 3.1
documents.

## Install

```sh
bun add @responsibleapi/ts
```

```sh
npm install @responsibleapi/ts
```

Requires Node `22.18.0+` for plain `node api.ts` workflows.

## Usage

```ts
import { GET, object, responsibleAPI, resp, string } from "@responsibleapi/ts"

const api = responsibleAPI({
  partialDoc: {
    openapi: "3.1.0",
    info: {
      title: "Example API",
      version: "1.0.0",
    },
  },
  routes: {
    "/hello": GET({
      res: {
        200: resp({
          description: "OK",
          body: object({
            message: string(),
          }),
        }),
      },
    }),
  },
})

console.log(JSON.stringify(api, null, 2))
```

## YAML Output

```ts
import { YAML } from "bun"
import { GET, object, responsibleAPI, resp, string } from "@responsibleapi/ts"

const api = responsibleAPI({
  partialDoc: {
    openapi: "3.1.0",
    info: {
      title: "Example API",
      version: "1.0.0",
    },
  },
  routes: {
    "/hello": GET({
      res: {
        200: resp({
          description: "OK",
          body: object({
            message: string(),
          }),
        }),
      },
    }),
  },
})

console.log(YAML.stringify(api))
```

Bun YAML docs: <https://bun.com/docs/runtime/yaml>

## Release

Canonical release flow:

- `task check`
- `task build`
- `task publish:dry-run`
- `task publish`

User-level `~/.npmrc`:

```ini
@responsibleapi:registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=${NPM_CONFIG_TOKEN}
```

Keep auth in environment or user config. Do not commit repo-local `.npmrc`.

## Development

Use `bun`
