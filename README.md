<div align="center">
  <img src="hashword_logo.png" alt="Hashword logo" width="400">
</div>

<h4 align="center">A terminal UI preview for a wallet and password manager.</h4>

---
## Requirements

- Node.js 22 or newer (required by Ink 8), with npm.
- An interactive terminal with keyboard input and color support.

The current app is a UI preview. Opening the vault toggles the preview state; password storage, wallet storage, and authentication are not implemented.

## Install

From a terminal:

```sh
git clone https://github.com/nickczak/Hashword-Wallet-Password-Manager.git
cd Hashword-Wallet-Password-Manager/hashword
npm ci
```

If you already have the repository, run `cd hashword` from its root, then `npm ci`. Run all remaining commands from the `hashword/` directory.

## Build

Compile the TypeScript UI to JavaScript:

```sh
npx tsc --module ESNext --moduleResolution Bundler --rootDir src --outDir dist
node -e 'require("node:fs").writeFileSync("dist/package.json", JSON.stringify({type: "module"}))'
```

These commands produce `dist/` and mark the compiled files as ES modules, as required by Ink and the UI's `import.meta.url` asset loading. The explicit compiler options override the project's current CommonJS configuration. Keep `public/assets/banner.txt` in place next to `dist/`; the UI loads it at startup.

## Run

After building, start the preview:

```sh
node --input-type=module -e 'import React from "react"; import {render} from "ink"; import App from "./dist/ui/App.js"; render(React.createElement(App));'
```

This command renders the UI directly because `src/index.tsx` is currently empty. Rebuild after editing the source, then run the command again.

| Key | Action |
| --- | --- |
| Enter | Open or lock the vault preview |
| P | Show passwords while unlocked |
| W | Show wallets while unlocked |
| Q | Quit |

The banner hides when the terminal is too small. Enlarge the window to see it.

## Current tooling limitations

There are no `npm start`, `npm run dev`, or `npm run build` scripts yet. Use the commands above. `npm test` is a placeholder that exits with an error; no automated test suite is configured.

