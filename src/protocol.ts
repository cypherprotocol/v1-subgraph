import {
  ProtocolCreated as ProtocolCreatedEvent,
  CypherProtocol as ProtocolContract,
} from "../generated/CypherProtocol/CypherProtocol";
import { Account, Protocol } from "../generated/schema";

export function handleProtocolCreated(event: ProtocolCreatedEvent): void {
  let protocol = Protocol.load(event.address.toHexString());

  if (protocol == null) {
    protocol = new Protocol(event.address.toHexString());

    let escrowContract = ProtocolContract.bind(event.address);

    let name = escrowContract.try_getProtocolName();
    protocol.name = name.reverted ? "Unknown" : name.value;
    protocol.architect = event.params.architect.toHexString();

    let account = Account.load(event.params.architect.toHexString());

    if (account == null) {
      account = new Account(event.params.architect.toHexString());
      account.save();
    }

    protocol.save();
  }
}
