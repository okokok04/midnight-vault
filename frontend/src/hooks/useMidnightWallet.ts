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
  laceApi: MidnightLaceApi | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (net: MidnightNetwork) => void;
}

export function useMidnightWallet(): MidnightWalletState {
  const [isLaceAvailable, setIsLaceAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [network, setNetwork] = useState<MidnightNetwork>('preprod');
  const [addresses, setAddresses] = useState<MidnightAddressInfo | null>(null);
  const [balance, setBalance] = useState<{ unshielded: bigint; shielded: bigint } | null>(null);
  const [laceApi, setLaceApi] = useState<MidnightLaceApi | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const checkAvailability = async () => {
      const provider = window.midnight?.mnLace ?? window.midnight?.lace;
      const available = Boolean(provider);
      if (!active) return;
      setIsLaceAvailable(available);

      if (provider) {
        try {
          const enabled = await provider.isEnabled();
          if (enabled && active) {
            const api: MidnightLaceApi = await provider.enable();
            if (!active) return;
            const unshielded = await api.getUnshieldedAddress();
            const shielded = await api.getShieldedAddress();
            const bal = await api.getBalance();
            const net = (await api.getNetworkId?.()) || 'preprod';

            setLaceApi(api);
            setAddresses({
              unshieldedAddress: unshielded,
              shieldedAddress: shielded,
            });
            setBalance(bal);
            setNetwork(net as MidnightNetwork);
            setIsConnected(true);
          }
        } catch {
          // Extension not authorized yet
        }
      }
    };
    checkAvailability();
    return () => {
      active = false;
    };
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const provider = window.midnight?.mnLace ?? window.midnight?.lace;
      if (!provider) {
        throw new Error(
          'Midnight Lace wallet extension is not detected. Please install and enable the Midnight Lace extension in your browser.'
        );
      }

      const api: MidnightLaceApi = await provider.enable();
      const unshielded = await api.getUnshieldedAddress();
      const shielded = await api.getShieldedAddress();
      const bal = await api.getBalance();
      const net = (await api.getNetworkId?.()) || 'preprod';

      setLaceApi(api);
      setAddresses({
        unshieldedAddress: unshielded,
        shieldedAddress: shielded,
      });
      setBalance(bal);
      setNetwork(net as MidnightNetwork);
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect Midnight Lace wallet');
      setIsConnected(false);
      setLaceApi(null);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setLaceApi(null);
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
    laceApi,
    connect,
    disconnect,
    switchNetwork,
  };
}
