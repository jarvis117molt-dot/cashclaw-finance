import { useState, useEffect } from "react";
import { api, type WalletInfo } from "../../lib/api.js";

interface WalletStepProps {
  onNext: () => void;
}

export function WalletStep({ onNext }: WalletStepProps) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importKey, setImportKey] = useState("");
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    api.getWallet()
      .then(setWallet)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleImport() {
    if (!importKey.trim()) return;
    setImporting(true);
    setError("");
    try {
      const w = await api.importWallet(importKey.trim());
      setWallet(w);
      setImportKey("");
      setShowImport(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return <p className="text-zinc-500 text-center">Checking wallet...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Wallet</h2>
        <p className="text-sm text-zinc-400">
          Your agent needs a wallet to sign transactions on Base mainnet.
        </p>
      </div>

      {error && (
        <div className="bg-red-950 border border-red-800 rounded px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {wallet && (
        <div className="bg-zinc-900 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Address</span>
            <span className="font-mono text-zinc-200">
              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
            </span>
          </div>
          {wallet.balance && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Balance</span>
              <span className="text-zinc-200">{wallet.balance} ETH</span>
            </div>
          )}
        </div>
      )}

      {!wallet && !showImport && (
        <button
          onClick={() => setShowImport(true)}
          className="text-sm text-zinc-400 hover:text-zinc-200 underline"
        >
          Import existing private key
        </button>
      )}

      {showImport && (
        <div className="space-y-3">
          <input
            type="password"
            placeholder="0x..."
            value={importKey}
            onChange={(e) => setImportKey(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded text-sm font-medium hover:bg-zinc-200 disabled:opacity-50"
            >
              {importing ? "Importing..." : "Import"}
            </button>
            <button
              onClick={() => setShowImport(false)}
              className="px-4 py-2 text-zinc-400 text-sm hover:text-zinc-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {wallet && (
        <button
          onClick={onNext}
          className="w-full py-2.5 bg-zinc-100 text-zinc-900 rounded text-sm font-medium hover:bg-zinc-200"
        >
          Continue
        </button>
      )}
    </div>
  );
}
