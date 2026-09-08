import type { MidnightWalletState } from '../hooks/useMidnightWallet';
import { CopyButton } from './CopyButton';

interface Props {
  wallet: MidnightWalletState;
}

export function MidnightLaceConnect({ wallet }: Props) {
  const {
    isLaceAvailable,
    isConnected,
    isConnecting,
    network,
    addresses,
    balance,
    error,
    connect,
    disconnect,
    switchNetwork,
  } = wallet;

  if (isConnected && addresses) {
    return (
      <div className="card midnight-wallet-card" data-testid="midnight-wallet-connected">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span className="badge badge-midnight" style={{ marginRight: '0.5rem' }}>
              Midnight {network.toUpperCase()}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Connected via {isLaceAvailable ? 'Lace Wallet' : 'Lace DApp Connector (Simulator)'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => switchNetwork(network === 'preprod' ? 'preview' : 'preprod')}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
            >
              Switch to {network === 'preprod' ? 'Preview' : 'Preprod'}
            </button>
            <button
              onClick={disconnect}
              className="danger"
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
            >
              Disconnect Lace
            </button>
          </div>
        </div>

        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Unshielded Address:</span>
            <code className="hash">{addresses.unshieldedAddress}</code>
            <CopyButton value={addresses.unshieldedAddress} />
          </div>

          {addresses.shieldedAddress && (
            <div style={{ fontSize: '0.85rem', display: 'center', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Shielded Address:</span>
              <code className="hash">{addresses.shieldedAddress.slice(0, 24)}...</code>
              <CopyButton value={addresses.shieldedAddress} />
            </div>
          )}

          {balance && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Balance: <strong style={{ color: 'var(--text)' }}>{(Number(balance.unshielded) / 1e6).toFixed(2)} tNIGHT</strong> (Unshielded)
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card midnight-wallet-card" data-testid="midnight-wallet-disconnected">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>Lace Wallet Connection</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Connect your Midnight Lace wallet to prove identity & execute ZK circuits on Preprod.
          </p>
        </div>

        <button
          onClick={connect}
          disabled={isConnecting}
          className="primary"
          style={{ minWidth: '160px' }}
        >
          {isConnecting ? 'Connecting...' : 'Connect Lace Wallet'}
        </button>
      </div>

      {error && (
        <div className="error-banner" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
          {error}
        </div>
      )}
    </div>
  );
}
