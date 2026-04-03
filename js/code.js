// GLOBALNE SPREMENLJIVKE
let canvas, ctx;
let WIDTH, HEIGHT;
let x = 150, y = 150;
let dx = 2, dy = 4;
let r = 10;

let paddleW = 75, paddleH = 10, paddleX;
let rightDown = false, leftDown = false;

let NROWS = 5, NCOLS = 5, BRICKWIDTH, BRICKHEIGHT = 15, PADDING = 1;
let bricks = [];
let intervalId;

//BARVA PLOŠČKOV
var rowcolors = ["#FF1C0A", "#FFFD0A", "#00A308", "#0008DB", "#EB0093"];
var paddlecolor = "#000000";

var tocke=0;//TOČKOVANJE 

// INITIALIZACIJA IGRE
function initGame() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    WIDTH = canvas.width;
    HEIGHT = canvas.height;

    initPaddle();
    initBricks();

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    intervalId = setInterval(draw, 20);
	
	sekunde = 0;
	izpisTimer = "00:00";
	
	tocke = 0;
	$("#tocke").html(tocke);
}

// PADDLE
function initPaddle() {
    paddleX = (WIDTH - paddleW) / 2;
}

// BRICKS
function initBricks() {
    BRICKWIDTH = (WIDTH / NCOLS) - 1;
    for (let i = 0; i < NROWS; i++) {
        bricks[i] = [];
        for (let j = 0; j < NCOLS; j++) {
            bricks[i][j] = 1; // 1 pomeni, da opeka obstaja
        }
    }
}

// TIPKE
function onKeyDown(evt) {
    if (evt.key === "ArrowRight") rightDown = true;
    else if (evt.key === "ArrowLeft") leftDown = true;
}

function onKeyUp(evt) {
    if (evt.key === "ArrowRight") rightDown = false;
    else if (evt.key === "ArrowLeft") leftDown = false;
}

// RISALNE FUNKCIJE
function circle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.closePath();
    ctx.fillStyle = "black";
    ctx.fill();
}

function rect(x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fillStyle = null;
    ctx.fill();
}

function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

// GLAVNA FUNKCIJA RISANJA
function draw() {
    clear();

    // krogec
    circle(x, y, r);

    // premik paddle
    if (rightDown && paddleX + paddleW < WIDTH) paddleX += 5;
    if (leftDown && paddleX > 0) paddleX -= 5;
    rect(paddleX, HEIGHT - paddleH, paddleW, paddleH);

    // risanje opek
    for (let i = 0; i < NROWS; i++) {
        for (let j = 0; j < NCOLS; j++) {
            if (bricks[i][j] === 1) {
                rect(
                    j * (BRICKWIDTH + PADDING) + PADDING,
                    i * (BRICKHEIGHT + PADDING) + PADDING,
                    BRICKWIDTH, BRICKHEIGHT
                );
            }
        }
    }
	for (i=0; i < NROWS; i++) {
    ctx.fillStyle = rowcolors[i]; //barvanje vrstic
    for (j=0; j < NCOLS; j++) {
      if (bricks[i][j] == 1) {
        rect((j * (BRICKWIDTH + PADDING)) + PADDING,
            (i * (BRICKHEIGHT + PADDING)) + PADDING,
            BRICKWIDTH, BRICKHEIGHT);
      }
    }
  }

    // preverjanje trka z opeko
    let rowHeight = BRICKHEIGHT + PADDING;
    let colWidth = BRICKWIDTH + PADDING;
    let row = Math.floor(y / rowHeight);
    let col = Math.floor(x / colWidth);
    if (y < NROWS * rowHeight && row >= 0 && col >= 0 && bricks[row][col] === 1) {
        dy = -dy;
        bricks[row][col] = 0; // odstrani opeko
        tocke++;
        $("#tocke").html(tocke);
    }

    // trki s stenami
    if (x + dx > WIDTH - r || x + dx < r) dx = -dx;
    if (y + dy < r) dy = -dy;
    else if (y + dy > HEIGHT - r) {
        // trk s paddle z odbojem glede na položaj udarca
        if (x > paddleX && x < paddleX + paddleW) {
            dx = 8 * ((x - (paddleX + paddleW / 2)) / paddleW);
            dy = -dy;
        } else {
			start=false;
            clearInterval(intervalId); // konec igre
            alert("Game Over!");
        }
    }
    // premik žogice
    x += dx;
    y += dy;

    // win condition: vse opeke odstranjene
    if (tocke === NROWS * NCOLS) {
        clearInterval(intervalId);
        alert("You Win!");
    }
	//TIMER
	if(start==true){
	sekunde++;

	sekundeI = ((sekundeI = (sekunde % 60)) > 9) ? sekundeI : "0"+sekundeI;
	minuteI = ((minuteI = Math.floor(sekunde / 60)) > 9) ? minuteI : "0"+minuteI;
	izpisTimer = minuteI + ":" + sekundeI;

	$("#cas").html(izpisTimer);
	}
	else{
	sekunde=0;
	//izpisTimer = "00:00";
	$("#cas").html(izpisTimer);
	}
}