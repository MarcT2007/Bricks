// ==========================================
// GLOBALNE SPREMENLJIVKE
// ==========================================
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
const RED = "#FF1C0A";    
const BLUE = "#0000FF";   
const YELLOW = "#FFFF00"; 
const PURPLE = "#800080"; 
const GREEN = "#228B22";  
const ORANGE = "#FFA500"; 
const GRAY = "#808080"; 

// ==========================================
// POMOŽNE FUNKCIJE
// ==========================================

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

// ==========================================
// GLAVNA ZANKA RISANJA IN LOGIKE
// ==========================================

function draw() {
    if (!start) return;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    circle(x, y, r, ballcolor);

    if (rightDown && paddleX + paddleW < WIDTH) paddleX += 10;
    if (leftDown && paddleX > 0) paddleX -= 10;
    rect(paddleX, HEIGHT - paddleH, paddleW, paddleH, paddlecolor);

    let preostaleOpeke = 0;

    for (let i = 0; i < NROWS; i++) {
        for (let j = 0; j < NCOLS; j++) {
            let b = bricks[i][j];
            if (b.color !== 0) {
                let brickX = j * (BRICKWIDTH + PADDING) + (PADDING / 2);
                let brickY = i * (BRICKHEIGHT + PADDING) + (PADDING / 2);

                rect(brickX, brickY, BRICKWIDTH, BRICKHEIGHT, b.color);
                preostaleOpeke++;

                let closestX = x;
                let closestY = y;
                if (x < brickX) closestX = brickX;
                else if (x > brickX + BRICKWIDTH) closestX = brickX + BRICKWIDTH;
                if (y < brickY) closestY = brickY;
                else if (y > brickY + BRICKHEIGHT) closestY = brickY + BRICKHEIGHT;

                let distanceX = x - closestX;
                let distanceY = y - closestY;
                let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

                if (distanceSquared < (r * r)) {
                    let overlapX = 0, overlapY = 0;
                    if (x < closestX) overlapX = (x + r) - brickX;
                    else overlapX = closestX + BRICKWIDTH - (x - r);
                    if (y < closestY) overlapY = (y + r) - brickY;
                    else overlapY = closestY + BRICKHEIGHT - (y - r);

                    if (overlapX < overlapY) {
                        dx = -dx;
                        if (x < closestX) x = brickX - r;
                        else x = brickX + BRICKWIDTH + r;
                    } else {
                        dy = -dy;
                        if (y < closestY) y = brickY - r;
                        else y = brickY + BRICKHEIGHT + r;
                    }

                    if (!lockedBricks[i][j]) {
                        let canBreak = false;
                        let bc = b.color;
                        if (bc === RED && (ballcolor === RED || ballcolor === PURPLE || ballcolor === ORANGE)) canBreak = true;
                        else if (bc === BLUE && (ballcolor === BLUE || ballcolor === PURPLE || ballcolor === GREEN)) canBreak = true;
                        else if (bc === YELLOW && (ballcolor === YELLOW || ballcolor === ORANGE || ballcolor === GREEN)) canBreak = true;
                        else if (bc === PURPLE && ballcolor === PURPLE) canBreak = true;
                        else if (bc === GREEN && ballcolor === GREEN) canBreak = true;
                        else if (bc === ORANGE && ballcolor === ORANGE) canBreak = true;

                        if (canBreak) {
                            bricks[i][j].color = 0;
                            skupneTocke++;
                            $("#tocke").html(skupneTocke);
                        } else {
                            let original = b.originalColor;
                            bricks[i][j].color = GRAY;
                            lockedBricks[i][j] = true;
                            setTimeout(() => {
                                if (bricks[i][j] && bricks[i][j].color !== 0) {
                                    bricks[i][j].color = original;
                                    lockedBricks[i][j] = false;
                                }
                            }, 3000);
                        }
                    }
                }
            }
        }
    }

    if (preostaleOpeke === 0) {
        start = false;
        dx = 0; dy = 0; 
        levelWin();
        return;
    }

    if (x + dx > WIDTH - r || x + dx < r) dx = -dx;
    if (y + dy < r) {
        y = r; 
        dy = -dy;
    } 
    else if (y + r > HEIGHT - paddleH) {
        if (x > paddleX && x < paddleX + paddleW) {
            y = HEIGHT - paddleH - r; 
            ballcolor = paddlecolor; 
            dx = 8 * ((x - (paddleX + paddleW / 2)) / paddleW);
            dy = -Math.abs(dy);
        } 
        else if (y + r > HEIGHT) {
            gameOver();
            return;
        }
    }

    x += dx; y += dy;
    $("#cas").html(formatirajCas(sekunde));
}

// ==========================================
// KONEC IGRE IN ZMAGA (Brez črnega ozadja)
// ==========================================

function gameOver() {
    start = false;
    clearInterval(intervalId);
    clearInterval(timerId);
    Swal.fire({
        title: 'Konec igre!',
        html: `Točke: <b>${skupneTocke}</b>`,
        icon: 'error',
        backdrop: false, // Ta vrstica odstrani črnino/sivino v ozadju
        confirmButtonText: 'Poskusi znova'
    }).then(() => location.reload());
}

function levelWin() {
    start = false;
    if (trenutniNivo >= 5) {
        Swal.fire({
            title: 'Popolna zmaga!',
            icon: 'success',
            backdrop: false, // Odstrani črnino
            confirmButtonText: 'Odlično!'
        }).then(() => location.reload());
    } else {
        Swal.fire({
            title: `Nivo ${trenutniNivo} opravljen!`,
            icon: 'success',
            backdrop: false, // Odstrani črnino
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
    ctx.strokeStyle = "black";
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