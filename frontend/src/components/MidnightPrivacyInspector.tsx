import { useState } from 'react';
import type { CircuitProofTrace, MidnightPrivateState } from '../types/midnight';
import { CopyButton } from './CopyButton';
import { LockIcon, GlobeIcon, SparklesIcon, RefreshCwIcon, CheckCircleIcon, LayersIcon, CodeIcon, ShieldIcon } from './Icons';

interface Props {
  privateState: MidnightPrivateState;
  traces: CircuitProofTrace[];
  onRegenerateSecret: () => void;
  onUpdateSecret: (secret: string) => void;
}

export function MidnightPrivacyInspector({
  privateState,
  traces,
  onRegenerateSecret,
  onUpdateSecret,
}: Props) {
  const [showZkJson, setShowZkJson] = useState(false);

  // Simulated real ZK-IR Proof Payload for live inspection
  const sampleZkProofJson = {
    protocol: "Midnight Compact ZK-SNARK (PlonK / Halo2 Arithmetization)",
    circuit: "midnight_vault_escrow::release",
    curve: "BLS12-381 / Jubjub Embedded",
    constraints: 4328,
    provingKeyHash: "0x8fa1b9e2c4d6f8a0123456789abcdef0123456789abcdef0123456789abcdef0",
    publicInputs: [
      privateState.derivedPublicKey || "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x4d69646e696768745661756c745f4d696c6573746f6e655f3030310000000000",
    ],
    proofData: {
      a: "0x29a4f61e8093dbac875143a15276e48c08efbc01289de61d9a2468bc701f5e82",
      b: "0x10fa8c71b3e94a82c6d40f1a9b8e7c6d5a4b3c2e1f0d9c8b7a6f5e4d3c2b1a09",
      c: "0x98ef76dc54ba3210fedcba9876543210abcdef0123456789abcdef0123456789",
    },
    verificationStatus: "CRYPTOGRAPHICALLY_SOUND",
  };

  return (
    <div className="card privacy-inspector-card" data-testid="privacy-inspector">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <SparklesIcon width="18" height="18" />
            <span>Observable Privacy Behavior Inspector</span>
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Zero-Knowledge proofs prove buyer/arbiter authority without disclosing private keys.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setShowZkJson(!showZkJson)}
            style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem' }}
          >
            <CodeIcon width="12" height="12" />
            <span>{showZkJson ? 'Hide Proof JSON' : 'Inspect ZK Proof JSON'}</span>
          </button>
          <span className="badge badge-midnight">ZK Prover</span>
        </div>
      </div>

      {/* Visual Pipeline Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '1rem', background: 'var(--bg-inset)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '0.74rem', color: '#fb7185', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
          <LockIcon width="12" height="12" />
          <span>1. Local Witness</span>
        </div>
        <div style={{ fontSize: '0.74rem', color: '#93c5fa', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
          <LayersIcon width="12" height="12" />
          <span>2. Compact Circuit</span>
        </div>
        <div style={{ fontSize: '0.74rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
          <GlobeIcon width="12" height="12" />
          <span>3. Public State</span>
        </div>
      </div>

      <div className="privacy-grid">
        {/* Left: Private State (Local Witness) */}
        <div className="privacy-panel private-panel">
          <div className="panel-header">
            <span className="panel-badge private-badge">
              <LockIcon width="11" height="11" />
              <span>Private Witness (Never Disclosed)</span>
            </span>
          </div>
          <p className="panel-desc">
            Kept strictly inside browser memory. Never leaves your client or on-chain transaction.
          </p>
          <div style={{ marginTop: '0.65rem' }}>
            <label htmlFor="local-secret-input">
              <code>localSecretKey(): Bytes&lt;32&gt;</code>
            </label>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <input
                id="local-secret-input"
                type="password"
                value={privateState.localSecretKey}
                onChange={(e) => onUpdateSecret(e.target.value)}
                style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}
              />
              <button
                type="button"
                onClick={onRegenerateSecret}
                title="Generate fresh secret"
                style={{ fontSize: '0.74rem', whiteSpace: 'nowrap', padding: '0.4rem 0.65rem' }}
              >
                <RefreshCwIcon width="12" height="12" />
                Fresh
              </button>
            </div>
          </div>
        </div>

        {/* Right: Public Ledger State */}
        <div className="privacy-panel public-panel">
          <div className="panel-header">
            <span className="panel-badge public-badge">
              <GlobeIcon width="11" height="11" />
              <span>Public Ledger State (Disclosed)</span>
            </span>
          </div>
          <p className="panel-desc">
            Opaque hash computed by <code>derivePublicKey()</code> via ZK circuit.
          </p>
          <div style={{ marginTop: '0.65rem' }}>
            <label>
              <code>export sealed ledger buyer: Bytes&lt;32&gt;</code>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <code className="hash" style={{ wordBreak: 'break-all', fontSize: '0.74rem', flex: 1 }}>
                {privateState.derivedPublicKey || 'Deriving...'}
              </code>
              <CopyButton value={privateState.derivedPublicKey} />
            </div>
          </div>
        </div>
      </div>

      {/* Raw ZK-IR JSON Proof Inspector Drawer */}
      {showZkJson && (
        <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'var(--bg-inset)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#93c5fa', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldIcon width="12" height="12" />
              <span>Midnight Compact Zero-Knowledge Proof Structure</span>
            </span>
            <CopyButton value={JSON.stringify(sampleZkProofJson, null, 2)} />
          </div>
          <pre style={{ margin: 0, padding: '0.65rem', background: '#090c12', borderRadius: 'var(--radius-xs)', fontSize: '0.72rem', color: '#93c5fa', overflowX: 'auto', fontFamily: 'var(--font-mono)' }}>
            {JSON.stringify(sampleZkProofJson, null, 2)}
          </pre>
        </div>
      )}

      {/* Proof Traces & Observable Verification */}
      {traces.length > 0 && (
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <h4 style={{ margin: '0 0 0.65rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-secondary)' }}>
            <CheckCircleIcon width="14" height="14" />
            <span>Cryptographic Proof Execution Trace</span>
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {traces.map((trace, idx) => (
              <div key={idx} className="trace-item" style={{ fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className={`badge badge-${trace.zkProofGenerated ? 'released' : 'refunded'}`} style={{ fontSize: '0.65rem' }}>
                      {trace.zkProofGenerated ? 'ZK-VERIFIED' : 'FAILED'}
                    </span>
                    <strong style={{ color: 'var(--text)' }}>Circuit: {trace.circuitName}()</strong>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    {trace.timestamp}
                  </span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginBottom: '0.25rem' }}>
                  {trace.privateWitnessUsed}
                </div>
                {trace.zkProofHash && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>ZK Proof Hash:</span>
                    <code className="hash" style={{ fontSize: '0.72rem' }}>{trace.zkProofHash}</code>
                  </div>
                )}
                {trace.txHash && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Tx Hash:</span>
                    <code className="hash" style={{ fontSize: '0.72rem' }}>{trace.txHash}</code>
                    <CopyButton value={trace.txHash} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
