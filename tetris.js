const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

String.prototype.shuffle = () => this.split('').shuffle().join('');

Array.prototype.shuffle = function () {
    return this.sort((a, b) => 0.5 - Math.random());
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x=0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            };
        };
    };

    return false;
};

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    };
    return matrix;
};

function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [0, 4, 4],
        ];
    } else if (type === 'S') {
        return [
            [0, 5, 5],
            [5, 5, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [6, 6, 0],
            [0, 6, 6],
            [0, 0, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 0, 7, 0],
            [0, 0, 7, 0],
            [0, 0, 7, 0],
            [0, 0, 7, 0],
        ];
    };
};

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            };
        });
    });
};

function draw(){
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
};

function drawMatrix(matrix, offset){
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(
                    x + offset.x,
                    y + offset.y,
                    1,
                    1);
            }
        })
    });
};

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerDrop() {
    player.pos.y ++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        player.pos.y = 0;
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerRotate(dir) {
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1))
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = post;
            return;
        }
    }
};

const pieces = "SZJLOIT".split("");
var usedPieces = [];

function newPiece(){
    if (usedPieces.length === 0){
        usedPieces = Array.from(pieces.shuffle());
    }
    return usedPieces.shift();
}

function playerReset() {
    let nextPiece = createPiece(newPiece());
    player.matrix = nextPiece;
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
    return nextPiece;
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        };
    };

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
};

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

const colors = [
    null,
    'BlueViolet',
    'yellow',
    'blue',
    'orange',
    'lime',
    'red',
    'cyan',
]

const arena = createMatrix(10, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
}

document.addEventListener('keydown', event => {
    if (event.key === "ArrowRight") {
        playerMove(1);
    } else if (event.key === "ArrowLeft") {
        playerMove(-1);
    } else if (event.key === "ArrowDown") {
        playerDrop();
    } else if (event.key === "a") {
        playerRotate(-1);
    } else if (event.key === "z") {
        playerRotate(1);
    }
})

playerReset();
updateScore();
update();