import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}
    
    async changeNewProfilePicture(pseudo: string, newProfilePicture: string): Promise<User>
    {
        const updatedProfilePicture = await this.prisma.user.update({
            where: { pseudo: pseudo},
            data: { picture: newProfilePicture }
        });
        return updatedProfilePicture;
    }

    async findUserById(id: number): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id,
            }
        });
        return user;
    }

    async findUserByUsername(username: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: {
                username: username,
            }
        });
        return user;
    }

    async findUserByUsernameBool(username: string): Promise<Boolean> {
        const user = await this.prisma.user.findUnique({
            where: {
                username: username,
            }
        });
        if (!user)
			return false;
		return true;
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
                data: { username: newPseudo }
            })
            return updatedPseudo;
        }
    }
    
    async checkNewPseudo(user: User, newPseudo: string): Promise <Boolean> {
        const check = await this.prisma.user.findUnique({
            where: {
                username: newPseudo
            }
        });
        if (check)
            return false // nouveau pseudo deja pris
        else
            return true // nouveau pseudo valide
    }
    
    async decodeToken(token: string) {
        const ret = jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
            if (err) {
                return false;
            }
            else {
                return decoded;
            }
          });
        if (ret != false){
            const user = await this.findUserByPseudo(ret.pseudo);
            return user;
        }
        else
          return undefined;
    }
}
