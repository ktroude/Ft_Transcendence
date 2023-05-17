<script>
// @ts-nocheck

  import { Ball } from './ball';
  import { Player } from './player';
  import { onMount } from 'svelte';
  import * as setting_game from "./GameConfig" 

  let currentUser;
  let Colyseus;
  let client;
  let room;
  let clientId;
  let canvas;
  let showButtons = false;
  let mainclient = false;
  let winner;
  let gameFinished = false;
  let started = 0;

function countdown(counter)
{
  const context = canvas.getContext('2d');
  context.font = '48px Arial';
  context.fillStyle = 'Black';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  const countdownInterval = setInterval(() => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText(counter, canvas.width / 2, canvas.height / 2);

    counter--;

    if (counter < 0) {
      clearInterval(countdownInterval);
      play()
      // Le compte à rebours est terminé, vous pouvez exécuter votre code ici
    }
  }, 1000);
}

function init_player1() {
  let player = new Player(0, setting_game.canvas_height / 2, 0, 0);
  return player;
}

function init_player2() {
  let player2 = new Player(setting_game.canvas_width - setting_game.paddle_width, setting_game.canvas_height / 2, 0, 0);
  return player2;
}

function init_ball()
{
  let ball = new Ball(setting_game.canvas_width / 2, setting_game.canvas_height / 2, 2, 2);
  return ball;
}

let player = init_player1();
let player2 = init_player2();
let ball = init_ball();

// Fonction pour afficher le message de victoire
function print_win(gagnant)
{
  // Effacer le canvas
  const context = canvas.getContext('2d');
  cancelAnimationFrame(anim);
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Style du texte
  context.font = '42px Arial';
  context.fillStyle = 'Red';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  // Coordonnées du message
  const x = canvas.width / 2;
  const y = canvas.height / 2;
  
  // Afficher le message de victoire
  context.fillText(`${gagnant} a gagné ! Score : ${player.score} vs ${player2.score}`, x, y);
}
    
async function connect()
{
    Colyseus = await import("colyseus.js");
    client = new Colyseus.Client('ws://localhost:3001');
    room = await client.joinOrCreate("Private_Room");
    room.onMessage('Player_init', (message) =>
    {
      player.pseudo = message.player1_pseudo;
      player2.pseudo = message.player2_pseudo;
      player.id = message.player1_id;
      player2.id = message.player2_id;
      player.score = message.player1_score;
      player2.score = message.player2_score;
      player.color = message.player1_color;
      player2.color = message.player2_color;
      mainclient = message.mainclient;
      console.log(mainclient);
      showButtons = true;
      countdown(5);
    })
  room.onMessage('role', (message) => {
    clientId = message.client;
  });
  room.send('player_name', {player_pseudo : currentUser.pseudo});
  console.log('Joined succefuly', room);
}
    
const MAX_SPEED = 8;

let anim;

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
	};


function draw()
{
  const context = canvas.getContext('2d');
  // Draw field
  // context.clearRect(0, 0, canvas.width, canvas.height);
  // context.fillStyle = 'black';
  // context.font = "30px Arial";
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // player name
  context.fillText(player.pseudo, canvas.width / 15, canvas.height / 10);


  // Draw middle line
  context.strokeStyle = 'white';
  context.beginPath();
  context.moveTo(canvas.width / 2, 0);
  context.lineTo(canvas.width / 2, canvas.height);
  context.stroke();
  
  // context.fillStyle = "black";
  // context.font = "30px Arial";


  // player name
  context.fillText(player2.pseudo, 10 * canvas.width / 15, canvas.height / 10);
  //context.fillText(player2.score, 3 * canvas.current.width / 4, canvas.current.height / 2);
  context.strokeStyle = 'black';
  context.beginPath();
  context.moveTo(canvas.width / 2, 0);
  context.lineTo(canvas.width / 2, canvas.height);
  context.stroke();
  // console.log(player.color);
  context.fillStyle = player.color;
  context.fillRect(0, player.y, setting_game.paddle_width, setting_game.paddle_height);
  context.fillRect(canvas.width - setting_game.paddle_width, player2.y, setting_game.paddle_width, setting_game.paddle_height);
  // Draw ball
  // context.beginPath();
  // context.fillStyle = 'black';
  // context.arc(ball.x, ball.y, setting_game.ball_radius, 0, Math.PI * 2, false);
  // context.fill();

  // Draw ball
  context.beginPath();
  context.fillStyle = 'white';
  context.arc(ball.x, ball.y, setting_game.ball_radius, 0, Math.PI * 2, false);
  context.fill();
}

function play()
{
  if (mainclient == true)
  {
    ballMove();
  }
  updatePos();
  Updatescore();
  Updateball();
  // console.log(ball.x);
  draw();
  endGame();
  if(!gameFinished)
    anim = requestAnimationFrame(play);
}


function collide(playerCurrent) {
  // Le joueur ne touche pas la balle
  if (ball.y < playerCurrent.y || ball.y > playerCurrent.y + setting_game.paddle_height)
  {
    if (ball.x > canvas.width - setting_game.paddle_width)
    {
      player.score++;
    }
    else
    {
      player2.score++;
    }
    // Remet la balle et les joueurs au centre
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    // envoie les scores.
    room.send("updateScore", {player_score: player.score , player2_score : player2.score});
    ball.velocity_x = (Math.random() * 3 + 2) * (Math.random() < .5 ? -1 : 1);
		ball.velocity_y = Math.random();
    // if(Math.abs(ball.velocity_x) < MAX_SPEED)
    //   ball.velocity_x *= 1.2;
  }
  else
  {
    // Augmente la vitesse et change la direction
    if(Math.abs(ball.velocity_x) < MAX_SPEED)
    ball.velocity_x *= -1.1;
    changeDirection(playerCurrent.y);
  }
}

