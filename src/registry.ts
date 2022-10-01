import {
  EscrowCreated as EscrowCreatedEvent,
  CypherRegistry as RegistryContract,
} from "../generated/CypherRegistry/CypherRegistry";

import { Account, Escrow, Protocol } from "../generated/schema";

export function handleEscrowCreated(event: EscrowCreatedEvent): void {}
