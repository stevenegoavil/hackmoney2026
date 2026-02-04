'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Navbar */}
      <nav className="border-b border-amber-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">☕</span>
              <h1 className="text-xl font-bold text-amber-900">Coffee Trade</h1>
            </div>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-amber-900 mb-4">
            Trade Coffee Beans on Blockchain
          </h2>
          <p className="text-xl text-amber-700 max-w-2xl mx-auto">
            Compare traditional trading costs with Yellow Network's session-based payments. 
            Lower fees, instant settlement.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-amber-100">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-amber-900 mb-2">Lower Fees</h3>
            <p className="text-amber-700">
              Session-based payments reduce transaction costs compared to traditional methods.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-amber-100">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-amber-900 mb-2">Instant Settlement</h3>
            <p className="text-amber-700">
              No waiting days for payments to clear. Trade happens in real-time.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-amber-100">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-amber-900 mb-2">Transparent</h3>
            <p className="text-amber-700">
              Every transaction is recorded on-chain for full transparency.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg">
            Start Trading Coffee
          </button>
        </div>
      </main>
    </div>
  );
}