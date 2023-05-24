<script>
  import { onMount } from 'svelte';
  import Colyseus from 'colyseus.js';
  import * as dotenv from 'dotenv';
  dotenv.config();

  let canvas;
  let game;
  let anim;
  let client;
  let room;

  const PLAYER_HEIGHT = 100;
  const PLAYER_WIDTH = 5;
  const MAX_SPEED = 12;

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

    // Draw players
    context.fillStyle = 'white';
    context.fillRect(0, game.player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
    context.fillRect(canvas.width - PLAYER_WIDTH, game.computer.y, PLAYER_WIDTH, PLAYER_HEIGHT);

    // Draw ball
    context.beginPath();
    context.fillStyle = 'white';
    context.arc(game.ball.x, game.ball.y, game.ball.r, 0, Math.PI * 2, false);
    context.fill();
  }

  function changeDirection(playerPosition) {
    const impact = game.ball.y - playerPosition - PLAYER_HEIGHT / 2;
    const ratio = 100 / (PLAYER_HEIGHT / 2);

    // Get a value between 0 and 10
    game.ball.speed.y = Math.round(impact * ratio / 10);
  }

  function playerMove(event) {
    // Get the mouse location in the canvas
    const canvasLocation = canvas.getBoundingClientRect();
    const mouseLocation = event.clientY - canvasLocation.y;

    if (mouseLocation < PLAYER_HEIGHT / 2) {
      game.player.y = 0;
    } else if (mouseLocation > canvas.height - PLAYER_HEIGHT / 2) {
      game.player.y = canvas.height - PLAYER_HEIGHT;
    } else {
      game.player.y = mouseLocation - PLAYER_HEIGHT / 2;
    }
  }

  function computerMove() {
    game.computer.y += game.ball.speed.y * game.computer.speedRatio;
  }

  function collide(player) {
    // The player does not hit the ball
    if (game.ball.y < player.y || game.ball.y > player.y + PLAYER_HEIGHT) {
      reset();

      // Update score
      if (player == game.player) {
        game.computer.score++;
        document.querySelector('#computer-score').textContent = game.computer.score;
      } else {
        game.player.score++;
        document.querySelector('#player-score').textContent = game.player.score;
      }
    } else {
      // Change direction
      game.ball.speed.x *= -1;
      changeDirection(player.y);

      // Increase speed if it has not reached max speed
      if (Math.abs(game.ball.speed.x) < MAX_SPEED) {
        game.ball.speed.x *= 1.2;
      }
    }
  }

  function ballMove() {
    // Rebounds on top and bottom
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

  function play() {
    draw();

    computerMove();
    ballMove();

    anim = requestAnimationFrame(play);
  }

  function reset() {
    // Reset ball position
    game.ball.x = canvas.width / 2;
    game.ball.y = canvas.height / 2;

    // Reset ball speed
    game.ball.speed.x = game.ball.speed.x < 0 ? -5 : 5;
    game.ball.speed.y = Math.floor(Math.random() * 10) - 5;
  }

  onMount(async () => {
    canvas = document.querySelector('#canvas');
    canvas.addEventListener('mousemove', playerMove);

    game = {
      player: {
        y: (canvas.height - PLAYER_HEIGHT) / 2,
        score: 0,
      },
      computer: {
        y: (canvas.height - PLAYER_HEIGHT) / 2,
        score: 0,
        speedRatio: 0.1,
      },
      ball: {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: 10,
        speed: {
          x: -5,
          y: Math.floor(Math.random() * 10) - 5,
        },
      },
    };

    client = new Colyseus.Client(`ws://${process.env.LOCALHOST}:2567`);
    room = await client.joinOrCreate('pong');

    room.onStateChange((state) => {
      // Update computer player position
      game.computer.y = state.computer.y;
    });

    room.state.players.onAdd = (player, sessionId) => {
      if (sessionId !== room.sessionId) {
        // Add opponent player to game state
        game.opponent = {
          y: (canvas.height - PLAYER_HEIGHT) / 2,
          score: 0,
        };

        // Listen for opponent player position updates
        room.state.players[sessionId].onChange = (changes) => {
          if (changes.y !== undefined) {
            game.opponent.y = changes.y;
          }
        };
      }
    };

    reset();
    play();
  });
<script>