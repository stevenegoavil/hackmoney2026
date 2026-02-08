'use client';

interface CostBreakdown {
  method: string;
  transactionFee: number;
  settlementTime: string;
  total: number;
  color: string;
}

export default function CostComparison({ purchaseAmount }: { purchaseAmount: number }) {
  const costBreakdowns: CostBreakdown[] = [
    {
      method: 'Credit Card',
      transactionFee: 0, // 2.9% + $0.30
      settlementTime: '"Data not available at this momment"',
      total: 0,
      color: 'from-red-500 to-red-600'
    },
    {
      method: 'Wire Transfer',
      transactionFee: 0, // Flat fee
      settlementTime: '"Data not available at this momment"',
      total: 0,
      color: 'from-orange-500 to-orange-600'
    },
    {
      method: 'Standard Blockchain',
      transactionFee: 1.5, // Estimated gas fees
      settlementTime: '10-15 minutes',
      total: purchaseAmount + 1.5,
      color: 'from-blue-500 to-blue-600'
    },
    {
      method: 'Yellow Network (Per Session)',
      transactionFee: 0.50, // Minimal session fee
      settlementTime: 'Instant',
      total: purchaseAmount + 0.50,
      color: 'from-green-500 to-green-600'
    }
  ];

  const savings = costBreakdowns[0].total - costBreakdowns[3].total;
  const savingsPercent = ((savings / costBreakdowns[0].total) * 100).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-stone-800 mb-2">Cost Comparison</h2>
        <p className="text-stone-600">Purchase Amount: <span className="font-bold text-amber-700">${purchaseAmount.toFixed(2)}</span></p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {costBreakdowns.map((breakdown) => (
          <div key={breakdown.method} className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden">
            <div className={`bg-gradient-to-r ${breakdown.color} p-4 text-center`}>
              <h3 className="text-lg font-bold text-white">{breakdown.method}</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-stone-600 text-sm">Transaction Fee</p>
                  <p className="text-2xl font-bold text-stone-800">${breakdown.transactionFee.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-stone-600 text-sm">Settlement Time</p>
                  <p className="font-semibold text-stone-700">{breakdown.settlementTime}</p>
                </div>
                <div className="pt-3 border-t border-stone-200">
                  <p className="text-stone-600 text-sm">Total Cost</p>
                  <p className="text-3xl font-bold text-amber-700">${breakdown.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Savings Highlight */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold text-stone-800 mb-2">💰 You Save with Yellow Network</h3>
        <p className="text-4xl font-bold text-green-600 mb-2">${savings.toFixed(2)}</p>
        <p className="text-stone-600">That's <span className="font-bold text-green-600">{savingsPercent}% savings</span> compared to credit cards!</p>
      </div>
    </div>
  );
}