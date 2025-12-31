import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { AuthInput, AuthResult } from 'lib/types';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersRepository } from 'src/users/users.repository';

export type JwtPayload = UserEntity;

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async authenticate(input: AuthInput): Promise<AuthResult> {
    if (!input.email || !input.password || input.password.trim() === '') {
      console.error('Invalid credentials provided');
      throw new UnauthorizedException('Invalid credentials');
    }
    const user = await this.validateUser(input);
    if (!user) {
      console.error('User not found or invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.signIn(user);
  }

  async validateUser(authInput: AuthInput): Promise<UserEntity | null> {
    const user = await this.userRepository.findByEmail(authInput.email);

    if (user && (await compare(authInput.password, user.password))) {
      return user;
    }
    return null;
  }

  async signIn(user: UserEntity): Promise<AuthResult> {
    const tokenPayload = new UserEntity(user);
    const accessToken = this.jwtService.sign(tokenPayload);
    return {
      token: {
        accessToken,
        issuedAt: Math.floor(Date.now()), // Current time in milliseconds
        expiresAt: Math.floor(Date.now()) + 30 * 60 * 1000, // 30 minutes later
      },
      user: tokenPayload,
    };
  }

  async renewSession(user: UserEntity): Promise<AuthResult> {
    return this.signIn(user);
  }
}
