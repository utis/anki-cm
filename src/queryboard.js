import { COLOR, INPUT_EVENT_TYPE, Chessboard, BORDER_TYPE, FEN } from "../lib/cm-chessboard/src/Chessboard";
import { Chess } from "../lib/chess.js/src/chess.js";
import { MARKER_TYPE, Markers } from "../lib/cm-chessboard/src/extensions/markers/Markers.js";
import {Utils} from "../lib/cm-chessboard/src/lib/Utils.js"
import {Extension} from "../lib/cm-chessboard/src/model/Extension.js"
// import { Accessibility } from "../lib/cm-chessboard/src/extensions/accessibility/Accessibility.js";
import { PROMOTION_DIALOG_RESULT_TYPE, PromotionDialog } from "../lib/cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js";


// Technically, this is an extension. But the logic works better, if I
// treat this as its own MVC, with the board as the View. Therefore we
// hide the funcitonality of the Chessboard class behind AnkiView.

class AnkiGame {
    constructor(fen) {
        this.chess = new Chess(fen);
    }
    
    turn() {
        return this.chess.turn();
    }

    moves(square) {
        return this.chess.moves(square);
    }

    move(chessMove) {
        return this.chess.move(chessMove);
    }

    fen() {
        return this.chess.fen();
    }
}

class AnkiView {
    constructor(board, turn, nextMoveFunc) {
        this.board = board;
        this.enableMoveInput(inputHandler, turn);
    }

    enableMoveInput(turn) {
        this.board.enableMoveInput(inputHandler, turn);
    }

    disableMoveInput() {
        this.board.disableMoveInput();
    }

    displayMoves(moves) {
        for (const move of moves) { // draw dots on possible squares
            if (move.promotion && move.promotion !== "q") {
                continue
            }
            if (this.board.getPiece(move.to)) {
                this.board.addMarker(MARKER_TYPE.bevel, move.to)
            } else {
                this.board.addMarker(MARKER_TYPE.dot, move.to)
            }
        }
    }

    cleanUp() {
        this.board.removeMarkers(MARKER_TYPE.dot)
        this.board.removeMarkers(MARKER_TYPE.bevel)
    }

    update(fen) {
        this.board.state.moveInputProcess.then(() => {
            // wait for the move input process has finished
                this.board.setPosition(fen, true).then(() => {
                    // update position, maybe castled and wait for animation has finished
                })
            })
    }

    promotionDialog(toSquare, color, callback) {
        this.board.showPromotionDialog(toSquare, color, callback);
    }
}


export default class AnkiQuery extends Extension {
    constructor(chessboard, props={}) {
        super(chessboard, props);
        chessboard.props.chessgame = this; // For finding this from the input handler.
        console.log(chessboard.props.position);
        this.game = new AnkiGame(chessboard.props.position);
        this.view = new AnkiView(chessboard, this.game.turn());
        this.nextMoveFunction = this.makeRandomMove;
    }

    
    moveStartedAction(from) {
        const moves = this.game.moves({square: from, verbose: true});
        this.view.displayMoves(moves);
        return moves.length > 0
    }


    notMoveFinishedAction() {
        this.view.cleanUp();
    }


    validateMoveAction(fromSquare, toSquare, promotion) {
        const move = {from: fromSquare, to: toSquare, promotion: promotion}
        const result = this.game.move(move)
        console.log("here1");

        if (result) {
            this.view.update(this.game.fen());
            this.nextMoveFunction();
        } else {
            // console.log("--> What else?");
            // promotion?
            // let possibleMoves = this.game.moves({square: event.squareFrom, verbose: true})
            // for (const possibleMove of possibleMoves) {
            //     if (possibleMove.promotion && possibleMove.to === toSquare) {
            //         this.view.promotionDialog(toSquare, COLOR, (result) => {
            //             console.log(result);
            //             console.log("promotion result", result)
            //             if (result.type === PROMOTION_DIALOG_RESULT_TYPE.pieceSelected) {
            //                 chess.move({from: event.squareFrom, to: event.squareTo, promotion: result.piece.charAt(1)})
            //                 event.chessboard.setPosition(chess.fen(), true)
            //                 makeEngineMove(event.chessboard)
            //             } else {
            //                 // promotion canceled
            //                 event.chessboard.enableMoveInput(inputHandler, COLOR.white)
            //                 event.chessboard.setPosition(chess.fen(), true)
            //             }
            //         })
            //         return true
            //     }
            // }
        }
        return result

    }

    moveInputFinishedAction(legalMove) {
        if(legalMove) {
            this.view.disableMoveInput()
        }
    }

    makeRandomMove() {
        let seed = 71;
        function random() {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        }

        const possibleMoves = this.game.chess.moves({verbose: true})
        if (possibleMoves.length > 0) {
            const randomIndex = Math.floor(random() * possibleMoves.length)
            const randomMove = possibleMoves[randomIndex]
            setTimeout(() => { // smoother with 500ms delay
                this.game.move({from: randomMove.from, to: randomMove.to});
                this.view.update;
                // chessboard.setPosition(chess.fen(), true)
                this.view.enableMoveInput(this.game.turn());
            }, 500)
        }
    }
}


// Shamelessly copied and refactored from cm-chessboard's website.
function inputHandler(event) {
    console.log("inputHandler", event)
    const game = event.chessboard.props.chessgame;
    chess = game.chess;
    // console.log(game);
    // const game = game.game;

    if(event.type === INPUT_EVENT_TYPE.movingOverSquare) {
        // console.log("--> Moving over square");
        return // ignore this event
    }
    if(event.type !== INPUT_EVENT_TYPE.moveInputFinished) {
        // console.log("--> Move input finished");
        game.notMoveFinishedAction();
    }
    if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
        // console.log("--> Move input started");
        return game.moveStartedAction(event.squareFrom);

    } else if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
        // console.log("--> Validate move input");
        return game.validateMoveAction(event.squareFrom, event.squareTo, event.promotion);
    } else if (event.type === INPUT_EVENT_TYPE.moveInputFinished) {
        // console.log("--> Move input finished.");
        game.moveInputFinishedAction(event.legalMove);
    }
}


