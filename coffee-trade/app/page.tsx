'use client';

import { useState, useRef, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import CostComparison from './components/CostComparison';
import SellerForm from './components/SellerForm';
import { useAccount, useSignMessage, useWalletClient, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { createYellowClient } from './lib/yellowClient'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import CoffeeMarketplace, { type CoffeeListing } from './components/CoffeeMarketplace_oh';






export default function Home() {
  //yellow
  type WsStatus = 'connecting' | 'open' | 'closed' | 'error';
  const safeStringify = (obj: any) =>
  JSON.stringify(obj, (_key, value) => (typeof value === 'bigint' ? value.toString() : value));
  const [listings, setListings] = useState<CoffeeListing[]>([]);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'sell'>('marketplace');
  const { writeContractAsync } = useWriteContract();
  const [yellowWsStatus, setYellowWsStatus] = useState<WsStatus>('connecting');
  const [yellowJwt, setYellowJwt] = useState<string | null>(null);
  const [yellowUsdc, setYellowUsdc] = useState<string>('0'); // best-effort
  const [yellowLastError, setYellowLastError] = useState<string | null>(null);
  const [yellowSessionKey, setYellowSessionKey] = useState<string | null>(null);

  const [yellowCertified, setYellowCertified] = useState(false);
  const [yellowCertError, setYellowCertError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: walletClient} = useWalletClient();

  const [yellowLog, setYellowLog] = useState<string[]>([]);
  const yellowRef = useRef<ReturnType<typeof createYellowClient> | null>(null);


useEffect(() => {
  if (!yellowRef.current) {
    yellowRef.current = createYellowClient((msg) => {
      // log
      setYellowLog((prev) =>
        [`${new Date().toLocaleTimeString()} ${safeStringify(msg)}`, ...prev].slice(0, 8)
      );

      // WS status
      if (msg?.type === 'ws') {
        if (msg.status === 'open') setYellowWsStatus('open');
        else if (msg.status === 'closed') setYellowWsStatus('closed');
        else if (msg.status === 'error') setYellowWsStatus('error');
        return;
      }

      // Auth success
      if (msg?.method === 'auth_verify' && msg?.params?.success) {
        setYellowJwt(msg.params.jwtToken ?? null);
        setYellowLastError(null);
        setYellowCertified(true);
        if (msg.params.sessionKey) setYellowSessionKey(msg.params.sessionKey);
      }

      // Node error
      if (msg?.method === 'error') {
        setYellowLastError(msg?.params?.error ?? 'Unknown Yellow error');
      }

      // Balance updates
      if (msg?.method === 'bu') {
        const updates = msg?.params?.balanceUpdates ?? [];
        for (const u of updates) {
          const asset = (u?.asset ?? u?.symbol ?? u?.token)
            ?.toString()
            ?.toLowerCase();
          if (asset === 'usdc') {
            const amt = u?.amount ?? u?.balance ?? u?.delta;
            if (amt != null) setYellowUsdc(String(amt));
          }
        }
      }

      // Debug
      if (msg?.type === 'debug' && msg?.label === 'sessionKeyUsedForTransfer') {
        setYellowSessionKey(msg.sessionKey ?? null);
      }
    });
  }

  return () => {
    try {
      yellowRef.current?.ws?.close();
    } catch {}
    yellowRef.current = null;
    setYellowWsStatus('closed');
  };
}, []);


//added this line
  useEffect(() => {
      if (!isConnected || !address || !yellowRef.current) return;
      if (yellowCertified) return;
      if (!walletClient) return;
      if (yellowCertified) return;

      (async () => {
      try {
      setYellowCertError(null);

        const APP_ID = 'coffee-trade';
        const expiresAt = BigInt(Math.floor(Date.now() / 1000) + 3600);

        const result = await yellowRef.current!.authenticate({
        
        address: address as `0x${string}`,
        walletClient,
        
        scope: 'test.app',
        application: APP_ID,
        expiresAt,
        allowances: [],
        
        } as any);



        setYellowCertified(true);

        
        if (result?.jwtToken || yellowRef.current!.isCertified()) {
        setYellowCertified(true);
        } else {
        throw new Error('Yellow auth did not return a token');
        }
        } catch (e: any) {
        setYellowCertified(false);
        setYellowCertError(e?.message ?? 'Yellow auth failed');
        }
        })();
  }, [isConnected, address, walletClient, yellowCertified]);



  const [purchaseAmount, setPurchaseAmount] = useState(925);
  const [showComparison, setShowComparison] = useState(false);
  const comparisonRef = useRef<HTMLDivElement>(null);

  

  const handlePurchaseSelect = (amount: number) => {
    setPurchaseAmount(amount);
    setShowComparison(true);
    
    setTimeout(() => {
      comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };
  
   const short = (a?: string | null) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '—');

  const mmStatus = isConnected && address ? `Connected (${short(address)})` : 'Not connected';

  const wsLabel =
    yellowWsStatus === 'open'
      ? 'Connected'
      : yellowWsStatus === 'connecting'
      ? 'Connecting…'
      : yellowWsStatus === 'error'
      ? 'Error'
      : 'Disconnected';

      const authLabel = yellowCertified || !!yellowJwt ? 'Certified' : 'Not certified'

  const erc20Abi = [
    {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    },
  ] as const;

    // -----------------------------
  // BUY LOGIC (two paths)
  // -----------------------------
  const USDC_ADDRESS =
    process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}` | undefined;

  const CHARGE_USDC_BASE = BigInt(10000); // $0.01 in 6 decimals

  const canUseYellow =
    yellowWsStatus === 'open' && (yellowCertified || !!yellowJwt) && !!yellowRef.current;

  const [buyStatus, setBuyStatus] = useState<string | null>(null);

  
 







  // NOTE: CoffeeMarketplace must call onBuy(product)
  // product must include: { name, recipient }
  const buyProduct = async (p: { recipient: `0x${string}`; name: string }) => {
    if (!address) throw new Error('Connect wallet first');

    setBuyStatus(`Buying ${p.name} for $0.01...`);

    // A) Yellow off-chain
    if (canUseYellow) {
      await yellowRef.current!.sendPayment({
        userAddress: address as `0x${string}`,
        recipient: p.recipient,
        signMessageAsync,
        amount: CHARGE_USDC_BASE.toString(), // "10000"
      } as any);

      setBuyStatus(`✅ Paid off-chain via Yellow ($0.01)`);
      return;
    }

    // B) MetaMask on-chain (USDC transfer)
    if (!USDC_ADDRESS) {
      throw new Error('Missing NEXT_PUBLIC_USDC_ADDRESS (needed for on-chain USDC payments)');
    }

    await writeContractAsync({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [p.recipient, CHARGE_USDC_BASE],
    });

    setBuyStatus(`✅ Paid on-chain via MetaMask ($0.01 USDC)`);
  };

  const createListing = yellowCertified || !!yellowJwt ? 'Certified' : 'Not certified';

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-neutral-50 to-amber-50">
      {/* Navbar */}
      <nav className="border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">☕</span>
              <h1 className="text-xl font-bold text-amber-900">CoffeeRun</h1>
            </div>
            <ConnectButton />
          </div>
        </div>
      </nav>
      {/*yellow bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 text-black">
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-semibold">MetaMask:</span>
              <span className="text-sm">{mmStatus}</span>

              <span className="text-sm font-semibold ml-4">Yellow WS:</span>
              <span className="text-sm">{wsLabel}</span>

              <span className="text-sm font-semibold ml-4">Yellow Auth:</span>
              <span className="text-sm">{authLabel}</span>

              <span className="text-sm font-semibold ml-4">USDC:</span>
              <span className="text-sm">{yellowUsdc}</span>

              <span className="text-sm font-semibold ml-4">Session Key:</span>
              <span className="text-sm">{short(yellowSessionKey)}</span>
            </div>

            <div className="flex items-center gap-2">
              {yellowLastError ? (
                <span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-2 py-1">
                  {yellowLastError}
                </span>
              ) : (
                <span className="text-xs text-stone-500"> </span>
              )}
            </div>
          </div>

          <div className="mt-2 text-xs text-stone-500">
            JWT: {yellowJwt ? 'present' : 'none'}
            {yellowCertError ? ` • Auth Error: ${yellowCertError}` : ''}
          </div>
        </div>
      </div>



      {/*display log*/}
      {/*<div className="mt-4 bg-white border border-stone-200 rounded-lg p-3 text-xs font-mono">
        {yellowLog.length === 0 ? 'No Yellow messages yet' : yellowLog.map((l, i) => <div key={i}>{l}</div>)}
      </div> */}
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

          {/*<button
            disabled={!isConnected || !address}
            onClick={async () => {
              const partnerAddress = '0x000000000000000000000000000000000000dEaD' as const;
              // $0.01 in 6 decimals
              await yellowRef.current?.sendPayment({
                userAddress: address as `0x${string}`,
                recipient: partnerAddress,
                signMessageAsync,
                amount: '10000',
            })}}
            className="bg-amber-700 text-white px-4 py-2 rounded-lg ml-2"
          >
            Send $0.01 Off-chain
          </button> */}

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

        {/*<CoffeeMarketplace onPurchaseSelect={handlePurchaseSelect} />
        <div className="text-center">
        <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg ">
            Start Trading Coffee
        </button>
        </div>
        {buyStatus && (
        <div className="mt-4 bg-white border border-stone-200 rounded-lg p-3 text-sm">
            {buyStatus}
          </div>
        )}

        <div className="text-center mt-10">
          <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg">
            Start Trading Coffee
          </button>
        </div>*/}

         {/* MAIN CONTENT: marketplace OR seller */}
        {activeTab === 'marketplace' ? (
          <CoffeeMarketplace
            listings={listings}
            onPurchaseSelect={handlePurchaseSelect}
            onBuy={buyProduct}
          />
        ) : (
          <SellerForm
            onCreateListing={(newListing) => {
              setListings((prev) => [newListing, ...prev]);
              setActiveTab('marketplace');
            }}
          />
        )}

        {buyStatus && (
          <div className="mt-4 bg-white border border-stone-200 rounded-lg p-3 text-sm">
            {buyStatus}
          </div>
        )}

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