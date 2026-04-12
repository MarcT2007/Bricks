// GLOBALNE SPREMENLJIVKE
let canvas, ctx;
let WIDTH, HEIGHT;
let x, y;
let dx = 3, dy = -5;
let r = 10; 
let ballcolor = "#FFFFFF"; 

let paddleW = 120, paddleH = 15, paddleX;
let rightDown = false, leftDown = false;

// OPEKE IN NIVOJI
let NROWS = 3; 
let NCOLS = 8;
let BRICKWIDTH, BRICKHEIGHT = 20, PADDING = 4;
let bricks = []; 
let lockedBricks = []; 
let intervalId, timerId;

var paddlecolor = "#808080"; 
var skupneTocke = 0;
var sekunde = 0;
var start = false;
let trenutniNivo = 1;

// DEFINICIJA BARV
const RED = "#FF1C0A", BLUE = "#0000FF", YELLOW = "#FFFACD";
const PURPLE = "#800080", GREEN = "#228B22", ORANGE = "#FFA500";
const GRAY = "#808080"; 

// Pomožna funkcija za formatiranje časa
function formatirajCas(s) {
    let m = Math.floor(s / 60);
    let sek = s % 60;
    return (m < 10 ? "0" + m : m) + ":" + (sek < 10 ? "0" + sek : sek);
}

function startGame() {
    $("#zacetni-zaslon").fadeOut(300, function() {
        $("#igra-zaslon").fadeIn(300);
        initGame();
    });
}

function initGame() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    paddleX = (WIDTH - paddleW) / 2;
    
    resetBall();
    initBricks();

    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(draw, 16);

    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => { if(start) sekunde++; }, 1000);
    start = true;
}

function initBricks() {
    BRICKWIDTH = (WIDTH / NCOLS) - PADDING;
    bricks = [];
    lockedBricks = [];
    for (let i = 0; i < NROWS; i++) {
        bricks[i] = [];
        lockedBricks[i] = [];
        for (let j = 0; j < NCOLS; j++) {
            let mozneBarve = [];
            if (trenutniNivo === 1) mozneBarve = [RED];
            else if (trenutniNivo === 2) mozneBarve = [RED, BLUE];
            else if (trenutniNivo === 3) mozneBarve = [RED, BLUE, YELLOW];
            else if (trenutniNivo === 4) mozneBarve = [RED, BLUE, YELLOW, PURPLE];
            else mozneBarve = [RED, BLUE, YELLOW, PURPLE, GREEN, ORANGE];

            let selectedColor = mozneBarve[Math.floor(Math.random() * mozneBarve.length)];
            bricks[i][j] = { 
                color: selectedColor,
                originalColor: selectedColor 
            };
            lockedBricks[i][j] = false;
        }
    }
}

function resetBall() {
    x = WIDTH / 2;
    y = HEIGHT - 50;
    dx = 3;
    dy = -5;
    ballcolor = "#FFFFFF";
}

function onKeyDown(evt) {
    if (evt.key === "ArrowRight") rightDown = true;
    if (evt.key === "ArrowLeft") leftDown = true;

    if (evt.key === "1") paddlecolor = RED;
    if (evt.key === "2") paddlecolor = BLUE;
    if (evt.key === "3") paddlecolor = YELLOW;
    if (evt.key === "4") paddlecolor = PURPLE;
    if (evt.key === "5") paddlecolor = GREEN;
    if (evt.key === "6") paddlecolor = ORANGE;
}

