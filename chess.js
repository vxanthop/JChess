const ROWS = 8, COLS = 8;
const WP = {color: "white", piece: "pawn"}, 
      WR = {color: "white", piece: "rook"},
      WN = {color: "white", piece: "knight"},
      WB = {color: "white", piece: "bishop"},
      WQ = {color: "white", piece: "queen"},
      WK = {color: "white", piece: "king"};

const BP = {color: "black", piece: "pawn"}, 
      BR = {color: "black", piece: "rook"},
      BN = {color: "black", piece: "knight"},
      BB = {color: "black", piece: "bishop"},
      BQ = {color: "black", piece: "queen"},
      BK = {color: "black", piece: "king"};

const EM = {color: "empty", piece: "empty"};

let turn = "white";
let board = [];

function inBounds(x, y) {
    return x >= 0 && y >= 0
        && x < COLS && y < ROWS;
}

function resetPosition() {
    init();
    render();
}

function clearPosition() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            board[y][x] = EM;
        }
    }

    render();
}

function canShortCastle(fromX, fromY, toX, toY) {
    if (board[fromY][fromX].color == "white"){
        return (fromX == 4 && fromY == 7 && toX == 6 && toY == 7 && board[7][7].piece == "rook");
    } else {
        return (fromX == 4 && fromY == 0 && toX == 6 && toY == 0 && board[7][0].piece == "rook");
    }
}

function canLongCastle(fromX, fromY, toX, toY) {
    if (board[fromY][fromX].color == "white"){
        return (fromX == 4 && fromY == 7 && toX == 2 && toY == 7 && board[0][7].piece == "rook");
    } else {
        return (fromX == 4 && fromY == 0 && toX == 2 && toY == 0 && board[0][0].piece == "rook");
    }
}

function commitMove(fromX, fromY, toX, toY) {
    board[toY][toX] = board[fromY][fromX];
    board[fromY][fromX] = EM;
}

function isBlocked(fromX, fromY, toX, toY, piece, color, movement) {
    let dx, dy;
    let tempY = fromY, tempX = fromX;
    switch(movement) {
        case 'diagonal':
            dx = 1 - 2*(toX < fromX), dy = 1 - 2*(toY < fromY);

            for(let i = 0; i < Math.abs(fromX - toX) - 1; ++i) {
                tempX += dx;
                tempY += dy;

                console.log(tempX, tempY);

                if(board[tempY][tempX] != EM) 
                    return true;
            }

            return color == board[toY][toX].color;
    
        case 'horizontal':
            if(fromY != toY) {
                dy = 1 - 2*(fromY > toY);
                
                for(let i = 0; i < Math.abs(fromY - toY) - 1; ++i) {
                    tempY += dy;
    
                    console.log(tempX, tempY);
    
                    if(board[tempY][tempX] != EM) 
                        return true;
                }
    
                return color == board[toY][toX].color;

            } else {
                dx = 1 - 2*(fromX > toX);

                for(let i = 0; i < Math.abs(fromX - toX) - 1; ++i) {
                    tempX += dx;
    
                    console.log(tempX, tempY);
    
                    if(board[tempY][tempX] != EM) 
                        return true;
                }
    
                return color == board[toY][toX].color;
            }
    }
}

function isInTurn(color) {
    return color == turn; 
}

function isMoving(fromX, fromY, toX, toY) {
    return fromX != toX || fromY != toY;
}

function isDiagonalMove(fromX, fromY, toX, toY) {
    return Math.abs(fromX - toX) == Math.abs(fromY - toY);
}

function isStraightMove(fromX, fromY, toX, toY) {
    return fromX == toX || fromY == toY;
}

function isKnightMove(fromX, fromY, toX, toY) {
    return (Math.abs(fromX - toX) == 2 && Math.abs(fromY - toY) == 1) || (Math.abs(fromY - toY) == 2 && Math.abs(fromX - toX) == 1);
}

function isKingMove(fromX, fromY, toX, toY) {
    return (Math.abs(fromX - toX) <= 1 && Math.abs(fromY - toY) <= 1) || canLongCastle(fromX, fromY, toX, toY) || canShortCastle(fromX, fromY, toX, toY);
}

function legalMove(fromX, fromY, toX, toY, piece, color) {
    let isLegal = false;

    if(isInTurn(color) && isMoving(fromX, fromY, toX, toY)) {
        switch(piece) {
            case "pawn":
                if(board[toY][toX] == EM){
                    if(color == "white") {
                        isLegal = (fromX == toX) && (fromY == toY + 1) || ((fromY == toY + 2) && (fromX == toX) && fromY == 6);
                    } else {
                        isLegal = (fromX == toX) && (fromY == toY - 1) || ((fromY == toY - 2) && (fromX == toX) && fromY == 1);
                    }
                } else {
                    if(board[toY][toX].color != color) {
                        if(color == "white") {           
                            isLegal = (fromY == toY + 1) && (Math.abs(fromX - toX) == 1)
                        } else {
                            isLegal = (fromY == toY - 1) && (Math.abs(fromX - toX) == 1)
                        }
                    }
                }
                break;
            case "bishop":
                isLegal = isDiagonalMove(fromX, fromY, toX, toY) && !isBlocked(fromX, fromY, toX, toY, piece, color, 'diagonal');
                break;
            case "knight":
                isLegal = isKnightMove(fromX, fromY, toX, toY);
                break;
            case "rook":
                isLegal = isStraightMove(fromX, fromY, toX, toY) && !isBlocked(fromX, fromY, toX, toY, piece, color, 'horizontal');
                break;
            case "queen":
                isLegal = (isStraightMove(fromX, fromY, toX, toY) && !isBlocked(fromX, fromY, toX, toY, piece, color, 'horizontal')) ||
                          (isDiagonalMove(fromX, fromY, toX, toY) && !isBlocked(fromX, fromY, toX, toY, piece, color, 'diagonal'));
                break;
            case "king":
                isLegal = isKingMove(fromX, fromY, toX, toY) && !isBlocked(fromX, fromY, toX, toY, piece, color, '');
                break;
        }   
    }

    return isLegal;
}

function movePiece(fromX, fromY, toX, toY) {
    if(legalMove(fromX, fromY, toX, toY, board[fromY][fromX].piece, board[fromY][fromX].color)) {
        commitMove(fromX, fromY, toX, toY);

        if (turn == "white") {
            turn = "black";
        } else {
            turn = "white";
        }
    }
    
    render();
}

function init() {
    board = [
        [BR, BN, BB, BQ, BK, BB, BN, BR],
        [BP, BP, BP, BP, BP, BP, BP, BP],
        [EM, EM, EM, EM, EM, EM, EM, EM],
        [EM, EM, EM, EM, EM, EM, EM, EM],
        [EM, EM, EM, EM, EM, EM, EM, EM],
        [EM, EM, EM, EM, EM, EM, EM, EM],
        [WP, WP, WP, WP, WP, WP, WP, WP],
        [WR, WN, WB, WQ, WK, WB, WN, WR]
    ];

    turn = "white";
    clicks = 0;
    lastClick = {
        x: 0,
        y: 0
    };
}

init();
