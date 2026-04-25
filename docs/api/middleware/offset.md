# offset

`offset(value)` shifts floating coordinates away from the reference.

## Signature

```ts
offset(value: number)
```

## Usage

```ts
computePosition(reference, floating, {
    middleware: [offset(8), flip(), shift()],
});
```

## Notes

- positive values increase distance from the anchor side;
- place `offset` before `flip` and `shift` for predictable behavior.
