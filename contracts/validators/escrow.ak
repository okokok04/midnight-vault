use aiken/interval
use cardano/address
use cardano/assets
use cardano/transaction.{Output, OutputReference, Transaction}
use stellar_vault/types.{
  Cancel, EscrowDatum, EscrowRedeemer, Refund, Release, Resolve, Split,
}
use stellar_vault/utils.{deadline_passed, paid_at_least, signed_by}

/// StellarVault milestone escrow validator.
///
/// This is the privacy-critical core of the product: the on-chain rule
/// that funds locked at the script address can *only* leave under one of
/// authorized conditions, each requiring the correct party's signature. No
/// off-chain service, API, or UI can bypass this — the guarantee holds
/// even if the backend in `backend/` is fully compromised.
///
/// Spend paths:
///   - Release  : buyer signs, seller is paid in full.
///   - Refund   : buyer signs after the deadline, buyer reclaims funds.
///   - Cancel   : seller signs, buyer is refunded early before deadline.
///   - Resolve  : arbiter signs, directs funds in full to either side.
///   - Split    : arbiter signs, divides funds proportionally between seller and buyer.
validator escrow {
  spend(
    datum: Option<EscrowDatum>,
    redeemer: EscrowRedeemer,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(EscrowDatum {
      buyer,
      seller,
      arbiter,
      milestone_amount,
      deadline,
    }) = datum

    when redeemer is {
      Release ->
        signed_by(self, buyer) && paid_at_least(
          self.outputs,
          seller,
          milestone_amount,
        )

      Refund -> signed_by(self, buyer) && deadline_passed(self, deadline)

      Cancel ->
        signed_by(self, seller) && paid_at_least(
          self.outputs,
          buyer,
          milestone_amount,
        )

      Resolve { pay_seller } -> {
        let payee =
          if pay_seller {
            seller
          } else {
            buyer
          }
        signed_by(self, arbiter) && paid_at_least(
          self.outputs,
          payee,
          milestone_amount,
        )
      }

      Split { pay_seller_amount, pay_buyer_amount } ->
        pay_seller_amount > 0 && pay_buyer_amount > 0 && pay_seller_amount + pay_buyer_amount == milestone_amount && signed_by(
          self,
          arbiter,
        ) && paid_at_least(self.outputs, seller, pay_seller_amount) && paid_at_least(
          self.outputs,
          buyer,
          pay_buyer_amount,
        )
    }
  }

  else(_) {
    fail
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const test_buyer = #"11111111111111111111111111111111111111111111111111111111"
const test_seller = #"22222222222222222222222222222222222222222222222222222222"
const test_arbiter = #"33333333333333333333333333333333333333333333333333333333"
const test_milestone = 10_000_000
const test_deadline = 1_700_000_000

fn sample_datum() -> EscrowDatum {
  EscrowDatum {
    buyer: test_buyer,
    seller: test_seller,
    arbiter: test_arbiter,
    milestone_amount: test_milestone,
    deadline: test_deadline,
  }
}

fn sample_ref() -> OutputReference {
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: 0,
  }
}

fn payment_output(recipient: ByteArray, amount: Int) -> Output {
  Output {
    address: address.from_verification_key(recipient),
    value: assets.from_lovelace(amount),
    datum: transaction.NoDatum,
    reference_script: None,
  }
}

test escrow_spend_release_success() {
  let tx =
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [test_buyer],
      outputs: [payment_output(test_seller, test_milestone)],
    }

  escrow.spend(Some(sample_datum()), Release, sample_ref(), tx)
}

test escrow_spend_release_fails_unauthorized() {
  let tx =
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [test_seller],
      outputs: [payment_output(test_seller, test_milestone)],
    }

  !escrow.spend(Some(sample_datum()), Release, sample_ref(), tx)
}

