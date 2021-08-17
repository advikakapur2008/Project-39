var PLAY = 1;
var END = 0;
var gameState = PLAY;

var man_running, manRunningImage;
var ground, invisibleGround;
var bg;
//var cloudsGroup, cloudImage;
var obstaclesGroup, obstacle1, obstacle2, obstacle3;
var score=0;
var gameOver, restart;

localStorage["HighestScore"] = 0;
// create database and position variable here
var database;
var position;

function preload(){
   bg =loadImage("cityImage.png");
   manRunningImage =loadAnimation("manRunning.png");
   
   
  obstacle1 = loadImage("OB1.png");
  obstacle2 = loadImage("obstacle2.png");
  obstacle3 = loadImage("obstacle3.png");
  
  gameOverImg = loadImage("gameOverText.png");
  restartImg = loadImage("restart.png");
  }

//Function to set initial environment
function setup() {
  database=firebase.database();
  createCanvas(displayWidth - 20, displayHeight-120);

  man_running =createSprite(250,450,150,150);
  man_running.addImage("manRunning", manRunningImage);
  //balloon.scale=0.5;

  var balloonPosition = database.ref('balloon/position');
  balloonPosition.on("value", readPosition, showError)

  ground = createSprite(200,180,700,20);
  ground.x = ground.width /2;
  ground.velocityX = -(6 + 3*score/100);

  gameOver = createSprite(300,50);
  gameOver.addImage(gameOverImg);
  
  restart = createSprite(300,140);
  restart.addImage(restartImg);
  gameOver.scale = 0.5;
  restart.scale = 0.5;

  gameOver.visible = false;
  restart.visible = false;
  
  invisibleGround = createSprite(200,190,400,10);
  invisibleGround.visible = false;

  obstaclesGroup = new Group();

  textSize(20);
  textFont("Georgia");
  textStyle(BOLD);
  fill("white");
  score = 0;
}

// function to display UI
function draw() {
  camera.x = man_running.x;
  camera.y = man_running.y;

  gameOver.position.x = restart.position.x = camera.x
  
  background(bg);

  fill(0);
  stroke("white");
  textSize(25);
  textAlign(RIGHT, TOP);
  text("Score: "+ score, 600,5);

  if(gameState===PLAY){
    score = score + Math.round(getFrameRate()/60)
    ground.velocityX = -(6+3*score/100);
  }
  if(keyDown("space") && man_running.y >= 159) {
    man_running.velocityY = -12;
  }
  man_running.velocityY = man_running.velocityY + 0.8
  if (ground.x < 0){
    ground.x = ground.width/3;
  }
  man_running.collide(invisibleGround);
  spawnObstacles();

  if(obstaclesGroup.isTouching(man_running)){
    gameState = END;
  }else if(gameState = END){
    gameOver.visible = true;
    restart.visible = true;
    ground.velocityX =0;
    man_running.velocityY = 0;
    obstaclesGroup.setVelocityEach(0);
    obstaclesGroup.setLifetimeEach(-1);
    if(mousePressedOver(restart)) {
      reset();
    }
  }
  drawSprites();
}

function spawnObstacles(){
  if(frameCount%60 ===0){
    var obstacle = createSprite(camera.x+width/2,165,10,40)
    obstacle.debug = true;
    obstacle.velocityX = -(6 + 3*score/100);

    var rand = Math.round(random(1,3));
    switch(rand){
      case 1: obstacle.addImage(obstacle1);
              break;
      case 2: obstacle.addImage(obstacle2);
              break;
      case 3: obstacle.addImage(obstacle3);
              break;
      default: break;
    }
    obstacle.scale = 0.5;
    obstacle.lifetime = 300;
    obstaclesGroup.add(obstacle);
  }
}
function updateHeight(x,y){
  database.ref('balloon/position').set({
    'x': height.x + x,
    'y': height.y + y
  })
}

function readPosition(data){
  height = data.val();
  man_running.x = height.x;
  man_running.y = height.y;
}

function showError(){
  console.log("ERROR");
}