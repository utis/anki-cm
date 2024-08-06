import { COLOR, INPUT_EVENT_TYPE, Chessboard } from "../lib/cm-chessboard/src/Chessboard";
import { Chess } from "../lib/chess.js/src/chess.js";

import { Extension } from "cm-chessboard/src/model/Extension.js"
import { Observed } from "cm-web-modules/src/observed/Observed.js"


export class Playfield extends Extension {

    constructor(chessboard, props = {}) {
        super(chessboard)
        this.props = {
            playerColor: COLOR.white,
            player: undefined,
            opponent: undefined
        }
        Object.assign(this.props, props)
        this.state = new Observed({
            chess: new Chess(chessboard.props.position),
            moveShown: null,
            player: new this.props.player.type(this, this.props.player.name, this.props.player.props),
            opponent: new this.props.opponent.type(this, this.props.opponent.name, this.props.opponent.props)
        })
        this.state.addObserver(() => {
            this.chessboard.setPosition(this.state.moveShown.fen, true)
        }, ["moveShown"])
        this.nextMove()
    }

    playerToMove() {
        return this.state.chess.turn() === this.props.playerColor ? this.state.player : this.state.opponent
    }

    nextMove() {
        const playerToMove = this.playerToMove()
        if (playerToMove) {
            playerToMove.moveRequest(this.handleMoveResponse.bind(this))
        }
    }

    handleMoveResponse(move) {
        const moveResult = this.state.chess.move(move)
        if (!moveResult) {
            console.error("illegalMove", this.state.chess, move)
            return moveResult
        }
        if (this.state.moveShown === this.state.chess.lastMove().previous) {
            this.state.moveShown = this.state.chess.lastMove()
        }
        if (!this.state.chess.gameOver()) {
            this.nextMove()
        }
        return moveResult
    }

}


// let seed = 71;
// function random() {
//     const x = Math.sin(seed++) * 10000;
//     return x - Math.floor(x);
// }
// function makeEngineMove(chessboard) {
//     const possibleMoves = chess.moves({verbose: true})
//     if (possibleMoves.length > 0) {
//         const randomIndex = Math.floor(random() * possibleMoves.length)
//         const randomMove = possibleMoves[randomIndex]
//         setTimeout(() => { // smoother with 500ms delay
//             chess.move({from: randomMove.from, to: randomMove.to})
//             chessboard.setPosition(chess.fen(), true)
//             chessboard.enableMoveInput(inputHandler, COLOR.white)
//         }, 500)
//     }
// }


// const chess = new Chess()

// function makeEngineMove(chessboard) {
//     if (chessboard.state.inputWhiteEnabled) {
//         chessboard.enableMoveInput(inputHandler, COLOR.black)
//     } else {
//         chessboard.enableMoveInput(inputHandler, COLOR.white)
//     }
// }





// new Chessboard(document.getElementById("board"), {
//     assetsUrl: "./assets/",
//     position: "rn2k1r1/ppp1pp1p/3p2p1/5bn1/P7/2N2B2/1PPPPP2/2BNK1RR w Gkq - 4 11",
// });

//             chessboard.setPosition(chess.fen(), true)
//             chessboard.enableMoveInput(inputHandler, COLOR.white)
//         }, 500)
//     }
// }

