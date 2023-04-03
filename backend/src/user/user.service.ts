import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { setDefaultResultOrder } from 'dns';
import { PrismaService } from 'src/prisma/prisma.service';
// import * as jwt from 'jsonwebtoken';
import { allowedNodeEnvironmentFlags } from 'process';
const jwt = require('jsonwebtoken');
@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async findUserById(id: number): Promise<User> {

        const user = await this.prisma.user.findUnique({
            where: {
                id: id,
            }
        });
        return user;
    }

    async findUserByPseudo(pseudo: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: {
                pseudo: pseudo,
            }
        });
        return user;
    }

    async updatePseudo(user: User, newPseudo: string): Promise<User> {
        if (await this.checkNewPseudo(user, newPseudo) === false)
            return user
        else {
            const updatedPseudo = await this.prisma.user.update({
                where: { id: user.id},
                data: { pseudo: newPseudo }
            })
            return updatedPseudo;
        }
    }
    
    async checkNewPseudo(user: User, newPseudo: string): Promise <Boolean> {
        const check = await this.prisma.user.findUnique({
            where: {
                pseudo: newPseudo
            }
        });
        if (check)
            return false // nouveau pseudo deja pris
        else
            return true // nouveau pseudo valide
    }

    decodeToken(token: string) {
        const ret = jwt.verify(token, process.env.JWT_SECRET, { algorithms: 'HS256' }, function(err, decoded) {
            if (err)
                return false
            else
                console.log(decoded);
                
                return decoded;
          });
        const user = this.findUserByPseudo(ret.pseudo)
    }
}
