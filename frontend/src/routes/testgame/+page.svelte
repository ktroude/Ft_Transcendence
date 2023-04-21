<script>
// @ts-nocheck

  import { onMount } from 'svelte';

  const PLAYER_HEIGHT = 100;
  const PLAYER_WIDTH = 5;

  let canvas;
  let anim;
  let game = {
    player: {
      y: 0,
      score: 0
    },
    computer: {
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
    context.fillRect(canvas.width - PLAYER_WIDTH, game.computer.y, PLAYER_WIDTH, PLAYER_HEIGHT);
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
      computerMove();
      ballMove();
      anim = requestAnimationFrame(play);
  }
  function playerMove(event) {
  var canvasLocation = canvas.getBoundingClientRect();
  var mouseLocation = event.clientY - canvasLocation.y;

  if (mouseLocation < PLAYER_HEIGHT / 2){
      game.player.y = 0;
  } else if (mouseLocation > canvas.height - PLAYER_HEIGHT / 2){
      game.player.y = canvas.height - PLAYER_HEIGHT;
  } else {
      game.player.y = mouseLocation - PLAYER_HEIGHT / 2;
  }
  // Obtenir l'emplacement de la souris dans le canevas
}

function collide(player) {
  // Le joueur ne touche pas la balle
  if (game.ball.y < player.y || game.ball.y > player.y + PLAYER_HEIGHT) {
      // remet la balle et les joueurs au centre
      game.ball.x = canvas.width / 2;
      game.ball.y = canvas.height / 2;
      game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
      game.computer.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
      if (player == game.player){
        game.computer.score++;
        document.querySelector('#computer-score').textContent = game.computer.score;
        game.ball.speed.x = 2;
        game.ball.speed.y = 2;
      } else {
        game.player.score++;
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
    collide(game.computer);
  } else if (game.ball.x < PLAYER_WIDTH) {
    collide(game.player);
  }
  game.ball.x += game.ball.speed.x;
  game.ball.y += game.ball.speed.y;
}

function stop() {
  cancelAnimationFrame(anim);
  // Placez la balle et les joueurs au centre
  game.ball.x = canvas.width / 2;
  game.ball.y = canvas.height / 2;
  game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
  game.computer.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
  // Reset speed
  game.ball.speed.x = 2;
  game.ball.speed.y = 2;
  // Init score
  game.computer.score = 0;
  game.player.score = 0;
  document.querySelector('#computer-score').textContent = game.computer.score;
  document.querySelector('#player-score').textContent = game.player.score;
  draw();
}

function computerMove() {
  game.computer.y += game.ball.speed.y * 1.85;
}

  onMount(() => {
    canvas = document.getElementById('canvas');
    game.player.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
    game.computer.y = canvas.height / 2 - PLAYER_HEIGHT / 2;
    game.ball.x = canvas.width / 2;
    game.ball.y = canvas.height / 2;
    game.ball.x += 2;
    game.ball.y += 2;
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
  <p>
    joueur 1 : <em id="player-score">0</em> - Joueur 2 : <em id="computer-score">0</em>
  </p>
  <ul>
    <li>
      <button id="start-game">Start</button>
    </li>
    <li>
      <button id="stop-game">Stop</button>
    </li>
  </ul>
  <canvas id="canvas" width="640" height="480"></canvas>
</main>