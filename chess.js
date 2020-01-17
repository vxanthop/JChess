const ROWS = 8, COLS = 8;
const WP = {color: 'white', type: 'pawn'}, 
      WR = {color: 'white', type: 'rook'},
      WN = {color: 'white', type: 'knight'},
      WB = {color: 'white', type: 'bishop'},
      WQ = {color: 'white', type: 'queen'},
      WK = {color: 'white', type: 'king'};

const BP = {color: 'black', type: 'pawn'}, 
      BR = {color: 'black', type: 'rook'},
      BN = {color: 'black', type: 'knight'},
      BB = {color: 'black', type: 'bishop'},
      BQ = {color: 'black', type: 'queen'},
      BK = {color: 'black', type: 'king'};

const EM = {color: 'empty', type: 'empty'};

let turn = 'white';
let playing = true;
let superMode = false;
let moveNumber = 0;
let board = [];
let whiteCanShortCastle = true, blackCanShortCastle = true;
let whiteCanLongCastle = true, blackCanLongCastle = true;
let whiteKingPos = {
    x: 4,
    y: 7
};
let blackKingPos = {
    x: 4,
    y: 0
};
let lastMove = {
    fromX: 0,
    fromY: 0,
    toX: 0,
    toY: 0,
    piece: EM,
    isCapture: false,
    isShortCastle: false,
    isLongCastle: false,
    isPromotion: false,
    isCheckMate: false,
    isStaleMate: false
};

function inBounds(x, y) {
    return x >= 0 && y >= 0
        && x < COLS && y < ROWS;
}

function resetPosition() {
    init();
    resetScoresheet();
    render();
}

function clearPosition() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            board[y][x] = EM;
        }
    }

    resetScoresheet();
    render();
}

//  tries to commit the move to check if it's legal,
//  without changing the global state variables 
function pseudoCommitMove(fromX, fromY, toX, toY, myBoard) {
    let color = board[fromY][fromX].color, _isEnPassant;

    if(isShortCastle(fromX, fromY, toX, toY)) {
        if (myBoard[fromY][fromX].color == 'white'){
            myBoard[7][7] = EM;
            myBoard[7][5] = WR;
        } else {
            myBoard[0][7] = EM;
            myBoard[0][5] = BR;
        }    
    }
    
    if(isLongCastle(fromX, fromY, toX, toY)) {
        if (myBoard[fromY][fromX].color == 'white'){
            myBoard[7][0] = EM;
            myBoard[7][3] = WR;
        } else {
            myBoard[0][0] = EM;
            myBoard[0][3] = BR;
        }
    }

    _isEnPassant = isEnPassant(fromX, fromY, toX, toY, color);
    
    if(_isEnPassant) {
        myBoard[lastMove.toY][lastMove.toX] = EM;
    }

    myBoard[toY][toX] = myBoard[fromY][fromX];  
    myBoard[fromY][fromX] = EM;
} 

function isCapture(fromX, fromY, toX, toY) {
    return (board[toY][toX].color != board[fromY][fromX].color) && 
           board[toY][toX].color != 'empty' && 
           board[fromY][fromX].color != 'empty';
}

