import {
  EscrowCreated as EscrowCreatedEvent,
  CypherRegistry as RegistryContract,
} from "../generated/CypherRegistry/CypherRegistry";

import { CypherProtocol as ProtocolContract } from "../generated/CypherRegistry/CypherProtocol";

import { Account, Escrow, Protocol } from "../generated/schema";

export function handleEscrowCreated(event: EscrowCreatedEvent): void {
  let protocol = Protocol.load(event.params.protocol.toHexString());

  if (protocol == null) {
    let escrowContract = EscrowContract.bind(event.params.escrow);

    protocol = new Protocol(event.params.protocol.toHexString());

    let escrow = Escrow.load(event.params.escrow.toHexString());
    if (escrow == null) {
      escrow = new Escrow(event.params.escrow.toHexString());
      escrow.token = event.params.token.toHexString();
      escrow.tokenThreshold = event.params.tokenThreshold;
      escrow.timeLimit = event.params.timeLimit;
      escrow.oracles = event.params.oracles.map((oracle) =>
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
    }

    protocol.escrow = escrow.id;
    protocol.name = "Unknown";

    protocol.save();
  }
}
