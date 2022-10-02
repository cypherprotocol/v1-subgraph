import {
  AmountSent as AmountSentEvent,
  AmountStopped as AmountStoppedEvent,
  TransactionDenied as TransactionDeniedEvent,
  OracleAdded as OracleAddedEvent,
  TimeLimitSet as TimeLimitSetEvent,
  AddressAddedToWhitelist as AddressAddedToWhitelistEvent,
  WithdrawApproved as WithdrawApprovedEvent,
  WithdrawDisapproved as WithdrawDisapprovedEvent,
  CypherEscrow as EscrowContract,
} from "../generated/CypherEscrow/CypherEscrow";

import {
  Account,
  Escrow,
  Protocol,
  EscrowTransaction,
} from "../generated/schema";

export function handleAmountSent(event: AmountSentEvent): void {}

export function handleAmountStopped(event: AmountStoppedEvent): void {}

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

export function handleWithdrawApproved(event: WithdrawApprovedEvent): void {
  let escrow = Escrow.load(event.address.toHexString());
  if (escrow == null) return;

  // TODO

  escrow.save();
}

export function handleWithdrawDisapproved(
  event: WithdrawDisapprovedEvent
): void {}
