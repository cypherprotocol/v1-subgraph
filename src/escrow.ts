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
  // get the prococol
  let protocol = Protocol.load(event.params.protocol.toHexString());

  // Create new escrowTx to display in UI
  let escrowTx = EscrowTransaction.load(event.address.toHex());
  if (escrowTx == null) return;

  let tupleArray: Array<ethereum.Value> = [
    ethereum.Value.fromAddress(
      Address.fromString(event.params.origin.toHexString())
    ),
    ethereum.Value.fromAddress(
      Address.fromString(event.params.protocol.toHexString())
    ),
    ethereum.Value.fromAddress(
      Address.fromString(event.params.dst.toHexString())
    ),
    ethereum.Value.fromUnsignedBigInt(event.params.counter),
  ];

  let tuple = tupleArray as ethereum.Tuple;

  let encoded = ethereum.encode(ethereum.Value.fromTuple(tuple))!;

  // Calculate the id which is a hash of the event params
  escrowTx.id = crypto.keccak256(encoded).toHexString();

  escrowTx.origin = event.params.origin.toHexString(); // account type
  escrowTx.protocol = event.params.protocol.toHexString(); // protocol type
  escrowTx.dst = event.params.dst.toHexString(); // account type
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
