import {
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

import { Address, crypto, ethereum } from "@graphprotocol/graph-ts";

/// The main escrow function, this is from addLimiter() which is called in escrowETH() and escrowTokens()
export function handleAmountStopped(event: AmountStoppedEvent): void {
  // Create new escrowTx to display in UI
  let escrowTx = EscrowTransaction.load(event.address.toHex());
  if (escrowTx == null) return;

  let tupleArray: Array<ethereum.Value> = [
    ethereum.Value.fromAddress(
      Address.fromString(event.params.from.toHexString())
    ),
    ethereum.Value.fromAddress(
      Address.fromString(event.params.to.toHexString())
    ),
    ethereum.Value.fromUnsignedBigInt(event.params.counter),
  ];

  let tuple = tupleArray as ethereum.Tuple;

  let encoded = ethereum.encode(ethereum.Value.fromTuple(tuple))!;

  // Calculate the id which is a hash of the event params
  escrowTx.id =
    crypto.keccak256(encoded).toHexString() + event.address.toHexString();

  escrowTx.from = event.params.from.toHexString();
  escrowTx.to = event.params.to.toHexString();
  escrowTx.token = event.params.tokenContract.toHexString();
  escrowTx.amount = event.params.amount;
  escrowTx.counter = event.params.counter;
  escrowTx.status = "STOPPED";

  escrowTx.save();
}

export function handleTransactionDenied(event: TransactionDeniedEvent): void {
  // Calculate the id which is a hash of the event params
  let id = event.params.key.toHexString() + event.address.toHexString();
  // Load the escrowTx with the specific key
  let escrowTx = EscrowTransaction.load(id);
  if (escrowTx == null) return;

  escrowTx.status = "DENIED";

  escrowTx.save();
}

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
