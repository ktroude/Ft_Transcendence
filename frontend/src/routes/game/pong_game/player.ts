import {Schema, type} from "@colyseus/schema";

export class Player extends Schema {
	@type('number')
	x: number;
	@type('number')
	y: number;
	@type('number')
	score: number;
	@type('number')
	id: number;
	@type('string')
	id_user: string;
	@type ('string')
	pseudo : string;
	@type ('string')
	nickname : string;
	@type ('string')
	color : string;
	@type ('boolean')
	rdtoplay : boolean;
  
	constructor(x = 0, y = 0, score = 0, id = 0, id_user = '', Pseudo = "", nickname = "", color = "red") {
	  super();
	  this.x = x;
	  this.y = y;
	  this.score = score;
	  this.id = id;
	  this.pseudo = Pseudo;
	  this.nickname = nickname;
	  this.color = color;
	  this.id_user = id_user;
	  this.rdtoplay = false;
	}
  }