function onKeyUp(evt) {
    if (evt.key === "ArrowRight") rightDown = false;
    if (evt.key === "ArrowLeft") leftDown = false;
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    circle(x, y, r, ballcolor);

    if (rightDown && paddleX + paddleW < WIDTH) paddleX += 10;
    if (leftDown && paddleX > 0) paddleX -= 10;
    rect(paddleX, HEIGHT - paddleH, paddleW, paddleH, paddlecolor);

    let preostaleOpeke = 0;
    for (let i = 0; i < NROWS; i++) {
        for (let j = 0; j < NCOLS; j++) {
            if (bricks[i][j].color !== 0) {
                rect(j * (BRICKWIDTH + PADDING) + (PADDING/2), i * (BRICKHEIGHT + PADDING) + (PADDING/2), 
                     BRICKWIDTH, BRICKHEIGHT, bricks[i][j].color);
                preostaleOpeke++;
            }
        }
    }

    let rowHeight = BRICKHEIGHT + PADDING;
    let colWidth = BRICKWIDTH + PADDING;
    let row = Math.floor(y / rowHeight);
    let col = Math.floor(x / colWidth);
    
    if (y < NROWS * rowHeight && row >= 0 && col >= 0 && bricks[row][col].color !== 0) {
        if (lockedBricks[row][col]) {
            dy = -dy;
        } else {
            let brick = bricks[row][col];
            let bc = brick.color;
            let canBreak = false;

            if (bc === RED && (ballcolor === RED || ballcolor === PURPLE || ballcolor === ORANGE)) canBreak = true;
            else if (bc === BLUE && (ballcolor === BLUE || ballcolor === PURPLE || ballcolor === GREEN)) canBreak = true;
            else if (bc === YELLOW && (ballcolor === YELLOW || ballcolor === ORANGE || ballcolor === GREEN)) canBreak = true;
            else if (bc === PURPLE && ballcolor === PURPLE) canBreak = true;
            else if (bc === GREEN && ballcolor === GREEN) canBreak = true;
            else if (bc === ORANGE && ballcolor === ORANGE) canBreak = true;

            if (canBreak) {
                bricks[row][col].color = 0;
                skupneTocke++;
                $("#tocke").html(skupneTocke);
            } else {
                let original = bricks[row][col].color;
                bricks[row][col].color = GRAY;
                lockedBricks[row][col] = true;
                setTimeout(() => {
                    if (bricks[row][col] && bricks[row][col].color !== 0) {
                        bricks[row][col].color = original;
                        lockedBricks[row][col] = false;
                    }
                }, 3000);
            }
            dy = -dy;
        }
    }

    if (x + dx > WIDTH - r || x + dx < r) dx = -dx;

    if (y + dy < r) {
        dy = -dy;
    } else if (y + dy > HEIGHT - r - paddleH) {
        // Preverjanje trka s ploščadjo (paddle)
        if (x > paddleX && x < paddleX + paddleW) {
            ballcolor = paddlecolor;
            dx = 8 * ((x - (paddleX + paddleW / 2)) / paddleW);
            dy = -Math.abs(dy); // Zagotovi, da se odbije navzgor
        } else if (y + dy > HEIGHT - r) {
            gameOver();
        }
    }

    x += dx; y += dy;

    if (preostaleOpeke === 0 && start) {
        levelWin();
    }

    if(start) {
        $("#cas").html(formatirajCas(sekunde));
    }
}

function gameOver() {
    start = false;
    clearInterval(intervalId);
    Swal.fire({
        title: 'Konec igre!',
        html: `Dosegel si nivo <b>${trenutniNivo}</b>.<br>Točke: <b>${skupneTocke}</b><br>Čas igranja: <b>${formatirajCas(sekunde)}</b>`,
        icon: 'error',
        confirmButtonText: 'Poskusi znova',
        confirmButtonColor: '#d33'
    }).then(() => location.reload());
}

function levelWin() {
    start = false;
    let končniČas = formatirajCas(sekunde);
    if (trenutniNivo >= 5) {
        Swal.fire({
            title: 'Popolna zmaga!',
            html: `Čestitamo! Postal si mojster barv.<br>Skupni čas: <b>${končniČas}</b>`,
            icon: 'success',
			scrollbarPadding: false, // Ta vrstica prepreči zamik
            confirmButtonText: 'Odlično!'
        }).then(() => location.reload());
    } else {
        Swal.fire({
            title: `Nivo ${trenutniNivo} opravljen!`,
            html: `Čas nivoja: <b>${končniČas}</b><br>Pripravi se na naslednji izziv.`,
            icon: 'success',
			scrollbarPadding: false, // Ta vrstica prepreči zamik
            confirmButtonText: 'Naslednji nivo'
        }).then(() => {
            trenutniNivo++;
            resetBall();
            initBricks();
            start = true;
        });
    }
}

function circle(x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "black"; // ČRNA OBROBA
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function rect(x, y, w, h, color) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}