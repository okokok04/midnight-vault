# Demo video script

Target length: 3–5 minutes. Record with the dashboard running against the
real Preprod deployment (not localhost-only) so the on-chain activity
shown is real and checkable on cardanoscan afterward.

## Before recording

- [ ] Contract deployed and verified (`scripts/deploy-preprod.ts --verify`).
- [ ] Backend running and reachable (local is fine if the screen capture
      shows the terminal, but a public URL is better).
- [ ] Frontend running with `VITE_API_BASE_URL` pointed at that backend.
- [ ] Three Preprod wallets ready in your browser extension (or three
      profiles): buyer, seller, arbiter — each funded from the faucet.
- [ ] [preprod.cardanoscan.io](https://preprod.cardanoscan.io) open in a
      second tab to confirm transactions land.

## Shot list

1. **Cold open (10s)** — one sentence on the problem: freelance payments
   require trusting a stranger or a platform; StellarVault removes that.
2. **Architecture glance (20s)** — show the repo structure and
   `contracts/validators/escrow.ak` for a few seconds; mention it's Aiken
   compiled to Plutus V3, and that this validator is the enforcement
   layer, not the backend.
3. **Connect wallet (15s)** — open the dashboard, connect the buyer
   wallet, show the address populate the "Buyer address" field.
4. **Create an escrow (30s)** — fill in seller + arbiter addresses, an
   amount (e.g. 10 ADA), and a near deadline. Submit. Point out the
   `lockTxHash` that appears, then switch tabs and show that transaction
   confirmed on cardanoscan.
5. **Release path (30s)** — click "Release to seller". Show the escrow's
   status flip to `Released` and the `settleTxHash`. Confirm on
   cardanoscan that the seller's address received the milestone amount.
6. **Refund / dispute path (60s, optional but strong)** — create a second
   escrow with a deadline a minute in the future; wait for it to pass;
   click "Refund buyer" and show it succeed. Alternatively, show
   "Arbiter → seller" resolving a dispute.
7. **Attempted double-spend (15s)** — try clicking a settlement action a
   second time on an already-settled escrow; show the `409` response,
   proving the API (and, underneath it, the validator) refuses to move
   funds twice.
8. **Feedback loop (25s)** — scroll to "Leave feedback", submit a rating
   + message, show it appear immediately in "Recent feedback" below —
   and in the stat-tile row at the top (feedback count / average rating
   ticking up). Click one of its triage buttons ("Mark triaged") and
   show the badge update live. Mention `docs/FEEDBACK.md` for the process.
9. **Midnight Privacy Escrow & Lace Wallet Connect (35s)**:
   - Click the "🌌 Midnight Privacy Escrow (Compact ZK)" tab on the live dashboard.
   - Click "Connect Lace Wallet" — show the connected unshielded/shielded address and tNIGHT balance.
   - Disconnect and reconnect to demonstrate seamless wallet session management.
10. **Observable Privacy Behavior & ZK Circuit Call (45s)**:
   - Highlight the **Observable Privacy Behavior Inspector**: point out `localSecretKey` in private witness panel (never leaves browser memory) vs. the derived opaque key hash in the public ledger panel.
   - Click "1. circuit deposit()" — watch the frontend prove authority via Zero-Knowledge circuit.
   - Inspect the generated ZK proof trace (`0xzkproof_...`), confirmed state transition to `LOCKED`, and verifiable Preprod contract address.
   - Click "2. circuit release()" — show the seller payout circuit executed without revealing off-chain identities.
11. **CI/CD & Deployments (15s)** — show the green checks on GitHub Actions, the live dashboard on GitHub Pages, and on-chain contract addresses.
12. **Close (10s)** — repo URL, X profile handle, summary of trustless + privacy-preserving freelance escrows.

## Recorded Video Demo

- **Google Drive Link:** [Watch Recorded Demo Video](https://drive.google.com/file/d/1dfl-PEse7T6iJ8OFS7otk2VUeMl7WlJV/view?usp=sharing)
- **Content:** Demonstrates Lace Wallet connect, observable privacy behavior, client witness, and successful ZK circuit execution (`deposit` and `release`).

