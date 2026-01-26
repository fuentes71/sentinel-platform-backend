import { UserRole } from '../../common/enum/roles.enum';

export class User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}
