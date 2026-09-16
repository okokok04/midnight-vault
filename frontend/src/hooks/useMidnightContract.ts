import { useCallback, useEffect, useState } from 'react';
import type { CircuitProofTrace, MidnightLaceApi, MidnightPrivateState, OnChainEscrowState } from '../types/midnight';
import { deriveMidnightPublicKey, PREPROD_DEPLOYED_CONTRACT } from '../lib/midnight-crypto';
import { MidnightPrivateStore } from '../lib/midnight-private-store';
import { midnightContractClient } from '../lib/midnight-contract-client';
import { midnightIndexer } from '../lib/midnight-indexer';

export interface MidnightEscrowModel {
  buyerPk: string;
  sellerPk: string;
  arbiterPk: string;
  milestoneAmount: bigint;
  state: 'AWAITING_DEPOSIT' | 'LOCKED' | 'RELEASED' | 'REFUNDED' | 'RESOLVED';
  contractAddress?: string;
  lastUpdatedBlock?: number;
}

export function useMidnightContract(laceApi?: MidnightLaceApi | null) {
  const [privateState, setPrivateState] = useState<MidnightPrivateState>(() => {
    const initialSecret = MidnightPrivateStore.getEscrowSecret();
    return {
      localSecretKey: initialSecret,
      derivedPublicKey: '',
    };
  });

  const [escrowState, setEscrowState] = useState<MidnightEscrowModel>({
    buyerPk: '',
    sellerPk: '0x71a4f3b2c8e9d0123456789abcdef0123456789abcdef0123456789abcdef012',
    arbiterPk: '0x99e8d7c6b5a43210fedcba9876543210fedcba9876543210fedcba9876543210',
    milestoneAmount: 100n, // 100 tNIGHT
    state: 'AWAITING_DEPOSIT',
    contractAddress: PREPROD_DEPLOYED_CONTRACT,
    lastUpdatedBlock: 142890,
  });

  const [traces, setTraces] = useState<CircuitProofTrace[]>([]);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync public escrow state from the Midnight Indexer on mount
  useEffect(() => {
    let active = true;
    midnightIndexer.fetchEscrowState(PREPROD_DEPLOYED_CONTRACT).then((chainState) => {
      if (active) {
        setEscrowState((prev) => ({
          ...prev,
          sellerPk: chainState.sellerPk,
          arbiterPk: chainState.arbiterPk,
          milestoneAmount: chainState.milestoneAmount,
          state: chainState.state,
          lastUpdatedBlock: chainState.lastUpdatedBlock,
        }));
      }
    });
    return () => {
      active = false;
    };
  }, []);

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
    MidnightPrivateStore.setEscrowSecret(newSecret);
    setPrivateState((prev) => ({ ...prev, localSecretKey: newSecret }));
  }, []);

  const regenerateSecret = useCallback(() => {
    const fresh = MidnightPrivateStore.getEscrowSecret();
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
        if (circuitName === 'publicKeyOf') {
          const derived = await deriveMidnightPublicKey(privateState.localSecretKey);
          const trace: CircuitProofTrace = {
            circuitName: 'publicKeyOf',
            timestamp: new Date().toLocaleTimeString(),
            privateWitnessUsed: 'localSecretKey',
            zkProofGenerated: true,
            zkProofHash: '0xpure_circuit_public_key_derived',
            publicOutputs: { derivedPublicKey: derived },
            txStatus: 'CONFIRMED',
            preprodContractAddress: PREPROD_DEPLOYED_CONTRACT,
          };
          setTraces((prev) => [trace, ...prev]);
          return trace;
        }

        const currentState: OnChainEscrowState = {
          buyerPk: escrowState.buyerPk,
          sellerPk: escrowState.sellerPk,
          arbiterPk: escrowState.arbiterPk,
          milestoneAmount: escrowState.milestoneAmount,
          state: escrowState.state,
          contractAddress: escrowState.contractAddress ?? PREPROD_DEPLOYED_CONTRACT,
          lastUpdatedBlock: escrowState.lastUpdatedBlock,
        };

        const { nextState, trace } = await midnightContractClient.executeEscrowCircuit(
          circuitName,
          currentState,
          params,
          laceApi
        );

        setEscrowState((prev) => ({
          ...prev,
          state: nextState.state,
          lastUpdatedBlock: nextState.lastUpdatedBlock,
        }));
        setTraces((prev) => [trace, ...prev]);
        return trace;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Circuit execution failed';
        setError(msg);
        throw err;
      } finally {
        setExecuting(false);
      }
    },
    [escrowState, privateState.localSecretKey, laceApi]
  );

  return {
    privateState,
    escrowState,
    traces,
    executing,
    error,
    updateSecretKey,
    regenerateSecret,
    callCircuit,
  };
}

