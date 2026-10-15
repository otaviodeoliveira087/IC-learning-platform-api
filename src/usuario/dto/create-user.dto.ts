import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  usu_nome!: string;

  @IsEmail()
  @IsNotEmpty()
  usu_email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, {
    message: 'A senha deve possuir pelo menos 6 caracteres\n',
  })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'A senha deve possuir pelo menos um caractere especial\n',
  })
  @MaxLength(72, {
    message: 'A senha deve possuir no máximo 72 caracteres',
  })
  usu_senha!: string;

  @IsOptional()
  @IsString()
  usu_proposta?: string;

  @IsOptional()
  @IsString()
  usu_status?: string;

  @IsOptional()
  tiu_id?: number;
}