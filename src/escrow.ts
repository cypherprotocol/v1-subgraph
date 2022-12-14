import {
  AmountStopped as AmountStoppedEvent,
  TransactionDenied as TransactionDeniedEvent,
  TransactionAccepted as TransactionAcceptedEvent,
  OracleAdded as OracleAddedEvent,
  TimeLimitSet as TimeLimitSetEvent,
  AddressAddedToWhitelist as AddressAddedToWhitelistEvent,
  CypherEscrow as EscrowContract,
} from "../generated/CypherEscrow/CypherEscrow";

import { CypherRegistry as RegistryContract } from "../generated/CypherRegistry/CypherRegistry";
import { sendEPNSNotification } from "./EPNSNotification";

import {
  Account,
  Escrow,
  Protocol,
  EscrowTransaction,
} from "../generated/schema";

import { Address, crypto, ethereum } from "@graphprotocol/graph-ts";

function findOrCreate(address: string): Account {
  let account = Account.load(address);
  if (account === null) {
    account = new Account(address);
    account.save();
    return account;
  } else {
    return account;
  }
}

/// The main escrow function, this is from addLimiter() which is called in escrowETH() and escrowTokens()
export function handleAmountStopped(event: AmountStoppedEvent): void {
  let escrowTx = EscrowTransaction.load(event.params.key.toHexString());
  if (escrowTx == null) {
    escrowTx = new EscrowTransaction(event.params.key.toHexString());
    escrowTx.txid = event.transaction.hash.toHexString();
    escrowTx.escrow = event.address.toHexString();
    escrowTx.origin = findOrCreate(event.params.origin.toHexString()).id; // account type
    escrowTx.protocol = event.params.protocol.toHexString(); // protocol type
    escrowTx.dst = findOrCreate(event.params.dst.toHexString()).id; // account type
    escrowTx.token = event.params.tokenContract.toHexString();
    escrowTx.amount = event.params.amount;
    escrowTx.counter = event.params.counter;
    escrowTx.status = "PENDING";

    let txid = event.transaction.hash.toHexString();
    let escrow = event.address.toHexString();
    let origin = event.params.origin.toHexString();
    let protocol = event.params.protocol.toHexString();
    let dst = event.params.dst.toHexString();
    let token = event.params.tokenContract.toHexString();
    let amount = event.params.amount;
    let counter = event.params.counter;

    let notification = `{\"txid\": \"${txid}\", \"escrow\": \"${escrow}\", \"origin\": \"${origin}\", \"protocol\": \"${protocol}\", \"dst\": \"${dst}\", \"token\": \"${token}\", \"amount\": \"${amount}\", \"counter\": \"${counter}\"}`;

    let escrowContract = Escrow.load(escrow);
    if (escrowContract != null) {
      let oracles = escrowContract.oracles;
      for (let i = 0; i < oracles.length; i++) {
        sendEPNSNotification(oracles[i], notification);
      }
    }
  }

  escrowTx.save();
}

export function handleTransactionAccepted(
  event: TransactionAcceptedEvent
): void {
  // Calculate the id which is a hash of the event params
  let id = event.params.key.toHexString();
  // Load the escrowTx with the specific key
  let escrowTx = EscrowTransaction.load(id);
  if (escrowTx == null) return;

  escrowTx.status = "ACCEPTED";

  escrowTx.save();
}

export function handleTransactionDenied(event: TransactionDeniedEvent): void {
  // Calculate the id which is a hash of the event params
  let id = event.params.key.toHexString();
  // Load the escrowTx with the specific key
  let escrowTx = EscrowTransaction.load(id);
  if (escrowTx == null) return;

  escrowTx.status = "DENIED";

  escrowTx.save();
}

export function handleOracleAdded(event: OracleAddedEvent): void {
  let escrow = Escrow.load(event.address.toHexString());
  if (escrow == null) {
    escrow = new Escrow(event.address.toHexString());
  }

  escrow.oracles = escrow.oracles.concat([event.params.oracle.toHexString()]);

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
