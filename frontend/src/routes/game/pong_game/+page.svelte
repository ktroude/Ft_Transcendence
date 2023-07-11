<svelte:head>
	<link rel="preload" href="/img/bg2.jpeg" as="image">
	<link rel="preload" href="/pong.css" as="style"/>
	<link rel="stylesheet" href="/pong.css" />
	<link rel="stylesheet" href="/homepage_style.css" />
	<link rel="stylesheet" href="/navbar.css" />
	<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
</svelte:head>

<!-- {#if loading == true} -->
<body style="margin:0px; padding:0px; background-image:url('/img/bg2.jpeg');
background-position: center; background-size: cover ; overflow: hidden; width: 100vw;height: 100vh;">
	<div class="score_bloc">
		{#if connected == true}
			<div class="scores">
				<span style="color:rgb(93, 215, 255);">{player.username}</span>: <span id="player1_score">{player.score}</span> <span style="color:rgb(93, 215, 255);">|</span> <span style="color:rgb(93, 215, 255);">{player2.username}</span>: <span id="player2_score">{player2.score}</span>
			</div>
		{/if} 
	</div>
	<div class="canvas-container">
		<canvas id="canvas" width={setting_game.canvas_width} height={setting_game.canvas_height}>
		</canvas>
		{#if connected == false}
			{#if waiting_game == false}
				<button class="play_button" on:click={ready_to_play}>PLAY</button>
			{:else}
				<button class="waiting_button">WAITING...</button>
			{/if}
		{/if}
		{#if gameFinished == true}
			<button class="lobby_button" on:click={() => location.href = "/game"}>LOBBY</button>
		{/if}
	</div>
	<div class='select_color_box'>
		<!-- Ajout du composant ColorDropdown -->
		<!-- <ColorDropdown on:selectedColor={handleColorSelected} /> -->

		<h1>Choisissez une couleur :</h1>
		
		<label for="couleur">Couleur :</label>
		<select id="couleur" on:change={handleChange}>
  		<option value="Défault">Sélectionnez une couleur</option>
  		<option value="Rouge">Rouge</option>
  		<option value="Vert">Vert</option>
  		<option value="Bleu">Bleu</option>
  		<option value="Jaune">Jaune</option>
		</select>

		<p>Vous avez sélectionné la couleur : {selectedColor}</p>
	</div>
</body>
<!-- {/if} -->

<script>
// @ts-nocheck

  import { Ball } from './ball';
//   import {ColorDropdown, selectedColor} from './ColorDropdown.svelte';
  import { Player } from './player';
  import { onMount } from 'svelte';
  import * as setting_game from "./GameConfig" 
  import { fetchAccessToken, fetchData, fetchFriend, fetchDataOfUser, fetch2FA } from '../../../API/api';
  import { LOCALHOST } from "../../../API/env";
  import {io, Socket} from 'socket.io-client';

	let currentUser;
	let Colyseus;
	let client;
	let room;
	let clientId;
	let canvas;
	let mainclient = false;
	let winner;
	let gameFinished = false;
	let break_r = false;
	let connected = false;
	let touched = 0;
	let touched_player_1 = false;
	let touched_player_2 = false;
	let waiting_game = false;
	let user;
  // debug
	let room_id;
	let started = 0;

	let selectedColor = '';
	let colorValuePlayer = '';

function handleChange(event) {
  selectedColor = event.target.value;
  
  switch (selectedColor) {
	case 'Rouge':
		colorValuePlayer = 'rgb(255, 0, 0)';
        break;
	case 'Jaune':
        colorValuePlayer = 'rgb(255, 255, 0)';
        break;
    case 'Bleu':
		colorValuePlayer = 'rgb(0, 0, 255)';
        break;
    case 'Vert':
        colorValuePlayer = 'rgb(0, 255, 0)';
        break;
    default:
		colorValuePlayer = 'rgb(93, 215, 255)';
        break;
	}
}

function ready_to_play()
{
	return ;
}

function countdown(counter)
{
	const context = canvas.getContext('2d');
	if (anim)
		cancelAnimationFrame(anim);
	context.font = '80px Bebas Neue';
	context.fillStyle = 'rgb(93, 215, 255)';
	context.textAlign = 'center';
	context.textBaseline = 'middle';

	const countdownInterval = setInterval(() => {
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillText(counter, canvas.width / 2, canvas.height / 2);
		counter--;
		if (counter < 0) {
		clearInterval(countdownInterval);
		play()
		}
	}, 1000);
}

function getRoomIdFromUrl(){
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('room_id');
}

function init_player(num) {
	let player;
	if(num == 1)
		player = new Player(0, setting_game.canvas_height / 2, 0, 0);
	else
		player = new Player(setting_game.canvas_width - setting_game.paddle_width, setting_game.canvas_height / 2, 0, 0);		
  return player;
}

function init_ball(){
  let ball = new Ball(setting_game.canvas_width / 2, setting_game.canvas_height / 2, 5, 5);
  return ball;
}

let player = init_player(1);
let player2 = init_player(2);
let ball = init_ball();

// Fonction pour afficher le message de victoire
function print_win(gagnant){
	// Effacer le canvas
	const context = canvas.getContext('2d');
	cancelAnimationFrame(anim);
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Style du texte
	context.font = '60px Bebas Neue';
	context.fillStyle = 'rgb(93, 215, 255)';
	context.textAlign = 'center';
	context.shadowColor="black";
	context.shadowOffsetX = 5;
	context.shadowOffsetY = 5;
	context.shadowBlur = 6;
	context.textBaseline = 'middle';

	// Coordonnées du message
	const x = canvas.width / 2;
	const y = canvas.height / 2;

	// Afficher le message de victoire
	context.fillText(`${gagnant} won!`, x, y);
}

async function connect(){
    Colyseus = await import("colyseus.js");
    client = new Colyseus.Client(`ws://${LOCALHOST}:3001`);
    room = await client.joinById(room_id, {player_pseudo : currentUser.pseudo, player_username : currentUser.username, player_id : currentUser.id});
	waiting_game = true;
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
		player.id_user = message.player1_iD_user;
		player2.id_user = message.player2_iD_user;
		player.username = message.player1_username;
		player2.username = message.player2_username;
		if(clientId == player.id)
			mainclient = true;
		connected = true;
		countdown(5);
    })
	room.onMessage('role', (message) => {
		clientId = message.client;
	});
	endGame();
}
    
const MAX_SPEED = 8;
const MIN_SPEED = 7;

let anim;

const fletchCurrentUserData = async () => {
		const cookies = document.cookie.split(';');
		const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('access_token='));
		const accessToken = accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
		if (accessToken) {
			const headers = new Headers();
			headers.append('Authorization', `Bearer ${accessToken}`);
			const response = await fetch(`http://${LOCALHOST}:3000/users/userInfo`, { headers });
			const data = await response.json();
			const user = data;
			return user;
		}
	};

function draw(){
	const context = canvas.getContext('2d');
	// Set the background color
	context.fillStyle = 'rgba(35, 35, 35)';
	context.fillRect(0, 0, canvas.width, canvas.height);

	// Set the color of the ball
	context.fillStyle = 'rgb(93, 215, 255)';
	context.beginPath();
	context.arc(ball.x, ball.y, setting_game.ball_radius, 0, Math.PI * 2, false);
	context.fill();

	//middle bar
	context.strokeStyle = 'rgb(93, 215, 255)';
	context.beginPath();
	context.moveTo(canvas.width / 2, 0);
	context.lineTo(canvas.width / 2, canvas.height);
	context.stroke();

	// Set the color of the bars
	context.fillStyle = colorValuePlayer;
	context.fillRect(0, player.y, setting_game.paddle_width, setting_game.paddle_height);
	context.fillRect(
		canvas.width - setting_game.paddle_width,
		player2.y,
		setting_game.paddle_width,
		setting_game.paddle_height
	);
}

function draw2(){
	const context = canvas.getContext('2d');
	// Set the background color
	context.fillStyle = 'rgba(35, 35, 35)';
	context.fillRect(0, 0, canvas.width, canvas.height);

	// Set the color of the ball
	context.fillStyle = 'rgb(93, 215, 255)';
	context.beginPath();
	context.arc(ball.x, ball.y, setting_game.ball_radius, 0, Math.PI * 2, false);
	context.fill();

	//middle bar
	context.strokeStyle = 'rgb(93, 215, 255)';
	context.beginPath();
	context.moveTo(canvas.width / 2, 0);
	context.lineTo(canvas.width / 2, canvas.height);
	context.stroke();

	// Set the color of the bars
	if (touched_player_1 == true){
		context.fillStyle = 'white';
		context.fillRect(0, player.y, setting_game.paddle_width, setting_game.paddle_height);
		context.fillStyle = colorValuePlayer;
		context.fillRect(
			canvas.width - setting_game.paddle_width,
			player2.y,
			setting_game.paddle_width,
			setting_game.paddle_height
			);
	}
	else{
		context.fillStyle = colorValuePlayer;
		context.fillRect(0, player.y, setting_game.paddle_width, setting_game.paddle_height);
		context.fillStyle = 'white';
		context.fillRect(
			canvas.width - setting_game.paddle_width,
			player2.y,
			setting_game.paddle_width,
			setting_game.paddle_height
			);
	}
	touched--;
}

function play(){
	room.send("rdtoplay", 1);
	room.onMessage("break", (message) => {
		if(break_r == true && message == false)
		{
			countdown(5);
			break_r = message;
			return;
		}
		else
			break_r = message
	});
	if (mainclient == true)
		ballMove();
	updatePos();
	Updatescore();
	Updateball();
	// console.log("I am vitesse: ",ball.velocity_x, ball.velocity_y);
	if (touched > 0)
		draw2();
	else
		draw();
	endGame();
	if(!gameFinished)
		anim = requestAnimationFrame(play);
}

function collide(playerCurrent) {
  // Le joueur ne touche pas la balle
	if (ball.y < playerCurrent.y || ball.y > playerCurrent.y + setting_game.paddle_height){
		if (ball.x > canvas.width - setting_game.paddle_width) {
			const player1ScoreElement = document.getElementById("player1_score");
			player1ScoreElement.classList.add('pop_out');
			player.score++;
			player1ScoreElement.addEventListener('animationend', function () {
				player1ScoreElement.classList.remove('pop_out');
				player1ScoreElement.classList.add('pop_in');
			}, { once: true });
		} else {
			const player2ScoreElement = document.getElementById("player2_score");
			player2ScoreElement.classList.add('pop_out');
			player2.score++;
			player2ScoreElement.addEventListener('animationend', function () {
				player2ScoreElement.classList.remove('pop_out');
			player2ScoreElement.classList.add('pop_in');
			}, { once: true });
		}
		// Remet la balle et les joueurs au centre
		ball.x = canvas.width / 2;
		ball.y = canvas.height / 2;
		// envoie les scores.
		room.send("updateScore", {player_score: player.score , player2_score : player2.score});
		ball.velocity_x = (Math.random() * 3 + 2) * (Math.random() < .5 ? -1 : 1);
		ball.velocity_y = Math.random();
		//console.log(ball.velocity_x, ball.velocity_y);
		// if(Math.abs(ball.velocity_x) < MAX_SPEED)
		//   ball.velocity_x *= 1.2;
	}
	else{
	// Augmente la vitesse et change la direction
	if(Math.abs(ball.velocity_x) < MAX_SPEED)
		ball.velocity_x *= -1.1;
	changeDirection(playerCurrent.y);
	touched = 10;
	}
}

function changeDirection(playerPosition){
  var impact = ball.y - playerPosition - setting_game.paddle_height / 2;
  var ratio = 100 / (setting_game.paddle_height / 2);
  // Obtenir une valeur entre 0 et 10
  ball.velocity_y = Math.round(impact * ratio / 10);
}

function endGame(){
  room.onMessage("gameFinished", (message) => {
	connected = true;
    winner = message.winner;
    gameFinished = true;
      print_win(winner);
  });
}

function Updatescore(){
  room.onMessage("updateScore", (message) => {
      player.score = message.player_score;
      player2.score = message.player2_score;
  })
}

function Updateball(){
  room.onMessage("ballPos", (message) => {
    ball.x = message.ball_x;
    ball.y = message.ball_y;
  })
}

function ballMove()
{
	// room.onMessage("break", (message) => {break_r = message});
	if(break_r == true)
	{
		ball.x = canvas.width / 2;
		ball.y = canvas.height / 2;
		ball.velocity_y = 2;
		ball.velocity_x = 2;
		room.send("ballPos", {ball_x: ball.x, ball_y: ball.y});
		return;
	}
	if (ball?.y > canvas.height || ball?.y < 0)
		ball.velocity_y *= -1;
	if (ball.x > canvas.width - setting_game.paddle_width) {
		touched_player_2 = true;
		touched_player_1 = false;
		collide(player2);
	} else if (ball.x < setting_game.paddle_width) {
		collide(player);
		touched_player_2 = false;
		touched_player_1 = true;
	}
	ball.x += ball.velocity_x;
	ball.y += ball.velocity_y;
	room.send("ballPos", {ball_x: ball.x, ball_y: ball.y});
}

function playerMove(event){
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

function player2Move(event){
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
// Obtenir l'emplacement de la souris dans le canvas
function updatePos(){
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
	const access = await fetchAccessToken();
	const user = await fetchData();
	if (!user)
	{
		location.href = '/';
		return ;
	}
	const FA2 = await fetch2FA(user.id);
	if (FA2 === true)
	{
		location.href = 'auth/2fa';
		return ;
	}
	if (access)
	{
		canvas = document.getElementById('canvas');
		currentUser = await fletchCurrentUserData();
		canvas.addEventListener('mousemove', playerMove);
		canvas.addEventListener('mousemove', player2Move);
		room_id = await getRoomIdFromUrl();
		const socket = io(`http://${LOCALHOST}:3000`); // Connect to the server
			socket.on('connect', async function() {			
				socket.emit('userConnected', { pseudo: user.pseudo }); // Send the user pseudo to the server
			});
		try {
			await connect();
		}
		catch{
			location.href = "/game";
		}
	}
	else
	{	
		location.href = '/';
		return ;
	}
});

</script>
