<script>
// @ts-nocheck

    // import { Client, Room, } from 'colyseus.js'
    import { Ball } from './ball';
    import { Player } from './player';
	  import { onMount } from 'svelte';

    let currentUser;
    let Colyseus;
    let client;
    let room;
    let clientId;
    let player = new Player;
    let player2 = new Player;

    async function connect() {
        Colyseus = await import("colyseus.js");
        client = new Colyseus.Client('ws://localhost:3001');
        room = await client.joinOrCreate("Private_Room");

        console.log('Joined succefuly', room);
    }
    function init_client(){
      room = room;
      room.onMessage('Player_init', (message) => {
        console.log(message);
        player.pseudo = message.player1_pseudo;
        player2.pseudo = message.player2_pseudo;
        player.id = message.player1_id;
        player2.id = message.player2_id;
        player.score = message.player1_score;
        player2.score = message.player2_score;
        player.color = message.player1_color;
        player2.color = message.player2_color;
      })
      room.onMessage('role', async (message) => {
        clientId = message.client;
      })
      room?.send('player_name', {player_pseudo : currentUser.pseudo});
    }

const PLAYER_HEIGHT = 100;
const PLAYER_WIDTH = 5;
const MAX_SPEED = 8;

let canvas;
let anim;
let game = {
  player: {
    y: 0,
    score: 0
  },
  player2: {
    y: 0,
    score: 0
  },
  ball: {
    x: 0,
    y: 0,
    r: 5,
    speed: {
        x: 2,
        y: 2
    }
  }
};

const fletchCurrentUserData = async () => {
		const cookies = document.cookie.split(';');
		const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
			const response = await fetch('http://localhost:3000/users/userInfo', { headers });
			const data = await response.json();
			const user = {
				id: data?.id,
				pseudo: data?.pseudo,
				status: -2,
				room: -1
			};
			return user;
		}
		// const user = {
		// 	id: -1,
		// 	pseudo: '',
		// 	status: -2,
		// 	room: -1
		// };
		// return user;
	};



