import { createAppSessionMessage, parseAnyRPCResponse,  createAuthRequestMessage,
  createAuthVerifyMessage,
  createEIP712AuthMessageSigner, createECDSAMessageSigner, createTransferMessage 
   } from '@erc7824/nitrolite';
import type { WalletClient } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
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
    amount: string; 
  }) => Promise<void>;

    authenticate: (args: {
    address: `0x${string}`;
    sessionKey: `0x${string}`;
    walletClient: WalletClient;
    scope: string;
    application: string;
    expiresAt: bigint;
    allowances: any[];
    
  }) => Promise<{ jwtToken: string }>;
  isCertified: () => boolean;
  getJwt: () => string | null;
};





export function createYellowClient(onMessage: (msg: any) => void): YellowClient {
  const sessionPrivKey = generatePrivateKey();
  const sessionAccount = privateKeyToAccount(sessionPrivKey);
  const sessionKey = sessionAccount.address as `0x${string}`;
  
  const ws = new WebSocket('wss://clearnet.yellow.com/ws');
  let jwtToken: string | null = null;
  let certified = false;
  let pendingAuthResolve: ((v: any) => void) | null = null;
  let pendingAuthReject: ((e: any) => void) | null = null;

  

ws.onopen = () => onMessage({ type: 'ws', status: 'open' });
  ws.onerror = (e) => onMessage({ type: 'ws', status: 'error', error: e });
  ws.onclose = () => onMessage({ type: 'ws', status: 'closed' });

ws.onmessage = (event) => {
  let parsed: any = null;

  try {
    parsed = parseAnyRPCResponse(event.data);
  } catch {
    onMessage(event.data);
    return;
  }

  onMessage(parsed);

  const method = parsed?.method ?? parsed?.res?.[1];
  const params = parsed?.params ?? parsed?.res?.[2];

  
  if (method === 'auth_verify') {
    if (params?.success) {
      jwtToken = params.jwtToken;
      certified = true;
      pendingAuthResolve?.({ jwtToken });
      pendingAuthResolve = null;
      pendingAuthReject = null;
    } else {
      certified = false;
      pendingAuthReject?.(new Error(params?.error ?? 'Auth verify failed'));
      pendingAuthResolve = null;
      pendingAuthReject = null;
    }
    return;
  }

  
  if (method === 'error') {
    const err = params?.error ?? 'Unknown error';
    if (pendingAuthReject) {
      pendingAuthReject(new Error(err));
      pendingAuthResolve = null;
      pendingAuthReject = null;
    }
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

      
    const messageSigner = async (m: any) => {
    const safe =
        typeof m === 'string'
        ? m
        : JSON.stringify(m); 
    if (!safe || safe.length === 0) throw new Error('Empty message passed to signer');
    return await signMessageAsync({ message: safe });
    };

      const sessionMessage = await createAppSessionMessage(messageSigner as any, [
        { definition: appDefinition, allocations },
      ]as any);

      

      ws.send(sessionMessage);
    },
    async authenticate({ address, walletClient, scope, application, expiresAt, allowances }) {
  
    const safeAllowances =
    allowances?.length ? allowances : [{ asset: 'usdc', amount: '1000000' }];
  
  const authReq = await createAuthRequestMessage({
    address,
    session_key: sessionKey,
    application,
    allowances: safeAllowances,
    expires_at: expiresAt,
    scope,
  });

  ws.send(authReq);
    return await new Promise<{ jwtToken: string }>((resolve, reject) => {
    pendingAuthResolve = resolve;
    pendingAuthReject = reject;

    const onChallenge = async (event: MessageEvent) => {
      let parsed: any;
      try {
        parsed = parseAnyRPCResponse((event as any).data);
      } catch {
        return;
      }

      const method = parsed?.method ?? parsed?.res?.[1];
      const params = parsed?.params ?? parsed?.res?.[2];

      if (method !== 'auth_challenge') return;

      const challengeMessage = params?.challengeMessage ?? params?.challenge_message;
      if (!challengeMessage) {
        ws.removeEventListener('message', onChallenge as any);
        reject(new Error('No challengeMessage in auth_challenge'));
        return;
      }

      const authParams = {
        scope,
        application,
        participant: sessionKey,
        session_key: sessionKey,
        expires_at: expiresAt,
        allowances: safeAllowances,
      };

      const eip712Signer = createEIP712AuthMessageSigner(walletClient as any, authParams as any, {
        name: application,
      });

      const verifyMsg = await createAuthVerifyMessage(eip712Signer as any, {
        ...parsed,
        params: { challengeMessage },
      } as any);

      ws.send(verifyMsg);

      
      ws.removeEventListener('message', onChallenge as any);
    };

    ws.addEventListener('message', onChallenge as any);


    setTimeout(() => {
      if (!certified && pendingAuthReject) {
        pendingAuthReject(new Error('Auth timed out'));
        pendingAuthResolve = null;
        pendingAuthReject = null;
      }
      ws.removeEventListener('message', onChallenge as any);
    }, 60000);
  });
},

isCertified() {
  return certified;
},

getJwt() {
  return jwtToken;
},
    
async sendPayment({ recipient, amount }) {
  if (ws.readyState !== WebSocket.OPEN) {
    throw new Error(`WebSocket not open (state=${ws.readyState})`);
  }

  // Use session key to sign the off-chain transfer (matches the video)
  const sessionSigner = createECDSAMessageSigner(sessionPrivKey);


      const amt = amount

      const transferMessage = await createTransferMessage(sessionSigner, {
        destination: recipient,
        allocations: [
          {
            asset: 'usdc',
            amount: amt,
          },
        ],
      }, Date.now());
      console.log('transferMessage typeof:', typeof transferMessage);
      console.log('transferMessage:', transferMessage);

      ws.send(transferMessage);

      onMessage({
  type: 'debug',
  label: 'sessionKeyUsedForTransfer',
  sessionKey,
      });
    }
}
};