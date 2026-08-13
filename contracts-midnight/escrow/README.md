# StellarVault escrow — Midnight (Compact)

A privacy-preserving port of StellarVault's milestone escrow to the
[Midnight Network](https://midnight.network), written in
[Compact](https://docs.midnight.network/develop/reference/compact/).
Buyer, seller, and arbiter are never linked to an off-chain identity by
the contract — see [Public state vs. private witness](#public-state-vs-private-witness)
below.

## Prerequisites

- **Node.js 22+**
- The [Compact toolchain](https://docs.midnight.network/develop/tutorial/building/) (`compact` CLI, which wraps `compactc`).
  Midnight ships pre-built binaries for Linux and macOS only — **there is
  no native Windows build**. On Windows, install
  [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) with an
  Ubuntu distro and install/run the toolchain there:
  ```sh
  # inside WSL2/Ubuntu
  curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/midnightntwrk/compact/main/install.sh | sh
  compact update
  ```
- Docker (only needed later, to run a local proof server for a real
  testnet deployment — not required to compile or run the unit tests).

## Compile

From this directory (`contracts-midnight/escrow/`):

```sh
npm install
npm run compact
# wraps: compact compile contract/src/escrow.compact contract/managed/escrow
```

On Windows, run the same command inside `wsl`:

```sh
wsl -e bash -lc "cd /mnt/d/Stellar/contracts-midnight/escrow && npm run compact"
```

This regenerates `contract/managed/escrow/`: the compiled JS/TS contract
(`contract/index.{js,d.ts}`), and per-circuit proving/verifying keys and
ZK-IR (`keys/`, `zkir/`) for every non-pure exported circuit
(`deposit`, `release`, `refund`, `resolve`).

## Test

```sh
npm test
```

Runs the Vitest suite in `contract/src/test/` against a lightweight
in-memory simulator (`contract/src/test/escrow-simulator.ts`), built on
`@midnight-ntwrk/compact-runtime`'s `createConstructorContext` /
`createCircuitContext` — the same pattern used by Midnight's own
`example-counter`. It covers constructor validation, access control
(only the buyer/arbiter whose secret hashes to the stored public key
may call the corresponding circuit), and state transitions.

One limitation worth calling out explicitly rather than hiding: the
simulator runs one circuit call at a time and never assembles or
applies a real transaction, so `receiveUnshielded`'s claim in `deposit`
never becomes an actual *credited* contract balance the way it would
once a real transaction is submitted and applied on a live network.
`release`/`refund`/`resolve`'s `unshieldedBalanceGte` guard correctly
still blocks payout in that situation — the test
`blocks release/resolve until the deposit is a real, on-chain-applied
balance` asserts exactly that, instead of faking a balance credit to
force a green test. The full money-movement path is exercised against
a deployed testnet contract instead (see the root
[`README.md`](../../README.md) for the live deployment).

## Public state vs. private witness

`escrow.compact` splits its data into two kinds:

- **Public ledger state** (`export sealed ledger buyer/seller/arbiter:
  Bytes<32>`, `milestoneAmount`, `state`) — readable by anyone querying
  the contract. These are never raw secrets or off-chain identities:
  `buyer`/`seller`/`arbiter` are opaque hashes produced by
  `derivePublicKey(secret)`, and `disclose()` marks the exact points
  where a value derived from private data is deliberately allowed onto
  the public ledger (the compiler rejects any other path from a
  witness/parameter to disclosed behavior).
- **Private witness** (`witness localSecretKey(): Bytes<32>;`) — each
  party's secret key. It never appears as a call argument, in a
  transaction, or in ledger state. Whoever is running a given call
  (buyer, seller, or arbiter, each with their own local copy of the
  off-chain app and their own `witnesses` implementation — see
  `contract/src/witnesses.ts`) answers `localSecretKey()` locally with
  their own secret; the circuit only ever sees, and only ever
  discloses, the *derived* public-key hash.

This is what lets `deposit`/`release`/`refund` assert "only the buyer
may call this" and `resolve` assert "only the arbiter may call this"
without the contract — or anyone reading the chain — ever learning who
the buyer or arbiter actually are off-chain.

## Layout

```
contract/src/escrow.compact        the contract
contract/src/witnesses.ts          TS implementation of the localSecretKey witness
contract/src/test/                 Vitest simulator + tests
contract/managed/escrow/           compiler output (gitignored inputs regenerate this)
```
