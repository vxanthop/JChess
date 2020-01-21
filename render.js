const W = 600, H = 600;
const BLOCK_W = W / COLS, 
      BLOCK_H = H / ROWS;

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const resetButton = document.getElementById('reset');
const clearButton = document.getElementById('clear');

const scoreSheet = document.getElementById('myTable')
const infoTable = document.getElementById('info')

let canDrag = false;
let currentMove = {
    fromX: 0,
    fromY: 0,
    toX: 0,
    toY: 0
};

const WPIcon = new Image(),
      BPIcon = new Image(),
      WNIcon = new Image(),
      BNIcon = new Image(),
      WBIcon = new Image(),
      BBIcon = new Image(),
      WQIcon = new Image(),
      BQIcon = new Image(),
      WKIcon = new Image(),
      BKIcon = new Image(),
      WRIcon = new Image(),
      BRIcon = new Image();

WPIcon.src = 'images/Chess_plt45.svg';
BPIcon.src = 'images/Chess_pdt45.svg';
WNIcon.src = 'images/Chess_nlt45.svg';
BNIcon.src = 'images/Chess_ndt45.svg';
WBIcon.src = 'images/Chess_blt45.svg';
BBIcon.src = 'images/Chess_bdt45.svg';
WQIcon.src = 'images/Chess_qlt45.svg';
BQIcon.src = 'images/Chess_qdt45.svg';
WKIcon.src = 'images/Chess_klt45.svg';
BKIcon.src = 'images/Chess_kdt45.svg';
WRIcon.src = 'images/Chess_rlt45.svg';
BRIcon.src = 'images/Chess_rdt45.svg';

const iconSelector = {
    "whitepawn": WPIcon,
    "whiterook": WRIcon,
    "whiteknight": WNIcon,
    "whitebishop": WBIcon,
    "whitequeen": WQIcon,
    "whiteking": WKIcon,
    "blackpawn": BPIcon,
    "blackrook": BRIcon,
    "blackknight": BNIcon,
    "blackbishop": BBIcon,
    "blackqueen": BQIcon,
    "blackking": BKIcon
};

const pieceSelector = {
    "whitepawn": WP,
    "whiterook": WR,
    "whiteknight": WN,
    "whitebishop": WB,
    "whitequeen": WQ,
    "whiteking": WK,
    "blackpawn": BP,
    "blackrook": BR,
    "blackknight": BN,
    "blackbishop": BB,
    "blackqueen": BQ,
    "blackking": BK
}

const squareToAlgebraic = [
    ['a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8'],
    ['a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7'],
    ['a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6'],
    ['a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5'],
    ['a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4'],
    ['a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3'],
    ['a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'],
    ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1']
];

const pieceToAlgebraic = {
    'pawn': '',
    'rook': 'R',
    'knight': 'N',
    'bishop': 'B',
    'queen': 'Q',
    'king': 'K',
}

function modelToView(x, y) {
    return {
        x: x * BLOCK_W, 
        y: y * BLOCK_H
    };
}

function viewToModel(x, y) {
    return {
        x: Math.floor(x / BLOCK_W), 
        y: Math.floor(y / BLOCK_H)
    };
}

function selectIcon(x, y) {
    return iconSelector[board[y][x].color + board[y][x].type];
}

function renderPromotionMenu(x, y) {
    let validOptions = ['queen', 'bishop', 'knight', 'rook']
    let input, color = board[y][x].color;

    while(!validOptions.includes(input)) {
        input = prompt("Enter the piece you wish to promote to", "queen");
    }

    return pieceSelector[color + input];
}

function renderPiece(x, y) {
    let viewCoords = modelToView(x, y);
    
    pieceIcon = selectIcon(x, y);
    ctx.drawImage(pieceIcon, viewCoords.x, viewCoords.y, BLOCK_W, BLOCK_H);
}

