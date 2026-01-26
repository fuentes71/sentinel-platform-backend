import { UserRole } from '../enum/roles.enum';

export interface WsUser {
  id: string;
  email: string;
  role: UserRole;
}
