import { Type } from 'class-transformer';
// auth/dto/auth-result.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { TokenDto } from './token.dto';
import { UserEntity } from 'dtos/generated';

export class AuthResultDto {
  @ApiProperty({ type: TokenDto })
  token: TokenDto;

  @ApiProperty({ type: UserEntity })
  user: UserEntity;
}
