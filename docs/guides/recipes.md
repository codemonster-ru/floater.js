# Recipes

Production-ready patterns for common UI scenarios.

## Tooltip

```ts
computePosition(reference, floating, {
    placement: 'top',
    middleware: [offset(8), flip(), shift(), arrow(arrowEl)],
}).then(({ x, y, middlewareData }) => {
    floating.style.left = `${x}px`;
    floating.style.top = `${y}px`;

    if (middlewareData.arrow) {
        arrowEl.style.left = `${middlewareData.arrow.x}px`;
        arrowEl.style.top = `${middlewareData.arrow.y}px`;
    }
});
```

## Dropdown

```ts
computePosition(button, menu, {
    placement: 'bottom-start',
    middleware: [offset(6), flip({ placements: ['bottom-start', 'top-start'] }), shift()],
});
```

## Context Menu (VirtualElement)

```ts
const pointRef = {
    offsetTop: event.clientY,
    offsetLeft: event.clientX,
    getBoundingClientRect() {
        return {
            x: event.clientX,
            y: event.clientY,
            width: 0,
            height: 0,
            top: event.clientY,
            right: event.clientX,
            bottom: event.clientY,
            left: event.clientX,
        };
    },
};

computePosition(pointRef, menu, {
    placement: 'right-start',
    middleware: [offset(4), flip(), shift()],
});
```

## Fixed Portal Popover

```ts
floating.style.position = 'fixed';
document.body.appendChild(floating);

computePosition(reference, floating, {
    strategy: 'fixed',
    placement: 'bottom',
    middleware: [offset(8), flip(), shift()],
});
```

## Reactive Updates

```ts
const update = () => {
    computePosition(reference, floating, {
        placement: 'bottom',
        middleware: [offset(8), flip(), shift()],
    }).then(({ x, y }) => {
        floating.style.left = `${x}px`;
        floating.style.top = `${y}px`;
    });
};

const cleanup = autoUpdate(reference, update, floating);
update();

// ...
cleanup();
```
