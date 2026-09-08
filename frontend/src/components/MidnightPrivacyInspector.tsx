import type { CircuitProofTrace, MidnightPrivateState } from '../types/midnight';
import { CopyButton } from './CopyButton';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🛡️</span> Observable Privacy Behavior Inspector
          </h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Zero-Knowledge proofs allow you to prove authority (e.g. buyer/arbiter) without ever disclosing your secret key.
          </p>
        </div>
      </div>

      <div className="privacy-grid">
        {/* Left: Private State (Local Witness) */}
        <div className="privacy-panel private-panel">
          <div className="panel-header">
            <span className="panel-badge private-badge">🔒 Private Witness (Never Disclosed)</span>
          </div>
          <p className="panel-desc">
            Kept strictly inside browser memory / local storage. Never leaves the client machine, never sent in any network packet or on-chain transaction.
          </p>
          <div style={{ marginTop: '0.5rem' }}>
            <label htmlFor="local-secret-input" style={{ fontSize: '0.78rem' }}>
              <code>localSecretKey(): Bytes&lt;32&gt;</code>
            </label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                id="local-secret-input"
                type="password"
                value={privateState.localSecretKey}
                onChange={(e) => onUpdateSecret(e.target.value)}
                style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}
              />
              <button
                type="button"
                onClick={onRegenerateSecret}
                title="Generate fresh secret"
                style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}
              >
                🔄 Fresh
              </button>
            </div>
          </div>
        </div>

        {/* Right: Public Ledger State */}
        <div className="privacy-panel public-panel">
          <div className="panel-header">
            <span className="panel-badge public-badge">🌐 Public Ledger State (Disclosed)</span>
          </div>
          <p className="panel-desc">
            Opaque hash computed by <code>derivePublicKey()</code> via ZK circuit and disclosed deliberately through <code>disclose()</code>.
          </p>
          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.78rem' }}>
              <code>export sealed ledger buyer: Bytes&lt;32&gt;</code>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <code className="hash" style={{ wordBreak: 'break-all', fontSize: '0.78rem' }}>
                {privateState.derivedPublicKey || 'Deriving...'}
              </code>
              <CopyButton value={privateState.derivedPublicKey} />
            </div>
          </div>
        </div>
      </div>

      {/* Proof Traces & Observable Verification */}
      <div style={{ marginTop: '1.25rem' }}>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text)' }}>
          🔍 ZK Circuit Execution & Verification Traces
        </h4>
        {traces.length === 0 ? (
          <div className="empty-state" style={{ fontSize: '0.85rem' }}>
            No circuits called yet. Click <strong>"Deposit"</strong>, <strong>"Release"</strong>, or <strong>"Resolve"</strong> below to execute a Compact ZK circuit.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {traces.map((trace, idx) => (
              <div key={idx} className="trace-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span className="badge badge-midnight" style={{ marginRight: '0.5rem' }}>
                      Circuit: {trace.circuitName}()
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {trace.timestamp}
                    </span>
                  </div>
                  <span className="badge badge-released" style={{ fontSize: '0.7rem' }}>
                    Status: {trace.txStatus}
                  </span>
                </div>

                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', display: 'grid', gridTemplateColumns: '1fr', gap: '0.25rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Proven Witness: </span>
                    <span style={{ color: 'var(--success)' }}>{trace.privateWitnessUsed}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>ZK Proof Hash: </span>
                    <code className="hash">{trace.zkProofHash}</code>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Disclosed Ledger Outputs: </span>
                    <code>{JSON.stringify(trace.publicOutputs)}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
