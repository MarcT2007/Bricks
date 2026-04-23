// --- SPREMENLJIVKE ---
let canvas, ctx, WIDTH, HEIGHT, x, y, dx, dy;
let r = 10;
let paddleW = 120, paddleH = 15, paddleX;
let originalPaddleW = 120;
let rightDown = false, leftDown = false;
let NROWS = 4, NCOLS = 8;
let BRICKWIDTH, BRICKHEIGHT = 25, PADDING = 4;
let bricks = [];
let intervalId, timerId;
let skupneTocke = 0;
let sekunde = 0;
let trenutniNivo = 1, start = false, isPaused = false;
let keysPressed = {};
let trenutniUporabnik = "";

// Bonus
let bonusSlika = new Image();
bonusSlika.src = 'slike/bonus.png';
let bonus = { x: 0, y: 0, w: 30, h: 30, vidno: false, aktivno: false, prikazanTimer: null, trajanjeTimer: null };

// Barve
const RED = "rgb(255, 0, 0)", GREEN = "rgb(0, 255, 0)", BLUE = "rgb(0, 0, 255)";
const YELLOW = "rgb(255, 255, 0)", CYAN = "rgb(0, 255, 255)", MAGENTA = "rgb(255, 0, 255)";
const GRAY = "rgb(128, 128, 128)", WHITE = "rgb(255, 255, 255)", BLACK = "rgb(0, 0, 0)";
let ballcolor = WHITE, paddlecolor = GRAY;

// --- SISTEM NIVOJEV PO IGRALCU ---

function posodobiGumbNivojev() {
    const ime = document.getElementById("username").value.trim();
    // Če imena ni, je odklenjen samo nivo 1, sicer preberemo iz localStorage za tega igralca
    let maxNivoIgralca = 1;
    if (ime !== "") {
        maxNivoIgralca = parseInt(localStorage.getItem("maxNivo_" + ime)) || 1;
    }

    for (let i = 1; i <= 5; i++) {
        let gumb = document.getElementById(`btn-nivo-${i}`);
        if (gumb) {
            if (i <= maxNivoIgralca) {
                gumb.disabled = false;
                gumb.style.opacity = "1";
            } else {
                gumb.disabled = true;
                gumb.style.opacity = "0.3";
            }
        }
    }
}

function shraniRezultat() {
    let rezultati = JSON.parse(localStorage.getItem("rgb_breakout_scores")) || [];
    rezultati.push({
        ime: trenutniUporabnik,
        tocke: skupneTocke,
        nivo: trenutniNivo,
        cas: formatirajCas(sekunde)
    });
    rezultati.sort((a, b) => b.tocke - a.tocke);
    localStorage.setItem("rgb_breakout_scores", JSON.stringify(rezultati.slice(0, 5)));
}

function prikaziLestvico() {
    const lista = document.getElementById("top-scores");
    if (!lista) return;
    const rezultati = JSON.parse(localStorage.getItem("rgb_breakout_scores")) || [];
    lista.innerHTML = rezultati.map(r => 
        `<li>${r.ime}: <b>${r.tocke}</b> točk (${r.cas || "00:00"})</li>`
    ).join("");
}

// --- LOGIKA IGRE ---

function initGame() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    WIDTH = canvas.width; HEIGHT = canvas.height;
    paddleX = (WIDTH - paddleW) / 2;
    
    $("#tocke").html(skupneTocke);
    $("#cas").html(formatirajCas(sekunde));
    
    resetBall();
    initBricks();
    resetBonus();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(draw, 16);
    
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => { 
        if(start && !isPaused) {
            sekunde++;
            $("#cas").html(formatirajCas(sekunde));
            preveriBonusSpawn();
        }
    }, 1000);
    
    start = true; isPaused = false;
}

function initBricks() {
    BRICKWIDTH = (WIDTH / NCOLS) - PADDING;
    bricks = [];
    let barve = (trenutniNivo === 1) ? [RED] : (trenutniNivo === 2) ? [RED, GREEN] : (trenutniNivo === 3) ? [RED, GREEN, BLUE] : [RED, GREEN, BLUE, YELLOW, CYAN, MAGENTA];
    for (let i = 0; i < NROWS; i++) {
        bricks[i] = [];
        for (let j = 0; j < NCOLS; j++) {
            let col = barve[Math.floor(Math.random() * barve.length)];
            bricks[i][j] = { color: col, originalColor: col, timer: 0 };
        }
    }
}

