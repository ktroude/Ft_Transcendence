import { Game, players } from '../schema/schema';
import { Room, Client } from 'colyseus';

export class gameRoom extends Room {
  player1: players = new players();
  player2: players = new players();
  p1_nick: string = '';
  p2_nick: string = '';
  game: Game;
  my_job: any;
  p1_score: number = 0;
  p2_score: number = 0;
  p1_color: string = 'white';
  p2_color: string = 'white';
  p1_id: string = '';
  p2_id: string = '';
  token: any;
  finished: number = 0;

  onCreate() {
    this.setState(new Game);
    this.player1.username = 'null';
    this.player2.username = 'null';
  }
  onJoin(client: Client, options?) {
      console.log(this.player1);
  }
}
