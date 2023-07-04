/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class AuthDto {
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 20, { message : 'Password has to be between 3 and 20 chars'})
  public password: string;
  
  @Length(8, 8, { message : 'PhoneNumber should be 8 chars'})
  public phoneNumber: string;
}
