import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiPropertyOptional({
    description: 'First name of the user',
    minimum: 5,
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  firstName?: string | null;

  @ApiProperty({
    description: 'Last name of the user',
    minimum: 5,
  })
  @IsString()
  @MinLength(5)
  lastName!: string;

  @ApiProperty({
    description: 'Email of the user',
  })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({
    description: 'Date of email verification',
    format: 'date-time',
  })
  @IsOptional()
  emailVerified?: Date | null;

  @ApiProperty({
    description: 'Hashed password of the user',
    minimum: 10,
  })
  @IsString()
  @MinLength(10)
  password!: string;
}
