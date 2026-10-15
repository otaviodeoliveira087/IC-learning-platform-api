import {
    IsString,
    IsOptional,
} from 'class-validator';

export class createCursoDto {
    @IsString()
    cur_titulo!: string;

    @IsString()
    cur_descricao!: string;

    @IsString()
    cur_publico!: string;

    @IsString()
    cur_n_modulos!: string;

    @IsString()
    cur_conteudo_modulos!: string;

    @IsOptional()
    @IsString()
    cur_carga_horaria_modulos?: string;

    @IsString()
    cur_forma_avaliacao!: string;
}
