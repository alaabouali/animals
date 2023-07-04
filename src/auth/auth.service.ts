/* eslint-disable prettier/prettier */
import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { jwtSecret } from '../utils/constants';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async signup(dto: AuthDto) {
    const { email, password, phoneNumber } = dto;

    const foundUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (foundUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    await this.prisma.user.create({
      data: {
        email,
        hashedPassword,
        phoneNumber,
      },
    });

    return { message: 'signup was successful' };
  }


  async signin(dto: AuthDto, req: Request, res: Response) {
    const { email, password } = dto;

    const foundUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!foundUser) {
      throw new BadRequestException('does not exist !');
    }

    const isMatch = await this.comparePasswords({
      password,
      hash: foundUser.hashedPassword,
    });
    if (!isMatch) {
      throw new BadRequestException('does not exist !');
    }

    const token = await this.signToken({
      id: foundUser.id.toString(),
      email: foundUser.email,
    });

     if(!token) {
      throw new ForbiddenException()
     }
   res.cookie('token', token)

    //sign jwt and return to the user

    return res.send({message: 'logged in successfuly way'});
  }


  async signout(req: Request, res: Response) {
    res.clearCookie('token')
    return res.send({message: 'Logged out succefully'});
  }




  async hashPassword(password: string) {
    const saltOrRounds = 10;

    return await bcrypt.hash(password, saltOrRounds);
  }

  async comparePasswords(args: { password: string; hash: string }) {
    return await bcrypt.compare(args.password, args.hash);
  }

  async signToken(args: { id: string; email: string }) {
    const payload = args;

    return this.jwt.signAsync(payload, { secret: jwtSecret });
  }
}
