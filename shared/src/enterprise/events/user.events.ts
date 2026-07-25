import { DomainEvent } from './DomainEvent.js';


export interface UserRegisteredPayload {
  userId: string;
  email: string;
  roleId: string;
  registeredAt: Date;
}
export interface UserRegisteredEventV1 extends DomainEvent<UserRegisteredPayload> {}
