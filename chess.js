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
let whiteHasCastled = false, blackHasCastled = false;
let whiteKingMoved = false, blackKingMoved = false; 
let isEnPassant = false;
let isPromotion = false;
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
    piece: '',
    color: '' 
};

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

function commitMove(fromX, fromY, toX, toY, board) {
    if(isShortCastle(fromX, fromY, toX, toY)) {
        if (board[fromY][fromX].color == "white"){
            board[7][7] = EM;
            board[7][5] = WR;
            whiteHasCastled = true;
        } else {
            board[0][7] = EM;
            board[0][5] = BR;
            blackHasCastled = true;
        }    
    } else if(isLongCastle(fromX, fromY, toX, toY)) {
        if (board[fromY][fromX].color == "white"){
            board[7][0] = EM;
            board[7][3] = WR;
            whiteHasCastled = true;
        } else {
            board[0][0] = EM;
            board[0][3] = BR;
            blackHasCastled = true;
        }
    } else if(isEnPassant) {
        board[lastMove.toY][lastMove.toX] = EM;
        isEnPassant = false;
    }
    
    let c = turn, kingX, kingY;
    if(turn == 'white') {
        kingX = whiteKingPos.x;
        kingY = whiteKingPos.y;
    } else {
        kingX = blackKingPos.x;
        kingY = blackKingPos.y;
    }

    lastMove.fromX = fromX;
    lastMove.fromY = fromY;
    lastMove.toX = toX;
    lastMove.toY = toY;
    lastMove.piece = board[fromY][fromX].piece;
    lastMove.color = board[fromY][fromX].color;
    
    if(board[fromY][fromX].piece == 'king'){
        if(board[fromY][fromX].color == 'white') {
            whiteKingPos.x = toX; 
            whiteKingPos.y = toY;
        } else {
            blackKingPos.x = toX; 
            blackKingPos.y = toY;
        }
    }

    if(isPromotion) {
        selection = renderPromotionMenu(toX, toY);
        board[toY][toX] = {color: board[fromY][fromX].color, piece: selection};
        isPromotion = false;
    } else {
        board[toY][toX] = board[fromY][fromX];
    }
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

                if(board[tempY][tempX] != EM) 
                    return true;
            }

            return color == board[toY][toX].color;
    
        case 'horizontal':
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
    if(Math.abs(fromX - toX) <= 1 && Math.abs(fromY - toY) <= 1) {
        if(board[fromY][fromX].color == 'white') {
            whiteKingMoved = true;
        } else {
            blackKingMoved = true;
        }

        return true;
    }

    return false;
}

function inCheckDiagonal(kingX, kingY, board) {
    let kingColor = board[kingY][kingX].color;
    let tempX, tempY, dx, dy;

    dx = 1, dy = 1;
    tempX = kingX, tempY = kingY;
    for(let i = 0; i < Math.min(Math.abs(7 - kingX), Math.abs(7 - kingY)); ++i) {
        tempX += dx;
        tempY += dy;
        c = board[tempY][tempX].color;
        p = board[tempY][tempX].piece;
        if(p != 'empty') {
            if(c != kingColor) {
                if(p == 'bishop' || p == 'queen') 
                    return true;
                else if(p == 'king' && Math.abs(kingX - tempX) == 1 && Math.abs(kingY - tempY) == 1) 
                    return true;
                else
                    return false;
            } else {
                break;
            }
        }
    }

    dx = 1, dy = -1;
    tempX = kingX, tempY = kingY;
    for(let i = 0; i < Math.min(Math.abs(7 - kingX), Math.abs(0 - kingY)); ++i) {
        tempX += dx;
        tempY += dy;
        c = board[tempY][tempX].color;
        p = board[tempY][tempX].piece;
        if(p != 'empty') {
            if(c != kingColor) {
                if(p == 'bishop' || p == 'queen') 
                    return true;
                else if(p == 'king' && Math.abs(kingX - tempX) == 1 && Math.abs(kingY - tempY) == 1) 
                    return true;
                else
                    return false;
            } else {
                break;
            }
        }
    }

    dx = -1, dy = 1;
    tempX = kingX, tempY = kingY;
    for(let i = 0; i < Math.min(Math.abs(0 - kingX), Math.abs(7 - kingY)); ++i) {
        tempX += dx;
        tempY += dy;
        c = board[tempY][tempX].color;
        p = board[tempY][tempX].piece;
        if(p != 'empty') {
            if(c != kingColor) {
                if(p == 'bishop' || p == 'queen') 
                    return true;
                else if(p == 'king' && Math.abs(kingY - tempY) == 1 && Math.abs(kingX - tempX) == 1) 
                    return true;
                else
                    return false;
            } else {
                break;
            }
        }
    }

    dx = -1, dy = -1;
    tempX = kingX, tempY = kingY;
    for(let i = 0; i < Math.min(Math.abs(0 - kingX), Math.abs(0 - kingY)); ++i) {
        tempX += dx;
        tempY += dy;
        c = board[tempY][tempX].color;
        p = board[tempY][tempX].piece;
        if(p != 'empty') {
            if(c != kingColor) {
                if(p == 'bishop' || p == 'queen') 
                    return true;
                else if(p == 'king' && Math.abs(kingY - tempY) == 1 && Math.abs(kingX - tempX) == 1) 
                    return true;
                else
                    return false;
            } else {
                break;
            }
        }
    }
}

