//player config
class Piece {
    isKing: boolean;
    isBlack: boolean;

    constructor(isKing: boolean, isBlack: boolean) {
        this.isKing = isKing;
        this.isBlack = isBlack;
    }
}
//action config
class Move {
    startX: number;
    startY: number;
    endX: number;
    endY: number;

    constructor(startX: number, startY: number, endX: number, endY: number) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
    }
}
class CheckersGame {
    //arena config
    board: Piece[][];
    isBlackTurn: boolean;
    //activate gameplay
    constructor() {
        this.board = Array.from({ length: 8 }, () => Array(8).fill(null));
        this.initializeBoard();
        this.isBlackTurn = true; // Black moves first
    }
        initializeBoard() {
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    if (i < 3 && (i + j) % 2 === 1) {
                        this.board[i][j] = new Piece(false, true);
                    } else if (i > 4 && (i + j) % 2 === 1) {
                        this.board[i][j] = new Piece(false, false);
                    } else {
                        this.board[i][j] = new Piece(false, false);
                    }
                }
            }
        }
    //action
    makeMove(move: Move) {
        if (this.validateMove(move)) {
            this.executeMove(move);
            this.checkForKing(move);
            this.isBlackTurn = !this.isBlackTurn;
            this.checkWinCondition();
        } else {
            throw new Error("Invalid move");
        }
    }
        validateMove(move: Move): boolean {
            const piece = this.board[move.startX][move.startY];
            if (piece && piece.isBlack !== this.isBlackTurn) {
                return false;
            }
            // Add more validation logic here...
            return true;
        }
        executeMove(move: Move) {
            const piece = this.board[move.startX][move.startY];
            this.board[move.endX][move.endY] = piece;
            this.board[move.startX][move.startY] = new Piece(false, false);
            // Handle captures
            if (Math.abs(move.endX - move.startX) === 2) {
                const captureX = (move.startX + move.endX) / 2;
                const captureY = (move.startY + move.endY) / 2;
                this.board[captureX][captureY] = new Piece(false, false);
            }
        }
    //reaction
    checkForKing(move: Move) {
        const piece = this.board[move.endX][move.endY];
        if (piece && !piece.isKing && ((piece.isBlack && move.endX === 7) || (!piece.isBlack && move.endX === 0))) {
            piece.isKing = true;
        }
    }
    checkWinCondition() {
        // Implement win/draw condition checks...
    }
}