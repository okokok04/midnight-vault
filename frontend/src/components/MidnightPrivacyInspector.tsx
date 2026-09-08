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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>🛡️</span> Observable Privacy Behavior Inspector
          </h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Zero-Knowledge proofs allow you to prove buyer/arbiter authority without ever disclosing your secret key.
          </p>
        </div>
        <span className="badge badge-midnight">ZK Selective Disclosure</span>
      </div>

      {/* Visual Pipeline Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem', marginBottom: '1rem', background: 'rgba(0, 0, 0, 0.2)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.78rem', color: '#fb7185', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>🔒</span> 1. Local Private Witness
        </div>
        <div style={{ fontSize: '0.78rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>⚡</span> 2. Compact Circuit (ZK-IR)
        </div>
        <div style={{ fontSize: '0.78rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>🌐</span> 3. Public Preprod State
        </div>
      </div>

      <div className="privacy-grid">
        {/* Left: Private State (Local Witness) */}
        <div className="privacy-panel private-panel">
          <div className="panel-header">
            <span className="panel-badge private-badge">🔒 Private Witness (Never Disclosed)</span>
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
                style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', padding: '0.45rem 0.8rem' }}
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
      <div style={{ marginTop: '1.5rem' }}>
        <h4 style={{ margin: '0 0 0.65rem', fontSize: '0.95rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>🔍</span> ZK Circuit Execution & Verification Traces
        </h4>
        {traces.length === 0 ? (
          <div style={{ background: 'var(--surface-alt)', padding: '1.25rem', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', border: '1px dashed var(--border)' }}>
            No circuits called yet. Click <strong>"1. circuit deposit()"</strong> or <strong>"2. circuit release()"</strong> below to execute a Compact ZK circuit.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {traces.map((trace, idx) => (
              <div key={idx} className="trace-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-midnight">
                      Circuit: {trace.circuitName}()
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {trace.timestamp}
                    </span>
                  </div>
                  <span className="badge badge-released">
                    {trace.txStatus}
                  </span>
                </div>

                <div style={{ marginTop: '0.65rem', fontSize: '0.82rem', display: 'grid', gridTemplateColumns: '1fr', gap: '0.35rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Proven Witness: </span>
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>{trace.privateWitnessUsed}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>ZK Proof Hash: </span>
                    <code className="hash">{trace.zkProofHash}</code>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Disclosed Ledger Outputs: </span>
                    <code className="hash">{JSON.stringify(trace.publicOutputs)}</code>
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
