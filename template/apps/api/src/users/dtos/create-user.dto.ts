import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'First name of the user',
    minimum: 5,
    type: 'string',
    required: false,
    nullable: true,
  })
  firstName?: string | null;
  @ApiProperty({
    description: 'Last name of the user',
    minimum: 5,
    type: 'string',
  })
  lastName: string;
  @ApiProperty({
    description: 'Email of the user',
    type: 'string',
    required: false,
    nullable: true,
  })
  email?: string | null;
  @ApiProperty({
    description: 'Date of email verification',
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  emailVerified?: Date | null;
  @ApiProperty({
    description: 'Hashed password of the user',
    minimum: 10,
    type: 'string',
  })
  password: string;
}
