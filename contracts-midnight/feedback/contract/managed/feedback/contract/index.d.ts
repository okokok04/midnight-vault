import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum FeedbackCategory { COMMUNICATION = 0,
                               PAYMENT_PROMPTNESS = 1,
                               WORK_QUALITY = 2,
                               COLLABORATION = 3,
                               GENERAL = 4
}

export type Witnesses<PS> = {
  participantSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  submitRating(context: __compactRuntime.CircuitContext<PS>,
               rating_0: bigint,
               category_0: FeedbackCategory): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  submitRating(context: __compactRuntime.CircuitContext<PS>,
               rating_0: bigint,
               category_0: FeedbackCategory): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  nullifierOf(secret_0: Uint8Array, topic_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  submitRating(context: __compactRuntime.CircuitContext<PS>,
               rating_0: bigint,
               category_0: FeedbackCategory): __compactRuntime.CircuitResults<PS, []>;
  nullifierOf(context: __compactRuntime.CircuitContext<PS>,
              secret_0: Uint8Array,
              topic_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type Ledger = {
  readonly totalResponses: bigint;
  readonly totalRatingSum: bigint;
  readonly lastNullifier: Uint8Array;
  readonly surveyTopic: Uint8Array;
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
               _topic_0: Uint8Array): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