function inCheckHorizontal(kingX, kingY, board) {
    let kingColor = board[kingY][kingX].color;

    for(let tempX = kingX + 1; tempX < 8; ++tempX) {
        c = board[kingY][tempX].color;
        p = board[kingY][tempX].piece;
        if(p != 'empty') {
            if(c != kingColor) {
                if(p == 'rook' || p == 'queen') 
                    return true;
                else if(p == 'king' && Math.abs(kingX - tempX) == 1) 
                    return true;
                else
                    return false;
            } else {
                break;
            }
        }
    }

    for(let tempX = kingX - 1; tempX >= 0; --tempX) {
        c = board[kingY][tempX].color;
        p = board[kingY][tempX].piece;
        if(p != 'empty') {
            if(c != kingColor) {
                if(p == 'rook' || p == 'queen') 
                    return true;
                else if(p == 'king' && Math.abs(kingX - tempX) == 1) 
                    return true;
                else
                    return false;
            } else {
                break;
            }
        }
    }

    for(let tempY = kingY + 1; tempY < 8; ++tempY) {
        c = board[tempY][kingX].color;
        p = board[tempY][kingX].piece;
        if(p != 'empty') {
            if(c != kingColor) {
                if(p == 'rook' || p == 'queen') 
                    return true;
                else if(p == 'king' && Math.abs(kingY - tempY) == 1) 
                    return true;
                else
                    return false;
            } else {
                break;
            }
        }
    }

    for(let tempY = kingY - 1; tempY >= 0; --tempY) {
        c = board[tempY][kingX].color;
        p = board[tempY][kingX].piece;
        if(p != 'empty') {
            if(c != kingColor) {
                if(p == 'rook' || p == 'queen') 
                    return true;
                else if(p == 'king' && Math.abs(kingY - tempY) == 1) 
                    return true;
                else
                    return false;
            } else {
                break;
            }
        }
    }
}

function inCheckKnight(kingX, kingY, board) {
    c = board[kingY][kingX].color;

    return (inBounds(kingX + 2, kingY + 1) && board[kingY + 1][kingX + 2].piece == 'knight' && board[kingY + 1][kingX + 2].color != c) ||
           (inBounds(kingX + 2, kingY - 1) && board[kingY - 1][kingX + 2].piece == 'knight' && board[kingY - 1][kingX + 2].color != c) || 
           (inBounds(kingX - 2, kingY + 1) && board[kingY + 1][kingX - 2].piece == 'knight' && board[kingY + 1][kingX - 2].color != c) ||
           (inBounds(kingX - 2, kingY - 1) && board[kingY - 1][kingX - 2].piece == 'knight' && board[kingY - 1][kingX - 2].color != c) ||
           (inBounds(kingX + 1, kingY + 2) && board[kingY + 2][kingX + 1].piece == 'knight' && board[kingY + 2][kingX + 1].color != c) ||
           (inBounds(kingX + 1, kingY - 2) && board[kingY - 2][kingX + 1].piece == 'knight' && board[kingY - 2][kingX + 1].color != c) ||
           (inBounds(kingX - 1, kingY + 2) && board[kingY + 2][kingX - 1].piece == 'knight' && board[kingY + 2][kingX - 1].color != c) ||
           (inBounds(kingX - 1, kingY - 2) && board[kingY - 2][kingX - 1].piece == 'knight' && board[kingY - 2][kingX - 1].color != c);
}

function inCheckPawn(kingX, kingY, board) {
    c = board[kingY][kingX].color;

    if(c == 'white') {
        return (inBounds(kingX - 1, kingY - 1) && board[kingY - 1][kingX - 1].piece == 'pawn' && board[kingY - 1][kingX - 1].color != c) ||
               (inBounds(kingX + 1, kingY - 1) && board[kingY - 1][kingX + 1].piece == 'pawn' && board[kingY - 1][kingX + 1].color != c);
    } else {
        return (inBounds(kingX + 1, kingY - 1) && board[kingY - 1][kingX + 1].piece == 'pawn' && board[kingY - 1][kingX + 1].color != c) ||
               (inBounds(kingX + 1, kingY + 1) && board[kingY + 1][kingX + 1].piece == 'pawn' && board[kingY + 1][kingX + 1].color != c);
    }
}


