import {
  EscrowCreated as EscrowCreatedEvent,
  CypherRegistry as RegistryContract,
} from "../generated/CypherRegistry/CypherRegistry";

import { CypherProtocol as ProtocolContract } from "../generated/CypherRegistry/CypherProtocol";

import { Account, Escrow, Protocol } from "../generated/schema";

export function handleEscrowCreated(event: EscrowCreatedEvent): void {
  let protocol = Protocol.load(event.params.protocol.toHexString());

  if (protocol == null) return;

  let escrow = Escrow.load(event.params.escrow.toHexString());
  if (escrow == null) {
    escrow = new Escrow(event.params.escrow.toHexString());
    escrow.token = event.params.token.toHexString();
    escrow.tokenThreshold = event.params.tokenThreshold;
    escrow.timeLimit = event.params.timeLimit;
    escrow.whitelist = [];
    escrow.oracles = event.params.oracles.map<string>((oracle) =>
      oracle.toHexString()
    );

    event.params.oracles.forEach((oracle) => {
      let account = Account.load(oracle.toHexString());
      if (account == null) {
        account = new Account(oracle.toHexString());
        account.save();
      }
    });

    escrow.save();

    let escrowContract = ProtocolContract.bind(event.params.protocol);

    protocol = new Protocol(event.params.protocol.toHexString());

    let name = escrowContract.try_getProtocolName();
    protocol.name = name.reverted ? "Unknown" : name.value;
    protocol.escrow = escrow.id;

    protocol.save();
  }
}
