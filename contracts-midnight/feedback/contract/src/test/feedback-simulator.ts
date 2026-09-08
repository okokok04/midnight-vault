import {
  type CircuitContext,
  createCircuitContext,
  createConstructorContext,
  sampleContractAddress,
} from '@midnight-ntwrk/compact-runtime';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { Contract, type Ledger, ledger, FeedbackCategory } from '../../managed/feedback/contract/index.js';
import { type FeedbackPrivateState, createFeedbackPrivateState, witnesses } from '../witnesses.js';

setNetworkId('undeployed');

const DUMMY_COIN_PUBLIC_KEY = '0'.repeat(64);

export class FeedbackSimulator {
  readonly contract: Contract<FeedbackPrivateState>;
  readonly contractAddress: string;
  circuitContext: CircuitContext<FeedbackPrivateState>;

  constructor(topic: Uint8Array, initialSecret: Uint8Array) {
    this.contract = new Contract<FeedbackPrivateState>(witnesses);
    this.contractAddress = sampleContractAddress();

    const { currentContractState, currentPrivateState } = this.contract.initialState(
      createConstructorContext(createFeedbackPrivateState(initialSecret), DUMMY_COIN_PUBLIC_KEY),
      topic
    );

    this.circuitContext = createCircuitContext(
      this.contractAddress,
      DUMMY_COIN_PUBLIC_KEY,
      currentContractState,
      currentPrivateState
    );
  }

  getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  asParticipant(secret: Uint8Array): void {
    this.circuitContext = {
      ...this.circuitContext,
      currentPrivateState: createFeedbackPrivateState(secret),
    };
  }

  submitRating(rating: bigint, category: FeedbackCategory = FeedbackCategory.WORK_QUALITY) {
    const result = this.contract.circuits.submitRating(this.circuitContext, rating, category);
    this.circuitContext = result.context;
    return result;
  }
}
