import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';
//

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @MinLength(6)
  confirmPassword: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{9,14}$/, { message: 'Invalid phone number format' })
  phoneNumber: string;
}
