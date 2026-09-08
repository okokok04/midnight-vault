import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MidnightLaceConnect } from './MidnightLaceConnect';
import { MidnightPrivacyInspector } from './MidnightPrivacyInspector';
import { MidnightEscrowPanel } from './MidnightEscrowPanel';
import type { MidnightWalletState } from '../hooks/useMidnightWallet';

describe('MidnightLaceConnect', () => {
  it('renders disconnected state and calls connect on click', () => {
    const connectMock = vi.fn();
    const wallet: MidnightWalletState = {
      isLaceAvailable: true,
      isConnected: false,
      isConnecting: false,
      network: 'preprod',
      addresses: null,
      balance: null,
      error: null,
      connect: connectMock,
      disconnect: vi.fn(),
      switchNetwork: vi.fn(),
    };

    render(<MidnightLaceConnect wallet={wallet} />);
    expect(screen.getByText('Connect Lace Wallet')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Connect Lace Wallet'));
    expect(connectMock).toHaveBeenCalledTimes(1);
  });

  it('renders connected state with addresses and balance', () => {
    const disconnectMock = vi.fn();
    const wallet: MidnightWalletState = {
      isLaceAvailable: true,
      isConnected: true,
      isConnecting: false,
      network: 'preprod',
      addresses: {
        unshieldedAddress: 'mn_unshielded1234567890',
        shieldedAddress: 'mn_shieldedabcdef123456',
      },
      balance: { unshielded: 5000000000n, shielded: 10000000000n },
      error: null,
      connect: vi.fn(),
      disconnect: disconnectMock,
      switchNetwork: vi.fn(),
    };

    render(<MidnightLaceConnect wallet={wallet} />);
    expect(screen.getByText(/mn_unshielded/i)).toBeInTheDocument();
    expect(screen.getByText('Disconnect')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Disconnect'));
    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });
});

describe('MidnightPrivacyInspector', () => {
  it('displays private witness and public state correctly', () => {
    const updateSecret = vi.fn();
    const regenSecret = vi.fn();

    render(
      <MidnightPrivacyInspector
        privateState={{
          localSecretKey: '0x1122334455667788990011223344556677889900112233445566778899001122',
          derivedPublicKey: '0x9988776655443322110099887766554433221100998877665544332211009988',
        }}
        traces={[]}
        onRegenerateSecret={regenSecret}
        onUpdateSecret={updateSecret}
      />
    );

    expect(screen.getByText('Observable Privacy Behavior Inspector')).toBeInTheDocument();
    expect(screen.getAllByText(/Private Witness/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Public Ledger State/i).length).toBeGreaterThan(0);
    expect(screen.getByText('0x9988776655443322110099887766554433221100998877665544332211009988')).toBeInTheDocument();
  });
});

describe('MidnightEscrowPanel', () => {
  it('renders escrow panel and allows calling circuits', async () => {
    render(<MidnightEscrowPanel />);

    expect(screen.getByText('Midnight Compact Escrow State')).toBeInTheDocument();
    expect(screen.getByText('1. circuit deposit()')).toBeInTheDocument();

    const depositBtn = screen.getByText('1. circuit deposit()');
    fireEvent.click(depositBtn);

    await waitFor(() => {
      expect(screen.getByText(/Circuit: deposit\(\)/i)).toBeInTheDocument();
    });
  });
});