function commitMove(fromX, fromY, toX, toY) {
    let color = board[fromY][fromX].color, _isEnPassant, _isPromotion; 

    if(isShortCastle(fromX, fromY, toX, toY)) {
        if (color == 'white'){
            board[7][7] = EM;
            board[7][5] = WR;
            whiteCanShortCastle = false;
            whiteCanLongCastle = false;
            lastMove.isShortCastle = true;
        } else {
            board[0][7] = EM;
            board[0][5] = BR;
            blackCanShortCastle = false;
            blackCanLongCastle = false;
            lastMove.isShortCastle = true;
        }    
    } else {
        lastMove.isShortCastle = false;
    }
    
    if(isLongCastle(fromX, fromY, toX, toY)) {
        if (color == 'white'){
            board[7][0] = EM;
            board[7][3] = WR;
            whiteCanLongCastle = false;
            whiteCanShortCastle = false;
            lastMove.isLongCastle = true;
        } else {
            board[0][0] = EM;
            board[0][3] = BR;
            blackCanLongCastle = false;
            blackCanShortCastle = false;
            lastMove.isLongCastle = true;
        }
    } else {
        lastMove.isLongCastle = false;
    }
    
    _isEnPassant = isEnPassant(fromX, fromY, toX, toY, color);
    _isPromotion = isPromotion(fromX, fromY, toX, toY, color);
    
    if(fromY == 0 && fromX == 0) blackCanLongCastle = false;
    else if(fromY == 0 && fromX == 7) blackCanShortCastle = false;
    else if(fromY == 7 && fromX == 0) whiteCanLongCastle = false;
    else if(fromY == 7 && fromX == 7) whiteCanShortCastle = false;
    
    if(board[fromY][fromX] == WK){
        whiteCanLongCastle = false;
        whiteCanLongCastle = false;
        whiteKingPos.x = toX; 
        whiteKingPos.y = toY;
    } else if(board[fromY][fromX] == BK){
        blackCanLongCastle = false;
        blackCanShortCastle = false;
        blackKingPos.x = toX; 
        blackKingPos.y = toY;
    }
    
    if(_isEnPassant) board[lastMove.toY][lastMove.toX] = EM;

    if(_isPromotion) {
        selection = renderPromotionMenu(fromX, fromY);
        board[toY][toX] = selection;
    } else {
        board[toY][toX] = board[fromY][fromX];
    }

    
    lastMove.fromX = fromX;
    lastMove.fromY = fromY;
    lastMove.toX = toX;
    lastMove.toY = toY;
    lastMove.piece = board[fromY][fromX];
    lastMove.isCapture = isCapture(fromX, fromY, toX, toY) || _isEnPassant;
    lastMove.isEnPassant = isEnPassant(fromX, fromY, toX, toY, color);
    lastMove.isPromotion = _isPromotion;
    
    board[fromY][fromX] = EM;

    if(turn == 'white') {
        turn = 'black';
    } else{
        turn = 'white';
    }

    if(!hasMoves()) {
        if (turn == 'white') {
            let testBoard = board.map(L => L.slice());
            if(inCheck(whiteKingPos.x, whiteKingPos.y, testBoard)) {
                lastMove.isCheckMate = true;
                alert('Black won by checkmate!!');
            } else {
                lastMove.isStaleMate = true;
                alert('Draw by Stalemate');
            }
        } else {
            let testBoard = board.map(L => L.slice());
            if(inCheck(blackKingPos.x, blackKingPos.y, testBoard)) {
                lastMove.isCheckMate = true;
                alert('White won by checkmate!!');
            } else {
                lastMove.isStaleMate = true;
                alert('Draw by Stalemate');                    
            }
        }
        
        playing = false;
    }

    renderScoresheet(lastMove, moveNumber);
    addToPgn(lastMove, moveNumber);
    moveNumber++;
}

