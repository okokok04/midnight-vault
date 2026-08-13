import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import type { Ledger } from '../managed/escrow/contract/index.js';

export type EscrowPrivateState = {
  readonly secretKey: Uint8Array;
};

export const createEscrowPrivateState = (secretKey: Uint8Array): EscrowPrivateState => ({
  secretKey,
});

export const witnesses = {
  localSecretKey: (context: WitnessContext<Ledger, EscrowPrivateState>): [EscrowPrivateState, Uint8Array] => [
    context.privateState,
    context.privateState.secretKey,
  ],
};
