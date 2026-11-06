
import {
    IsString,
    IsBoolean,
    IsNumber,
    IsEnum,
    IsArray,
    ValidateNested,
    ValidateIf,
    Min,
    IsOptional,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreateAlternativaDto {

    @IsString()
    texto!: string;

    @IsBoolean()
    correta!: boolean;

}

export class CreateQuestaoDto {

    @IsString()
    texto!: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAlternativaDto)
    alternativas!: CreateAlternativaDto[];

}

export class CreateAvaliacaoDto {

    @IsString()
    ava_titulo!: string;

    @IsEnum(["QUIZ", "PROVA"])
    ava_tipo!: "QUIZ" | "PROVA";

    @IsNumber()
    @Min(1)
    ava_tempo_limite!: number;

    @IsBoolean()
    proctoring!: boolean;

    @IsNumber()
    mod_id!: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestaoDto)
    questoes!: CreateQuestaoDto[];

}

export class FinalizarProvaDto {

    @IsNumber()
    tentativaId!: number;

    @IsArray()
    respostas!: {
        que_id: number;
        alt_id: number;
    }[];

}
