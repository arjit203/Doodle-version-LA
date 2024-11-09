//board
let board;
let boardWidth = 360;  //width of canvas,or "game board"
let boardHeight = 575;
let contex;


//doodler or alien's character

let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth/2 - doodlerWidth/2; //starting X-coordinate of the doodler, placing it at the center of the canvas horizontally
let doodlerY = boardHeight*7/8 - doodlerHeight;  //initial Y-position of the doodler near the bottom of the canvas
let doodlerRightImg;
let doodlerLeftImg;


let doodler = {
    img : null,
    x : doodlerX,  //position of doodler at start from x-axis
    y : doodlerY,
    width : doodlerWidth,  //width of doodler
    height : doodlerHeight
} 


//physics
let velocityX = 0;
let velocityY = 0;  //doodler jump speed
let initialVelocityY = -8;  //starting velocity Y (-ve velocity indicates upward movement)
let gravity = 0.4;

//platforms or grass
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;


let score = 0;
let maxScore = 0;
let gameOver = false;


//this function will work after loading of entire webpage and canvas(board)
window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // used for drawing on the board

    //load doodler image
    doodlerRightImg = new Image();
    doodlerRightImg.src = "./doodler-right.png";
    doodler.img = doodlerRightImg;
    doodlerRightImg.onload = function() {
    context.drawImage(doodler.img, doodler.x, doodler.y,doodler.width,doodler.height);
    }

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "./doodler-left.png";
    platformImg = new Image();
    platformImg.src = "./platform.png";
    
    velocityY = initialVelocityY;
    
    placePlatforms();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler);   
}


function update() 
{
    requestAnimationFrame(update);
    if(gameOver) {
        return;
    }

    //clear canvas and prevent overlapping of image
    context.clearRect(0, 0, board.width, board.height);

    // Update doodler's position based on velocity
    doodler.x += velocityX;
    velocityY += gravity;  //doodler falls down after jumping
    doodler.y += velocityY;

    //As doodler pass right side of board
    if(doodler.x > boardWidth)
        doodler.x = 0;  // set position of doodler to zero(telepot to left side of canvas)

    //when doodler passes left side of canvas
    else if(doodler.x + doodler.width < 0)
        doodler.x = boardWidth;   //telepot to end of canvas (right side)

    // Check for game over if doodler goes off the bottom of the screen
    if(doodler.y > board.height){
        gameOver = true;
      
    }

    // drawing doodler again and again in loop
    context.drawImage(doodler.img, doodler.x, doodler.y,doodler.width,doodler.height);

     //platforms
     // Move platforms and check for collisions
      for(let i = 0; i < platformArray.length; i++){
      let platform = platformArray[i];

      // Make platforms scroll down if the doodler is above a certain height
      if(velocityY < 0 && doodler.y < boardHeight*3/4) { //doodler  is above 3/4 height from bottom
          platform.y -= initialVelocityY ; //slides platform down the canvas
      }


      // Check for collision between doodler and platform
      if(detectCollision(doodler, platform) && velocityY >= 0) {
        velocityY = initialVelocityY;   //bounce on the platform
      }

      // Draw platform on the canvas
      context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
     }
    
     
     //clear platforms that go off the screen and add new ones
     while(platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift();  //removes element from array
        newPlatform();   //replace with new platform on top
     }
      
      
     //Update and display scores
     updateScore();
     context.fillStyle = "black";
     context.font = "16px sans-serif";
     context.fillText("Score: " +score, 5, 20);

     if(gameOver) {
        context.fillText("Game Over: Press 'Space to Restart",boardWidth/7, boardHeight*7/8);
     }

}
    

function moveDoodler(e) {
    if (e.code == "ArrowRight" || e.code == "KeyD") { //move right
        velocityX = 3;
        doodler.img = doodlerRightImg;
    }
    else if (e.code == "ArrowLeft" || e.code == "KeyA") { //move left
        velocityX = -3;
        doodler.img = doodlerLeftImg;
    }
    else if(e.code == "Space" && gameOver) {
       
        doodler.x = doodlerX;   //position of doodler at start from x-axis
        doodler.y = doodlerY;
        doodler.img = doodlerRightImg;
        doodler.width = doodlerWidth;
        doodler.height = doodlerHeight;
        velocityX = 0;
        velocityY = initialVelocityY;
        score = 0;
        highestY = doodlerY; 
        gameOver = false;

        platformArray = []; // Clears existing platforms
        placePlatforms();
    }
}


function placePlatforms() {
    platformArray = [];

    //starting platforms
    let platform = {
        img : platformImg,
        x : boardWidth/2,
        y : boardHeight - 50,
        width : platformWidth,
        height : platformHeight
    }

    platformArray.push(platform);

    for (let i = 0; i < 6; i++){
        let randomX = Math.floor(Math.random() * boardWidth*3/4);  //(0-1) * boardWidth*3/4
        let platform = {
            img : platformImg,
            x : randomX,
            y : boardHeight - 75*i - 150,
            width : platformWidth,
            height : platformHeight
        }
    
        platformArray.push(platform);
    }

}


function newPlatform() {
    let randomX = Math.floor(Math.random() * boardWidth*3/4);  //(0-1) * boardWidth*3/4
    let platform = {
        img : platformImg,
        x : randomX,
        y : -platformHeight,
        width : platformWidth,
        height : platformHeight
    }

    platformArray.push(platform);
}


//collision btw alien and grass
function detectCollision(a,b) {
    return a.x < b.x + b.width &&    //a's top left corner doesn't reach b's top right corner 
           a.x + a.width > b.x &&    //a's top right corner passes b's top left corner 
           a.y < b.y + b.height &&   //a's top left corner doesn't reach b's bottom left corner    
           a.y + a.height > b.y ;    //a's bottom left corner passes b's top left corner 
}

let highestY = doodlerY;  // Initialize to doodler's starting y position
function updateScore() {
    // Only update the score if doodler is moving upwards and reaches a new highest point
    if (velocityY < 0 && doodler.y < highestY) {
        highestY = doodler.y;  // Update highest point
        score++;               // Increment score
    }
}


