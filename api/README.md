# api — SnailPay (Express + TypeScript)

Pasarela de pagos **simulada**. No guarda estado ni se conecta a servicios reales.

```bash
npm run dev -w @snail-race/api     # http://localhost:3000 (tsx watch)
npm test -w @snail-race/api        # 40 pruebas (unit + HTTP con supertest)
npm run build -w @snail-race/api   # dist/server.js y dist/lambda.js (esbuild)
```

| Endpoint                    | Descripción                                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `POST /v1/snailpay/charges` | Solicita un cobro ([contrato](../docs/03-snailpay/contrato.md), [escenarios](../docs/03-snailpay/escenarios.md)) |
| `GET /v1/health`            | Salud y estado de la caída simulada                                                                              |

- Colección Postman y Newman: [`postman/`](postman/README.md) (`npm run test:postman -w @snail-race/api`)
- Arquitectura y decisiones: [`docs/02-arquitectura/api.md`](../docs/02-arquitectura/api.md)
- Variables de entorno: [`.env.example`](.env.example) y [`docs/06-operacion/ejecutar-local.md`](../docs/06-operacion/ejecutar-local.md)
