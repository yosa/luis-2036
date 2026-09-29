// Empaqueta el API en archivos únicos: dist/server.js (local/contenedor) y
// dist/lambda.js (AWS Lambda). Todo va dentro del bundle; no hace falta
// node_modules en el despliegue.
import { build } from 'esbuild'

await build({
  entryPoints: { server: 'src/server.ts', lambda: 'src/lambda.ts' },
  outdir: 'dist',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  sourcemap: true,
  // Algunas dependencias CommonJS usan require(); en un bundle ESM hay que proveerlo.
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
})
