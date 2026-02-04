'use client';

import { useState, useRef } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import CoffeeMarketplace from './components/CoffeeMarketPlace';
import CostComparison from './components/CostComparison';
import SellerForm from './components/SellerForm';

export default function Home() {
 const [purchaseAmount, setPurchaseAmount] = useState(925);
  const [showComparison, setShowComparison] = useState(false);
  const comparisonRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'marketplace' | 'sell'>('marketplace');

  const handlePurchaseSelect = (amount: number) => {
    setPurchaseAmount(amount);
    setShowComparison(true);
    // Scroll to comparison after a brief delay
    setTimeout(() => {
      comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-amber-50">
      {/* Navbar */}
      <nav className="border-b border-stone-200 bg-white/80 backdrop-blur-sm">
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
          <h2 className="text-5xl font-bold text-stone-800 mb-4">
            Trade Coffee Beans on Blockchain
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Compare traditional trading costs with Yellow Network's session-based payments.
            Lower fees, instant settlement.
          </p>
        </div>

                {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'marketplace'
                ? 'bg-amber-700 text-white'
                : 'bg-white text-stone-700 border border-stone-300 hover:border-amber-700'
            }`}
          >
            Buy Coffee
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'sell'
                ? 'bg-amber-700 text-white'
                : 'bg-white text-stone-700 border border-stone-300 hover:border-amber-700'
            }`}
          >
            Sell Coffee
          </button>
        </div>

        {/* Conditional Content */}
        {activeTab === 'marketplace' ? (
          <>
            <CoffeeMarketplace onPurchaseSelect={handlePurchaseSelect} />
            {showComparison && (
              <div ref={comparisonRef} className="border-t border-stone-200 mt-16 pt-16">
                <CostComparison purchaseAmount={purchaseAmount} />
              </div>
            )}
          </>
        ) : (
          <SellerForm />
        )}

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-stone-200">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-stone-800 mb-2">Lower Fees</h3>
            <p className="text-stone-600">
              Session-based payments reduce transaction costs compared to traditional methods.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-stone-200">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-stone-800 mb-2">Instant Settlement</h3>
            <p className="text-stone-600">
              No waiting days for payments to clear. Trade happens in real-time.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-stone-200">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-stone-800 mb-2">Transparent</h3>
            <p className="text-stone-600">
              Every transaction is recorded on-chain for full transparency.
            </p>
          </div>
        </div>

        <CoffeeMarketplace onPurchaseSelect={handlePurchaseSelect} />
        <div className="text-center">
          <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg">
            Start Trading Coffee
          </button>
        </div>
        {/* Cost Comparison */}
        {showComparison && (
          <div ref={comparisonRef} className="border-t border-stone-200 mt-16 pt-16">
            <CostComparison purchaseAmount={purchaseAmount} />
          </div>
        )}
      </main>
    </div>
  );
}