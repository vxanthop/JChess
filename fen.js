let fen = {
    piecePLacement: '',
    activeColor: '',
    castlingFlags: '',
    enPassant: '',
    halfmoveClock: '',
    fullMoveNumber: ''
};

//uses board, castling flags, halfmoves and 
function generateFen() {
    let empty, rowString;
    fen = {
        piecePlacement: '',
        activeColor: '',
        castlingFlags: '',
        enPassant: '',
        halfmoveClock: '',
        fullMoveNumber: ''
    };


    for(let y = 0; y < ROWS; y++) {
        rowString = '';
        empty = 0;
        for(let x = 0; x < COLS; x++) {
            if(board[y][x] == EM) {
                empty++;
            } else {
                if(empty > 0) {
                    rowString += empty;
                    empty = 0;
                }

                let color = board[y][x].color,
                    type = board[y][x].type;
                
                let c = 'P';
                if(type != 'pawn') {
                    c = pieceToAlgebraic[type];
                }

                rowString += color == 'white' ? c : c.toLowerCase();
            }
        }

        if(empty > 0) {
            rowString += empty;
        }

        fen.piecePlacement += rowString; 
        if(y != 7) { 
            fen.piecePlacement += '/';
        }
    }

    fen.activeColor = turn.charAt(0);

    if(whiteCanShortCastle) {
        fen.castlingFlags += 'K';
    }

    if(whiteCanLongCastle) {
        fen.castlingFlags += 'Q';
    }

    if(whiteCanShortCastle) {
        fen.castlingFlags += 'k';
    }

    if(whiteCanLongCastle) {
        fen.castlingFlags += 'q';
    }

    if(epSquare.x == -1 && epSquare.y == -1) {
        fen.enPassant = '-';
    } else {
        fen.enPassant += squareToAlgebraic[epSquare.y][epSquare.x];
    }

    fen.fullMoveNumber = Math.floor(moveNumber / 2);
    fen.halfmoveClock = halfMoves;

    return [fen.piecePlacement, fen.activeColor, fen.castlingFlags, fen.enPassant, fen.halfmoveClock, fen.fullMoveNumber].join(' ');
}

// function importFen() {

// }