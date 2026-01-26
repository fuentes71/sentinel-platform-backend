import { IsEmail, IsEnum, IsStrongPassword } from 'class-validator';
import { UserRole } from '../../common/enum/roles.enum';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
