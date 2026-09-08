import { useMidnightWallet } from '../hooks/useMidnightWallet';
import { useMidnightContract } from '../hooks/useMidnightContract';
import { MidnightLaceConnect } from './MidnightLaceConnect';
import { MidnightPrivacyInspector } from './MidnightPrivacyInspector';
import { CopyButton } from './CopyButton';
import { MidnightFeedbackPanel } from './MidnightFeedbackPanel';
import { PREPROD_DEPLOYED_CONTRACT } from '../lib/midnight-crypto';

export function MidnightEscrowPanel() {
  const wallet = useMidnightWallet();
  const {
    privateState,
    escrowState,
    traces,
    executing,
    error,
    updateSecretKey,
    regenerateSecret,
    callCircuit,
  } = useMidnightContract();

  return (
    <div className="midnight-escrow-panel" data-testid="midnight-escrow-panel">
      {/* 1. Lace Wallet Connect */}
      <MidnightLaceConnect wallet={wallet} />

      {/* 2. Observable Privacy Behavior Inspector */}
      <div style={{ marginTop: '1.5rem' }}>
        <MidnightPrivacyInspector
          privateState={privateState}
          traces={traces}
          onRegenerateSecret={regenerateSecret}
          onUpdateSecret={updateSecretKey}
        />
      </div>

      {/* 3. Preprod Deployed Contract Status & Lifecycle */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📜</span> Midnight Compact Escrow State
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Milestone escrow contract deployed on Midnight Preprod network with ZK circuit verification.
            </p>
          </div>
          <span className={`badge badge-${escrowState.state.toLowerCase()}`}>
            ● {escrowState.state}
          </span>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
          <div style={{ background: 'var(--surface-alt)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Preprod Contract Address</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <code className="hash" style={{ fontSize: '0.78rem' }}>{PREPROD_DEPLOYED_CONTRACT.slice(0, 18)}...{PREPROD_DEPLOYED_CONTRACT.slice(-8)}</code>
              <CopyButton value={PREPROD_DEPLOYED_CONTRACT} />
            </div>
          </div>

          <div style={{ background: 'var(--surface-alt)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Milestone Amount</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
              {escrowState.milestoneAmount.toString()} tNIGHT
            </div>
          </div>

          <div style={{ background: 'var(--surface-alt)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Seller Key Hash</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <code className="hash" style={{ fontSize: '0.78rem' }}>{escrowState.sellerPk.slice(0, 16)}...</code>
              <CopyButton value={escrowState.sellerPk} />
            </div>
          </div>

          <div style={{ background: 'var(--surface-alt)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>Arbiter Key Hash</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <code className="hash" style={{ fontSize: '0.78rem' }}>{escrowState.arbiterPk.slice(0, 16)}...</code>
              <CopyButton value={escrowState.arbiterPk} />
            </div>
          </div>
        </div>

        {error && (
          <div className="error-banner" style={{ marginTop: '1.25rem', marginBottom: 0 }}>
            {error}
          </div>
        )}

        {/* 4. Circuit Invocation Controls */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Execute Compact ZK Circuits</h4>
            {executing && (
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="status-dot" style={{ background: 'var(--accent-cyan)', boxShadow: '0 0 8px var(--accent-cyan)' }} />
                Computing Zero-Knowledge Proof...
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="primary"
              disabled={executing || escrowState.state !== 'AWAITING_DEPOSIT'}
              onClick={() => callCircuit('deposit')}
              style={{ minWidth: '160px' }}
            >
              1. circuit deposit()
            </button>

            <button
              disabled={executing || escrowState.state !== 'LOCKED'}
              onClick={() => callCircuit('release')}
              style={{ minWidth: '160px' }}
            >
              2. circuit release()
            </button>

            <button
              disabled={executing || escrowState.state !== 'LOCKED'}
              onClick={() => callCircuit('refund')}
              style={{ minWidth: '160px' }}
            >
              3. circuit refund()
            </button>

            <button
              disabled={executing || escrowState.state !== 'LOCKED'}
              onClick={() => callCircuit('resolve', { paySeller: true })}
              style={{ minWidth: '160px' }}
            >
              4. circuit resolve()
            </button>
          </div>
        </div>
      </div>

      {/* 5. Anonymous Feedback & Survey Protocol Component */}
      <MidnightFeedbackPanel />
    </div>
  );
}
