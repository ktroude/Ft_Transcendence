import { Game, players } from '../schema/schema';
import { Room, Client } from 'colyseus';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { User } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { async } from 'rxjs';


async function mybroadcast(room, event, data) {
  for (const client of room.clients) {
    const player = client.sessionId === room.player1.id ? room.player1 : room.player2;
    if (player.rdtoplay) {
      await client.send(event, data);
    }
  }
}

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
    where: {pseudo : player.pseudo},
    data: { connected: condition}
  });
}
  
async function handleVictoryPrisma(winner, looser, prisma) {
  // push winner
  const winner_match = await creatmatchprsima(winner, looser, prisma);
  const looser_match = await creatmatchprsima(looser, winner, prisma);
  const tmp = await prisma.user.findUnique({
    where: {id : winner.id_user},
    select : {wins : true, FirstWin: true, ImTheBoss: true, win_streak: true, WinStreak: true}
  });
  if (tmp.FirstWin == false)
  {
    await prisma.user.update({
      where: {id : winner.id_user},
      data: {FirstWin: true}
    });
  }
  if (looser.pseudo == 'bleroy' || looser.pseudo == 'vl-hotel'|| looser.pseudo == 'ple-berr'|| looser.pseudo == 'ktroude')
  {
    await prisma.user.update({
      where: {id : winner.id_user},
      data: {ImTheBoss: true}
    });
  }
  if (tmp.win_streak == 2)
  {
    await prisma.user.update({
      where: {id : winner.id_user},
      data: {WinStreak: true}
    });
  }
    if (winner.pseudo === 'null')
      return;
  await prisma.user.update({
    where: {pseudo : winner.pseudo},
    data: {
      Match_historiques : {connect : {id: winner_match.id}},
      wins: { increment: 1 }, win_streak: { increment: 1 }, level: { increment: 1 }}
  });

  // push looser
  if (looser.pseudo === 'null')
      return ;
  await prisma.user.update({
    where: {pseudo : looser.pseudo},
    data: {
      Match_historiques : {connect : {id: looser_match.id}},
      losses: { increment: 1 }, win_streak: 0 }
  });
}

async function leavePlayer(player, prisma)
{
  player.rdtoplay = false;
  await updateConnected(player, 1, prisma);
  player.pseudo = 'null';
  player.username = '';
  player.id = '';
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
  break: boolean = false;
  rdtoplay: boolean = false;
  // reconnectTimeout: NodeJS.Timeout;

  onCreate() {
    this.setState(new Game());
    this.player1.pseudo = 'null';
    this.player2.pseudo = 'null';
  }
  onJoin(client: Client, options?)
  {
    const playerInfo = {
      player_pseudo: options.player_pseudo,
      player_username: options.player_username,
      player_id: options.player_id
    };
    this.handlePlayerJoin(client, playerInfo);

    this.onMessage('player', (client, message) => {
      if (this.rdtoplay == true)
      {
        for (let i = 0; i < this.clients.length; i++) {
          if (this.clients[i].sessionId != client.sessionId)
            this.clients[i].send('player', { player_y: message.player_y });
        }
      }
    });
    this.onMessage('player2', (client, message) => {
      if (this.rdtoplay == true)
      {
        for (let i = 0; i < this.clients.length; i++) {
          if (this.clients[i].sessionId != client.sessionId) {
            this.clients[i].send('player2', { player2_y: message.player2_y });
          }
        }
      }
    });
    this.onMessage('rdtoplay', (client, message) => {
      this.rdtoplay = true
      if (client.sessionId === this.player1.id) {
        this.player1.rdtoplay = true;
      } else if (client.sessionId === this.player2.id) {
        this.player2.rdtoplay = true;
      }
    })
    this.onMessage('updateScore', async(client, message) =>
    {
      this.player1.score = message.player_score;
      this.player2.score = message.player2_score;
      this.broadcast('updateScore',
      {
        player_score: message.player_score,
        player2_score: message.player2_score,
      });
      if (this.player1.score >= this.max_score || this.player2.score >= this.max_score)
      {
        if(this.player1.score > this.player2.score)
        {
          handleVictoryPrisma(this.player1, this.player2, this.prisma);
          this.broadcast('gameFinished', { winner: this.player1.username });
        }
        else
        {
          handleVictoryPrisma(this.player2, this.player1, this.prisma);
          this.broadcast('gameFinished', { winner: this.player2.username });
        }
      }
    });
    // const isGameFinished: boolean = this.player1.score >= this.max_score || this.player2.score >= this.max_score;
    this.onMessage('ballPos', async(client, message) => {
      await mybroadcast(this, 'ballPos', { ball_x: message.ball_x, ball_y: message.ball_y,});
      // if (this.rdtoplay == true)
      // {
      //   console.log("send ballpos");
      //   this.broadcast('ballPos', {
      //     ball_x: message.ball_x,
      //     ball_y: message.ball_y,
      //   });
      // }
    });
  }
  async onLeave(client: Client, consented: boolean) {
    if(client.sessionId == this.player1.id)
      leavePlayer(this.player1, this.prisma);
    else
      leavePlayer(this.player2, this.prisma);
    if(this.player1.score < this.max_score || this.player2.score < this.max_score)
    {
      this.break = true;
      await mybroadcast(this, 'break', true);
      // this.broadcast('break',true);
    }
    
    if(this.player1.score >= this.max_score || this.player2.score >= this.max_score)
      this.disconnect();
  }
  OnDispose(){
    // console.log("salle détruite", this.roomId);
  }


  async handlePlayerJoin(client: Client, playerInfo: { player_pseudo: string, player_username: string, player_id: string }) {
    // clearTimeout(this.reconnectTimeout);
  
    const { player_pseudo, player_username, player_id } = playerInfo;
  
    if (this.player1.pseudo === 'null') {
      this.player1.pseudo = player_pseudo;
      this.player1.username = player_username;
      this.player1.id_user = player_id;
      this.player1.id = client.sessionId;
    } else if (this.player2.pseudo === 'null') {
      this.player2.pseudo = player_pseudo;
      this.player2.username = player_username;
      this.player2.id_user = player_id;
      this.player2.id = client.sessionId;
      if (this.player1.pseudo === this.player2.pseudo) {
        this.player2.pseudo = 'null';
        this.player2.id = 'null';
        this.clients.length--;
        return;
      }
    }
    
    client.send('role', { client: client.sessionId });
    this.break = false;
  
    if (this.player1.pseudo !== 'null' && this.player2.pseudo !== 'null') {
      if (this.player1.score >= this.max_score || this.player2.score >= this.max_score)
      {
        if(this.player1.score > this.player2.score)
        {
          handleVictoryPrisma(this.player1, this.player2, this.prisma);
          this.broadcast('gameFinished', { winner: this.player1.username });
        }
        else
        {
          handleVictoryPrisma(this.player2, this.player1, this.prisma);
          this.broadcast('gameFinished', { winner: this.player2.username });
        }
        return
      }
      this.broadcast('Player_init', {
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
      });
      updateConnected(this.player2, 2, this.prisma);
      updateConnected(this.player1, 2, this.prisma);
      await mybroadcast(this, 'break', false);
      // if (this.rdtoplay == true)
      //   this.broadcast('break', false);
    }
  }
}
