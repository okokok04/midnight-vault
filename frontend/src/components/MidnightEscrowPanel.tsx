import { useMidnightWallet } from '../hooks/useMidnightWallet';
import { useMidnightContract } from '../hooks/useMidnightContract';
import { MidnightLaceConnect } from './MidnightLaceConnect';
import { MidnightPrivacyInspector } from './MidnightPrivacyInspector';
import { CopyButton } from './CopyButton';
import { LayersIcon, CheckCircleIcon, ExternalLinkIcon } from './Icons';
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
    resetEscrowState,
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
              <LayersIcon width="20" height="20" />
              <span>Midnight Compact Escrow State</span>
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
          <div style={{ background: 'var(--surface-alt)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Preprod Contract Address</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <code className="hash" style={{ fontSize: '0.76rem' }}>{PREPROD_DEPLOYED_CONTRACT.slice(0, 18)}...{PREPROD_DEPLOYED_CONTRACT.slice(-8)}</code>
              <CopyButton value={PREPROD_DEPLOYED_CONTRACT} />
            </div>
          </div>

          <div style={{ background: 'var(--surface-alt)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Milestone Amount</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-purple)', fontVariantNumeric: 'tabular-nums' }}>
              {escrowState.milestoneAmount.toString()} tNIGHT
            </div>
          </div>

          <div style={{ background: 'var(--surface-alt)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Seller Key Hash</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <code className="hash" style={{ fontSize: '0.76rem' }}>{escrowState.sellerPk.slice(0, 16)}...</code>
              <CopyButton value={escrowState.sellerPk} />
            </div>
          </div>

          <div style={{ background: 'var(--surface-alt)', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>Arbiter Key Hash</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <code className="hash" style={{ fontSize: '0.76rem' }}>{escrowState.arbiterPk.slice(0, 16)}...</code>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>Execute Compact ZK Circuits</h4>
            {executing && (
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="status-dot" style={{ background: 'var(--accent-cyan)', boxShadow: '0 0 8px var(--accent-cyan)' }} />
                Computing Zero-Knowledge Proof...
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => callCircuit('deposit')}
              disabled={executing || escrowState.state !== 'AWAITING_DEPOSIT'}
              className={escrowState.state === 'AWAITING_DEPOSIT' ? 'primary' : undefined}
              style={{ fontSize: '0.82rem' }}
            >
              1. circuit deposit()
            </button>

            <button
              onClick={() => callCircuit('release')}
              disabled={executing || escrowState.state !== 'LOCKED'}
              className={escrowState.state === 'LOCKED' ? 'primary' : undefined}
              style={{ fontSize: '0.82rem' }}
            >
              2. circuit release()
            </button>

            <button
              onClick={() => callCircuit('refund')}
              disabled={executing || escrowState.state !== 'LOCKED'}
              className="danger"
              style={{ fontSize: '0.82rem' }}
            >
              circuit refund()
            </button>

            <button
              onClick={() => callCircuit('resolve', { paySeller: true })}
              disabled={executing || escrowState.state !== 'LOCKED'}
              style={{ fontSize: '0.82rem' }}
            >
              circuit resolve(seller)
            </button>

            {escrowState.state !== 'AWAITING_DEPOSIT' && escrowState.state !== 'LOCKED' && (
              <button
                onClick={resetEscrowState}
                style={{ fontSize: '0.82rem', borderColor: 'var(--accent-purple)', color: 'var(--accent-purple)' }}
                title="Reset demo lifecycle back to Step 1: Deposit"
              >
                ↻ Reset Demo Lifecycle
              </button>
            )}
          </div>
        </div>


        {/* 5. Explorer Verification Link */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircleIcon width="14" height="14" color="var(--success)" />
            <span>Verifiable Compact Contract Bytecode & ZK Proving Keys</span>
          </div>
          <a
            href="https://indexer.preprod.midnight.network"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            Inspect on Midnight Indexer <ExternalLinkIcon width="12" height="12" />
          </a>
        </div>
      </div>
    </div>
  );
}
