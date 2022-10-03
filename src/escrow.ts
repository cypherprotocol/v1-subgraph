import {
  AmountSent as AmountSentEvent,
  AmountStopped as AmountStoppedEvent,
  TransactionDenied as TransactionDeniedEvent,
  OracleAdded as OracleAddedEvent,
  TimeLimitSet as TimeLimitSetEvent,
  AddressAddedToWhitelist as AddressAddedToWhitelistEvent,
  CypherEscrow as EscrowContract,
} from "../generated/CypherEscrow/CypherEscrow";

import {
  Account,
  Escrow,
  Protocol,
  EscrowTransaction,
} from "../generated/schema";

import { crypto } from "@graphprotocol/graph-ts";

export function handleAmountSent(event: AmountSentEvent): void {}

/// The main escrow function, this is from addLimiter() which is called in escrowETH() and escrowTokens()
export function handleAmountStopped(event: AmountStoppedEvent): void {
  // Create new escrowTx to display in UI
  let escrowTx = EscrowTransaction.load(event.address.toHex());
  if (escrowTx == null) return;

  // Calculate the id which is a hash of the event params
  escrowTx.id = JSON.stringify(
    crypto.keccak256(
      event.params.from,
      event.params.to,
      event.params.tokenContract,
      event.params.amount,
      event.params.counter
    )
  );
  escrowTx.from = event.params.from.toHexString();
  escrowTx.to = event.params.to.toHexString();
  escrowTx.token = event.params.tokenContract.toHexString();
  escrowTx.amount = event.params.amount;
  escrowTx.counter = event.params.counter;
  escrowTx.status = "STOPPED";

  escrowTx.save();
}

export function handleTransactionDenied(event: TransactionDeniedEvent): void {}

export function handleOracleAdded(event: OracleAddedEvent): void {
  let escrow = Escrow.load(event.address.toHex());
  if (escrow == null) {
    escrow = new Escrow(event.address.toHex());
  }

  escrow.oracles = escrow.oracles.concat([event.params.oracle.toHex()]);

  escrow.save();
}

export function handleTimeLimitSet(event: TimeLimitSetEvent): void {
  let escrow = Escrow.load(event.address.toHexString());
  if (escrow == null) return;

  escrow.timeLimit = event.params.timeLimit;

  escrow.save();
}

export function handleAddressAddedToWhitelist(
  event: AddressAddedToWhitelistEvent
): void {
  let escrow = Escrow.load(event.address.toHexString());
  if (escrow == null) return;

  escrow.whitelist = escrow.whitelist.concat([event.params.user.toHexString()]);

  escrow.save();
}
