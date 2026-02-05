## yellow-ts - Yellow.com Clearnet SDK for Typescript

TypeScript SDK for Yellow.com Clearnet that wraps `@erc7824/nitrolite` and uses `websocket-ts` for elegant backoff + reconnect, exposing an interface similar to `xrpl.js`.

- Works in Node.js and the browser
- Reconnects automatically with exponential backoff
- JSON-RPC-style `request` method with `id` correlation and timeouts

### Install

```bash
npm install yellow-ts
# peer deps are installed automatically as regular deps:
#   - websocket-ts
#   - @erc7824/nitrolite
```

### Usage (xrpl.js-like)

CommonJS:

```js
const { Client } = require("yellow-ts");

async function main() {
  // Defaults to wss://clearnet.yellow.com/ws if url is omitted
  const client = new Client({ url: "wss://clearnet.yellow.com/ws" })
  await client.connect();

  console.log(response);
  await client.disconnect();
}

main();
```

ESM / TypeScript:

```js
import { Client } from "yellow-ts";
import { RPCMethod, RPCResponse } from "@erc7824/nitrolite";

const client = new Client({
  // url optional; defaults to wss://clearnet.yellow.com/ws
  url: "wss://clearnet.yellow.com/ws"
});

await client.connect();

console.log('Yellow Server connected');

// Listen for all messages with switch statement
client.listen(async (message: RPCResponse) => {
  switch (message.method) {
    case RPCMethod.AuthVerify:
      console.log('Auth Verify', message);
      // Handle authentication verification
      // Example: Send a transfer after authentication
      break;
      
    case RPCMethod.Assets:
      console.log('Assets', message.params);
      break;
      
    case RPCMethod.Error:
      console.log('Error', message.params);
      break;
      
    case RPCMethod.ChannelsUpdate:
      console.log('Channels Update', message.params);
      break;
      
    case RPCMethod.BalanceUpdate:
      console.log('Balance Update', message.params);
      break;
      
    default:
      console.log('Unknown message:', message);
      break;
  }
});

await client.disconnect();
```

### API

#### WebSocket Methods

- `new Client(options?: ClientOptions)` - Options include websocket URL, timeouts, backoff settings, and optional nitrolite configuration
- `connect(): Promise<void>`
- `disconnect(code?: number, reason?: string): Promise<void>`
- `request<T = any>(request: RequestObject): Promise<T>`
- `sendMessage(message: any): Promise<T | void>` - Send a raw message over websocket. If the message contains an `id` field, awaits and returns the response with the matching id.
- `listen(event?: string, callback: Function): () => void` - Listen for messages. Returns a function to remove the listener.

#### Awaiting Responses with `sendMessage`

When you send a message that includes a request `id`, `sendMessage` will automatically wait for the corresponding response and return it:

```typescript
import { Client } from "yellow-ts";
import { createGetConfigMessage, createEIP712AuthMessageSigner } from "@erc7824/nitrolite";

const client = new Client();
await client.connect();

// Create a signed message with a request ID
const requestId = 12345;
const message = createGetConfigMessage(signer, requestId);

// sendMessage detects the id and awaits the matching response
const response = await client.sendMessage(message);
console.log(response); // Response with id: 12345
```

If the message does not contain an `id` field, `sendMessage` sends the message without waiting for a response (fire-and-forget).

On disconnect, all in-flight requests are rejected. Reconnect is automatic via `websocket-ts`.

### Node and Browser

This package targets both Node and browsers. It depends on `websocket-ts` under the hood for reconnection/backoff behavior.

### Types

Type definitions are included. `@erc7824/nitrolite` is also re-exported from the root as `nitrolite`.

### Build

```bash
npm run build
```

### Acceptance tests

These tests connect to a live Yellow clearnet websocket. By default they use `wss://clearnet.yellow.com/ws`. To run them, set `YELLOW_E2E=1` (or provide `YELLOW_WS_URL`). You can also override the command and params:

```bash
# Enable acceptance tests
export YELLOW_E2E=1

# Optional (override default URL)
export YELLOW_WS_URL="wss://clearnet.yellow.com/ws"



npm test
```

### License

MIT


