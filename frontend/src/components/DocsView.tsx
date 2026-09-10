import { useState } from "react";
import { CopyButton } from "./CopyButton";
import { LayersIcon, LockIcon, ShieldIcon, SparklesIcon, ExternalLinkIcon, CheckCircleIcon, KeyIcon } from "./Icons";
import { PREPROD_DEPLOYED_CONTRACT } from "../lib/midnight-crypto";

type DocSection = "architecture" | "privacy" | "compact" | "aiken" | "api" | "deployments";

export function DocsView() {
  const [activeSection, setActiveSection] = useState<DocSection>("architecture");

  return (
    <div className="docs-container" data-testid="docs-view">
      {/* Docs Header */}
      <div className="docs-header card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
              <span className="badge badge-midnight">Protocol Documentation</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>v0.3 Specification</span>
            </div>
            <h2 style={{ margin: 0, fontSize: "1.45rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <LayersIcon width="22" height="22" />
              <span>StellarVault Technical Documentation</span>
            </h2>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.88rem", color: "var(--text-muted)" }}>
              Complete reference guide for the multi-chain Zero-Knowledge milestone escrow &amp; confidential reputation protocol.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <a
              href="https://drive.google.com/file/d/1dfl-PEse7T6iJ8OFS7otk2VUeMl7WlJV/view?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="primary"
              style={{ padding: "0.55rem 1rem", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <span>🎬 Watch Demo Video</span>
              <ExternalLinkIcon width="13" height="13" />
            </a>
            <a
              href="https://github.com/okokok04/stellarvault"
              target="_blank"
              rel="noreferrer"
              className="secondary-btn"
              style={{ padding: "0.55rem 1rem", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
            >
              <span>GitHub Repo</span>
              <ExternalLinkIcon width="13" height="13" />
            </a>
          </div>
        </div>
      </div>


      <div className="docs-layout" style={{ marginTop: "1.5rem" }}>
        {/* Docs Navigation Sidebar */}
        <aside className="docs-sidebar card">
          <div className="docs-nav-group-title">Core Concepts</div>
          <button
            type="button"
            className={`docs-nav-item ${activeSection === "architecture" ? "active" : ""}`}
            onClick={() => setActiveSection("architecture")}
          >
            <LayersIcon width="16" height="16" />
            <span>1. Protocol Architecture</span>
          </button>

          <button
            type="button"
            className={`docs-nav-item ${activeSection === "privacy" ? "active" : ""}`}
            onClick={() => setActiveSection("privacy")}
          >
            <LockIcon width="16" height="16" />
            <span>2. ZK Privacy &amp; Nullifiers</span>
          </button>

          <div className="docs-nav-group-title" style={{ marginTop: "1.25rem" }}>Smart Contracts</div>
          <button
            type="button"
            className={`docs-nav-item ${activeSection === "compact" ? "active" : ""}`}
            onClick={() => setActiveSection("compact")}
          >
            <SparklesIcon width="16" height="16" />
            <span>3. Midnight Compact Engine</span>
          </button>

          <button
            type="button"
            className={`docs-nav-item ${activeSection === "aiken" ? "active" : ""}`}
            onClick={() => setActiveSection("aiken")}
          >
            <ShieldIcon width="16" height="16" />
            <span>4. Cardano Aiken Validator</span>
          </button>

          <div className="docs-nav-group-title" style={{ marginTop: "1.25rem" }}>Integration &amp; Registry</div>
          <button
            type="button"
            className={`docs-nav-item ${activeSection === "api" ? "active" : ""}`}
            onClick={() => setActiveSection("api")}
          >
            <KeyIcon width="16" height="16" />
            <span>5. REST API &amp; Client SDK</span>
          </button>

          <button
            type="button"
            className={`docs-nav-item ${activeSection === "deployments" ? "active" : ""}`}
            onClick={() => setActiveSection("deployments")}
          >
            <CheckCircleIcon width="16" height="16" />
            <span>6. Preprod Deployments</span>
          </button>
        </aside>

        {/* Docs Content Panel */}
        <main className="docs-content card">
          {activeSection === "architecture" && (
            <article className="docs-article">
              <span className="badge badge-midnight">System Overview</span>
              <h3 className="docs-heading">Dual-Chain Protocol Architecture</h3>
              <p>
                StellarVault combines the battle-tested deterministic UTxO settlement of <strong>Cardano</strong> with the confidential computing and Zero-Knowledge proofs of <strong>Midnight Network</strong>.
              </p>

              <div className="docs-callout">
                <strong>Why Milestone Escrow?</strong> Cross-border freelance work requires bilateral trust: buyers refuse to pay upfront for unverified deliverables, while freelancers cannot afford to risk uncompensated labor. StellarVault eliminates trusted intermediaries entirely by locking funds in smart contracts that release only under signature-checked or ZK-proven conditions.
              </div>

              <h4>Protocol Lifecycle Stages</h4>
              <div className="docs-lifecycle-grid">
                <div className="lifecycle-step">
                  <div className="step-num">1</div>
                  <div className="step-title">Lock / Deposit</div>
                  <div className="step-desc">Buyer locks milestone funds into the escrow contract with defined seller and arbiter addresses, amount, and deadline.</div>
                </div>

                <div className="lifecycle-step">
                  <div className="step-num">2</div>
                  <div className="step-title">Work &amp; Review</div>
                  <div className="step-desc">Freelancer delivers milestone. Client reviews work with full confidence that payment is reserved in contract custody.</div>
                </div>

                <div className="lifecycle-step">
                  <div className="step-num">3</div>
                  <div className="step-title">Release Settlement</div>
                  <div className="step-desc">Buyer executes <code>release()</code>. Validator immediately routes payment to the seller.</div>
                </div>

                <div className="lifecycle-step">
                  <div className="step-num">4</div>
                  <div className="step-title">Refund / Dispute</div>
                  <div className="step-desc">If deadline expires with no delivery, buyer reclaims funds. In case of disagreement, named arbiter signs resolution.</div>
                </div>
              </div>
            </article>
          )}

          {activeSection === "privacy" && (
            <article className="docs-article">
              <span className="badge badge-midnight">Zero-Knowledge Guarantees</span>
              <h3 className="docs-heading">Privacy Model &amp; Cryptographic Nullifiers</h3>
              <p>
                Public ledgers reveal all wallet balances and counterparty links. Midnight Compact contracts introduce <strong>Selective Disclosure</strong>, guaranteeing that observer nodes learn only public tallies while private witness keys remain strictly in browser client memory.
              </p>

              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Data Asset</th>
                    <th>Visibility</th>
                    <th>Cryptographic Guarantee</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Participant Off-Chain Identity</strong></td>
                    <td><span className="badge badge-refunded">CONFIDENTIAL</span></td>
                    <td>Never included in transactions or written on-chain.</td>
                  </tr>
                  <tr>
                    <td><strong>Witness Secret (<code>localSecretKey</code>)</strong></td>
                    <td><span className="badge badge-refunded">CONFIDENTIAL</span></td>
                    <td>Retained purely in client RAM; proven via local ZK circuit.</td>
                  </tr>
                  <tr>
                    <td><strong>Nullifier Hashes (<code>lastNullifier</code>)</strong></td>
                    <td><span className="badge badge-released">PUBLIC LEDGER</span></td>
                    <td>Deterministic Blake2b hash preventing double-voting without revealing identity.</td>
                  </tr>
                  <tr>
                    <td><strong>Aggregated Score &amp; State</strong></td>
                    <td><span className="badge badge-released">PUBLIC LEDGER</span></td>
                    <td>Verifiable tallies disclosed deliberately via <code>disclose()</code>.</td>
                  </tr>
                </tbody>
              </table>

              <h4>Nullifier Mathematical Definition</h4>
              <div className="docs-code-block">
                <code>
                  Nullifier = PersistentHash([ "stellarvault:feedback:nullifier:", ParticipantSecret, SurveyTopic ])
                </code>
              </div>
            </article>
          )}

          {activeSection === "compact" && (
            <article className="docs-article">
              <span className="badge badge-midnight">Midnight Compact</span>
              <h3 className="docs-heading">Midnight Compact Smart Contract Engine</h3>
              <p>
                The escrow and anonymous reputation circuits are implemented in Midnight's native Compact language (<code>0.23+</code>) with zero-knowledge intermediate representation (ZK-IR).
              </p>

              <h4>Escrow Circuit Interface (<code>escrow.compact</code>)</h4>
              <div className="docs-code-block">
                <pre>{`// Public ledger state
export ledger state: EscrowState;
export ledger milestoneAmount: Uint<64>;
export ledger sellerPk: Bytes<32>;
export ledger arbiterPk: Bytes<32>;

// Private client-side witness
witness localSecretKey(): Bytes<32>;

// Circuits
export circuit deposit(): [] {
  assert(state == EscrowState.CREATED, "Invalid state");
  state = EscrowState.LOCKED;
}

export circuit release(): [] {
  assert(state == EscrowState.LOCKED, "Escrow not locked");
  assert(publicKeyOf(localSecretKey()) == buyerPk, "Unauthorized");
  state = EscrowState.RELEASED;
}`}</pre>
              </div>
            </article>
          )}

          {activeSection === "aiken" && (
            <article className="docs-article">
              <span className="badge badge-midnight">Cardano Aiken</span>
              <h3 className="docs-heading">Cardano Aiken Plutus V3 Validator</h3>
              <p>
                Built in modern <a href="https://aiken-lang.org" target="_blank" rel="noreferrer">Aiken</a> and compiled to Plutus V3. The validator address governs locked UTxOs with strict multi-sig and timestamp assertions.
              </p>

              <h4>Datum &amp; Redeemer Specification</h4>
              <div className="docs-code-block">
                <pre>{`pub type EscrowDatum {
  buyer: ByteArray,
  seller: ByteArray,
  arbiter: ByteArray,
  milestone_amount: Int,
  deadline: Int,
}

pub type EscrowRedeemer {
  Release
  Refund
  Resolve { pay_seller: Bool }
}`}</pre>
              </div>
            </article>
          )}

          {activeSection === "api" && (
            <article className="docs-article">
              <span className="badge badge-midnight">Developer Integration</span>
              <h3 className="docs-heading">REST API &amp; Off-Chain Client SDK</h3>
              <p>
                StellarVault exposes clean REST endpoints and TypeScript utilities for seamless frontend and automation integrations:
              </p>

              <div className="docs-endpoint-card">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="badge badge-released">GET</span>
                  <code>/escrows</code>
                </div>
                <p>Returns all tracked milestone escrows with on-chain UTxO lock details and current state.</p>
              </div>

              <div className="docs-endpoint-card">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="badge badge-midnight">POST</span>
                  <code>/escrows</code>
                </div>
                <p>Creates and broadcasts a new milestone lock transaction on Cardano Preprod.</p>
              </div>

              <div className="docs-endpoint-card">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className="badge badge-locked">POST</span>
                  <code>/escrows/:id/release</code>
                </div>
                <p>Constructs and signs the settlement transaction paying the seller key hash.</p>
              </div>
            </article>
          )}

          {activeSection === "deployments" && (
            <article className="docs-article">
              <span className="badge badge-midnight">On-Chain Registry</span>
              <h3 className="docs-heading">Live Preprod Deployments &amp; Verified Hashes</h3>
              <p>
                All smart contract addresses, bootstrap transactions, and validator bytecode are deployed and verifiable on public testnet explorers:
              </p>

              <div className="deployment-item">
                <div>
                  <div className="dep-label">Midnight Preprod Escrow Contract</div>
                  <code className="hash" style={{ fontSize: "0.78rem" }}>{PREPROD_DEPLOYED_CONTRACT}</code>
                </div>
                <CopyButton value={PREPROD_DEPLOYED_CONTRACT} />
              </div>

              <div className="deployment-item">
                <div>
                  <div className="dep-label">Cardano Preprod Validator Address</div>
                  <code className="hash" style={{ fontSize: "0.78rem" }}>addr_test1wzpxqahdn4aqzwuc5x9hc94m0ljqhnc8e9tknca65nm6rdctz5fc9</code>
                </div>
                <CopyButton value="addr_test1wzpxqahdn4aqzwuc5x9hc94m0ljqhnc8e9tknca65nm6rdctz5fc9" />
              </div>

              <div className="deployment-item">
                <div>
                  <div className="dep-label">Verified Escrow Lock Transaction</div>
                  <code className="hash" style={{ fontSize: "0.78rem" }}>a3023e7e3730290372a7c5fa76a1e65006cc3de5df5b03aa7a52da81e1113031</code>
                </div>
                <CopyButton value="a3023e7e3730290372a7c5fa76a1e65006cc3de5df5b03aa7a52da81e1113031" />
              </div>

              <div className="deployment-item">
                <div>
                  <div className="dep-label">Verified Escrow Release Redeemer Transaction</div>
                  <code className="hash" style={{ fontSize: "0.78rem" }}>d59a54682df089213ee1c77c75126b75476b9def21d7f81272f4ccc2726a2287</code>
                </div>
                <CopyButton value="d59a54682df089213ee1c77c75126b75476b9def21d7f81272f4ccc2726a2287" />
              </div>
            </article>
          )}
        </main>
      </div>
    </div>
  );
}