// Hacky way to figure out direction, must change
function isBlocked(fromX, fromY, toX, toY, movement) {
    let dx, dy;
    let tempY = fromY, tempX = fromX;
    let color = board[fromY][fromX].color;

    switch(movement) {
        case 'diagonal':
            dx = 1 - 2*(toX < fromX), dy = 1 - 2*(toY < fromY);

            for(let i = 0; i < Math.abs(fromX - toX) - 1; ++i) {
                tempX += dx;
                tempY += dy;

                if(board[tempY][tempX] != EM) 
                    return true;
            }

            return color == board[toY][toX].color;
    
        case 'straight':
            if(fromY != toY) {
                dy = 1 - 2*(fromY > toY);
                
                for(let i = 0; i < Math.abs(fromY - toY) - 1; ++i) {
                    tempY += dy;
        
                    if(board[tempY][tempX] != EM) 
                        return true;
                }
    
                return color == board[toY][toX].color;

            } else {
                dx = 1 - 2*(fromX > toX);

                for(let i = 0; i < Math.abs(fromX - toX) - 1; ++i) {
                    tempX += dx;
        
                    if(board[tempY][tempX] != EM) 
                        return true;
                }
    
                return color == board[toY][toX].color;
            }

        case 'knight':
            return color == board[toY][toX].color;

        case 'unit':
            return color == board[toY][toX].color;

        default:
            return false;
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
    return Math.abs(fromX - toX) <= 1 && Math.abs(fromY - toY) <= 1;
}

function inCheckDiagonal(kingX, kingY, myBoard) {
    let kingColor = myBoard[kingY][kingX].color, enemyBishop, enemyQueen;
    let dx, dy;
    if(kingColor == 'white') {
        enemyBishop = BB;
        enemyQueen = BQ; 
    } else {
        enemyBishop = WB;
        enemyQueen = WQ;
    }


    dx = 1, dy = 1;
    for(let tempX = kingX + dx, tempY = kingY + dy; inBounds(tempX, tempY); tempX += dx, tempY += dy) {
        piece = myBoard[tempY][tempX];
        if (piece == EM) continue;
        else if(piece == enemyBishop || piece == enemyQueen) return true;
        else break;
    }

    dx = -1, dy = 1;
    for(let tempX = kingX + dx, tempY = kingY + dy; inBounds(tempX, tempY); tempX += dx, tempY += dy) {
        piece = myBoard[tempY][tempX];
        if (piece == EM) continue;
        else if(piece == enemyBishop || piece == enemyQueen) return true;
        else break;
    }

    dx = 1, dy = -1;
    for(let tempX = kingX + dx, tempY = kingY + dy; inBounds(tempX, tempY); tempX += dx, tempY += dy) {
        piece = myBoard[tempY][tempX];
        if (piece == EM) continue;
        else if(piece == enemyBishop || piece == enemyQueen) return true;
        else break;
    }

    dx = -1, dy = -1;
    for(let tempX = kingX + dx, tempY = kingY + dy; inBounds(tempX, tempY); tempX += dx, tempY += dy) {
        piece = myBoard[tempY][tempX];
        if (piece == EM) continue;
        else if(piece == enemyBishop || piece == enemyQueen) return true;
        else break;
    }


    return false;
}

function inCheckStraight(kingX, kingY, myBoard) {
    let kingColor = myBoard[kingY][kingX].color, enemyRook, enemyQueen;

    if(kingColor == 'white') {
        enemyRook = BR;
        enemyQueen = BQ; 
    } else {
        enemyRook = WR;
        enemyQueen = WQ;
    }

    for(let tempX = kingX + 1; tempX < COLS; ++tempX) {
        piece = myBoard[kingY][tempX];
        if (piece == EM) continue;
        else if(piece == enemyRook || piece == enemyQueen) return true;
        else break;
    }

    for(let tempX = kingX - 1; tempX >= 0; --tempX) {
        piece = myBoard[kingY][tempX];
        if (piece == EM) continue;
        else if(piece == enemyRook || piece == enemyQueen) return true;
        else break;
    }

    for(let tempY = kingY + 1; tempY < ROWS; ++tempY) {
        piece = myBoard[tempY][kingX];
        if (piece == EM) continue;
        else if(piece == enemyRook || piece == enemyQueen) return true;
        else break;
    }

    for(let tempY = kingY - 1; tempY >= 0; --tempY) {
        piece = myBoard[tempY][kingX];
        if (piece == EM) continue;
        else if(piece == enemyRook || piece == enemyQueen) return true;
        else break;
    }

    return false;
}

function inCheckKing(kingX, kingY, myBoard) {
    let enemyKing;
    if(myBoard[kingY][kingX].color == 'white') {
        enemyKing = BK;
    } else {
        enemyKing = WK;
    }

    for(let dx = -1; dx <= 1; ++dx) {
        for(let dy = -1; dy <= 1; ++dy) {
            if(dx != 0 || dy != 0){
                if(inBounds(kingX + dx, kingY + dy) && myBoard[kingY + dy][kingX + dx] == enemyKing) return true;
            }
        }
    }

    return false;
}

function inCheckKnight(kingX, kingY, myBoard) {
    if(myBoard[kingY][kingX].color == 'white') {
        enemyKnight = BN;
    } else {
        enemyKnight = WN;
    }
    
    return (inBounds(kingX + 2, kingY + 1) && myBoard[kingY + 1][kingX + 2] == enemyKnight) ||
           (inBounds(kingX + 2, kingY - 1) && myBoard[kingY - 1][kingX + 2] == enemyKnight) || 
           (inBounds(kingX - 2, kingY + 1) && myBoard[kingY + 1][kingX - 2] == enemyKnight) ||
           (inBounds(kingX - 2, kingY - 1) && myBoard[kingY - 1][kingX - 2] == enemyKnight) ||
           (inBounds(kingX + 1, kingY + 2) && myBoard[kingY + 2][kingX + 1] == enemyKnight) ||
           (inBounds(kingX + 1, kingY - 2) && myBoard[kingY - 2][kingX + 1] == enemyKnight) ||
           (inBounds(kingX - 1, kingY + 2) && myBoard[kingY + 2][kingX - 1] == enemyKnight) ||
           (inBounds(kingX - 1, kingY - 2) && myBoard[kingY - 2][kingX - 1] == enemyKnight);
}

function inCheckPawn(kingX, kingY, myBoard) {
    if(myBoard[kingY][kingX].color == 'white') {
        return (inBounds(kingX - 1, kingY - 1) && myBoard[kingY - 1][kingX - 1] == BP) ||
               (inBounds(kingX + 1, kingY - 1) && myBoard[kingY - 1][kingX + 1] == BP);
    } else {
        return (inBounds(kingX + 1, kingY + 1) && myBoard[kingY + 1][kingX + 1] == WP) ||
               (inBounds(kingX - 1, kingY + 1) && myBoard[kingY + 1][kingX - 1] == WP);
    }
}

function inCheck(kingX, kingY, myBoard) {
    return inCheckStraight(kingX, kingY, myBoard) || 
           inCheckDiagonal(kingX, kingY, myBoard) ||
           inCheckKnight(kingX, kingY, myBoard) ||
           inCheckPawn(kingX, kingY, myBoard) ||
           inCheckKing(kingX, kingY, myBoard);
}

function isEnPassant(fromX, fromY, toX, toY, color) {
    if(board[fromY][fromX].type == 'pawn') {
        if(color == 'white') {
            return lastMove.piece == BP && lastMove.toY - lastMove.fromY == 2 && lastMove.fromX == lastMove.toX && lastMove.toY == toY + 1;
        } else {
            return lastMove.piece == WP && lastMove.fromY - lastMove.toY == 2 && lastMove.fromX == lastMove.toX && lastMove.toY == toY - 1;
        }
    }
}

function isPromotion(fromX, fromY, toX, toY, color) {
    if(board[fromY][fromX].type == 'pawn') {
        if(color == 'white') {
            return toY == 0;
        } else {
            return toY == 7;
        }
    }
}

function isPawnMove(fromX, fromY, toX, toY, color) {
    if(color == 'white') {
        return (board[toY][toX] == EM && ((fromX == toX && toY == fromY - 1) || (fromX == toX && toY == fromY - 2 && fromY == 6))) || // straight move
               (board[toY][toX].color == 'black' && Math.abs(fromX - toX) == 1 && toY == fromY - 1) || // capture
               isEnPassant(fromX, fromY, toX, toY, color); // en-passant
    } else {
        return (board[toY][toX] == EM && ((fromX == toX && toY == fromY + 1) || (fromX == toX && toY == fromY + 2 && fromY == 1))) || // straight move
               (board[toY][toX].color == 'white' && Math.abs(fromX - toX) == 1 && toY == fromY + 1) || // capture
               isEnPassant(fromX, fromY, toX, toY, color);  // en-passant
    }
}

function isShortCastle(fromX, fromY, toX, toY) {
    if (board[fromY][fromX].color == 'white'){
        if(whiteCanShortCastle && fromX == 4 && fromY == 7 && toX == 6 && toY == 7 && board[7][7] == WR) {
            const testBoard = board.map(L => L.slice());
            pseudoCommitMove(fromX, fromY, fromX + 1, fromY, testBoard); 
            return !inCheck(fromX + 1, fromY, testBoard);
        }
    } else {
        if(blackCanShortCastle && fromX == 4 && fromY == 0 && toX == 6 && toY == 0 && board[0][7] == BR) {
            const testBoard = board.map(L => L.slice());
            pseudoCommitMove(fromX, fromY, toX + 1, fromY, testBoard); 
            return !inCheck(fromX + 1, fromY, testBoard);
        }
    }
}

function isLongCastle(fromX, fromY, toX, toY) {
    if (board[fromY][fromX].color == 'white'){
        if(whiteCanLongCastle && fromX == 4 && fromY == 7 && toX == 2 && toY == 7 && board[7][0] == WR) {
            const testBoard = board.map(L => L.slice());
            pseudoCommitMove(fromX, fromY, fromX - 1, fromY, testBoard); 
            return !inCheck(fromX - 1, fromY, testBoard);
        }
    } else {
        if(blackCanLongCastle && fromX == 4 && fromY == 0 && toX == 2 && toY == 0 && board[0][0] == BR) {
            const testBoard = board.map(L => L.slice());
            pseudoCommitMove(fromX, fromY, fromX - 1, fromY, testBoard); 
            return !inCheck(fromX - 1, fromY, testBoard);
        }
    }
}

function countKnightMoves(fromX, fromY) {
    moves = 0;

    if (legalMove(fromX, fromY, fromX + 2, fromY + 1, 'knight', turn)) moves++; 
    if (legalMove(fromX, fromY, fromX + 2, fromY - 1, 'knight', turn)) moves++;  
    if (legalMove(fromX, fromY, fromX - 2, fromY + 1, 'knight', turn)) moves++; 
    if (legalMove(fromX, fromY, fromX - 2, fromY - 1, 'knight', turn)) moves++; 
    if (legalMove(fromX, fromY, fromX + 1, fromY + 2, 'knight', turn)) moves++; 
    if (legalMove(fromX, fromY, fromX + 1, fromY - 2, 'knight', turn)) moves++; 
    if (legalMove(fromX, fromY, fromX - 1, fromY + 2, 'knight', turn)) moves++; 
    if (legalMove(fromX, fromY, fromX - 1, fromY - 2, 'knight', turn)) moves++;

    return moves;
}

function countStraightMoves(fromX, fromY) {
    moves = 0;
    let type = board[fromY][fromX].type; 

    for(let tempX = fromX + 1; tempX < COLS; ++tempX) {
        if(legalMove(fromX, fromY, tempX, fromY, type, turn)) moves++;
    }

    for(let tempX = fromX - 1; tempX >= 0; --tempX) {
        if(legalMove(fromX, fromY, tempX, fromY, type, turn)) moves++;
    }

    for(let tempY = fromY + 1; tempY < ROWS; ++tempY) {
        if(legalMove(fromX, fromY, fromX, tempY, type, turn)) moves++;
    }

    for(let tempY = fromY - 1; tempY >= 0; --tempY) {
        if(legalMove(fromX, fromY, fromX, tempY, type, turn)) moves++;
    }

    return moves++;
}

function countDiagonalMoves(fromX, fromY) {
    let moves = 0, dx, dy;
    let type = board[fromY][fromX].type; 

    dx = 1, dy = 1;
    for(let tempX = fromX + dx, tempY = fromY + dy; inBounds(tempX, tempY); tempX += dx, tempY += dy) {
        if(legalMove(fromX, fromY, tempX, tempY, type, turn)) moves++;
    }

    dx = -1, dy = 1;
    for(let tempX = fromX + dx, tempY = fromY + dy; inBounds(tempX, tempY); tempX += dx, tempY += dy) {
        if(legalMove(fromX, fromY, tempX, tempY, type, turn)) moves++;
    }

    dx = 1, dy = -1;
    for(let tempX = fromX + dx, tempY = fromY + dy; inBounds(tempX, tempY); tempX += dx, tempY += dy) {
        if(legalMove(fromX, fromY, tempX, tempY, type, turn)) moves++;
    }

    dx = -1, dy = -1;
    for(let tempX = fromX + dx, tempY = fromY + dy; inBounds(tempX, tempY); tempX += dx, tempY += dy) {
        if(legalMove(fromX, fromY, tempX, tempY, type, turn)) moves++;
    }


    return moves;
}

function countPawnMoves(fromX, fromY) {
    let moves = 0;

    if(turn == 'white') {
        if(legalMove(fromX, fromY, fromX, fromY - 1, 'pawn', 'white')) moves++;
        if(legalMove(fromX, fromY, fromX, fromY - 2, 'pawn', 'white')) moves++;
        if(legalMove(fromX, fromY, fromX - 1, fromY - 1, 'pawn', 'white')) moves++;
        if(legalMove(fromX, fromY, fromX + 1, fromY - 1, 'pawn', 'white')) moves++;
    } else {
        if(legalMove(fromX, fromY, fromX, fromY + 1, 'pawn', 'black')) moves++;
        if(legalMove(fromX, fromY, fromX, fromY + 2, 'pawn', 'black')) moves++;
        if(legalMove(fromX, fromY, fromX - 1, fromY + 1, 'pawn', 'black')) moves++;
        if(legalMove(fromX, fromY, fromX + 1, fromY + 1, 'pawn', 'black')) moves++;
    }

    return moves;
}

function countKingMoves(fromX, fromY) {
    let moves = 0;
    
    for(let dx = -1; dx <= 1; ++dx) {
        for(let dy = -1; dy <= 1; ++dy) {
            if(dx != 0 || dy != 0){
                if(legalMove(fromX, fromY, fromX + dx, fromY + dy, 'king', turn)) moves++;
            }
        }
    }

    return moves;
}

function countMoves() {
    let moves = 0

    for(let x = 0; x < ROWS; x++) {
        for(let y = 0; y < COLS; y++) {
            if (moves > 0) return moves; // Optimization that works if we care only about the existance of moves

            color = board[y][x].color;

            if(turn == color){
                type = board[y][x].type;
                switch(type) {
                    case 'pawn':
                        moves += countPawnMoves(x, y);
                        break;
                    case 'bishop':
                        moves += countDiagonalMoves(x, y);
                        break;
                    case 'knight':
                        moves += countKnightMoves(x, y);
                        break;
                    case 'rook':
                        moves += countStraightMoves(x, y);
                        break;
                    case 'queen':
                        moves += (countDiagonalMoves(x, y) + countStraightMoves(x, y));
                        break;
                    case 'king':
                        moves += countKingMoves(x, y);
                        break;
                }
            }
        }
    }

    return moves;
}


function legalMove(fromX, fromY, toX, toY, type, color) {
    let isLegal = false, isInCheck = false, kingX, kingY;

    if(isInTurn(color) && isMoving(fromX, fromY, toX, toY) && inBounds(toX, toY)) {
        switch(type) {
            case 'pawn':
                isLegal = isPawnMove(fromX, fromY, toX, toY, color);
                if(fromX == toX) isLegal &= !isBlocked(fromX, fromY, toX, toY, 'straight');
                else             isLegal &= !isBlocked(fromX, fromY, toX, toY, 'diagonal');

                break;
            case 'bishop':
                isLegal = isDiagonalMove(fromX, fromY, toX, toY) && !isBlocked(fromX, fromY, toX, toY, 'diagonal');
                break;
            case 'knight':
                isLegal = isKnightMove(fromX, fromY, toX, toY) && !isBlocked(fromX, fromY, toX, toY, 'knight');
                break;
            case 'rook':
                isLegal = isStraightMove(fromX, fromY, toX, toY) && !isBlocked(fromX, fromY, toX, toY, 'straight');
                break;
            case 'queen':
                isLegal = (isStraightMove(fromX, fromY, toX, toY) && !isBlocked(fromX, fromY, toX, toY, 'straight')) ||
                          (isDiagonalMove(fromX, fromY, toX, toY) && !isBlocked(fromX, fromY, toX, toY, 'diagonal'));
                break;
            case 'king':
                isLegal = (isKingMove(fromX, fromY, toX, toY) && !isBlocked(fromX, fromY, toX, toY, 'unit')) ||
                          isShortCastle(fromX, fromY, toX, toY) && !isBlocked(fromX, fromY, toX, toY, 'straight') || 
                          isLongCastle(fromX, fromY, toX, toY) && !isBlocked(fromX, fromY, toX, toY, 'straight');
                break;
        }   
    }

    if(isLegal) {
        if(type == 'king') {
            kingX = toX;
            kingY = toY;
        } else {
            if(turn == 'white') {
                kingX = whiteKingPos.x;
                kingY = whiteKingPos.y;
            } else {
                kingX = blackKingPos.x;
                kingY = blackKingPos.y;
            }
        }

        const testBoard = board.map(L => L.slice());
        pseudoCommitMove(fromX, fromY, toX, toY, testBoard); 
        isInCheck = inCheck(kingX, kingY, testBoard);

        return !isInCheck;
    }

    return false;
}

function hasMoves() {
    return countMoves() > 0;
}

function movePiece(fromX, fromY, toX, toY) {
    if(superMode) {
        board[toY][toX] = board[fromY][fromX];
        board[fromY][fromX] = EM;
        renderScoresheet(lastMove, moveNumber);
        moveNumber++;
    } else if(playing) {
        if(legalMove(fromX, fromY, toX, toY, board[fromY][fromX].type, board[fromY][fromX].color)) {
            commitMove(fromX, fromY, toX, toY, board);
        }
        
        render();
    }
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

    turn = 'white';
    playing = true;
    moveNumber = 0;
    whiteCanShortCastle = true, blackCanShortCastle = true;
    whiteCanLongCastle = true, blackCanLongCastle = true;
    lastMove = {
        fromX: 0,
        fromY: 0,
        toX: 0,
        toY: 0,
        piece: EM,
        isCapture: false,
        isShortCastle: false,
        isLongCastle: false,
        isPromotion: false,
        isCheckMate: false,
        isStaleMate: false
    };
    whiteKingPos = {
        x: 4,
        y: 7
    };
    blackKingPos = {
        x: 4,
        y: 0
    };
}

init();
