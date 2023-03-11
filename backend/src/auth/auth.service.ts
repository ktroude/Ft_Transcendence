import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import * as FormData from 'form-data';
import axios from 'axios';

@Injectable({})
export class AuthService {
    constructor(private prisma:PrismaService) {}
   
    // cette fonction permet de recuperer toutes les info d'un pelo qui se connecte a notre site via ce lien:
    // https://api.intra.42.fr/oauth/authorize
    async getUserData(code: string): Promise<any> {
        // url pour avoir le token genere par l'api 42
        const token_url = 'https://api.intra.42.fr/oauth/token';
        // les infos a envoyer a cette api
        const data = {
          grant_type: 'authorization_code',
          client_id: 'u-s4t2ud-ad63634a67eaff34218824a7796fa6e5c5337b11f88c026df3956ba7a8f38dc6',
          client_secret: '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',
          code: code,
          redirect_uri: 'http://localhost:3000/getUserData',
        };
        // la requete a l'api de 42
        const response = await axios.post(token_url, data);
        // url pour echanger le token (qu'on vient de generer dans la variable response) contre les data du user
        const data_url = 'https://api.intra.42.fr/v2/me';
        // le token en question
        const access_token = response.data.access_token;
        const headers = {
        'Authorization': 'Bearer ' + access_token
        };
        // la requete pour faire l'echange
        const userResponse = await axios.get(data_url, { headers: headers });
        // console.log(userResponse.data);
        return userResponse.data;
      }
    

}