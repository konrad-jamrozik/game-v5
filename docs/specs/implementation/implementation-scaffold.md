# Implementation Scaffold

| Metadata    | Value                                                                 |
| ----------- | --------------------------------------------------------------------- |
| Spec ID     | SCAFFOLD                                                              |
| Family      | Implementation                                                        |
| Status      | Draft                                                                 |
| Binding     | Guidance                                                              |
| Audience    | Implementer                                                           |
| Owns        | A suggested set of starting files for a new Implementation directory. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)        |

# Overview

The Implementation scaffold is a minimal, framework-neutral browser page that a new
[Implementation directory](implementation-placement.md#glossary) can start from. It is built with Vite and TypeScript,
has no runtime dependencies, and shows only a placeholder heading. The UI framework, renderer, state management, and
persistence are left open, so an Implementation is suggested to replace or extend every file as it grows.

# Relationships

- Uses [Implementation Placement](implementation-placement.md)

# Scaffold files

The scaffold consists of the following files. Every path is relative to the Implementation directory, and
`<implementation-name>` stands for the Implementation name.

| Path                 | Purpose                                                                       |
| -------------------- | ----------------------------------------------------------------------------- |
| `package.json`       | Package manifest with pinned development dependencies and the npm scripts     |
| `.node-version`      | Node version for Node version managers                                        |
| `.npmrc`             | npm settings that enforce the engine versions and save exact versions         |
| `.gitignore`         | Ignore rules for installed packages and build output                          |
| `index.html`         | The page that loads the application entry point                               |
| `src/main.ts`        | The application entry point, which renders the placeholder heading            |
| `src/style.css`      | The page style                                                                |
| `vite.config.ts`     | Vite configuration; a relative base lets the build be served from any subpath |
| `tsconfig.json`      | Shared strict compiler options, referencing the two projects below            |
| `tsconfig.app.json`  | Compiler project for the browser code in `src/`                               |
| `tsconfig.node.json` | Compiler project for the Node-side configuration files                        |

After `npm install`, the scaffold is suggested to be run with `npm run dev` and checked with `npm run build`, which
type-checks every compiler project and builds into `dist/`. An Implementation is also suggested to add its own test,
lint, and format tooling, e.g. Vitest, Oxlint, and Prettier, to its own package manifest.

## package.json

```json
{
  "name": "<implementation-name>",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "packageManager": "npm@11.19.0",
  "engines": {
    "node": "^24.21.0",
    "npm": "^11.19.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "npm run typecheck && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --build"
  },
  "devDependencies": {
    "@types/node": "24.13.4",
    "typescript": "7.0.2",
    "vite": "8.3.0"
  }
}
```

## .node-version

```text
24.21.0
```

## .npmrc

```ini
engine-strict=true
save-exact=true
```

## .gitignore

```text
node_modules/
dist/
*.tsbuildinfo
```

## index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" href="data:," />
    <title>Game v5</title>
  </head>
  <body>
    <main id="app"></main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

## src/main.ts

```ts
import './style.css'

const app = document.querySelector('#app')

if (app === null) {
  throw new Error('The app root is missing.')
}

const heading = document.createElement('h1')
heading.textContent = 'Game v5'
app.append(heading)
```

## src/style.css

```css
:root {
  font-family: system-ui, sans-serif;
  color-scheme: light dark;
}

body {
  margin: 0;
}

#app {
  display: grid;
  min-height: 100svh;
  place-items: center;
}

h1 {
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 600;
}
```

## vite.config.ts

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
})
```

## tsconfig.json

```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }],
  "compilerOptions": {
    "target": "ES2025",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "moduleDetection": "force",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "isolatedModules": true,
    "noEmit": true,
    "checkJs": true,
    "strict": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "noUncheckedSideEffectImports": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": false
  }
}
```

## tsconfig.app.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2025", "DOM"],
    "types": ["vite/client"],
    "tsBuildInfoFile": "./node_modules/.cache/tsconfig.app.tsbuildinfo"
  },
  "include": ["src"]
}
```

## tsconfig.node.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2025"],
    "types": ["node"],
    "tsBuildInfoFile": "./node_modules/.cache/tsconfig.node.tsbuildinfo"
  },
  "include": ["vite.config.ts"]
}
```
