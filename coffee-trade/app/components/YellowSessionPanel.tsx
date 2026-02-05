'use client';

import { YellowSession } from '../lib/yellowSession';

export default function YellowSessionPanel({
  session,
  onStart,
  onSettle,
  onClear,
}: {
  session: YellowSession | null;
  onStart: () => void;
  onSettle: () => void;
  onClear: () => void;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-stone-200 mb-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-stone-800">Yellow Session Mode</h3>
          <p className="text-stone-600 text-sm">
            Actions happen off-chain during the session. One on-chain settlement at the end.
          </p>
        </div>

        {!session ? (
          <button
            onClick={onStart}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg"
          >
            Start Session (Mock)
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onSettle}
              disabled={session.status === 'settled'}
              className="bg-green-600 disabled:bg-green-300 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg"
            >
              Settle
            </button>
            <button
              onClick={onClear}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold px-4 py-2 rounded-lg border border-stone-300"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {session && (
        <div className="mt-4 text-sm">
          <div className="flex flex-wrap gap-4 text-stone-700">
            <div><span className="font-semibold">Session:</span> {session.id}</div>
            <div><span className="font-semibold">Status:</span> {session.status}</div>
            <div><span className="font-semibold">Actions:</span> {session.actions.length}</div>
          </div>

          {session.actions.length > 0 && (
            <div className="mt-3 border-t border-stone-200 pt-3 space-y-2">
              {session.actions.map((a, idx) => (
                <div key={idx} className="flex justify-between text-stone-700">
                  <span className="font-mono">{a.type}</span>
                  <span className="text-stone-500">{new Date(a.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}