function renderSquare(x, y) {
    viewCoords = modelToView(x, y);

    ctx.strokeStyle = 'black';
    if ((x + y) % 2){
        ctx.fillStyle = '#994d00';
    } else { 
        ctx.fillStyle = '#ffe066';
    }

    ctx.fillRect(viewCoords.x, viewCoords.y, BLOCK_W, BLOCK_H);
    ctx.strokeRect(viewCoords.x, viewCoords.y, BLOCK_W, BLOCK_H);
}


function renderBlock(x, y) {
    renderSquare(x, y);

    if(board[y][x] != EM) {
        renderPiece(x, y);
    }
}

function mouseDown(x, y) {
    modelCoords = viewToModel(x, y);
    currentMove.fromX = modelCoords.x;
    currentMove.fromY = modelCoords.y;

    canDrag = true;
    canvas.onmousemove = mouseMove;

    lastIcon = selectIcon(modelCoords.x, modelCoords.y);
}

function sameDestination(move1) {
    return function(move2) {
        return move1.toX == move2.toX &&
               move1.toY == move2.toY;
    }
}

function moveDisambiguation(move) {
    let type = move.piece.type;
    let color = move.piece.color;
    let moves = [];

    switch(type) {
        case 'rook':
            for(let x = 0; x < ROWS; x++) {
                for(let y = 0; y < COLS; y++) {
                    if(oldBoard[y][x] == move.piece && (move.fromX != x || move.fromY != y))
                        moves = moves.concat(generateStraightMoves(x, y, color, oldBoard));
                }
            }
            break;

        case 'queen':
            for(let x = 0; x < ROWS; x++) {
                for(let y = 0; y < COLS; y++) {
                    if(oldBoard[y][x] == move.piece && (move.fromX != x || move.fromY != y)){
                        moves = moves.concat(generateStraightMoves(x, y, color, oldBoard));
                        moves = moves.concat(generateDiagonalMoves(x, y, color, oldBoard));
                    }
                }
            }
            break;

        case 'knight':
            for(let x = 0; x < ROWS; x++) {
                for(let y = 0; y < COLS; y++) {
                    if(oldBoard[y][x] == move.piece && (move.fromX != x || move.fromY != y))
                        moves = moves.concat(generateKnightMoves(x, y, color, oldBoard));
                }
            }
            break;

        case 'bishop':
            for(let x = 0; x < ROWS; x++) {
                for(let y = 0; y < COLS; y++) {
                    if(oldBoard[y][x] == move.piece && (move.fromX != x || move.fromY != y))
                        moves = moves.concat(generateDiagonalMoves(x, y, color, oldBoard));
                }
            }
            break;

        default: 
            return ''
    }

    disambiguationString = ''

    moves = moves.filter(sameDestination(move));
    for(let i = 0; i < moves.length; ++i) {
        if(moves[i].fromX == move.fromX){
            disambiguationString += squareToAlgebraic[move.fromY][move.fromX].charAt(1);
            break;
        }
    }
    
    for(let i = 0; i < moves.length; ++i) {
        if(moves[i].fromY == move.fromY) {
            disambiguationString += squareToAlgebraic[move.fromY][move.fromX].charAt(0);
            break;
        }
    }
    
    if(type == 'knight' && disambiguationString == '' && moves.length > 0) {
        disambiguationString += squareToAlgebraic[move.fromY][move.fromX].charAt(0);
    }

    if(type == 'queen' && disambiguationString == '' && moves.length > 0) {
        disambiguationString += squareToAlgebraic[move.fromY][move.fromX];
    }

    if(type == 'bishop' && disambiguationString == '' && moves.length > 0) {
        disambiguationString += squareToAlgebraic[move.fromY][move.fromX].charAt(0);
    }

    if(type == 'rook' && disambiguationString == '' && moves.length > 0) {
        disambiguationString += squareToAlgebraic[move.fromY][move.fromX].charAt(0);
    }

    return disambiguationString;
}

