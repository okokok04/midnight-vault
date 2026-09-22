use aiken/collection/list
use aiken/interval.{Finite}
use cardano/address.{VerificationKey}
use cardano/assets.{lovelace_of}
use cardano/transaction.{Output, Transaction}

/// Pure predicates shared by every spend path in the escrow validator.
///
/// Keeping these as small, independently-testable functions is the point:
/// the privacy/security-critical guarantee of this contract ("funds only
/// move when the right party signs and the right payee gets paid") lives
/// entirely in these three checks, not scattered across the validator body.
/// Is `key` one of the transaction's required signers?
pub fn signed_by(transaction: Transaction, key: ByteArray) -> Bool {
  list.has(transaction.extra_signatories, key)
}

/// Does at least one output pay `amount` lovelace or more to the wallet
/// identified by `key`?
pub fn paid_at_least(outputs: List<Output>, key: ByteArray, amount: Int) -> Bool {
  list.any(
    outputs,
    fn(output) {
      when output.address.payment_credential is {
        VerificationKey(hash) ->
          hash == key && lovelace_of(output.value) >= amount
        _ -> False
      }
    },
  )
}

/// Has the transaction's validity range started at or after `deadline`?
/// We only trust the *lower* bound: a transaction cannot be validated
/// with a lower bound in the future, so `lower_bound >= deadline` is a
/// safe on-chain proxy for "the deadline has passed".
pub fn deadline_passed(transaction: Transaction, deadline: Int) -> Bool {
  when transaction.validity_range.lower_bound.bound_type is {
    Finite(lower) -> lower >= deadline
    _ -> False
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test signed_by_finds_matching_signatory() {
  let alice = #"aa"
  let bob = #"bb"
  let tx =
    Transaction { ..transaction.placeholder, extra_signatories: [alice, bob] }

  signed_by(tx, alice) && !signed_by(tx, #"cc")
}

test paid_at_least_matches_amount_and_recipient() {
  let seller = #"ff"
  let outputs =
    [
      Output {
        address: address.from_verification_key(seller),
        value: assets.from_lovelace(5_000_000),
        datum: transaction.NoDatum,
        reference_script: None,
      },
    ]

  paid_at_least(outputs, seller, 5_000_000) && !paid_at_least(
    outputs,
    seller,
    5_000_001,
  ) && !paid_at_least(outputs, #"11", 5_000_000)
}

test deadline_passed_when_valid_lower_bound() {
  let deadline = 1_700_000_000
  let tx_after =
    Transaction {
      ..transaction.placeholder,
      validity_range: interval.after(1_700_000_001),
    }
  let tx_exact =
    Transaction {
      ..transaction.placeholder,
      validity_range: interval.after(deadline),
    }

  deadline_passed(tx_after, deadline) && deadline_passed(tx_exact, deadline)
}

test deadline_passed_when_before_deadline() {
  let deadline = 1_700_000_000
  let tx_before =
    Transaction {
      ..transaction.placeholder,
      validity_range: interval.after(1_699_999_999),
    }

  !deadline_passed(tx_before, deadline)
}

test deadline_passed_when_unbounded() {
  let deadline = 1_700_000_000
  let tx_unbounded =
    Transaction {
      ..transaction.placeholder,
      validity_range: interval.everything,
    }

  !deadline_passed(tx_unbounded, deadline)
}

