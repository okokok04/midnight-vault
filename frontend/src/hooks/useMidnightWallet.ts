import { useCallback, useEffect, useState } from 'react';
import type { MidnightAddressInfo, MidnightLaceApi, MidnightNetwork } from '../types/midnight';

export interface MidnightWalletState {
  isLaceAvailable: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  network: MidnightNetwork;
  addresses: MidnightAddressInfo | null;
  balance: { unshielded: bigint; shielded: bigint } | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (net: MidnightNetwork) => void;
}

const DEFAULT_SIMULATED_ADDRESS: MidnightAddressInfo = {
  unshieldedAddress: 'mn_unshielded1qqg8u0k92u089w2345v8d7f6z4k9a2j4m7n5p',
  shieldedAddress: 'mn_shielded1z9x8c7v6b5n4m3l2k1j0h9g8f7d6s5a4q3w2e1r',
};

export function useMidnightWallet(): MidnightWalletState {
  const [isLaceAvailable, setIsLaceAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [network, setNetwork] = useState<MidnightNetwork>('preprod');
  const [addresses, setAddresses] = useState<MidnightAddressInfo | null>(null);
  const [balance, setBalance] = useState<{ unshielded: bigint; shielded: bigint } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAvailability = () => {
      const provider = window.midnight?.mnLace ?? window.midnight?.lace;
      setIsLaceAvailable(Boolean(provider));
    };
    checkAvailability();
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const provider = window.midnight?.mnLace ?? window.midnight?.lace;
      if (provider) {
        const api: MidnightLaceApi = await provider.enable();
        const unshielded = await api.getUnshieldedAddress();
        const shielded = await api.getShieldedAddress();
        const bal = await api.getBalance();
        const net = await api.getNetworkId();

        setAddresses({
          unshieldedAddress: unshielded,
          shieldedAddress: shielded,
        });
        setBalance(bal);
        setNetwork(net);
        setIsConnected(true);
      } else {
        // Dev / Simulator mode for environments without the extension
        await new Promise((resolve) => setTimeout(resolve, 300));
        setAddresses(DEFAULT_SIMULATED_ADDRESS);
        setBalance({ unshielded: 5000000000n, shielded: 12000000000n });
        setIsConnected(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect Lace wallet');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAddresses(null);
    setBalance(null);
    setError(null);
  }, []);

  const switchNetwork = useCallback((net: MidnightNetwork) => {
    setNetwork(net);
  }, []);

  return {
    isLaceAvailable,
    isConnected,
    isConnecting,
    network,
    addresses,
    balance,
    error,
    connect,
    disconnect,
    switchNetwork,
  };
}
