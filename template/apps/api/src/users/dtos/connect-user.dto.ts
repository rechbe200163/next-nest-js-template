import { ApiProperty } from "@nestjs/swagger";

export class ConnectUserDto {
  @ApiProperty({
    type: "string",
    required: false,
  })
  id?: string;
  @ApiProperty({
    description: "Email of the user",
    type: "string",
    required: false,
  })
  email?: string;
}
