# frontend — React + Vite + TypeScript

Registro e inicio de sesión locales, dashboard con saldo y gráficas, y recarga de saldo con SnailPay.

```bash
npm run dev -w @snail-race/web          # http://localhost:5173
npm test -w @snail-race/web             # Vitest + Testing Library
npm run type-check -w @snail-race/web   # tsc -b (no tsc --noEmit: el tsconfig es de referencias)
npm run build -w @snail-race/web        # dist/
npm run test:e2e                        # Cypress contra el build (vite preview :4173)
```

En desarrollo, **http://localhost:5173/dev/ui** muestra el catálogo de componentes en sus estados; no entra al build de producción.

- Arquitectura y decisiones: [`docs/02-arquitectura/frontend.md`](../docs/02-arquitectura/frontend.md)
- Sistema visual: [`docs/04-diseno/sistema-visual.md`](../docs/04-diseno/sistema-visual.md)
- Autenticación y sesión: [`docs/02-arquitectura/autenticacion-y-sesion.md`](../docs/02-arquitectura/autenticacion-y-sesion.md)
- Persistencia en LocalStorage: [`docs/02-arquitectura/persistencia-localstorage.md`](../docs/02-arquitectura/persistencia-localstorage.md)
