import {Schema, type} from "@colyseus/schema";

export class Ball extends Schema {
	@type('number')
	x: number;
	@type('number')
	y: number;
	@type('number')
	velocity_x: number;
	@type('number')
	velocity_y: number;
  
	constructor(x = 0, y = 0, velocity_x =0, velocity_y = 0) {
	  super();
	  this.x = x;
	  this.y = y;
	  this.velocity_x = velocity_x;
	  this.velocity_y =- velocity_y;
	}
  }