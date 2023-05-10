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
  finished: number = 0;

  onCreate() {
    this.setState(new Game());
    this.player1.pseudo = 'null';
    this.player2.pseudo = 'null';
  }
  onJoin(client: Client, options?) {
    this.onMessage('player_name', (client, message) => {
      if (this.player1.pseudo === 'null') {
        this.player1.pseudo = message.player_pseudo;
        this.p1_id = client.sessionId;
        client.send('role', { client: client.sessionId });
      } else if (this.player2.pseudo === 'null') {
        this.player2.pseudo = message.player_pseudo;
        this.p2_id = client.sessionId;
        client.send('role', { client: client.sessionId });
      }
      console.log('Pseudo du player', this.player1.pseudo);
      console.log('ID du joueur', this.p1_id);
      console.log('Pseudo du player 2', this.player2.pseudo);
      console.log('ID du joueur', this.p2_id);
    });
  }
}
