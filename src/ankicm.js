import { COLOR, INPUT_EVENT_TYPE, Chessboard, BORDER_TYPE } from "../cm-chessboard/src/Chessboard";
import { MARKER_TYPE, Markers } from "../cm-chessboard/src/extensions/markers/Markers.js";
import {PROMOTION_DIALOG_RESULT_TYPE, PromotionDialog} from "../cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js";
import {Accessibility} from "../cm-chessboard/src/extensions/accessibility/Accessibility.js";
import {Chess} from "../chess.js/src/chess.js";


function send_to_terminal(m) {
    var myterminal=document.getElementById("myterminal");
    var mymessage=document.createElement("div");
    mymessage.appendChild(document.createTextNode(m));
    myterminal.appendChild(mymessage);
}

(function(){
    var oldError = console.error;
    var oldWarn = console.warn;
    var oldLog = console.log;

    window.onerror = function(message, source, lineno, colno, error) {
        send_to_terminal(message);
    };

    console.error = function(message) {
        send_to_terminal(message);
        oldError.apply(console, arguments);
    }

    console.warn = function(message) {
        send_to_terminal(message);
        oldWarn.apply(console, arguments);
    }

    console.log = function(message) {
        send_to_terminal(message);
        oldLog.apply(console, arguments);
    }
})();

let boards = document.getElementsByClassName("cm-board");

for (element of boards) {
    createBoard(element);
}


function createBoard(element) {
    var fen = element.textContent.trim();
    // Remove FEN string from page.
    element.innerHTML = "";

    let board = new Chessboard(element, {
        assetsUrl: "./",
        position: fen,
        orientation: boardOrientation(element, fen),
        style: { pieces: { file: "_ankicm-standard.svg", } },
        extensions: [
            {class: Markers, props: {autoMarkers: MARKER_TYPE.square,
                                     sprite: "_ankicm-markers.svg"}},
            {class: PromotionDialog},
            {class: Accessibility, props: {visuallyHidden: true}}
        ]
    });
}

function boardOrientation(element, fen) {
    let override = element.dataset.orientation || 'auto';

    switch (override) {
    case "white":
        return COLOR.white;
    case "black":
        return COLOR.black;
    case "auto":
        const fenRegex = /(w|b) [kKqQ-]* [a-z0-9-] \d+ \d+$/;
        let match = fen.match(fenRegex);

        if (match[1] == "w") {
            return COLOR.white;
        } else if (match[1] == "b") {
            return COLOR.black;
        } else {
            new Error("FEN does not specify whose turn it is in " + element);
        }
    default:
        new Error ("data-orientation must be either 'white', 'black' or 'auto'");
    }
}



    // import {INPUT_EVENT_TYPE, COLOR, Chessboard, BORDER_TYPE} from "../src/Chessboard.js"
    // import {MARKER_TYPE, Markers} from "../src/extensions/markers/Markers.js"
    // import {PROMOTION_DIALOG_RESULT_TYPE, PromotionDialog} from "../src/extensions/promotion-dialog/PromotionDialog.js"
    // import {Accessibility} from "../src/extensions/accessibility/Accessibility.js"
    // import {Chess} from "https://cdn.jsdelivr.net/npm/chess.mjs@1/src/chess.mjs/Chess.js"

    const chess = new Chess()

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

    const board = new Chessboard(document.getElementById("myboard"), {
        position: chess.fen(),
        assetsUrl: "./",
        style: {borderType: BORDER_TYPE.none, pieces: {file: "_ankicm-staunty.svg"}, animationDuration: 300},
        orientation: COLOR.white,
        extensions: [
            {class: Markers, props: {autoMarkers: MARKER_TYPE.square}},
            {class: PromotionDialog},
            {class: Accessibility, props: {visuallyHidden: true}}
        ]
    })
    board.enableMoveInput(inputHandler, COLOR.white)


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
