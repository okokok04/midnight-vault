# Usage

## Via the dashboard

1. Open the frontend (`http://localhost:5173` locally, or the deployed
   GitHub Pages URL).
2. Click **Connect** and approve the connection in your CIP-30 wallet
   (make sure it's switched to **Preprod**).
3. Fill in **New milestone escrow**:
   - Buyer / seller / arbiter addresses (`addr_test1...`).
   - Milestone amount in ADA.
   - A refund deadline (date/time in the future).
4. Click **Lock funds in escrow**. This calls the backend, which builds
   and submits a transaction locking the milestone amount at the
   validator's script address with an inline datum.
5. Once the escrow appears in the list, any of the three settlement
   actions become available:
   - **Release to seller** — the buyer approves; the seller is paid.
   - **Refund buyer** — enabled once the deadline has passed.
   - **Arbiter → seller / Arbiter → buyer** — breaks a deadlock.

Each action is a single on-chain transaction; the resulting tx hash is
shown on the escrow card and can be looked up on
[preprod.cardanoscan.io](https://preprod.cardanoscan.io).

## Via the Midnight Privacy dApp

1. On the live dashboard, switch to the **🌌 Midnight Privacy Escrow (Compact ZK)** tab.
2. Click **Connect Lace Wallet** (supports native Midnight Lace browser extension or testnet simulator).
3. **Observable Privacy Behavior Inspector:**
   - Manage your local private secret witness `localSecretKey(): Bytes<32>` (retained in browser memory).
   - View your derived opaque public-key hash disclosed on the public ledger.
4. **Execute Compact ZK Circuits:**
   - Click `1. circuit deposit()` to lock funds into the Preprod smart contract.
   - Click `2. circuit release()` or `3. circuit refund()` or `4. circuit resolve(paySeller)` to settle.
   - Live ZK proof traces will display the generated proof hash and on-chain verification confirmation.
5. **Submit Anonymous Survey & Feedback:**
   - Scroll down to the **Anonymous Feedback & Survey Protocol** panel.
   - Select rating (1-5 ⭐) and category (Work Quality, Communication, etc.).
   - Click **Submit Anonymous Feedback (ZK Circuit)** — a zero-knowledge nullifier is generated and recorded on-chain, proving valid participation without exposing your identity.

## Via the REST API directly

Base URL defaults to `http://localhost:4000`.

### Create an escrow

```sh
curl -X POST http://localhost:4000/escrows \
  -H "Content-Type: application/json" \
  -d '{
    "buyerAddress": "addr_test1...",
    "sellerAddress": "addr_test1...",
    "arbiterAddress": "addr_test1...",
    "milestoneAmountLovelace": 50000000,
    "deadlineUnixMs": 1735689600000
  }'
```

Returns the created `EscrowRecord`, including `scriptAddress` and
`lockTxHash`.

### List / inspect escrows

```sh
curl http://localhost:4000/escrows
curl http://localhost:4000/escrows/<id>
```

### Settle an escrow

```sh
# buyer approves delivery
curl -X POST http://localhost:4000/escrows/<id>/release

# after the deadline has passed
curl -X POST http://localhost:4000/escrows/<id>/refund

# arbiter breaks a deadlock
curl -X POST http://localhost:4000/escrows/<id>/resolve \
  -H "Content-Type: application/json" \
  -d '{"paySeller": true}'
```

Each settlement endpoint is only valid while the escrow's `status` is
`"locked"` — calling it twice (or on a non-existent id) returns `409` /
`404` respectively rather than silently no-op'ing.

### Feedback

```sh
# submit feedback (rating 1-5, message required, wallet/contact optional)
curl -X POST http://localhost:4000/feedback \
  -H "Content-Type: application/json" \
  -d '{"rating": 4, "message": "Lock flow was smooth", "walletAddress": "addr_test1..."}'

# list all feedback (contact is always stripped from the response)
curl http://localhost:4000/feedback

# move an item through triage (see docs/FEEDBACK.md)
curl -X PATCH http://localhost:4000/feedback/<id>/status \
  -H "Content-Type: application/json" \
  -d '{"status": "triaged"}'

# export everything as CSV (contact still stripped)
curl http://localhost:4000/feedback/export.csv -o feedback.csv

# remove spam/abuse
curl -X DELETE http://localhost:4000/feedback/<id>
```

The same form is available directly on the dashboard, below the escrow
list, and triage (`new → triaged → actioned/won't fix`) is a one-click
button on each feedback card there too — the `curl` above still works
identically if you'd rather script it. See
[`docs/FEEDBACK.md`](FEEDBACK.md) for how submissions get triaged and
prioritized.

### Escrow list filtering

The dashboard's escrow list has filter buttons
(All/Locked/Released/Refunded/Resolved) and a "Show more" button that
reveals 10 at a time — there's no equivalent filter on `GET /escrows`
itself yet (it always returns everything); filtering happens client-side.

### Stats

```sh
curl http://localhost:4000/stats
```

Returns a live aggregate — escrow counts by status, total lovelace
currently locked, feedback count, and average rating — computed on the
fly from the same stores `GET /escrows` and `GET /feedback` read, so it
can't drift from what those endpoints show. Shown as a stat-tile row at
the top of the dashboard.

## Amount and time conventions

- All amounts in the API and datum are in **lovelace** (1 ADA =
  1,000,000 lovelace). The dashboard's ADA input converts for you.
- `deadlineUnixMs` is a POSIX timestamp in **milliseconds**.
