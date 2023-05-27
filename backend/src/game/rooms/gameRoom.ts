import { Game, players } from '../schema/schema';
import { Room, Client } from 'colyseus';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { User } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { async } from 'rxjs';


async function creatmatchprsima(winner, looser, prisma)
{
  return await prisma.match.create({
    data: { 
      userId: parseInt(winner.id_user, 10),
      // user: { connnect: {id: parseInt(winner.id_user, 10) }},
      scoreUser:  winner.score,
      opponentId: looser.id_user ,
      scoreOpponent: looser.score,
      winner: winner.pseudo,
      loser: looser.pseudo
      }
  })
}

async function updateConnected(player, condition, prisma)
{
  await prisma.user.update({
    where: {username : player.pseudo},
    data: { connected: condition}
  });
}
  
async function handleVictoryPrisma(winner, looser, prisma) {
  // push winner
  const winner_match = await creatmatchprsima(winner, looser, prisma);
  const looser_match = await creatmatchprsima(looser, winner, prisma);
  await prisma.user.update({
    where: {username : winner.pseudo},
    data: {
      Match_historiques : {connect : {id: winner_match.id}},
      wins: { increment: 1 }, win_streak: { increment: 1 } }
  });

  // push looser
  await prisma.user.update({
    where: {username : looser.pseudo},
    data: {
      Match_historiques : {connect : {id: looser_match.id}},
      losses: { increment: 1 }, win_streak: 0 }
  });
}

@Injectable()
export class gameRoomService extends Room {
  constructor(private userservice: UserService){
    super();
  }
  maxClients: number = 2;
  max_score: number = 5;
  prisma = new PrismaService();
  player1: players = new players();
  player2: players = new players();
  game = Game;
  p1_color: string = 'green';
  p2_color: string = 'green';
  winner: User;
  reconnectTimeout: NodeJS.Timeout;

  onCreate() {
    this.setState(new Game());
    this.player1.pseudo = 'null';
    this.player2.pseudo = 'null';
    console.log("room pong crée ts =", this.roomId);
  }
  onJoin(client: Client, options?)
  {
    clearTimeout(this.reconnectTimeout);
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
          handleVictoryPrisma(this.player1, this.player2, this.prisma);
          this.broadcast('gameFinished', { winner: this.player1.pseudo });
        }
        else
        {
          handleVictoryPrisma(this.player2, this.player1, this.prisma);
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
        this.player1.username = message.player_username;
        this.player1.id_user = message.player_id;
        this.player1.id = client.sessionId;
        client.send('role', { client: client.sessionId });
      } else if (this.clients.length === 2 && this.player2.pseudo === 'null') {
        this.player2.pseudo = message.player_pseudo;
        this.player2.username = message.player_username;
        this.player2.id_user = message.player_id;
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
            player1_username: this.player1.username,
            player2_username: this.player2.username,
            player1_iD_user: this.player1.id_user,
            player2_iD_user: this.player2.id_user,
            mainclient: i === 0, // true si i est égal à 0, sinon false

            // rajouter ici pour le ingame
          });
        }
        updateConnected(this.player2, 2, this.prisma);
        updateConnected(this.player1, 2, this.prisma);
        // console.log(this.userservice.getConnectedStatus(this.player1.pseudo));
      }
    });
  }
  onLeave(client: Client, consented: boolean) {
    if (consented) {
      console.log("Leave consented pong");
      // Le client a quitté la room volontairement
      return;
    }
    this.reconnectTimeout = setTimeout(() => {
      // Supprimer le joueur de la salle après le délai d'attente
      
      console.log("je retire les player de la room");
    }, 5000);
    updateConnected(this.player2, 1, this.prisma);
    updateConnected(this.player1, 1, this.prisma);
    // Le client a quitté la room involontairement (rafraîchissement de la page)
    console.log("Leave la salle pong rom_id = ", this.roomId,client.id);
  }
  OnDispose(){
    console.log('Room Pong is disposed', this.roomId);
  }
}