test escrow_spend_release_fails_insufficient_amount() {
  let tx =
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [test_buyer],
      outputs: [payment_output(test_seller, test_milestone - 1)],
    }

  !escrow.spend(Some(sample_datum()), Release, sample_ref(), tx)
}

test escrow_spend_refund_success() {
  let tx =
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [test_buyer],
      validity_range: interval.after(test_deadline),
    }

  escrow.spend(Some(sample_datum()), Refund, sample_ref(), tx)
}

test escrow_spend_refund_fails_before_deadline() {
  let tx =
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [test_buyer],
      validity_range: interval.after(test_deadline - 1),
    }

  !escrow.spend(Some(sample_datum()), Refund, sample_ref(), tx)
}

test escrow_spend_refund_fails_unauthorized() {
  let tx =
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [test_seller],
      validity_range: interval.after(test_deadline),
    }

  !escrow.spend(Some(sample_datum()), Refund, sample_ref(), tx)
}

test escrow_spend_cancel_success() {
  let tx =
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [test_seller],
      outputs: [payment_output(test_buyer, test_milestone)],
    }

  escrow.spend(Some(sample_datum()), Cancel, sample_ref(), tx)
}

test escrow_spend_cancel_fails_unauthorized() {
  let tx =
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [test_buyer],
      outputs: [payment_output(test_buyer, test_milestone)],
    }

  !escrow.spend(Some(sample_datum()), Cancel, sample_ref(), tx)
}

test escrow_spend_resolve_seller_success() {
  let tx =
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [test_arbiter],
      outputs: [payment_output(test_seller, test_milestone)],
    }

  escrow.spend(
    Some(sample_datum()),
    Resolve { pay_seller: True },
    sample_ref(),
    tx,
  )
}

test escrow_spend_resolve_buyer_success() {
  let tx =
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [test_arbiter],
      outputs: [payment_output(test_buyer, test_milestone)],
    }

  escrow.spend(
    Some(sample_datum()),
    Resolve { pay_seller: False },
    sample_ref(),
    tx,
  )
}

test escrow_spend_resolve_fails_unauthorized() {
  let tx =
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [test_buyer],
      outputs: [payment_output(test_seller, test_milestone)],
    }

  !escrow.spend(
    Some(sample_datum()),
    Resolve { pay_seller: True },
    sample_ref(),
    tx,
  )
}

test escrow_spend_split_success() {
  let tx =
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [test_arbiter],
      outputs: [
        payment_output(test_seller, 6_000_000),
        payment_output(test_buyer, 4_000_000),
      ],
    }

  escrow.spend(
    Some(sample_datum()),
    Split { pay_seller_amount: 6_000_000, pay_buyer_amount: 4_000_000 },
    sample_ref(),
    tx,
  )
}

test escrow_spend_split_fails_invalid_sum() {
  let tx =
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [test_arbiter],
      outputs: [
        payment_output(test_seller, 6_000_000),
        payment_output(test_buyer, 3_000_000),
      ],
    }

  !escrow.spend(
    Some(sample_datum()),
    Split { pay_seller_amount: 6_000_000, pay_buyer_amount: 3_000_000 },
    sample_ref(),
    tx,
  )
}

test escrow_spend_split_fails_non_positive_amount() {
  let tx =
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [test_arbiter],
      outputs: [
        payment_output(test_seller, 0),
        payment_output(test_buyer, 10_000_000),
      ],
    }

  !escrow.spend(
    Some(sample_datum()),
    Split { pay_seller_amount: 0, pay_buyer_amount: 10_000_000 },
    sample_ref(),
    tx,
  )
}

test escrow_spend_split_fails_unauthorized() {
  let tx =
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [test_buyer],
      outputs: [
        payment_output(test_seller, 6_000_000),
        payment_output(test_buyer, 4_000_000),
      ],
    }

  !escrow.spend(
    Some(sample_datum()),
    Split { pay_seller_amount: 6_000_000, pay_buyer_amount: 4_000_000 },
    sample_ref(),
    tx,
  )
}
