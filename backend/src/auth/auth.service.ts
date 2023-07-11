/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { userInfo } from 'os';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import fetch from 'node-fetch';
import { pseudoRandomBytes } from 'crypto';

// permet de charger des variables depuis le fichier .env a la racine de backend
// c'est une question de secu pour ne pas laisser le client secret et autre variable sensible dans le code
dotenv.config();

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  // cette fonction permet de recuperer toutes les info d'un pelo qui se connecte a notre site via ce lien:
  // https://api.intra.42.fr/oauth/authorize
  async getUserData(code: string): Promise<{ access_token: string }> {
    // url pour avoir le token genere par l'api 42
    const token_url = process.env.TOKEN_URL;
    // les infos a envoyer a cette api
    const data = {
      grant_type: process.env.GRANT_TYPE,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.REDIRECT_URI,
    };
    // la requete a l'api de 42
    const response = await axios.post(token_url, data);
    // url pour echanger le token (qu'on vient de generer dans la variable response) contre les data du user
    const data_url = process.env.DATA_URL;
    // le token en question
    const access_token = response.data.access_token;
    const headers = {
      Authorization: 'Bearer ' + access_token,
    };
    // la requete pour faire l'echange
    const userResponse = await axios.get(data_url, { headers: headers });
    // toute les infos sont donc contenue dans userResponse.data
    // on creer le user, ou on recupere son id si il existe
    const user = await this.check_db(userResponse.data);
    // on convertie l'id du user et ses infos en un token qu'on reutilisera plus tard
    const signedToken = this.getJwtToken(user);

    return signedToken;
  }

  // parcour la db et check si le user existe dans la db
  // si il existe on le renvoie sinon on le creer et le renvoie.
  async check_db(user_data: any): Promise<User> {
    // check si il existe dans la db
    user_data.login = user_data.login.toUpperCase();
    const user = await this.prisma.user.findUnique({
      where: {
        pseudo: user_data.login,
      },
    });
    // prisma.findUnique() renvoie (null) si il existe pas dans la db
    if (!user) {
      // sinon on le creer
      const checkNickname = await this.prisma.user.findUnique({
        where: {
          username: user_data.login,
        }
      });
      if (checkNickname)
      {
        const new_user = await this.prisma.user.create({
          data: {
            firstname: user_data.first_name,
            lastname: user_data.last_name,
            pseudo: user_data.login,
            username: user_data.login + pseudoRandomBytes(4).toString('hex'),
            picture: await fetch(user_data.image.link)
                .then(res => res.buffer())
                .then(buffer => Buffer.from(buffer).toString('base64')),
          },
        });
        return new_user;
      }
      else
      {
        const new_user = await this.prisma.user.create({
          data: {
            firstname: user_data.first_name,
            lastname: user_data.last_name,
            pseudo: user_data.login,
            username: user_data.login,
            picture: await fetch(user_data.image.link)
                .then(res => res.buffer())
                .then(buffer => Buffer.from(buffer).toString('base64')),
          },
        });
      return new_user;
      }
    }
    return user;
  }

  // transforme les datas du user (name, id, ect..) en un token signé par la variable process.env.JWT_SECRET
  // (on peut trouver cette variable dans le .env, comme les autres process.env....)
  // on fait ca pour s'assurer que c'est bien nous qui avons cree ce token et que c'est pas une magouille d'un utilisateur
  async getJwtToken(user: User): Promise<{ access_token: string }> {
    const data = {
      sub: user.id,
      pseudo: user.pseudo,
      firstname: user.firstname,
      lastname: user.lastname,
    };
    const token = await this.jwt.signAsync(data, {
      secret: process.env.JWT_SECRET,
    });
    return { access_token: token };
  }
  
}

// maintenant il faut convertir les data du user qu'on recupere en un jwt token --> done

// a faire :
// et renvoyer l'utilisateur vers une page du fronte avec une variable code dans l'url
// ce code sera le jwt token et permettra d'afficher les infos dont on a besoin pour le front.
