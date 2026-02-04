'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

export default function SellerForm() {
  const { address, isConnected } = useAccount();
  const [formData, setFormData] = useState({
    farmName: '',
    location: '',
    pounds: '',
    pricePerPound: '',
    variety: '',
    roasted: false,
    harvestDate: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New listing:', { ...formData, seller: address });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    // Reset form
    setFormData({
      farmName: '',
      location: '',
      pounds: '',
      pricePerPound: '',
      variety: '',
      roasted: false,
      harvestDate: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-stone-800 mb-2">Connect Your Wallet</h3>
          <p className="text-stone-600">Please connect your wallet to list your coffee beans for sale.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-stone-800 mb-2">List Your Coffee</h2>
      <p className="text-stone-600 mb-8">Sell your locally grown coffee beans on the blockchain</p>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-semibold">✓ Listing submitted successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-stone-200 p-8">
        <div className="space-y-6">
          {/* Farm Name */}
          <div>
            <label className="block text-stone-700 font-medium mb-2">Farm Name *</label>
            <input
              type="text"
              name="farmName"
              value={formData.farmName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., Sunny Hills Coffee Farm"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-stone-700 font-medium mb-2">Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., Santa Barbara, CA"
            />
          </div>

          {/* Variety */}
          <div>
            <label className="block text-stone-700 font-medium mb-2">Coffee Variety *</label>
            <input
              type="text"
              name="variety"
              value={formData.variety}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., Caturra, Typica, Bourbon"
            />
          </div>

          {/* Harvest Date */}
          <div>
            <label className="block text-stone-700 font-medium mb-2">Harvest Date *</label>
            <input
              type="text"
              name="harvestDate"
              value={formData.harvestDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., January 2026"
            />
          </div>

          {/* Pounds */}
          <div>
            <label className="block text-stone-700 font-medium mb-2">Available Pounds *</label>
            <input
              type="number"
              name="pounds"
              value={formData.pounds}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., 50"
            />
          </div>

          {/* Price Per Pound */}
          <div>
            <label className="block text-stone-700 font-medium mb-2">Price Per Pound (USD) *</label>
            <input
              type="number"
              name="pricePerPound"
              value={formData.pricePerPound}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="e.g., 18.50"
            />
          </div>

          {/* Roasted Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="roasted"
              checked={formData.roasted}
              onChange={handleChange}
              className="w-5 h-5 text-amber-700 border-stone-300 rounded focus:ring-amber-500"
            />
            <label className="ml-3 text-stone-700 font-medium">Roasted (check if beans are roasted)</label>
          </div>

          {/* Connected Wallet Display */}
          <div className="bg-stone-50 rounded-lg p-4">
            <p className="text-stone-600 text-sm mb-1">Your Wallet Address:</p>
            <p className="text-stone-800 font-mono text-sm">{address}</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
          >
            List Coffee for Sale
          </button>
        </div>
      </form>
    </div>
  );
}