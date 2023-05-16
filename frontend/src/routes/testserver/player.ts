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
	@type ('string')
	pseudo : string;
	@type ('string')
	nickname : string;
	@type ('string')
	color : string;
  
	constructor(x = 0, y = 0, score = 0, id = 0, Pseudo = "", nickname = "", color = "red") {
	  super();
	  this.x = x;
	  this.y = y;
	  this.score = score;
	  this.id = id;
	  this.pseudo = Pseudo;
	  this.nickname = nickname;
	  this.color = color;
	}
  }