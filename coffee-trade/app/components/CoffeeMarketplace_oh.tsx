'use client';

import { useState } from 'react';

export interface CoffeeListing {
  id: number;
  sellerAddress: `0x${string}`; // IMPORTANT: full address for payment
  farmName: string;
  location: string;
  pounds: number;
  pricePerPound: number;
  roasted: boolean;
  variety: string;
  harvestDate: string;
}

interface CoffeeMarketplaceProps {
  listings: CoffeeListing[];
  onPurchaseSelect: (amount: number) => void; // used for your CostComparison section
  onBuy: (p: { recipient: `0x${string}`; name: string }) => Promise<void>; // calls buyProduct in page.tsx
}

export default function CoffeeMarketplace({
  listings,
  onPurchaseSelect,
  onBuy,
}: CoffeeMarketplaceProps) {
  const [selectedListing, setSelectedListing] = useState<CoffeeListing | null>(null);

  const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold text-stone-800 mb-8">Available Coffee Listings</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-amber-700 to-orange-700 p-6 text-center">
              <div className="text-6xl mb-2">☕</div>
              <h3 className="text-2xl font-bold text-white">{listing.farmName}</h3>
              <p className="text-amber-100">{listing.location}</p>
            </div>

            {/* Card Body */}
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-stone-600 font-medium">Seller:</span>
                  <span className="text-stone-800 font-mono text-sm">
                    {short(listing.sellerAddress)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-stone-600 font-medium">Variety:</span>
                  <span className="text-stone-800 font-semibold">{listing.variety}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-stone-600 font-medium">Harvest:</span>
                  <span className="text-stone-800 font-semibold">{listing.harvestDate}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-stone-600 font-medium">Roasted:</span>
                  <span className={`font-semibold ${listing.roasted ? 'text-amber-700' : 'text-stone-500'}`}>
                    {listing.roasted ? 'Yes ✓' : 'Green Beans'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-stone-600 font-medium">Available:</span>
                  <span className="text-stone-800 font-semibold">{listing.pounds} lbs</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-stone-600 font-medium">Price per lb:</span>
                  <span className="text-2xl font-bold text-amber-700">${listing.pricePerPound}</span>
                </div>
              </div>

              {/* Total Price */}
              <div className="bg-stone-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-stone-600 font-medium">Total Price:</span>
                  <span className="text-3xl font-bold text-stone-800">
                    ${(listing.pounds * listing.pricePerPound).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Buy Button */}
              <button
                type="button"
                onClick={() => setSelectedListing(listing)}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Purchase Modal */}
      {selectedListing && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedListing(null)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-stone-800 mb-4">Confirm Purchase</h3>

            <div className="space-y-3 mb-6">
              <p className="text-stone-600"><strong>Farm:</strong> {selectedListing.farmName}</p>
              <p className="text-stone-600"><strong>Location:</strong> {selectedListing.location}</p>
              <p className="text-stone-600"><strong>Variety:</strong> {selectedListing.variety}</p>
              <p className="text-stone-600"><strong>Roasted:</strong> {selectedListing.roasted ? 'Yes' : 'Green Beans'}</p>
              <p className="text-stone-600"><strong>Quantity:</strong> {selectedListing.pounds} lbs</p>
              <p className="text-stone-600">
                <strong>Total:</strong> ${(selectedListing.pounds * selectedListing.pricePerPound).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const totalAmount = selectedListing.pounds * selectedListing.pricePerPound;

                  // keep your comparison UI behavior
                  onPurchaseSelect(totalAmount);

                  // ACTUAL PAYMENT: always $0.01 via Yellow if connected, else on-chain
                  await onBuy({
                    name: selectedListing.farmName,
                    recipient: selectedListing.sellerAddress,
                  });

                  setSelectedListing(null);
                }}
                className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Pay with Yellow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}