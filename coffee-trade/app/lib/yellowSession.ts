export type SessionAction =
  | { type: 'BUY'; listingId: string; amountUsd: number; timestamp: number }
  | { type: 'CONFIRM_DELIVERY'; listingId: string; timestamp: number };

export type YellowSession = {
  id: string;
  startedAt: number;
  actions: SessionAction[];
  status: 'idle' | 'active' | 'settled';
};

export function createMockSession(): YellowSession {
  return {
    id: `ys_${Math.random().toString(16).slice(2)}`,
    startedAt: Date.now(),
    actions: [],
    status: 'active',
  };
}

export function addAction(session: YellowSession, action: SessionAction): YellowSession {
  return { ...session, actions: [...session.actions, action] };
}

export function settleMockSession(session: YellowSession): YellowSession {
  return { ...session, status: 'settled' };
}