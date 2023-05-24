import { Schema, type } from '@colyseus/schema';

export class Ball extends Schema {
  @type('number') x: number;
  @type('number') y: number;
  @type('number') velocity_x: number;
  @type('number') velocity_y: number;
}

export class players extends Schema {
  @type('number')
  x: number;
  @type('number')
  y: number;
  @type('number')
  score: number;
  @type('string')
  id: string;
  @type('string')
  id_user: string;
  @type('string')
  pseudo: string; // celui qui ne change pas
  @type('string')
  username: string;
  @type('boolean')
  rdtoplay: boolean;

  constructor(x = 0, y = 0, score = 0, id = '', id_user = '', Pseudo = '', Username = '') {
    super();
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.id_user = id_user;
    this.pseudo = Pseudo;
    this.username = Username;
    this.rdtoplay = false;
  }
}

export class Game extends Schema {
  @type(players) playerA = new players();
  @type(players) playerB = new players();
  @type(Ball) ball = new Ball();
}
