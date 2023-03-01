import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtSecretRequestType, JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { isEAN } from "class-validator";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService,
        ) {}

    async signup(dto: AuthDto) {
        // generate the password hash
        const hash = await argon.hash(dto.password);

        try {
            // save new user in the db
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash,
                }})

            delete user.hash // delete hashed PW from the return for safety

            // return the saved user
            return this.signToken(user.id, user.email);
        }
        catch(error) {
            if (error) {
                if (error.code === 'P2002') // num de ce code --> cette variable unique existe deja
                    throw new ForbiddenException('This email is already taken');
                throw error;
            }
        }
    }

    async signin(dto: AuthDto) {
        // find the user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            }
        });
        console.log(user);
        // if user does not exist throw exeption
        if (!user)
            throw new ForbiddenException('Incorect email');
        // compare PW
        const pwMatches = await argon.verify(user.hash, dto.password);
        // if PW incorect throw exeption
        if (!pwMatches)
            throw new ForbiddenException('Incorect password')
        // send back the user
        delete user.hash
        return this.signToken(user.id, user.email);
    }

    async signToken(userId: number, email: string): Promise<{ access_token: string }> {
        const payload = {
            sub: userId,
            email,
        }
        const secret = this.config.get('JWT_SECRET');
        
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '60m',
            secret: secret,
        });

        return { access_token : token };
    }
}