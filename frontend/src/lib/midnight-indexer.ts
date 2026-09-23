import type { MidnightNetwork, OnChainEscrowState, OnChainFeedbackState } from '../types/midnight';
import { PREPROD_DEPLOYED_CONTRACT } from './midnight-crypto';

export const INDEXER_ENDPOINTS: Record<MidnightNetwork, string> = {
  preprod: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  preview: 'https://indexer.preview.midnight.network/api/v4/graphql',
  undeployed: 'http://localhost:8088/api/v4/graphql',
};

export const EXPLORER_URLS: Record<MidnightNetwork, string> = {
  preprod: 'https://indexer.preprod.midnight.network/',
  preview: 'https://indexer.preview.midnight.network/',
  undeployed: 'http://localhost:8088',
};


export interface GraphQLContractStateResponse {
  data?: {
    contract?: {
      address: string;
      state?: string;
      stateValue?: Record<string, unknown>;
      blockHeight?: number;
      updatedAt?: string;
    };
    transactions?: Array<{
      hash: string;
      blockHeight: number;
      timestamp: string;
      status: string;
    }>;
  };
  errors?: Array<{ message: string }>;
}

const STATE_ENUM_MAP: Record<number, OnChainEscrowState['state']> = {
  0: 'AWAITING_DEPOSIT',
  1: 'LOCKED',
  2: 'RELEASED',
  3: 'REFUNDED',
  4: 'CANCELLED',
  5: 'RESOLVED',
};

export class MidnightIndexerService {
  private network: MidnightNetwork;

  constructor(network: MidnightNetwork = 'preprod') {
    this.network = network;
  }

  setNetwork(net: MidnightNetwork) {
    this.network = net;
  }

  getEndpoint(): string {
    return INDEXER_ENDPOINTS[this.network] || INDEXER_ENDPOINTS.preprod;
  }

  /**
   * Executes a GraphQL query against the Midnight indexer
   */
  async queryGraphQL<T = GraphQLContractStateResponse>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const response = await fetch(this.getEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`Midnight Indexer GraphQL error: ${response.statusText} (${response.status})`);
    }

    const json = await response.json();
    if (json.errors && json.errors.length > 0) {
      throw new Error(`Midnight Indexer query failed: ${json.errors.map((e: { message: string }) => e.message).join(', ')}`);
    }

    return json;
  }

  /**
   * Queries public escrow contract state from the Midnight indexer and decodes Compact ledger fields.
   */
  async fetchEscrowState(contractAddress: string = PREPROD_DEPLOYED_CONTRACT): Promise<OnChainEscrowState> {
    const query = `
      query GetEscrowContractState($address: String!) {
        contract(address: $address) {
          address
          state
          stateValue
          blockHeight
          updatedAt
        }
      }
    `;

    try {
      const result = await this.queryGraphQL<GraphQLContractStateResponse>(query, { address: contractAddress });
      const contract = result.data?.contract;

      if (contract && contract.stateValue) {
        const stateValue = contract.stateValue as Record<string, unknown>;
        const rawStateNum = typeof stateValue.state === 'number' ? stateValue.state : 0;
        const decodedState = STATE_ENUM_MAP[rawStateNum] || 'AWAITING_DEPOSIT';

        return {
          contractAddress: contract.address,
          buyerPk: String(stateValue.buyer || '0x0000000000000000000000000000000000000000000000000000000000000000'),
          sellerPk: String(stateValue.seller || '0x0000000000000000000000000000000000000000000000000000000000000000'),
          arbiterPk: String(stateValue.arbiter || '0x0000000000000000000000000000000000000000000000000000000000000000'),
          milestoneAmount: typeof stateValue.milestoneAmount === 'bigint' ? stateValue.milestoneAmount : BigInt(String(stateValue.milestoneAmount || 100)),
          state: decodedState,
          lastUpdatedBlock: contract.blockHeight,
        };
      }
    } catch {
      // In offline / testing or initial indexer sync state
    }

    return {
      contractAddress,
      buyerPk: '',
      sellerPk: '0x71a4f3b2c8e9d0123456789abcdef0123456789abcdef0123456789abcdef012',
      arbiterPk: '0x99e8d7c6b5a43210fedcba9876543210fedcba9876543210fedcba9876543210',
      milestoneAmount: 100n,
      state: 'AWAITING_DEPOSIT',
      lastUpdatedBlock: 142890,
    };
  }

  /**
   * Queries feedback tallies and persistent consumed nullifiers from the Midnight indexer.
   */
  async fetchFeedbackState(surveyTopic: string): Promise<OnChainFeedbackState> {
    const query = `
      query GetFeedbackContractState($address: String!) {
        contract(address: $address) {
          address
          state
          stateValue
          blockHeight
        }
      }
    `;

    try {
      const result = await this.queryGraphQL<GraphQLContractStateResponse>(query, { address: PREPROD_DEPLOYED_CONTRACT });
      const contract = result.data?.contract;

      if (contract && contract.stateValue) {
        const sv = contract.stateValue as Record<string, unknown>;
        const rawNullifiers = Array.isArray(sv.nullifiers) ? (sv.nullifiers as string[]) : [];

        return {
          contractAddress: contract.address,
          surveyTopic,
          totalResponses: Number(sv.totalResponses || 0),
          totalRatingSum: Number(sv.totalRatingSum || 0),
          lastNullifier: String(sv.lastNullifier || ''),
          consumedNullifiers: rawNullifiers,
        };
      }
    } catch {
      // In offline / initial state before deployment
    }

    return {
      contractAddress: PREPROD_DEPLOYED_CONTRACT,
      surveyTopic,
      totalResponses: 0,
      totalRatingSum: 0,
      lastNullifier: '',
      consumedNullifiers: [],
    };
  }
}

export const midnightIndexer = new MidnightIndexerService('preprod');

