# features/

Code is grouped by what it does for the business, not by what kind of file it is.
A feature owns everything it needs and exposes a small public surface through its
`index.ts`.

```
features/<feature>/
  components/   UI that belongs to this feature
  lib/          pure logic and server-side data loading for this feature
  actions/      server actions (if any)
  types.ts      types shared inside the feature
  index.ts      the ONLY thing other code may import from
```

Rules

1. `app/` holds routes only: read params, call a feature's loader, render its components.
2. Import a feature through its index (`@/features/price-finder`), never reach into its
   folders from outside.
3. Features may import from `components/ui` (design-system primitives) and `lib/`
   (cross-cutting helpers: supabase clients, formatting, auth). They should not import
   from each other's internals; if two features need the same thing, it moves to `lib/`.

Migration status

| Feature / area  | State |
| --------------- | ----- |
| `theme`         | done  |
| `price-finder`  | done  |
| `home`          | done (hero + all home sections) |
| `site-shell`    | done (header, nav, footer) |
| `quote`, `booking`, `admin` | still in `app/`, `components/quote`, `lib/actions` -- moved feature by feature in later steps |

Shared (not features): `components/ui` (design-system primitives), `components/motion`
(Reveal, GlowBackground), `components/icons` (brand icons), `lib/` (supabase clients,
pricing engine, formatting, auth).