// Shamelessly copied from cm-chessboard's website.
function inputHandler(event) {
    console.log("inputHandler", event)
    if(event.type === INPUT_EVENT_TYPE.movingOverSquare) {
        return // ignore this event
    }
    if(event.type !== INPUT_EVENT_TYPE.moveInputFinished) {
        event.chessboard.removeMarkers(MARKER_TYPE.dot)
        event.chessboard.removeMarkers(MARKER_TYPE.bevel)
    }
    if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
        const moves = chess.moves({square: event.squareFrom, verbose: true})
        for (const move of moves) { // draw dots on possible squares
            if (move.promotion && move.promotion !== "q") {
                continue
            }
            if (event.chessboard.getPiece(move.to)) {
                event.chessboard.addMarker(MARKER_TYPE.bevel, move.to)
            } else {
                event.chessboard.addMarker(MARKER_TYPE.dot, move.to)
            }
        }
        return moves.length > 0
    } else if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
        const move = {from: event.squareFrom, to: event.squareTo, promotion: event.promotion}
        const result = chess.move(move)
        if (result) {
            event.chessboard.state.moveInputProcess.then(() => { // wait for the move input process has finished
                event.chessboard.setPosition(chess.fen(), true).then(() => { // update position, maybe castled and wait for animation has finished
                    makeEngineMove(event.chessboard)
                })
            })
        } else {
            // promotion?
            let possibleMoves = chess.moves({square: event.squareFrom, verbose: true})
            for (const possibleMove of possibleMoves) {
                if (possibleMove.promotion && possibleMove.to === event.squareTo) {
                    event.chessboard.showPromotionDialog(event.squareTo, COLOR.white, (result) => {
                        console.log("promotion result", result)
                        if (result.type === PROMOTION_DIALOG_RESULT_TYPE.pieceSelected) {
                            chess.move({from: event.squareFrom, to: event.squareTo, promotion: result.piece.charAt(1)})
                            event.chessboard.setPosition(chess.fen(), true)
                            makeEngineMove(event.chessboard)
                        } else {
                            // promotion canceled
                            event.chessboard.enableMoveInput(inputHandler, COLOR.white)
                            event.chessboard.setPosition(chess.fen(), true)
                        }
                    })
                    return true
                }
            }
        }
        return result
    } else if (event.type === INPUT_EVENT_TYPE.moveInputFinished) {
        if(event.legalMove) {
            event.chessboard.disableMoveInput()
        }
    }
}

// const board = new Chessboard(document.getElementById("myboard"), {
//     position: chess.fen(),
//     assetsUrl: "./",
//     style: {borderType: BORDER_TYPE.none, pieces: {file: "_ankicm-staunty.svg"}, animationDuration: 300},
//     orientation: COLOR.white,
//     extensions: [
//         {class: Markers, props: {autoMarkers: MARKER_TYPE.square}},
//         {class: PromotionDialog},
//         {class: Accessibility, props: {visuallyHidden: true}}
//     ]
// })
// board.enableMoveInput(inputHandler, COLOR.white)


// const board = new Chessboard(document.getElementById("myboard"), {
// //    position: chess.fen(),
//     position: "7k/1P6/8/b7/6r1/8/pp2PPPP/2R1KBNR w - - 0 1", // "4k3/1P6/8/8/6r1/8/pp2PPPP/2R1KBNR w K - 0 1",
//     assetsUrl: "./",
//     style: {borderType: BORDER_TYPE.none, pieces: {file: "_ankicm-staunty.svg"}, animationDuration: 300},
//     orientation: COLOR.white,
//         extensions: [
//             {
//                 class: Playfield, props: {
//                     player: {name: "Local Player", type: LocalPlayerWithPremoves},
//                     opponent: {name: "Random Player", type: RandomPlayer, props: {delay: 2000}}
//                 }
//             },
//             {class: PlayfieldMarkers},
//         ],
    // extensions: [
    //     // {class: Markers, props: {autoMarkers: MARKER_TYPE.square}},
    //     {class: Playfield},
    //     {class: PromotionDialog},
    //     {class: Accessibility, props: {visuallyHidden: true}}
    // ]
// })


// var myboard = new Chessboard(document.getElementById("test"), {
//     assetsUrl: "./",
//     position: "rn2k1r1/ppp1pp1p/3p2p1/5bn1/P7/2N2B2/1PPPPP2/2BNK1RR w Gkq - 4 11",
//     pieces: { file: "standard.svg" }
// })

// return this.chessboard.props.assetsUrl + this.chessboard.props.style.pieces.file;


// new Chessboard(document.getElementById("board"), {
//     assetsUrl: "./assets/",
//     position: "rn2k1r1/ppp1pp1p/3p2p1/5bn1/P7/2N2B2/1PPPPP2/2BNK1RR w Gkq - 4 11",
// });
