import { Game, players } from '../schema/schema';
import { Room, Client } from 'colyseus';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { User } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { async } from 'rxjs';


// async function handleVictoryPrisma(winner, looser, prisma) {
//   await prisma.user.update({
//     where: {username : winner.pseudo},
//     data: {
//       Match_historiques : {
//         update: {
//           where: { userId: winner.id },
//           data: { scoreUser: { increment: 1 } }
//         }
//       }
//        wins: { increment: 1 }, win_streak: { increment: 1 } }
//   });
//   await prisma.user.update({
//     where: {username : looser.pseudo},
//     data: { losses: { increment: 1 }, win_streak: 0}
//   });
// }

@Injectable()
export class gameRoomService extends Room {
  constructor(private userservice: UserService){
    super();
  }
  maxClients: number = 2;
  max_score: number = 2;
  prisma = new PrismaService();
  player1: players = new players();
  player2: players = new players();
  game = Game;
  p1_color: string = 'green';
  p2_color: string = 'green';
  winner: User;

  onCreate() {
    this.setState(new Game());
    this.player1.pseudo = 'null';
    this.player2.pseudo = 'null';
    console.log("room pong crée ts =", this.roomId);
  }
  onJoin(client: Client, options?)
  {
    console.log("une personne a la salle pong ", this.roomId,client.id);
    this.onMessage('player', (client, message) => {
      for (let i = 0; i < this.clients.length; i++) {
        if (this.clients[i].sessionId != client.sessionId)
          this.clients[i].send('player', { player_y: message.player_y });
      }
    });
    this.onMessage('player2', (client, message) => {
      for (let i = 0; i < this.clients.length; i++) {
        if (this.clients[i].sessionId != client.sessionId) {
          this.clients[i].send('player2', { player2_y: message.player2_y });
        }
      }
    });
    this.onMessage('updateScore', async(client, message) =>
    {
      this.player1.score = message.player_score;
      this.player2.score = message.player2_score;
      for (let i = 0; i < this.clients.length; i++) {
        this.clients[i].send('updateScore',
        {
          player_score: message.player_score,
          player2_score: message.player2_score,
        });
      }
      if (this.player1.score >= this.max_score || this.player2.score >= this.max_score)
      {
        if(this.player1.score > this.player2.score)
        {
          // handleVictoryPrisma(this.player1, this.player2, this.prisma);
          this.broadcast('gameFinished', { winner: this.player1.pseudo });
        }
        else
        {
          // handleVictoryPrisma(this.player2, this.player1, this.prisma);
          this.broadcast('gameFinished', { winner: this.player2.pseudo });
        }
        console.log("envoie winner", this.player1.pseudo, this.player2.pseudo);
      }
    });
    // const isGameFinished: boolean = this.player1.score >= this.max_score || this.player2.score >= this.max_score;
    this.onMessage('ballPos', (client, message) => {
      for (let i = 0; i < this.clients.length; i++) {
        if (this.clients[i].sessionId != client.sessionId)
          this.clients[i].send('ballPos', {
            ball_x: message.ball_x,
            ball_y: message.ball_y,
          });
      }
    });
    this.onMessage('player_name', async(client, message) =>
    {
      if (this.clients.length === 1 && this.player1.pseudo === 'null') {
        this.player1.pseudo = message.player_pseudo;
        client.send('role', { client: client.sessionId });
        this.player1.id = client.sessionId;
      } else if (this.clients.length === 2 && this.player2.pseudo === 'null') {
        this.player2.pseudo = message.player_pseudo;
        this.player2.id = client.sessionId;
        if (this.player1.pseudo === this.player2.pseudo)
        {
          this.player2.pseudo = 'null';
          this.player2.id = 'null';
          this.clients.length--;
          return;
        }
        client.send('role', { client: client.sessionId });
      }
      console.log('id du p1', this.player1.id);
      if (this.player1.pseudo != 'null' && this.player2.pseudo != 'null') {
        for (let i = 0; i < this.clients.length; i++) {
          this.clients[i].send('Player_init',
          {
            player1_pseudo: this.player1.pseudo,
            player2_pseudo: this.player2.pseudo,
            player1_score: this.player1.score,
            player2_score: this.player2.score,
            player1_id: this.player1.id,
            player2_id: this.player2.id,
            player1_color: this.p1_color,
            player2_color: this.p2_color,
            mainclient: i === 0 // true si i est égal à 0, sinon false

            // rajouter ici pour le ingame
          });
        }
        await this.prisma.user.update({
          where: {username : this.player2.pseudo},
          data: { connected: 2}
        });
        await this.prisma.user.update({
          where: {username : this.player1.pseudo},
          data: { connected: 2}
        });
        // console.log(this.userservice.getConnectedStatus(this.player1.pseudo));
      }
    });
  }
  onLeave(client: Client, consented: boolean) {
    if (consented) {
      // Le client a quitté la room volontairement
      return;
    }

    // Le client a quitté la room involontairement (rafraîchissement de la page)
    if (this.player1 && this.player1.id === client.sessionId) {
      this.player1.pseudo = 'null';
      this.player1.id = '';
      // Réinitialisez toutes les autres propriétés du joueur 1 que vous devez réinitialiser
    } else if (this.player2 && this.player2.id === client.sessionId) {
      this.player2.pseudo = 'null';
      this.player2.id = '';
      // Réinitialisez toutes les autres propriétés du joueur 2 que vous devez réinitialiser
    }
    console.log("Leave la salle pong ", this.roomId,client.id);
  }
  OnDispose(){
    console.log('Room is disposed', this.roomId);
  }
}
