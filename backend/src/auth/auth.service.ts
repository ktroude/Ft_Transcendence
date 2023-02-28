import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2"
import { PrismaClientInitializationError, PrismaClientKnownRequestError } from "@prisma/client/runtime";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}

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
            return user;
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
        return user;
    }
}