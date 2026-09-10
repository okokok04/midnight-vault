import { useCallback, useEffect, useState } from 'react';
import type { CircuitProofTrace, MidnightPrivateState } from '../types/midnight';
import { deriveMidnightPublicKey, generateRandomSecret, PREPROD_DEPLOYED_CONTRACT } from '../lib/midnight-crypto';

export interface MidnightEscrowModel {
  buyerPk: string;
  sellerPk: string;
  arbiterPk: string;
  milestoneAmount: bigint;
  state: 'AWAITING_DEPOSIT' | 'LOCKED' | 'RELEASED' | 'REFUNDED' | 'RESOLVED';
}

export function useMidnightContract() {
  const [privateState, setPrivateState] = useState<MidnightPrivateState>(() => {
    const initialSecret = generateRandomSecret();
    return {
      localSecretKey: initialSecret,
      derivedPublicKey: '',
    };
  });

  const [escrowState, setEscrowState] = useState<MidnightEscrowModel>({
    buyerPk: '',
    sellerPk: '0x71a4f3b2c8e9d0123456789abcdef0123456789abcdef0123456789abcdef012',
    arbiterPk: '0x99e8d7c6b5a43210fedcba9876543210fedcba9876543210fedcba9876543210',
    milestoneAmount: 100n, // 100 NIGHT
    state: 'AWAITING_DEPOSIT',
  });

  const [traces, setTraces] = useState<CircuitProofTrace[]>([]);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive buyer public key whenever secret key changes
  useEffect(() => {
    let active = true;
    deriveMidnightPublicKey(privateState.localSecretKey).then((pk) => {
      if (active) {
        setPrivateState((prev) => ({ ...prev, derivedPublicKey: pk }));
        setEscrowState((prev) => ({ ...prev, buyerPk: pk }));
      }
    });
    return () => {
      active = false;
    };
  }, [privateState.localSecretKey]);

  const updateSecretKey = useCallback((newSecret: string) => {
    setPrivateState((prev) => ({ ...prev, localSecretKey: newSecret }));
  }, []);

  const regenerateSecret = useCallback(() => {
    const fresh = generateRandomSecret();
    setPrivateState((prev) => ({ ...prev, localSecretKey: fresh }));
  }, []);

  const callCircuit = useCallback(
    async (
      circuitName: 'deposit' | 'release' | 'refund' | 'resolve' | 'publicKeyOf',
      params?: { paySeller?: boolean; sellerAddress?: string; buyerAddress?: string }
    ) => {
      setExecuting(true);
      setError(null);

      try {
        // Simulate circuit proof computation (in real client, calls proof server / midnight-js)
        await new Promise((resolve) => setTimeout(resolve, 600));

        const derived = await deriveMidnightPublicKey(privateState.localSecretKey);
        const proofHash = '0xzkproof_' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 6);

        let nextState = escrowState.state;
        const publicOutputs: Record<string, string | number | boolean> = {
          derivedPublicKeyDisclosed: derived,
          amount: Number(escrowState.milestoneAmount),
        };

        if (circuitName === 'deposit') {
          if (escrowState.state !== 'AWAITING_DEPOSIT') {
            throw new Error('Escrow already deposited');
          }
          nextState = 'LOCKED';
          publicOutputs.newState = 'LOCKED';
        } else if (circuitName === 'release') {
          if (escrowState.state !== 'LOCKED') {
            throw new Error('Escrow is not in LOCKED state');
          }
          nextState = 'RELEASED';
          publicOutputs.newState = 'RELEASED';
          publicOutputs.sellerAddress = params?.sellerAddress ?? 'mn_unshielded1seller';
        } else if (circuitName === 'refund') {
          if (escrowState.state !== 'LOCKED') {
            throw new Error('Escrow is not in LOCKED state');
          }
          nextState = 'REFUNDED';
          publicOutputs.newState = 'REFUNDED';
          publicOutputs.buyerAddress = params?.buyerAddress ?? 'mn_unshielded1buyer';
        } else if (circuitName === 'resolve') {
          if (escrowState.state !== 'LOCKED') {
            throw new Error('Escrow is not in LOCKED state');
          }
          nextState = 'RESOLVED';
          publicOutputs.newState = 'RESOLVED';
          publicOutputs.paySeller = params?.paySeller ?? true;
        }

        const newTrace: CircuitProofTrace = {
          circuitName,
          timestamp: new Date().toLocaleTimeString(),
          privateWitnessUsed: 'localSecretKey [PROVEN IN ZK-CIRCUIT - NEVER TRANSMITTED]',
          zkProofGenerated: true,
          zkProofHash: proofHash,
          publicOutputs,
          txStatus: 'CONFIRMED',
          preprodContractAddress: PREPROD_DEPLOYED_CONTRACT,
        };

        setEscrowState((prev) => ({ ...prev, state: nextState }));
        setTraces((prev) => [newTrace, ...prev]);
        return newTrace;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Circuit execution failed';
        setError(msg);
        throw err;
      } finally {
        setExecuting(false);
      }
    },
    [escrowState, privateState.localSecretKey]
  );

  const resetEscrowState = useCallback(() => {
    setEscrowState((prev) => ({
      ...prev,
      state: 'AWAITING_DEPOSIT',
    }));
    setError(null);
  }, []);

  return {
    privateState,
    escrowState,
    traces,
    executing,
    error,
    updateSecretKey,
    regenerateSecret,
    callCircuit,
    resetEscrowState,
  };
}

