import type { Op } from "./operation.ts"

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "HEAD"

export function GET(_op: Op): Op {
  throw new Error("TODO")
}

export function HEAD(_op: Op): Op {
  throw new Error("TODO")
}

export function POST(op: Op): Op
export function POST(id: string, op: Op): Op
export function POST(_idOrOp: string | Op, _maybeOp?: Op): Op {
  throw new Error("TODO")
}

export function PUT(op: Op): Op
export function PUT(id: string, op: Op): Op
export function PUT(_idOrOp: string | Op, _maybeOp?: Op): Op {
  throw new Error("TODO")
}

export function DELETE(op: Op): Op
export function DELETE(id: string, op: Op): Op
export function DELETE(_idOrOp: string | Op, _maybeOp?: Op): Op {
  throw new Error("TODO")
}
