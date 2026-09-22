import { describe, expect, it } from 'vitest';
import { EscrowState, pureCircuits } from '../../managed/escrow/contract/index.js';
import { EscrowSimulator } from './escrow-simulator.js';

const secret = (label: string) => new TextEncoder().encode(label.padEnd(32, '\0')).slice(0, 32);

const buyerSecret = secret('buyer-secret');
const sellerSecret = secret('seller-secret');
const arbiterSecret = secret('arbiter-secret');
const sellerKey = pureCircuits.publicKeyOf(sellerSecret);
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
    expect(() => new EscrowSimulator(sellerKey, arbiterKey, 0n, buyerSecret)).toThrow(
      /Milestone amount must be greater than zero/
    );
  });

  it('rejects buyer and seller being the same party', () => {
    const buyerKey = pureCircuits.publicKeyOf(buyerSecret);
    expect(() => new EscrowSimulator(buyerKey, arbiterKey, 1_000n, buyerSecret)).toThrow(
      /Buyer and seller must be different parties/
    );
  });

  it('rejects buyer being the arbiter', () => {
    const buyerKey = pureCircuits.publicKeyOf(buyerSecret);
    expect(() => new EscrowSimulator(sellerKey, buyerKey, 1_000n, buyerSecret)).toThrow(
      /Buyer cannot also be the arbiter/
    );
  });

  it('rejects seller being the arbiter', () => {
    expect(() => new EscrowSimulator(sellerKey, sellerKey, 1_000n, buyerSecret)).toThrow(
      /Seller cannot also be the arbiter/
    );
  });
});

describe('escrow contract — private witness & lifecycle', () => {
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

  it('prevents duplicate deposits once escrow is funded', () => {
    const sim = new EscrowSimulator(sellerKey, arbiterKey, 1_000n, buyerSecret);
    sim.asParty(buyerSecret);
    sim.deposit();
    expect(() => sim.deposit()).toThrow(/Escrow already funded/);
  });

  it('only lets the arbiter resolve a dispute', () => {
    const sim = new EscrowSimulator(sellerKey, arbiterKey, 1_000n, buyerSecret);
    sim.asParty(buyerSecret);
    sim.deposit();
    sim.asParty(buyerSecret);
    expect(() => sim.resolve(true, 'seller-address', 'buyer-address')).toThrow(/Only the arbiter/);

    sim.asParty(sellerSecret);
    expect(() => sim.resolve(true, 'seller-address', 'buyer-address')).toThrow(/Only the arbiter/);
  });

  it('rejects resolve when escrow is still in awaiting deposit state', () => {
    const sim = new EscrowSimulator(sellerKey, arbiterKey, 1_000n, buyerSecret);
    sim.asParty(arbiterSecret);
    expect(() => sim.resolve(true, 'seller-address', 'buyer-address')).toThrow(/Escrow is not in a resolvable state/);
  });

  it('rejects release when escrow is still in awaiting deposit state', () => {
    const sim = new EscrowSimulator(sellerKey, arbiterKey, 1_000n, buyerSecret);
    sim.asParty(buyerSecret);
    expect(() => sim.release('seller-address')).toThrow(/Escrow is not in a releasable state/);
  });

  it('rejects refund when escrow is still in awaiting deposit state', () => {
    const sim = new EscrowSimulator(sellerKey, arbiterKey, 1_000n, buyerSecret);
    sim.asParty(buyerSecret);
    expect(() => sim.refund('buyer-address')).toThrow(/Escrow is not in a refundable state/);
  });

  it('blocks release/resolve until the deposit is a real, on-chain-applied balance', () => {
    const sim = new EscrowSimulator(sellerKey, arbiterKey, 1_000n, buyerSecret);
    sim.asParty(buyerSecret);
    sim.deposit();

    expect(() => sim.release('seller-address')).toThrow(/Contract balance is lower/);

    sim.asParty(arbiterSecret);
    expect(() => sim.resolve(true, 'seller-address', 'buyer-address')).toThrow(/Contract balance is lower/);
  });
});

