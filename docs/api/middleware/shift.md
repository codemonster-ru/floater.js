# shift

`shift(params?)` keeps the floating element inside visible bounds.

## Signature

```ts
shift(params?: { parent?: HTMLElement })
```

## Usage

```ts
computePosition(reference, floating, {
    middleware: [offset(8), flip(), shift()],
});
```

## Notes

- without `parent`, bounds are resolved from scroll parents and viewport;
- with `parent`, clamping uses that container explicitly.
