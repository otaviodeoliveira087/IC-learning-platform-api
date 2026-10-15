import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserProfessorDto } from './dto/create-user-professor.dto.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { usu_usuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { s3 }
    from '../config/aws.js';
import { PutObjectCommand }
    from '@aws-sdk/client-s3';
import { v4 as uuidv4 }
    from 'uuid';

@Injectable()
export class UsuarioService {

    constructor(private readonly prismaService: PrismaService) { }

    async createUser(data: CreateUserDto): Promise<usu_usuario> {
        const usuarioExistente = await this.prismaService.usu_usuario.findUnique({
            where: { usu_email: data.usu_email }
        });

        if (usuarioExistente) {
            throw new ConflictException('Usuário já cadastrado');
        }

        const hashPassword = await bcrypt.hash(data.usu_senha, 10);

        return this.prismaService.usu_usuario.create({
            data: {
                usu_nome: data.usu_nome,
                usu_email: data.usu_email,
                usu_senha: hashPassword,

                tiu_tipo_usuario: {
                    connect: {
                        tiu_id: 3
                    }
                }
            }
        });
    }

    async createUserProfessor(
        data: CreateUserProfessorDto,
        file: Express.Multer.File,
    ): Promise<usu_usuario> {

        // Verifica se o currículo foi enviado
        if (!file) {
            throw new BadRequestException(
                'Currículo é obrigatório',
            );
        }

        // Aceita somente arquivos PDF
        if (file.mimetype !== 'application/pdf') {
            throw new BadRequestException(
                'Apenas arquivos PDF são permitidos',
            );
        }

        // Verifica se o usuário já existe
        const usuarioExistente =
            await this.prismaService.usu_usuario.findUnique({
                where: {
                    usu_email: data.usu_email,
                },
            });

        if (usuarioExistente) {
            throw new ConflictException(
                'Usuário já cadastrado',
            );
        }

        const bucket = process.env.AWS_BUCKET_NAME;
        const region = process.env.AWS_REGION;

        if (!bucket || !region) {
            throw new Error(
                'AWS_BUCKET_NAME e AWS_REGION devem estar configurados.',
            );
        }

        // Define o caminho do arquivo no S3
        const fileName =
            `curriculos/${uuidv4()}-${file.originalname}`;

        // Envia o currículo para o Amazon S3
        await s3.send(
            new PutObjectCommand({
                Bucket: bucket,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        // Gera a URL do currículo
        const pdfUrl =
            `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;

        // Criptografa a senha
        const hashPassword = await bcrypt.hash(
            data.usu_senha,
            10,
        );

        // Cadastra o professor como pendente
        return this.prismaService.usu_usuario.create({
            data: {
                usu_nome: data.usu_nome,
                usu_email: data.usu_email,
                usu_senha: hashPassword,
                usu_proposta: data.usu_proposta,
                usu_curriculo: pdfUrl,
                usu_lattes: data.usu_lattes,
                usu_status: 'PENDENTE',

                tiu_tipo_usuario: {
                    connect: {
                        tiu_id: 2,
                    },
                },
            },
        });
    }

    async findAllUsers(): Promise<usu_usuario[]> {
        return this.prismaService.usu_usuario.findMany()
    }

    async findOneByEmail(usu_email: string) {
        return this.prismaService.usu_usuario.findUnique({
            where: { usu_email }
        })
    }

    async buscarPendentes() {
        return this.prismaService.usu_usuario.findMany({
            where: {
                usu_status: 'PENDENTE',
            },
            select: {
                usu_id: true,
                usu_nome: true,
                usu_email: true,
                usu_proposta: true,
                usu_status: true,
                usu_curriculo: true,
                usu_lattes: true,
                tiu_tipo_usuario: {
                    select: {
                        tiu_nome: true,
                    },
                },
            },
        });
    }

    async aprovarUsuario(id: number) {
        return this.prismaService.usu_usuario.update({
            where: {
                usu_id: id,
            },
            data: {
                usu_status: 'ATIVO',
            },
        });
    }

    async rejeitarUsuario(id: number) {
        return this.prismaService.usu_usuario.update({
            where: {
                usu_id: id,
            },
            data: {
                usu_status: 'REJEITADO',
            },
        });
    }

    async getEstatisticas() {
        const alunos = await this.prismaService.usu_usuario.count({
            where: {
                tiu_tipo_usuario: {
                    tiu_nome: "ALUNO"
                }
            },
        });

        const professores = await this.prismaService.usu_usuario.count({
            where: {
                tiu_tipo_usuario: {
                    tiu_nome: "PROFESSOR"
                }
            },
        });

        return {
            alunos,
            professores,
        };
    } F
}
