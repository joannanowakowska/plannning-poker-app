# Planning Poker App

A React and Vite web app for running planning poker sessions. The frontend connects to the hosted planning poker backend over WebSocket.

## Dependencies

- Node.js 18 or newer
- npm, included with Node.js
- Internet access to the hosted backend WebSocket endpoint:
  `wss://planning-poker-backend-ymq7.onrender.com/ws`

No local backend is required for normal development.

## Install

Install JavaScript dependencies from the locked npm package set:

```bash
npm install
```

## Run Locally

Start the Vite development server:

```bash
npm run dev
```

Vite prints the local URL in the terminal, usually:

```text
http://localhost:5173/
```

Open that URL in a browser. The app creates or reads a `room` query parameter in the URL and connects to the hosted backend after a display name is entered.

## Test

Run the unit and component test suite:

```bash
npm test
```

Tests run with Vitest and jsdom.

## Build

Create a production build:

```bash
npm run build
```

This runs TypeScript project checks and outputs the bundled app to `dist/`.

## Preview Production Build

After building, serve the production output locally:

```bash
npm run preview
```

Vite prints the preview URL in the terminal.

## Useful Scripts

- `npm run dev` starts the local development server.
- `npm test` runs the Vitest suite once.
- `npm run build` type-checks and builds the app.
- `npm run preview` serves the built app locally.
