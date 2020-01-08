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

let clicks = 0;
let lastClick = {
    x: 0,
    y: 0
};

let board = [];

function inBounds(x, y) {
    return x >= 0 && y >= 0
        && x < COLS && y < ROWS;
}


// function threatenedSquares(x, y) {
//     if (board[y][x] != EM) {
//         switch(board[y][x].piece) {
//             case "pawn":
//                 if ()
//         }
//     }
// }

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

// function pawnIsInStartingPosition(x, y) {
//     if(board[y][x].color == "white") {
//         return y == 6;
//     } else {
//         return y == 1;
//     }
// }

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

function legalMove(fromX, fromY, toX, toY) {
    let isLegal = false;

    console.log(fromX, fromY)
    console.log(toX, toY)

    if (turn == board[fromY][fromX].color && (fromX != toX || fromY != toY) && (board[fromY][fromX].color != board[toY][toX].color)) {
        switch(board[fromY][fromX].piece) {
            case "pawn":
                if(board[toY][toX] == EM){
                    if(board[fromY][fromX].color == "white") {
                        isLegal = (fromX == toX) && (fromY == toY + 1) || ((fromY == toY + 2) && (fromX == toX) && fromY == 6);
                    } else {
                        isLegal = (fromX == toX) && (fromY == toY - 1) || ((fromY == toY - 2) && (fromX == toX) && fromY == 1);
                    }
                } else {
                    if(board[toY][toX].color != board[fromY][fromX].color) {
                        if(board[fromY][fromX].color == "white") {           
                            isLegal = (fromY == toY + 1) && (Math.abs(fromX - toX) == 1)
                        } else {
                            isLegal = (fromY == toY - 1) && (Math.abs(fromX - toX) == 1)
                        }
                    }
                }
                break;
            case "bishop":
                isLegal = (Math.abs(fromX - toX) == Math.abs(fromY - toY));
                break;
            case "knight":
                isLegal = ((Math.abs(fromX - toX) == 2 && Math.abs(fromY - toY) == 1) || (Math.abs(fromY - toY) == 2 && Math.abs(fromX - toX) == 1));
                break;
            case "rook":
                isLegal = (fromX == toX || fromY == toY);
                break;
            case "queen":
                isLegal = (Math.abs(fromX - toX) == Math.abs(fromY - toY)) || (fromX == toX || fromY == toY);
                break;
            case "king":
                isLegal = (Math.abs(fromX - toX) <= 1 && Math.abs(fromY - toY) <= 1) || canLongCastle(fromX, fromY, toX, toY) || canShortCastle(fromX, fromY, toX, toY);
                break;
        }   
    }

    return isLegal;
}

function movePiece(x, y) {
    modelCoords = viewToModel(x, y);
    
    if (clicks == 1) {
        if (legalMove(lastClick.x, lastClick.y, modelCoords.x, modelCoords.y)){
            board[modelCoords.y][modelCoords.x] = board[lastClick.y][lastClick.x];
            board[lastClick.y][lastClick.x] = EM;
            
            if (turn == "white") {
                turn = "black";
            } else {
                turn = "white";
            }
        } else {

        }
    } else {
        lastClick = modelCoords;
    }
    
    clicks = (clicks + 1) % 2;
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
