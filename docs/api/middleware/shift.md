# Shift Middleware

`shift(params?)` keeps the floating element inside visible bounds.

## Signature

```ts
shift(params?: { parent?: HTMLElement })
```

## Parameters

| Parameter | Type          | Description                                           |
| --------- | ------------- | ----------------------------------------------------- |
| `parent`  | `HTMLElement` | Optional explicit boundary element used for clamping. |

## Usage

```ts
computePosition(reference, floating, {
    middleware: [offset(8), flip(), shift()],
});
```

## Notes

- Without `parent`, bounds are resolved from scroll parents and the viewport.
- With `parent`, clamping uses that container explicitly.
- `shift` works best after `offset` and `flip`.
