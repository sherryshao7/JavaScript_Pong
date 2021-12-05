const canvas = document.getElementById("pong");
const ctx = canvas.getContext('2d');

var gameover = false;

// SFX
let hit = new Audio();
let wall = new Audio();
let userScore = new Audio();
let comScore = new Audio();

hit.src = "sounds/hit.mp3";
wall.src = "sounds/wall.mp3";
comScore.src = "sounds/comScore.mp3";
userScore.src = "sounds/userScore.mp3";

// ball
const ball = {
    x: canvas.width/2,
    y: canvas.height/2,
    radius: 10,
    velocityX: 5,
    velocityY: 5,
    speed: 8,
    color: "white"
}

// user paddle
const user = {
    x: 20,
    y: (canvas.height - 100)/2,
    width: 20,
    height: 120,
    score: 0,
    color: "white"
}

// COM paddle
const com = {
    x: canvas.width - 40, // - 2x width of paddle
    y: (canvas.height - 100)/2,
    width: 20,
    height: 120,
    score: 0,
    color: "white"
}

// net
const net = {
    x: (canvas.width - 2)/2,
    y: 0,
    height: 10,
    width: 10,
    color: "white"
}

// rectangle function
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// circle function
function drawArc(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2,true);
    ctx.closePath();
    ctx.fill();
}

// reacting to mouse movement
canvas.addEventListener("mousemove", getMousePos);
function getMousePos(event) {
    let rect = canvas.getBoundingClientRect();
    
    user.y = event.clientY - rect.top - user.height/2;
}

// reset ball after either side scores
function resetBall() {
    ball.x = canvas.width/2;
    ball.y = canvas.height/2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 7;
}

// draw the net
function drawNet() {
    for (let i = 0; i <= canvas.height; i+=30){
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

// draw text
function drawText(text,x,y) {
    ctx.fillStyle = "white";
    ctx.font = "50px depixel";
    ctx.fillText(text, x, y);
}

// collision detection
function collision(b,p) {
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;
    
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;
    
    return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}

// update function
function update() {    
    // change the score of players
    // if (com.score == 2) {
    //     gameover = true;
    // } else 
    if (ball.x - ball.radius < 0 ) {
        com.score++;
        comScore.play();
        resetBall();
    } else if( ball.x + ball.radius > canvas.width) {
        user.score++;
        userScore.play();
        resetBall();
    }
    
    // velocity of ball
    ball.x += 1.5 * ball.velocityX;
    ball.y += 1.5 * ball.velocityY;
    
    // COM plays for itself and follows the position of the ball
    com.y += ((ball.y - (com.y + com.height/2))) * 0.1;
    
    // when the ball collides with the bottom/top walls, we inverse the y velocity
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
        wall.play();
    }
    
    // check if the paddle hit the user or the COM paddle
    let player = (ball.x + ball.radius < canvas.width/2) ? user : com;
    
    // if the ball hits a paddle
    if (collision(ball, player)) {
        // play sound
        hit.play();
        // check where the ball hits the paddle
        let collidePoint = (ball.y - (player.y + player.height/2));
        // normalize the value of collidePoint, we need to get numbers between -1 and 1.
        // -player.height/2 < collide Point < player.height/2
        collidePoint = collidePoint / (player.height/2);
        
        // when the ball hits the top of a paddle we want the ball, to take a -45degees angle
        // when the ball hits the center of the paddle we want the ball to take a 0degrees angle
        // when the ball hits the bottom of the paddle we want the ball to take a 45degrees
        // Math.PI/4 = 45degrees
        let angleRad = (Math.PI/4) * collidePoint;
        
        // change the X and Y velocity direction
        let direction = (ball.x + ball.radius < canvas.width/2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
        
        // speed up the ball everytime a paddle hits it.
        ball.speed += 0.1;
    }
}

// render function (which draws everything to the screen)
function render(){
    // draw Game Over screen
    // if (gameover) {
    //     drawRect(0, 0, canvas.width, canvas.height, "#black");
    //     drawText("GAME OVER", "50px depixel", 200, 300, "white");
    // }
    
    // clear the canvas
    drawRect(0, 0, canvas.width, canvas.height, "black");
    
    // draw the user score (left)
    drawText(user.score, canvas.width/4, canvas.height/6);
    
    // draw the COM score (right)
    drawText(com.score, 3*canvas.width/4, canvas.height/6);
    
    // draw the net (middle)
    drawNet();
    
    // draw the user's paddle
    drawRect(user.x, user.y, user.width, user.height, user.color);
    
    // draw the COM's paddle
    drawRect(com.x, com.y, com.width, com.height, com.color);
    
    // draw the ball
    drawArc(ball.x, ball.y, ball.radius, ball.color);
}

function game(){
    update();
    render();
}
// number of frames per second
let framePerSecond = 50;

// call the game function 50 times every 1 Sec
let loop = setInterval(game,1000/framePerSecond);