function changeDirection(playerPosition)
{
  var impact = ball.y - playerPosition - setting_game.paddle_height / 2;
  var ratio = 100 / (setting_game.paddle_height / 2);
  // Obtenir une valeur entre 0 et 10
  ball.velocity_y = Math.round(impact * ratio / 10);
}

function endGame()
{
  room.onMessage("gameFinished", (message) => {
    winner = message.winner;
    gameFinished = true;
    if (winner == player.pseudo && mainclient == true)
    {
      print_win(winner);
    }
    else
      print_win(winner);
  });
}

function Updatescore()
{
  room.onMessage("updateScore", (message) => {
      player.score = message.player_score;
      player2.score = message.player2_score;
  })
  document.querySelector('#player-score').textContent = player.score;
  document.querySelector('#player2-score').textContent = player2.score;
}

function Updateball()
{
  room.onMessage("ballPos", (message) => {
    ball.x = message.ball_x;
    ball.y = message.ball_y;
  })
}

function ballMove()
{
  if (ball?.y > canvas.height || ball?.y < 0) {
      ball.velocity_y *= -1;
  }
  if (ball.x > canvas.width - setting_game.paddle_width) {
    collide(player2);
  } else if (ball.x < setting_game.paddle_width) {
    collide(player);
  }
  ball.x += ball.velocity_x;
  ball.y += ball.velocity_y;
  room.send("ballPos", {ball_x: ball.x, ball_y: ball.y});
}

function stop()
{
  cancelAnimationFrame(anim);
  // Placez la balle et les joueurs au centre
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  player.y = canvas.height / 2 - setting_game.paddle_height / 2;
  player2.y = canvas.height / 2 - setting_game.paddle_height / 2;
  // Reset speed
  ball.velocity_y = 2;
  ball.velocity_x = 2;
  // Init score
  player2.score = 0;
  player.score = 0;
  document.querySelector('#player2-score').textContent = player2.score;
  document.querySelector('#player-score').textContent = player.score;
  draw();
}

function playerMove(event)
{
  if ((clientId === player?.id))
  {
    var canvasLocation = canvas.getBoundingClientRect();
    var mouseLocation = event.clientY - canvasLocation.y;
    if (player?.y || player?.y === 0)
    {
      player.y = (mouseLocation / canvasLocation.height * canvas.height)
              - setting_game.paddle_height / 2;
    }

    // permet de limiter les players par rapport a la taille du canvas
    if (mouseLocation < setting_game.paddle_height / 2) {
      if(player?.y || player?.y === 0)
        player.y = 0;
    } else if ((mouseLocation / canvasLocation.height * canvas.height)
          + setting_game.paddle_height / 2 > canvas.height) {
      if(player?.y || player?.y === 0)
        player.y = canvas.height - setting_game.paddle_height;
    }
    if (room)
    {
      room.send("player", {player_y : player.y})
    }
  }
}

function player2Move(event)
{
  if (clientId === player2?.id) {
    var canvasLocation = canvas.getBoundingClientRect();
    var mouseLocation = event.clientY - canvasLocation.y;
    if(player2?.y || player2?.y === 0)
    {
      player2.y = (mouseLocation / canvasLocation.height * canvas.height)
              - setting_game.paddle_height / 2;
    }

    // permet de limiter les players par rapport a la taille du canvas
    if (mouseLocation < setting_game.paddle_height / 2) {
      if(player2?.y || player2?.y === 0)
        player2.y = 0;
    } else if ((mouseLocation / canvasLocation.height * canvas.height)
          + setting_game.paddle_height / 2 > canvas.height) {
      if(player2?.y || player2?.y === 0)
        player2.y = canvas.height - setting_game.paddle_height;
    }
    if (room)
    {
      room.send("player2", {player2_y : player2.y})
    }
  }
}
// Obtenir l'emplacement de la souris dans le canevas
function updatePos()
{
  if (room)
  {
    room.onMessage("player", (message) => {
      player.y = message.player_y;
    })

    room.onMessage("player2", (message) => {
      player2.y = message.player2_y;
    })
  }
}

onMount(async() => {
  canvas = document.getElementById('canvas');
  currentUser = await fletchCurrentUserData();
  console.log(currentUser);
  canvas.addEventListener('mousemove', playerMove);
  canvas.addEventListener('mousemove', player2Move);
  // document.querySelector('#start-game').addEventListener('click', play);
  // document.querySelector('#stop-game').addEventListener('click', stop);
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

</h1>
<p>
  {player.pseudo} : <em id="player-score">0</em> - {player2.pseudo} : <em id="player2-score">0</em>
</p>
<ul>
  {#if showButtons}
    <li>
      <button on:click={play}>Start</button>
      <!-- <button id="start-game">Start</button> -->
    </li>
    <li>
      <button id="stop-game">Stop</button>
    </li>
  {/if}
</ul>
<h2>joined {room?.name} tu es {currentUser?.pseudo}</h2>
<canvas id="canvas" width={setting_game.canvas_width} height={setting_game.canvas_height}></canvas>
</main>
