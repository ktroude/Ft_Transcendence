import { Game, players } from '../schema/schema';
import { Room, Client } from 'colyseus';

export class gameRoom extends Room {
  player1: players = new players();
  player2: players = new players();
  p1_pseudo: string = '';
  p2_pseudo: string = '';
  game = Game;
  p1_score: number = 0;
  p2_score: number = 0;
  p1_id: string = '';
  p2_id: string = '';
  p1_color: string = 'green';
  p2_color: string = 'green';
  finished: number = 0;
  clientIds: string[] = [];

  onCreate() {
    this.setState(new Game());
    this.player1.pseudo = 'null';
    this.player2.pseudo = 'null';
  }
  onJoin(client: Client, options?) {
    // this.onMessage('player', (client, message) => {
      //   for (let i = 0; i < this.clients.length; i++) {
    //     if (this.clients[i].sessionId != client.sessionId)
    //       this.clients[i].send('player', { player_y: message.player_y });
    //   }
    // });
    // this.onMessage('player2', (client, message) => {
      //   for (let i = 0; i < this.clients.length; i++) {
    //     if (this.clients[i].sessionId != client.sessionId) {
    //       this.clients[i].send('player2', { player2_y: message.player2_y });
    //     }
    //   }
    // });
    // this.onMessage('update_score', (client, message) => {
    //   for (let i = 0; i < this.clients.length; i++) {
    //     this.p1_score = message.player_score;
    //     this.p2_score = message.player2_score;
    //     this.clients[i].send('score_uptdate', {
    //       player_score: message.player_score,
    //       player2_score: message.player2_score,
    //     });
    //   }
    // });
    this.onMessage('player_name', (client, message) => {
      if (this.player1.pseudo === 'null') {
        this.player1.pseudo = message.player_pseudo;
        this.p1_id = client.sessionId;
        client.send('role', { client: client.sessionId });
        this.clientIds.push(client.sessionId);
      } else if (this.player2.pseudo === 'null') {
        this.player2.pseudo = message.player_pseudo;
        this.p2_id = client.sessionId;
        client.send('role', { client: client.sessionId });
        // this.clientIds.push(client.sessionId);
      }
      console.log('les id des clients', this.clientIds);
      console.log('id du p1', this.p1_id);
      if (this.clientIds[0] === this.p2_id) {
        console.log('deja rejoint fdp');
        return;
      }
      if (this.player1.pseudo != 'null' && this.player2.pseudo != 'null') {
        for (let i = 0; i < this.clients.length; i++) {
          this.clients[i].send('Player_init', {
            player1_pseudo: this.player1.pseudo,
            player2_pseudo: this.player2.pseudo,
            player1_score: this.p1_score,
            player2_score: this.p2_score,
            player1_id: this.p1_id,
            player2_id: this.p2_id,
            player1_color: this.p1_color,
            player2_color: this.p2_color,
          });
        }
      }
    });
  }
  onLeave(client: Client, consented: boolean) {
    if (consented) {
      // Le client a quitté la room volontairement
      return;
    }

    // Le client a quitté la room involontairement (rafraîchissement de la page)
    if (this.player1 && this.p1_id === client.sessionId) {
      this.player1.pseudo = 'null';
      this.p1_id = '';
      // Réinitialisez toutes les autres propriétés du joueur 1 que vous devez réinitialiser
    } else if (this.player2 && this.p2_id === client.sessionId) {
      this.player2.pseudo = 'null';
      this.p2_id = '';
      // Réinitialisez toutes les autres propriétés du joueur 2 que vous devez réinitialiser
    }
  }
  }
