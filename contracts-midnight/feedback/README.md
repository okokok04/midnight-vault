# StellarVault Anonymous Feedback & Survey — Midnight (Compact)

A privacy-preserving survey and reputation feedback protocol on the
[Midnight Network](https://midnight.network), written in
[Compact](https://docs.midnight.network/develop/reference/compact/).

Participants (freelancers, clients, and community members) can submit
candid reviews and ratings without revealing their wallet address or off-chain
identity. A zero-knowledge nullifier prevents double-submissions.

## Privacy Model

### What an Observer CAN Learn
- **Total responses count** (`totalResponses: Uint<64>` on public ledger).
- **Sum of all ratings** (`totalRatingSum: Uint<64>`, allowing anyone to compute average rating: `sum / total`).
- **Opaque nullifiers** (`lastNullifier: Bytes<32>`), verifying that each response originated from a distinct participant token.
- **Survey topic hash** (`surveyTopic: Bytes<32>`).

### What an Observer CANNOT Learn
- **Participant Identity:** The participant's private witness (`participantSecret(): Bytes<32>`) is evaluated strictly locally and never revealed.
- **Link between Wallet and Rating:** No wallet address or identity token is attached to the submitted rating.
- **Individual rater breakdown:** Individual scores cannot be correlated with specific past escrows or counterparties.

## Compile & Test

Inside WSL2 (Ubuntu):
```sh
npm install
npm run compact
npm test
```

## Layout

```
contract/src/feedback.compact      the Compact ZK contract
contract/src/witnesses.ts         TS implementation of participantSecret witness
contract/src/test/                Vitest simulator and 5 unit tests
contract/managed/feedback/        compiler output (keys, ZK-IR, JS bindings)
```
