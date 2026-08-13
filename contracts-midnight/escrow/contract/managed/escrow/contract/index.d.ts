import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum EscrowState { AWAITING_DEPOSIT = 0,
                          LOCKED = 1,
                          RELEASED = 2,
                          REFUNDED = 3,
                          RESOLVED = 4
}

export type Witnesses<PS> = {
  localSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  deposit(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  release(context: __compactRuntime.CircuitContext<PS>,
          _sellerAddress_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  refund(context: __compactRuntime.CircuitContext<PS>,
         _buyerAddress_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  resolve(context: __compactRuntime.CircuitContext<PS>,
          paySeller_0: boolean,
          _sellerAddress_0: { bytes: Uint8Array },
          _buyerAddress_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  deposit(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  release(context: __compactRuntime.CircuitContext<PS>,
          _sellerAddress_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  refund(context: __compactRuntime.CircuitContext<PS>,
         _buyerAddress_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  resolve(context: __compactRuntime.CircuitContext<PS>,
          paySeller_0: boolean,
          _sellerAddress_0: { bytes: Uint8Array },
          _buyerAddress_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  publicKeyOf(secret_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  deposit(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  release(context: __compactRuntime.CircuitContext<PS>,
          _sellerAddress_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  refund(context: __compactRuntime.CircuitContext<PS>,
         _buyerAddress_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  resolve(context: __compactRuntime.CircuitContext<PS>,
          paySeller_0: boolean,
          _sellerAddress_0: { bytes: Uint8Array },
          _buyerAddress_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  publicKeyOf(context: __compactRuntime.CircuitContext<PS>, secret_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type Ledger = {
  readonly buyer: Uint8Array;
  readonly seller: Uint8Array;
  readonly arbiter: Uint8Array;
  readonly milestoneAmount: bigint;
  readonly state: EscrowState;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               _seller_0: Uint8Array,
               _arbiter_0: Uint8Array,
               _amount_0: bigint): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