function draw() {
    if (!start || isPaused) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    circle(x, y, r, ballcolor);
    if (rightDown && paddleX + paddleW < WIDTH) paddleX += 10;
    if (leftDown && paddleX > 0) paddleX -= 10;
    rect(paddleX, HEIGHT - paddleH, paddleW, paddleH, paddlecolor);

    if (bonus.vidno) {
        ctx.drawImage(bonusSlika, bonus.x, bonus.y, bonus.w, bonus.h);
        if (x+r > bonus.x && x-r < bonus.x+bonus.w && y+r > bonus.y && y-r < bonus.y+bonus.h) uloviBonus();
    }

    for (let i = 0; i < NROWS; i++) {
        for (let j = 0; j < NCOLS; j++) {
            let b = bricks[i][j];
            if (b.color !== 0) {
                if (b.color === GRAY) {
                    b.timer -= 16;
                    if (b.timer <= 0) { b.color = b.originalColor; b.timer = 0; }
                }
                let bx = j*(BRICKWIDTH+PADDING)+PADDING/2, by = i*(BRICKHEIGHT+PADDING)+PADDING/2;
                rect(bx, by, BRICKWIDTH, BRICKHEIGHT, b.color);
                
                if (x+r > bx && x-r < bx+BRICKWIDTH && y+r > by && y-r < by+BRICKHEIGHT) {
                    dy = -dy;
                    let ok = (ballcolor === b.color) || (ballcolor === YELLOW && (b.color === RED || b.color === GREEN)) || (ballcolor === CYAN && (b.color === GREEN || b.color === BLUE)) || (ballcolor === MAGENTA && (b.color === RED || b.color === BLUE));
                    if (ok && b.color !== GRAY) { b.color = 0; skupneTocke++; $("#tocke").html(skupneTocke); }
                    else if (b.color !== GRAY) { b.color = GRAY; b.timer = 6000; }
                    y += dy;
                }
            }
        }
    }

    if (x+dx > WIDTH-r || x+dx < r) dx = -dx;
    if (y+dy < r) dy = -dy;
    else if (y+r > HEIGHT-paddleH) {
        if (x > paddleX && x < paddleX+paddleW) { ballcolor = paddlecolor; dy = -Math.abs(dy); y = HEIGHT-paddleH-r; }
        else if (y+r > HEIGHT) { gameOver(); return; }
    }
    x += dx; y += dy;
    if (bricks.every(row => row.every(b => b.color === 0))) levelWin();
}

function gameOver() {
    start = false; clearInterval(intervalId); clearInterval(timerId);
    shraniRezultat();
    Swal.fire({
        title: 'KONEC IGRE!',
        text: `Spodletelo ti je! Dosežene točke: ${skupneTocke}`,
        icon: 'error',
        confirmButtonText: 'Nazaj na meni',
        background: '#1a1a1a',
        color: '#fff'
    }).then(() => {
        location.reload();
    });
}

function levelWin() {
    start = false; clearInterval(intervalId); clearInterval(timerId);
    
    // Odkleni nivo specifično za tega igralca
    let trenutniMax = parseInt(localStorage.getItem("maxNivo_" + trenutniUporabnik)) || 1;
    if (trenutniNivo >= trenutniMax && trenutniNivo < 5) {
        localStorage.setItem("maxNivo_" + trenutniUporabnik, trenutniNivo + 1);
    }

    Swal.fire({
        title: 'NIVO KONČAN!',
        text: `Bravo ${trenutniUporabnik}! Gremo na naslednji nivo?`,
        icon: 'success', 
        confirmButtonText: 'Naprej',
        background: '#1a1a1a',
        color: '#fff'
    }).then(() => {
        trenutniNivo++;
        initGame();
    });
}

// --- POMOŽNE FUNKCIJE ---
function posodobiBarvo() {
    if (keysPressed["1"] && keysPressed["2"]) paddlecolor = YELLOW;
    else if (keysPressed["2"] && keysPressed["3"]) paddlecolor = CYAN;
    else if (keysPressed["1"] && keysPressed["3"]) paddlecolor = MAGENTA;
    else if (keysPressed["1"]) paddlecolor = RED;
    else if (keysPressed["2"]) paddlecolor = GREEN;
    else if (keysPressed["3"]) paddlecolor = BLUE;
}
function onKeyDown(evt) { keysPressed[evt.key] = true; if (evt.key === " ") isPaused = !isPaused; if (evt.key === "ArrowRight") rightDown = true; if (evt.key === "ArrowLeft") leftDown = true; posodobiBarvo(); }
function onKeyUp(evt) { delete keysPressed[evt.key]; if (evt.key === "ArrowRight") rightDown = false; if (evt.key === "ArrowLeft") leftDown = false; }
function resetBall() { x = WIDTH/2; y = HEIGHT-50; dx = 4; dy = -5; ballcolor = WHITE; }
function circle(x,y,r,c) { ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle=c; ctx.fill(); ctx.stroke(); ctx.closePath(); }
function rect(x,y,w,h,c) { ctx.beginPath(); ctx.rect(x,y,w,h); ctx.fillStyle=c; ctx.fill(); ctx.stroke(); ctx.closePath(); }
function formatirajCas(s) { let m=Math.floor(s/60), sk=s%60; return (m<10?"0"+m:m)+":"+(sk<10?"0"+sk:sk); }
function preveriBonusSpawn() { if (!bonus.vidno && !bonus.aktivno && Math.random() < 0.1) { bonus.x = Math.random()*(WIDTH-bonus.w); bonus.y = (Math.random()*(HEIGHT/2))+50; bonus.vidno = true; bonus.prikazanTimer = setTimeout(() => { bonus.vidno = false; }, 10000); } }
function uloviBonus() { clearTimeout(bonus.prikazanTimer); bonus.vidno = false; bonus.aktivno = true; paddleW += 50; bonus.trajanjeTimer = setTimeout(() => { paddleW = originalPaddleW; bonus.aktivno = false; }, 15000); }
function resetBonus() { clearTimeout(bonus.prikazanTimer); clearTimeout(bonus.trajanjeTimer); bonus.vidno = false; bonus.aktivno = false; paddleW = originalPaddleW; }

window.onload = function() { prikaziLestvico(); posodobiGumbNivojev(); };