import {Schema, type} from "@colyseus/schema";

export class Computer extends Schema {
	@type('number')
	x: number;
	@type('number')
	y: number;
	@type('number')
	score: number;
  
	constructor(x = 0, y = 0, score = 0) {
	  super();
	  this.x = x;
	  this.y = y;
	  this.score = score;
	}
  }