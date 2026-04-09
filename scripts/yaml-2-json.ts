#!/usr/bin/env bun
import Bun from "bun"

const [inputPath, outputPath] = Bun.argv.slice(2)

if (!inputPath || !outputPath) {
  console.error("Usage: bun scripts/yaml-2-json.ts <input.yaml> <output.json>")
  process.exit(1)
}

const input = await Bun.file(inputPath).text()
const output = `${JSON.stringify(Bun.YAML.parse(input), null, 2)}\n`

await Bun.file(outputPath).write(output)
