<script>
    let ballX = 50;
    let ballY = 50;
    let ballSpeedX = 5;
    let ballSpeedY = 5;

    let player1Y = 40;
    let player2Y = 40;

    const update = () => {
        ballX += ballSpeedX;
        ballY += ballSpeedY;
        
        if (ballX < 0 || ballX > 400){
            ballSpeedX = -ballSpeedX;
        }
        if (ballY < 0 || ballY > 400) {
            ballSpeedY = -ballSpeedY;
        }
        if (ballX < 20 && ballY > player1Y && ballY < player1Y + 60) {
            ballSpeedX = -ballSpeedX;
        }
        if (ballX > 380 && ballY > player2Y && ballY < player2Y + 60) {
            ballSpeedX = -ballSpeedX;
        }

    };

</script>

<style lang="less">
    .game {
        width: 400px;
        height: 400px;
        background-color: black;
        position: relative;
    }
    .player {
        width: 20px;
        height: 60px;
        background-color: white;
        position: absolute;
    }
</style>
<div class="game"></div>
<div class="player"></div>