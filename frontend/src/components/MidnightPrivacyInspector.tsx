import type { CircuitProofTrace, MidnightPrivateState } from '../types/midnight';
import { CopyButton } from './CopyButton';
import { LockIcon, GlobeIcon, SparklesIcon, RefreshCwIcon, CheckCircleIcon, LayersIcon } from './Icons';

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
  return (
    <div className="card privacy-inspector-card" data-testid="privacy-inspector">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <SparklesIcon width="20" height="20" />
            <span>Observable Privacy Behavior Inspector</span>
          </h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Zero-Knowledge proofs allow you to prove buyer/arbiter authority without ever disclosing your secret key.
          </p>
        </div>
        <span className="badge badge-midnight">ZK Selective Disclosure</span>
      </div>

      {/* Visual Pipeline Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem', marginBottom: '1.15rem', background: 'var(--surface-alt)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.78rem', color: '#fb7185', display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600 }}>
          <LockIcon width="14" height="14" />
          <span>1. Local Private Witness</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600 }}>
          <LayersIcon width="14" height="14" />
          <span>2. Compact Circuit (ZK-IR)</span>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600 }}>
          <GlobeIcon width="14" height="14" />
          <span>3. Public Preprod State</span>
        </div>
      </div>

      <div className="privacy-grid">
        {/* Left: Private State (Local Witness) */}
        <div className="privacy-panel private-panel">
          <div className="panel-header">
            <span className="panel-badge private-badge">
              <LockIcon width="12" height="12" />
              <span>Private Witness (Never Disclosed)</span>
            </span>
          </div>
          <p className="panel-desc">
            Kept strictly inside local client memory. Never leaves your browser, never transmitted in any network packet or on-chain transaction.
          </p>
          <div style={{ marginTop: '0.75rem' }}>
            <label htmlFor="local-secret-input">
              <code>localSecretKey(): Bytes&lt;32&gt;</code>
            </label>
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              <input
                id="local-secret-input"
                type="password"
                value={privateState.localSecretKey}
                onChange={(e) => onUpdateSecret(e.target.value)}
                style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
              />
              <button
                type="button"
                onClick={onRegenerateSecret}
                title="Generate fresh secret"
                style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', padding: '0.45rem 0.8rem' }}
              >
                <RefreshCwIcon width="13" height="13" />
                Fresh
              </button>
            </div>
          </div>
        </div>

        {/* Right: Public Ledger State */}
        <div className="privacy-panel public-panel">
          <div className="panel-header">
            <span className="panel-badge public-badge">
              <GlobeIcon width="12" height="12" />
              <span>Public Ledger State (Disclosed)</span>
            </span>
          </div>
          <p className="panel-desc">
            Opaque hash computed by <code>derivePublicKey()</code> via ZK circuit and disclosed deliberately through <code>disclose()</code>.
          </p>
          <div style={{ marginTop: '0.75rem' }}>
            <label>
              <code>export sealed ledger buyer: Bytes&lt;32&gt;</code>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <code className="hash" style={{ wordBreak: 'break-all', fontSize: '0.78rem', flex: 1 }}>
                {privateState.derivedPublicKey || 'Deriving...'}
              </code>
              <CopyButton value={privateState.derivedPublicKey} />
            </div>
          </div>
        </div>
      </div>

      {/* Proof Traces & Observable Verification */}
      {traces.length > 0 && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <CheckCircleIcon width="16" height="16" />
            <span>Cryptographic Proof Execution Trace</span>
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {traces.map((trace, idx) => (
              <div key={idx} className="trace-item" style={{ fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge badge-${trace.zkProofGenerated ? 'released' : 'refunded'}`} style={{ fontSize: '0.7rem' }}>
                      {trace.zkProofGenerated ? 'ZK-VERIFIED' : 'FAILED'}
                    </span>
                    <strong style={{ color: 'var(--text)' }}>Circuit: {trace.circuitName}()</strong>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {trace.timestamp}
                  </span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                  {trace.privateWitnessUsed}
                </div>
                {trace.zkProofHash && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>ZK Proof Hash:</span>
                    <code className="hash" style={{ fontSize: '0.74rem' }}>{trace.zkProofHash}</code>
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
