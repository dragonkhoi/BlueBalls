var windowWidth;
var windowHeight;
var BRICK_WIDTH = 160;
var BRICK_HEIGHT = 80;
var BRICK_OFFSET = 10;
var BALL_WIDTH = 20;
var BALL_HEIGHT = 20;
var bricks = [];
var balls = [];
var powerUps = [];
var BALL_SPEED = 20;
var score = 0;
var numOfBalls = 1;
var ogBalls = 1;
var ballsAtBottom = 0;
var ballsFlying = false;
var gameOverBool = false;

var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.setAttribute("id", "myCanvas");
        this.canvas.width = windowWidth;
        this.canvas.height = windowHeight;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 16);
        this.updateScore(0);
        this.canvas.addEventListener('click', function (event) {
            if (gameOverBool) {
                gameOverBool = false;
                startGame();
            }
            if (!ballsFlying) {
                console.log("clicked");
                var mousePos = getMousePos(this.canvas, event);
                clickX = mousePos.x; // event.clientX - this.canvas.getBoundingClientRect().left;
                clickY = mousePos.y; // event.clientY - this.canvas.getBoundingClientRect().top;
                console.log("x: " + clickX + ", y:" + clickY);
                deltaX = clickX - balls[0].x;
                deltaY = clickY - balls[0].y;
                angle = Math.atan2(deltaY, deltaX);
                console.log(angle);
                for (var i = 0; i < balls.length; i++) {
                    balls[i].dx = BALL_SPEED * Math.cos(angle);  //deltaX / 10; //
                    balls[i].dy = BALL_SPEED * Math.sin(angle);  //deltaY / 10; //
                }
                launchBalls();
            }           
        }, false);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    updateScore: function (scoreIncrease) {
        score += scoreIncrease;
        this.context.font = "50px Trebuchet";
        this.context.fillStyle = "black";
        this.context.fillText("Score: " + score + " Balls: " + numOfBalls, 10, this.canvas.height - 10);
    }
}
function getMousePos(canvas, evt) {
    var rect = document.getElementById("myCanvas").getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
function startGame() {
    // 6width, 8 height
    windowWidth = window.innerWidth - 20;
    windowHeight = windowWidth;
    BRICK_WIDTH = windowWidth / 6 - BRICK_OFFSET;
    BRICK_HEIGHT = windowHeight / 8 - BRICK_OFFSET;
    BALL_HEIGHT = BALL_WIDTH = windowWidth / 30;
    BALL_SPEED = BALL_WIDTH * 0.6;
    myGameArea.start();
    firstBrick = new brick(BRICK_OFFSET, BRICK_OFFSET, "orange", 1);
    bricks.push(firstBrick);
    firstBall = new ball(windowWidth / 2, windowHeight - BALL_HEIGHT - 5, 0, 0, "blue", balls.length);
    balls.push(firstBall);
}

function brick(x, y, color, num) {
    this.width = BRICK_WIDTH;
    this.height = BRICK_HEIGHT;
    this.x = x;
    this.y = y;
    this.num = num;
    this.update = function () {
        ctx = myGameArea.context;
        color = "rgba(255, 165," + 255 % num + ",0.7)";
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.font = this.height/2 + "px Trebuchet";
        ctx.fillStyle = "black";
        ctx.fillText("" + this.num, this.x + this.width / 2 - 10, this.y + this.height / 2 + 10);
    }
    this.break = function (damage) {
        this.num -= damage;
        if (this.num == 0) {
            this.destroy();
        }
    }
    this.destroy = function () {
        ctx = myGameArea.context;
        ctx.clearRect(this.x, this.y, this.width, this.height);
        for (var i = 0; i < bricks.length; i += 1) {
            if (bricks[i] == this) {
                bricks.splice(i, 1);
                break;
            }
        }
    }
}
function launchBalls() {
    ogBalls = numOfBalls;
    ballsAtBottom = 0;
    for (var i = 0; i < balls.length; i++) {
        balls[i].x -= balls[0].dx * i * 3;
        balls[i].y -= balls[0].dy * i * 3;
    }
    ballsFlying = true;
}
function levelUp() {
    ballsFlying = false;
    score++;
    if (numOfBalls > ogBalls) {
        for (var i = 0; i < numOfBalls - ogBalls; i += 1) {
            newBall = new ball(balls[0].x, balls[0].y, 0, 0, "blue", balls.length);
            balls.push(newBall);
        }
    }
    for (var i = 0; i < balls.length; i++) {
        balls[i].x = balls[0].x;
        balls[i].y = balls[0].y;
    }
    console.log(balls);
    for (var i = 0; i < bricks.length; i++) {
        bricks[i].y += BRICK_HEIGHT + BRICK_OFFSET;
        if (bricks[i].y >= myGameArea.canvas.height - BRICK_HEIGHT - BRICK_OFFSET) {
            gameOver();
        }
    }
    for (var i = 0; i < powerUps.length; i++) {
        powerUps[i].y += BRICK_HEIGHT + BRICK_OFFSET;
    }

    var maxBricks = 1;
    if (score < 4) {
        maxBricks = 1;
    }
    else if (score >= 4 && score <= 10) {
        maxBricks = 2;
    }
    else if (score > 10 && score < 40) {
        maxBricks = 4;
    }
    else {
        maxBricks = 6;
    }
    console.log(maxBricks);
    var randomBrickNum = Math.floor((Math.random() * maxBricks) + 1);
    var brickSet = new Set();   
    for (var i = 0; i < randomBrickNum; i++) {
        var randy = Math.floor((Math.random() * 6));
        var brickSpot = randy * BRICK_WIDTH;
        brickSpot += BRICK_OFFSET;
        while (brickSet.has(brickSpot)) {
            randy = Math.floor((Math.random() * 6));
            brickSpot = randy * BRICK_WIDTH;
            brickSpot += BRICK_OFFSET;
        }
        brickSet.add(brickSpot);
        var newBrick = new brick(brickSpot, BRICK_OFFSET, "rgba(255, 165, " + 255 % score + ", 0.7)", score);
        bricks.push(newBrick);
    }
    
    randy = Math.floor((Math.random() * 6));
    var powerUpSpot = randy * BRICK_WIDTH + BRICK_OFFSET;
    while (brickSet.has(powerUpSpot)) {
        randy = Math.floor((Math.random() * 6));
        powerUpSpot = randy * BRICK_WIDTH + BRICK_OFFSET;
    }
    var newPowerUp = new powerUp(powerUpSpot + BRICK_WIDTH / 2, BRICK_OFFSET + (0.5*BRICK_HEIGHT), "plusBall");
    powerUps.push(newPowerUp);
}
function gameOver() {
    myGameArea.clear();
    context = myGameArea.canvas.getContext("2d");
    context.font = "100px Trebuchet";
    context.fillStyle = "black";
    context.fillText("GAME OVER - TAP TO PLAY AGAIN", 400, 400);
    gameOverBool = true;
}
function powerUp(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = BRICK_HEIGHT * 0.6;
    this.height = this.width;
    if (type == "plusBall") {
        this.color = "green";
    }
    this.update = function () {
        ctx = myGameArea.context;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }
    this.activatePowerUp = function(){
        if(type == "plusBall"){
            numOfBalls++;
        }
    }
    this.destroy = function () {
        this.activatePowerUp();
        ctx = myGameArea.context;
        ctx.clearRect(this.x, this.y, this.width, this.height);
        for (var i = 0; i < powerUps.length; i += 1) {
            if (powerUps[i] == this) {
                powerUps.splice(i, 1);
                break;
            }
        }
    }
}
function ball(x, y, dx, dy, color, index) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.width = BALL_WIDTH;
    this.height = BALL_HEIGHT;
    this.index = index;
    this.color = color;
    this.movedUp = false;
    this.collideWith = function(otherobj){
        var myLeft = this.x - this.width / 2 + this.dx*2;
        var myRight = this.x + this.width / 2 + this.dx*2;
        var myTop = this.y - this.width / 2 + this.dy*2;
        var myBottom = this.y + this.width / 2 + this.dy*2;
        var otherLeft = otherobj.x;
        var otherRight = otherobj.x + otherobj.width;
        var otherTop = otherobj.y;
        var otherBottom = otherobj.y + otherobj.height;
        if (myLeft < otherRight && myRight > otherRight && (this.y < otherBottom && this.y > otherTop)) {
            return "right"; // hit the right, bounce to the right
        }
        if (myRight > otherLeft && myLeft < otherLeft && (this.y < otherBottom && this.y > otherTop)) {
            return "left"; // hit the left, bounce left
        }
        if (myRight < otherRight + this.width/2 && myLeft > otherLeft - this.width/2 && myTop < otherBottom && myBottom > otherTop) {
            return "down"; // hit the bottom, bounce down
        }
        if (myRight < otherRight && myLeft > otherLeft && myBottom > otherTop && myTop < otherBottom) {
            return "up"; // hit the top, bounce up
        }
        return "";
    }
    this.update = function () {
        this.x += this.dx;
        this.y += this.dy;
        if (this.x + this.width / 2 + this.dx*2 >= myGameArea.canvas.width || this.x - this.width / 2 + this.dx*2 <= 0) {
            if (this.movedUp) {
                this.dx = -1 * this.dx;
            }
            //this.x = myGameArea.canvas.width - this.width / 2 - 1;
        }
        if (this.y - this.width / 2 + this.dy*2 <= 3) {
            //this.y = 1 + this.width / 2;
            this.dy = -1 * this.dy;
        }
        if (this.y < myGameArea.canvas.height - BALL_HEIGHT - 10) {
            // moved up is true
            this.movedUp = true;
        }
        if (this.y + this.width / 2 + this.dy*2 > myGameArea.canvas.height) {
            // hit the bottom
            if (this.movedUp) {
                this.movedUp = false;
                this.dy = 0;
                this.dx = 0;
                ballsAtBottom++;
                if (ballsAtBottom == balls.length)
                    levelUp();
            }           
        }
        for (var i = 0; i < bricks.length; i += 1) {
            var direction = this.collideWith(bricks[i]);
            if (direction == "right" || direction == "left") {
                this.dx = -1 * this.dx;
            }
            if (direction == "up" || direction == "down") {
                this.dy = -1 * this.dy;
            }
            if (direction != "") {
                bricks[i].break(1);
            }
        }
        for (var i = 0; i < powerUps.length; i += 1) {
            var direction = this.collideWith(powerUps[i]);
            if (direction != "") {
                powerUps[i].destroy();
            }
        }
        //console.log("ballx: " + this.x, ", y: " + this.y + ", dx: " + this.dx + ", dy: " + this.dy);
        ctx = myGameArea.context;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x - this.width/2, this.y - this.height/2, this.width/2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }
}

function updateGameArea() {
    if (gameOverBool) {
        return;
    }
    myGameArea.clear();
    myGameArea.updateScore(0);
    for (var i = 0; i < bricks.length; i += 1) {
        bricks[i].update();
    }
    for (var i = 0; i < balls.length; i += 1) {
        balls[i].update();
    }
    for (var i = 0; i < powerUps.length; i += 1) {
        powerUps[i].update();
    }
}
