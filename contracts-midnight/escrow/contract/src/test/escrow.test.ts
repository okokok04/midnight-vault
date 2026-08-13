import { describe, expect, it } from 'vitest';
import { EscrowState, pureCircuits } from '../../managed/escrow/contract/index.js';
import { EscrowSimulator } from './escrow-simulator.js';

const secret = (label: string) => new TextEncoder().encode(label.padEnd(32, '\0')).slice(0, 32);

const buyerSecret = secret('buyer-secret');
const arbiterSecret = secret('arbiter-secret');
const sellerKey = pureCircuits.publicKeyOf(secret('seller-secret'));
const arbiterKey = pureCircuits.publicKeyOf(arbiterSecret);

describe('escrow contract — public ledger state', () => {
  it('initializes with disclosed public key hashes, never the raw secrets', () => {
    const sim = new EscrowSimulator(sellerKey, arbiterKey, 1_000n, buyerSecret);
    const ledger = sim.getLedger();

    expect(ledger.seller).toEqual(sellerKey);
    expect(ledger.arbiter).toEqual(arbiterKey);
    expect(ledger.milestoneAmount).toBe(1_000n);
    expect(ledger.state).toBe(EscrowState.AWAITING_DEPOSIT);
    expect(ledger.buyer).toEqual(pureCircuits.publicKeyOf(buyerSecret));
  });

  it('rejects a zero milestone amount', () => {
    expect(() => new EscrowSimulator(sellerKey, arbiterKey, 0n, buyerSecret)).toThrow();
  });

  it('rejects buyer and seller being the same party', () => {
    const buyerKey = pureCircuits.publicKeyOf(buyerSecret);
    expect(() => new EscrowSimulator(buyerKey, arbiterKey, 1_000n, buyerSecret)).toThrow();
  });
});

describe('escrow contract — private witness', () => {
  it('only lets the buyer whose secret hashes to `buyer` call deposit', () => {
    const sim = new EscrowSimulator(sellerKey, arbiterKey, 1_000n, buyerSecret);
    sim.asParty(secret('impostor'));
    expect(() => sim.deposit()).toThrow(/Only the buyer/);
  });

  it('locks the escrow once the real buyer deposits', () => {
    const sim = new EscrowSimulator(sellerKey, arbiterKey, 1_000n, buyerSecret);
    sim.asParty(buyerSecret);
    sim.deposit();
    expect(sim.getLedger().state).toBe(EscrowState.LOCKED);
  });

  it('only lets the arbiter resolve a dispute', () => {
    const sim = new EscrowSimulator(sellerKey, arbiterKey, 1_000n, buyerSecret);
    sim.asParty(buyerSecret);
    sim.deposit();
    sim.asParty(buyerSecret);
    expect(() => sim.resolve(true, 'seller-address', 'buyer-address')).toThrow(/Only the arbiter/);
  });

  it('blocks release/resolve until the deposit is a real, on-chain-applied balance', () => {
    // `deposit`'s receiveUnshielded() only registers this call's *claim* to
    // an incoming unshielded input; the guard circuits (unshieldedBalanceGte)
    // read the contract's *actual* balance, which the kernel only credits
    // once a real transaction is submitted and applied on a live network.
    // A single-circuit-at-a-time simulator never applies that transaction,
    // so this guard correctly still fires even right after a "successful"
    // simulated deposit -- proving funds can't be released before the chain
    // itself has actually recorded them. The full release/refund/resolve
    // money-movement path is exercised against a deployed network instead
    // (see docs/SETUP.md).
    const sim = new EscrowSimulator(sellerKey, arbiterKey, 1_000n, buyerSecret);
    sim.asParty(buyerSecret);
    sim.deposit();

    expect(() => sim.release('seller-address')).toThrow(/Contract balance is lower/);

    sim.asParty(arbiterSecret);
    expect(() => sim.resolve(true, 'seller-address', 'buyer-address')).toThrow(/Contract balance is lower/);
  });
});
