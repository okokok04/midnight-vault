export interface FeedbackPrivateState {
  readonly participantSecret: Uint8Array;
}

export const createFeedbackPrivateState = (secret: Uint8Array): FeedbackPrivateState => ({
  participantSecret: secret,
});

export const witnesses = {
  participantSecret: ({ privateState }: { privateState: FeedbackPrivateState }): [FeedbackPrivateState, Uint8Array] => [
    privateState,
    privateState.participantSecret,
  ],
};
