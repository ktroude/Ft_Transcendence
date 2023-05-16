import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrimaryColumnCannotBeNullableError } from 'typeorm';
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}
    
    async enable2FA(user: number, status: string): Promise<User> {
        if (status == 'enable') 
        {
            const updatedUser = await this.prisma.user.update({ // update user
            where: { id: user }, // where id = user
            data: { FA2: true } // set FA2 to true
            });
            return updatedUser; // return updated user
        }
        else if (status == 'disable')
        {
            const updatedUser = await this.prisma.user.update({
                where: { id: user }, // where id = user
                data: { FA2: false, FA2secret: undefined } // set FA2 to false
            });
            return updatedUser;
        }
    }

    async get2fastatus(user: number): Promise<Boolean> {
      const user2fa = await this.prisma.user.findUnique({ // find user
        where: {
            id: user, // where id = user
        },
        select : {
            FA2: true // select FA2
        }
    });
        if (!user2fa)
            return null;
        return user2fa.FA2; // return FA2
    }

    async get2faLockStatus(user: number): Promise<Boolean> {
        const user2fa = await this.prisma.user.findUnique({ // find user
            where: {
                id: user, // where id = user
            },
            select : {
                FA2lock: true // select FA2
            }
        });
        if (!user2fa)
            return null;
        return user2fa.FA2lock; // return FA2
    }

    async update2fastatus(user: number, status: string){
        if (status == 'lock')
        {
            const updatedUser = await this.prisma.user.update({ // update user
                where: { id: user }, // where id = user
                data: { FA2lock: true } // set FA2 to true
            });
            return updatedUser; // return updated user
        }
        else if (status == 'unlock')
        {
            const updatedUser = await this.prisma.user.update({
                where: { id: user }, // where id = user
                data: { FA2lock: false } // set FA2 to false
            });
            return updatedUser;
        }
    }
    
    
    // Update the prisma with the new picture
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
        if (!user)
            return null;
        return user;
    }

    async findUserByUsername(username: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: {
                username: username,
            }
        });
        if (!user)
            return null;
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
        if (!user)
            return null;
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
    
    // decode le token et retourne l'utilisateur
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
