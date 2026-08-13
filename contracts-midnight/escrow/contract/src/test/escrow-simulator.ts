import {
  type CircuitContext,
  createCircuitContext,
  createConstructorContext,
  sampleContractAddress,
} from '@midnight-ntwrk/compact-runtime';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { Contract, type Ledger, ledger } from '../../managed/escrow/contract/index.js';
import { type EscrowPrivateState, createEscrowPrivateState, witnesses } from '../witnesses.js';

setNetworkId('undeployed');

const DUMMY_COIN_PUBLIC_KEY = '0'.repeat(64);

export class EscrowSimulator {
  readonly contract: Contract<EscrowPrivateState>;
  readonly contractAddress: string;
  circuitContext: CircuitContext<EscrowPrivateState>;

  constructor(seller: Uint8Array, arbiter: Uint8Array, amount: bigint, buyerSecretKey: Uint8Array) {
    this.contract = new Contract<EscrowPrivateState>(witnesses);
    this.contractAddress = sampleContractAddress();

    const { currentContractState, currentPrivateState } = this.contract.initialState(
      createConstructorContext(createEscrowPrivateState(buyerSecretKey), DUMMY_COIN_PUBLIC_KEY),
      seller,
      arbiter,
      amount,
    );

    this.circuitContext = createCircuitContext(
      this.contractAddress,
      DUMMY_COIN_PUBLIC_KEY,
      currentContractState,
      currentPrivateState,
    );
  }

  getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  asParty(secretKey: Uint8Array): void {
    this.circuitContext = {
      ...this.circuitContext,
      currentPrivateState: createEscrowPrivateState(secretKey),
    };
  }

  deposit() {
    const result = this.contract.circuits.deposit(this.circuitContext);
    this.circuitContext = result.context;
    return result;
  }

  release(sellerAddress: string) {
    const result = this.contract.circuits.release(this.circuitContext, { bytes: encodeAddress(sellerAddress) });
    this.circuitContext = result.context;
    return result;
  }

  refund(buyerAddress: string) {
    const result = this.contract.circuits.refund(this.circuitContext, { bytes: encodeAddress(buyerAddress) });
    this.circuitContext = result.context;
    return result;
  }

  resolve(paySeller: boolean, sellerAddress: string, buyerAddress: string) {
    const result = this.contract.circuits.resolve(
      this.circuitContext,
      paySeller,
      { bytes: encodeAddress(sellerAddress) },
      { bytes: encodeAddress(buyerAddress) },
    );
    this.circuitContext = result.context;
    return result;
  }
}

function encodeAddress(address: string): Uint8Array {
  return new TextEncoder().encode(address.padEnd(32, '\0')).slice(0, 32);
}
