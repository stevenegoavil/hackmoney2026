import { createAppSessionMessage, parseAnyRPCResponse, } from '@erc7824/nitrolite';

export type SignMessageAsync = (args: { message: string }) => Promise<`0x${string}`>;



export type YellowClient = {
  ws: WebSocket;
  createSession: (args: {
    userAddress: `0x${string}`;
    partnerAddress: `0x${string}`;
    signMessageAsync: SignMessageAsync;
    userAmount: string;
    partnerAmount: string;
  }) => Promise<void>;

    sendPayment: (args: {
    userAddress: `0x${string}`;
    recipient: `0x${string}`;
    signMessageAsync: SignMessageAsync;
    amount: string; // "10000" = $0.01 in 6 decimals
  }) => Promise<void>;
};





export function createYellowClient(onMessage: (msg: any) => void): YellowClient {
  const ws = new WebSocket('wss://clearnet-sandbox.yellow.com/ws');

ws.onopen = () => onMessage({ type: 'ws', status: 'open' });
  ws.onerror = (e) => onMessage({ type: 'ws', status: 'error', error: e });
  ws.onclose = () => onMessage({ type: 'ws', status: 'closed' });

  ws.onmessage = (event) => {
    try {
      const parsed = parseAnyRPCResponse(event.data);
      onMessage(parsed);
    } catch {
      onMessage(event.data);
    }
  };

  return {
    ws,

    async createSession({ userAddress, partnerAddress, signMessageAsync, userAmount, partnerAmount }) {
      const appDefinition = {
        protocol: 'coffee-trade-v1',
        participants: [userAddress, partnerAddress],
        weights: [50, 50],
        quorum: 100,
        challenge: 0,
        nonce: Date.now(),
      };

      const allocations = [
        { participant: userAddress, asset: 'usdc', amount: userAmount },
        { participant: partnerAddress, asset: 'usdc', amount: partnerAmount },
      ];

      // Adapter: SDK wants (message: string) => Promise<string>
    const messageSigner = async (m: any) => {
    const safe =
        typeof m === 'string'
        ? m
        : JSON.stringify(m); // <-- critical
    if (!safe || safe.length === 0) throw new Error('Empty message passed to signer');
    return await signMessageAsync({ message: safe });
    };

      const sessionMessage = await createAppSessionMessage(messageSigner as any, [
        { definition: appDefinition, allocations },
      ]as any);

      

      ws.send(sessionMessage);
    },
        async sendPayment({ userAddress, recipient, signMessageAsync, amount }) {
      const payload = {
        type: 'payment',
        amount,
        recipient,
        timestamp: Date.now(),
      };

      const signature = await signMessageAsync({
        message: JSON.stringify(payload),
      });

      ws.send(
        JSON.stringify({
        ...payload,
        sender: userAddress,
        signature,
        })
      );
      onMessage({
        type: 'client',
        event: 'payment_sent',
        amount,
        recipient,
     });


  },
}
};