function moveBuilder(move) {
    if(move.isShortCastle) {
        return 'o-o';
    }

    if(move.isLongCastle) {
        return 'o-o-o';
    }

    moveString = '';
    moveString += pieceToAlgebraic[move.piece.type];
    moveString += moveDisambiguation(move);


    if(move.isCapture) {
        if(move.piece.type == 'pawn') {
            moveString += squareToAlgebraic[move.fromY][move.fromX].charAt(0);
        }
    
        moveString += 'x';
    }

    moveString += squareToAlgebraic[move.toY][move.toX];

    
    if(move.isPromotion) {
        moveString += '=';
        moveString += pieceToAlgebraic[board[move.toY][move.toX].type];
    }

    if(move.isCheckMate) {
        moveString += '#';
    } else if (move.isCheck) {
        moveString += '+';
    }

    return moveString;
}

function renderScoresheet(move, moveNumber) {
    let i,j;

    if(moveNumber <= 60) {   
        if(move.piece.color == 'white') {
            i = (moveNumber - 1) % 20 + 1;
            j = 3 * Math.floor((moveNumber - 1) / 20) + 1;
        } else {
            i = (moveNumber - 1) % 20 + 1;
            j = 3 * Math.floor((moveNumber - 1) / 20) + 2;
        }
    
        moveString = moveBuilder(move);
        
        if(superMode) {
            moveString = 'BOOM';
        }

        
        scoreSheet.rows[i].cells[j].innerHTML = moveString;
    }

    if(move.isCheckMate) {
        if(turn == 'white') {
            infoTable.rows[1].cells[2].innerHTML = '1';
            infoTable.rows[2].cells[2].innerHTML = '0';
        } else {
            infoTable.rows[1].cells[2].innerHTML = '0';
            infoTable.rows[2].cells[2].innerHTML = '1';
        }
    }

    if(move.isStaleMate || move.drawRule) {
        infoTable.rows[1].cells[2].innerHTML = '1/2';
        infoTable.rows[2].cells[2].innerHTML = '1/2';
    }
}

function resetScoresheet() {
    for(let counter = 0; counter < 60; ++counter) {
        i = Math.floor(counter / 2) % 20;
        j = Math.floor((counter) % 2) + 3 * Math.floor(counter / 40);
            
        scoreSheet.rows[i + 1].cells[j + 1].innerHTML = '';
    }

    infoTable.rows[1].cells[2].innerHTML = '';
    infoTable.rows[2].cells[2].innerHTML = '';
}

function mouseMove(){
    if (canDrag){
        x = event.pageX - canvas.offsetLeft - BLOCK_H / 2; 
        y = event.pageY - canvas.offsetTop - BLOCK_W / 2; 

        render();
        renderSquare(currentMove.fromX, currentMove.fromY);
        ctx.drawImage(lastIcon, x, y, BLOCK_W, BLOCK_H);
    }
}

function mouseUp(x, y) {
    canDrag = false;
    canvas.onmousemove = null;

    const modelCoords = viewToModel(x, y);
    currentMove.toX = modelCoords.x;
    currentMove.toY = modelCoords.y;

    movePiece(currentMove.fromX, currentMove.fromY, currentMove.toX, currentMove.toY);
    render();
}

function render() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            renderBlock(x, y);
        }
    }
}

function activateSuperMode() {
    WPIcon.src = 'images/todo.png';
    BPIcon.src = 'images/todo.png';
    WNIcon.src = 'images/todo.png';
    BNIcon.src = 'images/todo.png';
    WBIcon.src = 'images/todo.png';
    BBIcon.src = 'images/todo.png';
    WQIcon.src = 'images/todo.png';
    BQIcon.src = 'images/todo.png';
    WKIcon.src = 'images/todo.png';
    BKIcon.src = 'images/todo.png';
    WRIcon.src = 'images/todo.png';
    BRIcon.src = 'images/todo.png';    
    alert("BOOOOOOOOOOOOOOOM");
    
    superMode = true;
    document.body.classList.add('super-mode');
}

BRIcon.onload = function () {
    render();
}