function inCheck(kingX, kingY, board) {
    return inCheckHorizontal(kingX, kingY, board) || 
           inCheckDiagonal(kingX, kingY, board) ||
           inCheckKnight(kingX, kingY, board) ||
           inCheckPawn(kingX, kingY, board);
}

function isPawnMove(fromX, fromY, toX, toY, color) {
    if(board[toY][toX] == EM){
        if(color == "white") {
            if((fromX == toX) && (fromY == toY + 1) || ((fromY == toY + 2) && (fromX == toX) && fromY == 6)) {
                if(toY == 0) {
                    isPromotion = true;
                }
                return true;
            } else if(lastMove.piece == 'pawn' && lastMove.color == 'black' && Math.abs(lastMove.fromY - lastMove.toY) == 2 && lastMove.toX == toX && lastMove.toY == toY + 1) {
                isEnPassant = true;
                return true;
            }
        } else {
            if((fromX == toX) && (fromY == toY - 1) || ((fromY == toY - 2) && (fromX == toX) && fromY == 1)) {
                if(toY == 7) {
                    isPromotion = true;
                }
                return true;
            } else if (lastMove.piece == 'pawn' && lastMove.color == 'white' && Math.abs(lastMove.fromY - lastMove.toY) == 2 && lastMove.toX == toX && lastMove.toY == toY - 1) {
                isEnPassant = true;
                return true;
            }
        }
    } else {
        if(board[toY][toX].color != color) {
            if(color == "white") {    
                if((fromY == toY + 1) && (Math.abs(fromX - toX) == 1)) {
                    if(toY == 0) {
                        isPromotion = true;
                    }       
                    return true;
                }
            } else {
                if((fromY == toY - 1) && (Math.abs(fromX - toX) == 1)) {
                    if(toY == 7) {
                        isPromotion = true;
                    }
                    return true;
                }
            }

            return false;
        }
    }
}

function isShortCastle(fromX, fromY, toX, toY) {
    if (board[fromY][fromX].color == "white"){
        return !whiteKingMoved && !whiteHasCastled && fromX == 4 && fromY == 7 && toX == 6 && toY == 7 && board[7][7].piece == "rook";
    } else {
        return !blackHasCastled && fromX == 4 && fromY == 0 && toX == 6 && toY == 0 && board[7][0].piece == "rook";
    }
}

function isLongCastle(fromX, fromY, toX, toY) {
    if (board[fromY][fromX].color == "white"){
        return !whiteHasCastled && fromX == 4 && fromY == 7 && toX == 2 && toY == 7 && board[0][7].piece == "rook";
    } else {
        return !blackKingMoved && !blackHasCastled && fromX == 4 && fromY == 0 && toX == 2 && toY == 0 && board[0][0].piece == "rook";
    }
}

function legalMove(fromX, fromY, toX, toY, piece, color) {
    let isLegal = false, isInCheck = false, kingX, kingY;

    if(isInTurn(color) && isMoving(fromX, fromY, toX, toY)) {
        switch(piece) {
            case "pawn":
                isLegal = isPawnMove(fromX, fromY, toX, toY, color) && !isBlocked(fromX, fromY, toX, toY, piece, color, 'horizontal');
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
                isLegal = (isKingMove(fromX, fromY, toX, toY) && !isBlocked(fromX, fromY, toX, toY, piece, color, '')) ||
                          isShortCastle(fromX, fromY, toX, toY) && !isBlocked(fromX, fromY, toX, toY, piece, color, 'horizontal') || 
                          isLongCastle(fromX, fromY, toX, toY) && !isBlocked(fromX, fromY, toX, toY, piece, color, 'horizontal');
                break;
        }   
        
        if(turn == 'white') {
            kingX = whiteKingPos.x;
            kingY = whiteKingPos.y;
        } else {
            kingX = blackKingPos.x;
            kingY = blackKingPos.y;
        }

        const oldBoard = JSON.parse(JSON.stringify(board));
        commitMove(fromX, fromY, toX, toY, oldBoard); 
        isInCheck = inCheck(kingX, kingY, oldBoard);
    }

    return isLegal && !isInCheck;
}

function movePiece(fromX, fromY, toX, toY) {
    if(legalMove(fromX, fromY, toX, toY, board[fromY][fromX].piece, board[fromY][fromX].color)) {
        commitMove(fromX, fromY, toX, toY, board);

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
    whiteHasCastled = false;
    blackHasCastled = false;
    whiteKingMoved = false;
    blackKingMoved = false;
    isEnPassant = false;
    isPromotion = false;
    lastMove = {
        fromX: 0,
        fromY: 0,
        toX: 0,
        toY: 0,
        piece: '',
        color: '' 
    }
}

init();
