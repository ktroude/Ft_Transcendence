import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import axios from 'axios';
import * as dotenv from 'dotenv';

// permet de charger des variables depuis le fichier .env a la racine de backend
// c'est une question de secu pour ne pas laisser le client secret et autre variable sensible dans le code
dotenv.config();

@Injectable({})
export class AuthService {
    constructor(private prisma:PrismaService) {}
    
    // cette fonction permet de recuperer toutes les info d'un pelo qui se connecte a notre site via ce lien:
    // https://api.intra.42.fr/oauth/authorize
    async getUserData(code: string): Promise<any> {
        // url pour avoir le token genere par l'api 42
        const token_url = process.env.TOKEN_URL;
        // les infos a envoyer a cette api
        const data = {
          grant_type: process.env.GRANT_TYPE ,
          client_id: process.env.CLIENT_ID ,
          client_secret: process.env.CLIENT_SECRET,
          code: code,
          redirect_uri: process.env.REDIRECT_URI ,
        };
        // la requete a l'api de 42
        const response = await axios.post(token_url, data);
        // url pour echanger le token (qu'on vient de generer dans la variable response) contre les data du user
        const data_url = process.env.DATA_URL;
        // le token en question
        const access_token = response.data.access_token;
        const headers = {
        'Authorization': 'Bearer ' + access_token
        };
        // la requete pour faire l'echange
        const userResponse = await axios.get(data_url, { headers: headers });
        // toute les infos sont donc contenue dans userResponse.data 
        return userResponse.data;
      }
    

}