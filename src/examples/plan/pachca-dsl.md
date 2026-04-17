# Pachca DSL Proof

## Conclusion

Yes. If the target is faithful Pachca parity, the DSL/compiler needs to be
extended first.

## Proven Gaps

- Operation-level vendor extensions are used throughout `pachca.yaml`, and the
  current DSL has no place to put them.
  - `/audit_events` `GET` carries `x-paginated` and `x-requirements` at
    [pachca.yaml](./pachca.yaml#L167)
  - `/direct_url` `POST` carries `x-external-url` and `x-requirements` at
    [pachca.yaml](./pachca.yaml#L1333)
  - `x-requirements` appears 67 times in the file
  - `x-paginated` appears 14 times in the file
  - `x-external-url` appears once in the file
  - The operation DSL only admits fixed fields in
    [operation.ts](../dsl/operation.ts)
  - The compiler only emits that fixed set in
    [index.ts](../compiler/index.ts#L974)
  - There is no `extensions` field or other `x-*` escape hatch in the current
    DSL surface

## Minimal Extension Set Justified By Pachca

- Add schema-level `nullable`
- Add operation/scope-level `x-*` extension support

Without those two changes, `pachca.ts` will either lose Pachca metadata or fail
to represent parts of the schema exactly.
