import { Game, players } from '../schema/schema';
import { Room, Client } from 'colyseus';

export class gameRoom extends Room {
  gameID: number;
  player1: players = new players();

  onCreate() {
    this.setState(new Game());
  }
  onJoin(client: Client, options?) {
    console.log(client.sessionId, 'Joined');
    this.onMessage('player_name', (client, message) => {
      this.player1.username = message.player_pseudo;
      this.player1.id = message.Id;
      console.log(this.player1.username);
      console.log(this.player1.id);
    });
  }
}
