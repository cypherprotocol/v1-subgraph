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

export function handleOracleAdded(event: OracleAddedEvent): void {}

export function handleTimeLimitSet(event: TimeLimitSetEvent): void {}

export function handleAddressAddedToWhitelist(
  event: AddressAddedToWhitelistEvent
): void {}

export function handleWithdrawApproved(event: WithdrawApprovedEvent): void {}

export function handleWithdrawDisapproved(
  event: WithdrawDisapprovedEvent
): void {}
