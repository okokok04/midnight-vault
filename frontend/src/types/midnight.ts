export type MidnightNetwork = 'preprod' | 'preview';

export interface MidnightAddressInfo {
  unshieldedAddress: string;
  shieldedAddress?: string;
}

export interface MidnightLaceApi {
  getNetworkId(): Promise<MidnightNetwork>;
  getUnshieldedAddress(): Promise<string>;
  getShieldedAddress(): Promise<string | undefined>;
  getBalance(): Promise<{ unshielded: bigint; shielded: bigint }>;
  proveTx?(tx: unknown): Promise<unknown>;
  submitTx?(tx: unknown): Promise<string>;
}

export interface MidnightLaceProvider {
  name: string;
  icon?: string;
  apiVersion: string;
  isEnabled(): Promise<boolean>;
  enable(): Promise<MidnightLaceApi>;
}

declare global {
  interface Window {
    midnight?: {
      mnLace?: MidnightLaceProvider;
      lace?: MidnightLaceProvider;
      [key: string]: unknown;
    };
  }
}

export interface MidnightPrivateState {
  localSecretKey: string;
  derivedPublicKey: string;
}

export interface CircuitProofTrace {
  circuitName: 'deposit' | 'release' | 'refund' | 'resolve' | 'publicKeyOf';
  timestamp: string;
  privateWitnessUsed: string; // Opaque indicator that secret was proven
  zkProofGenerated: boolean;
  zkProofHash: string;
  publicOutputs: Record<string, string | number | boolean>;
  txStatus: 'PROVEN' | 'SUBMITTED' | 'CONFIRMED';
  preprodContractAddress: string;
}
