export type MidnightNetwork = 'preprod' | 'preview' | 'undeployed';

export interface MidnightAddressInfo {
  unshieldedAddress: string;
  shieldedAddress?: string;
}

export interface MidnightTransactionReceipt {
  txHash: string;
  blockHeight?: number;
  status: 'SUBMITTED' | 'CONFIRMED' | 'FAILED';
  circuitName: string;
  nullifier?: string;
  timestamp: string;
}

export interface MidnightLaceApi {
  getNetworkId(): Promise<MidnightNetwork>;
  getUnshieldedAddress(): Promise<string>;
  getShieldedAddress(): Promise<string | undefined>;
  getBalance(): Promise<{ unshielded: bigint; shielded: bigint }>;
  proveTx?(tx: unknown): Promise<{ proof: Uint8Array; publicOutputs: unknown }>;
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

export interface FeedbackPrivateWitness {
  participantSecret: string;
  derivedNullifier: string;
}

export interface CircuitProofTrace {
  circuitName: 'deposit' | 'release' | 'refund' | 'cancel' | 'resolve' | 'resolveSplit' | 'publicKeyOf' | 'submitRating';
  timestamp: string;
  privateWitnessUsed: string;
  zkProofGenerated: boolean;
  zkProofHash: string;
  txHash?: string;
  publicOutputs: Record<string, string | number | boolean>;
  txStatus: 'PROVEN' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED';
  preprodContractAddress: string;
}

export interface OnChainEscrowState {
  buyerPk: string;
  sellerPk: string;
  arbiterPk: string;
  milestoneAmount: bigint;
  state: 'AWAITING_DEPOSIT' | 'LOCKED' | 'RELEASED' | 'REFUNDED' | 'CANCELLED' | 'RESOLVED';
  contractAddress: string;
  lastUpdatedBlock?: number;
}

export interface OnChainFeedbackState {
  totalResponses: number;
  totalRatingSum: number;
  lastNullifier: string;
  surveyTopic: string;
  contractAddress: string;
  consumedNullifiers: string[];
}

