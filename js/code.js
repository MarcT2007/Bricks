let canvas, ctx, WIDTH, HEIGHT, x, y, dx, dy;
let r = 10, ballcolor = "#FFFFFF";
let paddleW = 120, paddleH = 15, paddleX;
let rightDown = false, leftDown = false;
let NROWS = 3, NCOLS = 8;
let BRICKWIDTH, BRICKHEIGHT = 20, PADDING = 4;
let bricks = [];
let intervalId, timerId, skupneTocke = 0, sekunde = 0;
let trenutniNivo = 1, start = false, isPaused = false;
let keysPressed = {};

const RED = "#FF1C0A", BLUE = "#0000FF", YELLOW = "#FFFF00", 
      PURPLE = "#800080", GREEN = "#228B22", ORANGE = "#FFA500", GRAY = "#808080"; 

function initGame() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    WIDTH = canvas.width; HEIGHT = canvas.height;
    paddleX = (WIDTH - paddleW) / 2;
    skupneTocke = 0; sekunde = 0;
    $("#tocke").html(skupneTocke);
    paddlecolor = GRAY;
    resetBall();
    initBricks();
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(draw, 16);
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => { if(start && !isPaused) sekunde++; }, 1000);
    start = true; isPaused = false;
}

function initBricks() {
    BRICKWIDTH = (WIDTH / NCOLS) - PADDING;
    bricks = [];
    for (let i = 0; i < NROWS; i++) {
        bricks[i] = [];
        for (let j = 0; j < NCOLS; j++) {
            let mozne = [RED];
            if (trenutniNivo >= 2) mozne.push(BLUE);
            if (trenutniNivo >= 3) mozne.push(YELLOW);
            if (trenutniNivo >= 4) mozne.push(PURPLE);
            if (trenutniNivo >= 5) mozne.push(GREEN, ORANGE);
            let col = mozne[Math.floor(Math.random() * mozne.length)];
            bricks[i][j] = { color: col, originalColor: col, timer: 0 };
        }
    }
}

function resetBall() { x = WIDTH/2; y = HEIGHT-50; dx = 3; dy = -5; ballcolor = "#FFFFFF"; }

function onKeyDown(evt) {
    keysPressed[evt.key] = true;
    if (evt.key === " ") { isPaused = !isPaused; return; }
    if (evt.key === "ArrowRight") rightDown = true;
    if (evt.key === "ArrowLeft") leftDown = true;
    posodobiBarvo();
}

function onKeyUp(evt) {
    delete keysPressed[evt.key];
    if (evt.key === "ArrowRight") rightDown = false;
    if (evt.key === "ArrowLeft") leftDown = false;
    // Prazna funkcija tukaj pomeni, da barva OSTANE zadnja pritisnjena
}

function posodobiBarvo() {
    // Logika drži barvo: nastavi se le ob pritisku tipk 1, 2, 3
    if (keysPressed["1"] && keysPressed["2"]) paddlecolor = PURPLE;
    else if (keysPressed["2"] && keysPressed["3"]) paddlecolor = GREEN;
    else if (keysPressed["1"] && keysPressed["3"]) paddlecolor = ORANGE;
    else if (keysPressed["1"]) paddlecolor = RED;
    else if (keysPressed["2"]) paddlecolor = BLUE;
    else if (keysPressed["3"]) paddlecolor = YELLOW;
}

function draw() {
    if (!start || isPaused) {
        if(isPaused) { ctx.fillStyle = "white"; ctx.font = "40px Arial"; ctx.fillText("PAVZA", WIDTH/2 - 65, HEIGHT/2); }
        return;
    }
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    circle(x, y, r, ballcolor);
    if (rightDown && paddleX + paddleW < WIDTH) paddleX += 10;
    if (leftDown && paddleX > 0) paddleX -= 10;
    rect(paddleX, HEIGHT - paddleH, paddleW, paddleH, paddlecolor);

    for (let i = 0; i < NROWS; i++) {
        for (let j = 0; j < NCOLS; j++) {
            let b = bricks[i][j];
            if (b.color !== 0) {
                if (b.timer > 0) {
                    b.timer -= 16;
                    if (b.timer <= 0) { b.color = b.originalColor; b.timer = 0; }
                }
                let bx = j * (BRICKWIDTH + PADDING) + (PADDING/2);
                let by = i * (BRICKHEIGHT + PADDING) + (PADDING/2);
                rect(bx, by, BRICKWIDTH, BRICKHEIGHT, b.color);
                if (x + r > bx && x - r < bx + BRICKWIDTH && y + r > by && y - r < by + BRICKHEIGHT) {
                    dy = -dy; 
                    let ok = (ballcolor === b.color) || 
                             (b.color === RED && (ballcolor === PURPLE || ballcolor === ORANGE)) ||
                             (b.color === BLUE && (ballcolor === PURPLE || ballcolor === GREEN)) ||
                             (b.color === YELLOW && (ballcolor === ORANGE || ballcolor === GREEN));
                    if (ok && b.color !== GRAY) { 
                        bricks[i][j].color = 0; skupneTocke++; $("#tocke").html(skupneTocke);
                    } else if (b.color !== GRAY) {
                        b.color = GRAY; b.timer = 6000;
                    }
                    y += dy;
                }
            }
        }
    }
    if (x + dx > WIDTH - r || x + dx < r) dx = -dx;
    if (y + dy < r) dy = -dy; 
    else if (y + r > HEIGHT - paddleH) {
        if (x > paddleX && x < paddleX + paddleW) { ballcolor = paddlecolor; dy = -Math.abs(dy); y = HEIGHT-paddleH-r; }
        else if (y + r > HEIGHT) { gameOver(); return; }
    }
    x += dx; y += dy;
    $("#cas").html(formatirajCas(sekunde));
    if (bricks.every(row => row.every(b => b.color === 0))) { start = false; levelWin(); }
}

function gameOver() {
    start = false; clearInterval(intervalId); clearInterval(timerId);
    Swal.fire({ title: 'PORAZ!', html: `Čas: <b>${formatirajCas(sekunde)}</b><br>Točke: <b>${skupneTocke}</b>`, icon: 'error', heightAuto: false, scrollbarPadding: false }).then(() => location.reload());
}

function levelWin() {
    start = false;
    let naslov = trenutniNivo >= 5 ? 'KONČNA ZMAGA!' : 'ZMAGA NA NIVOJU!';
    Swal.fire({ title: naslov, html: `Čas: <b>${formatirajCas(sekunde)}</b><br>Točke: <b>${skupneTocke}</b>`, icon: 'success', heightAuto: false, scrollbarPadding: false }).then(() => { if(trenutniNivo < 5) { trenutniNivo++; initGame(); } else location.reload(); });
}

function formatirajCas(s) { let m=Math.floor(s/60); let sk=s%60; return (m<10?"0"+m:m)+":"+(sk<10?"0"+sk:sk); }
function circle(x,y,r,c) { ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle=c; ctx.fill(); ctx.stroke(); ctx.closePath(); }
function rect(x,y,w,h,c) { ctx.beginPath(); ctx.rect(x,y,w,h); ctx.fillStyle=c; ctx.fill(); ctx.closePath(); }