function draw() {
  const context = canvas.getContext('2d');
  // Draw field
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
  // Draw middle line
  context.strokeStyle = 'white';
  context.beginPath();
  context.moveTo(canvas.width / 2, 0);
  context.lineTo(canvas.width / 2, canvas.height);
  context.stroke();
  context.fillStyle = 'white';
  context.fillRect(0, game.player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
  context.fillRect(canvas.width - PLAYER_WIDTH, game.player2.y, PLAYER_WIDTH, PLAYER_HEIGHT);
  // Draw ball
  context.beginPath();
  context.fillStyle = 'white';
  context.arc(game.ball.x, game.ball.y, game.ball.r, 0, Math.PI * 2, false);
  context.fill();
}
function play() {
    game.ball.x += game.ball.speed.x;
    game.ball.y += game.ball.speed.y;
    draw();
    //player2Move();
    ballMove();
    anim = requestAnimationFrame(play);
}


function collide(player) {
// Le joueur ne touche pas la balle
if (game.ball.y < player.y || game.ball.y > player.y + PLAYER_HEIGHT) {
    // remet la balle et les joueurs au centre
    game.ball.x = canvas.width / 2;
    game.ball.y = canvas.height / 2;
    game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
    game.player2.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
    if (player == game.player){
      game.player2.score++;
      room.send('score_uptdate', {player_score: game.player.score, player2_score: game.player2.score});
      document.querySelector('#player2-score').textContent = game.player2.score;
      game.ball.speed.x = 2;
      game.ball.speed.y = 2;
    } else {
      game.player.score++;
      room.send('score_uptdate', {player_score: game.player.score, player2_score: game.player2.score});
      document.querySelector('#player-score').textContent = game.player.score;
      game.ball.speed.x = 2;
      game.ball.speed.y = 2;
    }
  } else {
    // augmente la vitesse et bouge la direction
    game.ball.speed.x *= -1.1;
    changeDirection(player.y);
}
}

function changeDirection(playerPosition) {
var impact = game.ball.y - playerPosition - PLAYER_HEIGHT / 2;
var ratio = 100 / (PLAYER_HEIGHT / 2);
// Obtenir une valeur entre 0 et 10
game.ball.speed.y = Math.round(impact * ratio / 10);
}

function ballMove(){
if (game.ball.y > canvas.height || game.ball.y < 0) {
    game.ball.speed.y *= -1;
}
if (game.ball.x > canvas.width - PLAYER_WIDTH) {
  collide(game.player2);
} else if (game.ball.x < PLAYER_WIDTH) {
  collide(game.player);
}
game.ball.x += game.ball.speed.x;
room.send('update_ball', {ball_x: game.ball.x})
game.ball.y += game.ball.speed.y;
}

function stop() {
cancelAnimationFrame(anim);
// Placez la balle et les joueurs au centre
game.ball.x = canvas.width / 2;
game.ball.y = canvas.height / 2;
game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
game.player2.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
// Reset speed
game.ball.speed.x = 2;
game.ball.speed.y = 2;
// Init score
game.player2.score = 0;
game.player.score = 0;
document.querySelector('#player2-score').textContent = game.player2.score;
document.querySelector('#player-score').textContent = game.player.score;
draw();
}

function playerMove(event) {
  if ((player?.id) && clientId === player?.id){
      var canvasLocation = canvas.getBoundingClientRect();
      var mouseLocation = event.clientY - canvasLocation.y;
    
    if (mouseLocation < PLAYER_HEIGHT / 2){
        game.player.y = 0;
    } else if (mouseLocation > canvas.height - PLAYER_HEIGHT / 2){
        game.player.y = canvas.height - PLAYER_HEIGHT;
    } else {
        game.player.y = mouseLocation - PLAYER_HEIGHT / 2;
    }
    if (room){
      room.send("player", {player_y: game.player.y});
    }
  }
  else if (clientId === player2?.id){
      var canvasLocation = canvas.getBoundingClientRect();
      var mouseLocation = event.clientY - canvasLocation.y;
    
    if (mouseLocation < PLAYER_HEIGHT / 2){
        game.player.y = 0;
    } else if (mouseLocation > canvas.height - PLAYER_HEIGHT / 2){
        game.player.y = canvas.height - PLAYER_HEIGHT;
    } else {
        game.player.y = mouseLocation - PLAYER_HEIGHT / 2;
    }
    if (room){
      room.send("player2", {player2_y: game.player2.y});
    }
  }
// Obtenir l'emplacement de la souris dans le canevas
}

onMount(async() => {
  canvas = document.getElementById('canvas');
  game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
  game.player2.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
  game.ball.x = canvas.width / 2;
  game.ball.y = canvas.height / 2;
  game.ball.x += 2;
  game.ball.y += 2;
  currentUser = await fletchCurrentUserData();
  console.log(currentUser);
  canvas.addEventListener('mousemove', playerMove);
  document.querySelector('#start-game').addEventListener('click', play);
  document.querySelector('#stop-game').addEventListener('click', stop);

});

</script>

<h1>Pong</h1>

<style>
ul {
    list-style: none;
    padding: 0;
}
li {
    display: inline-block;
}
</style>

<main role="main">
<h1>
    <button on:click={connect}>connect</button>
    <button on:click={init_client}>send</button>

</h1>
<p>
  {player?.pseudo} : <em id="player-score">0</em> - {player2?.pseudo} : <em id="player2-score">0</em>
</p>
<ul>
  <li>
    <button id="start-game">Start</button>
  </li>
  <li>
    <button id="stop-game">Stop</button>
  </li>
</ul>
<h2>joined {room?.name} tu es {currentUser?.pseudo}</h2>
<canvas id="canvas" width="640" height="480"></canvas>
</main>
