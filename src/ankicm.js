import { COLOR, Chessboard, BORDER_TYPE } from "../lib/cm-chessboard/src/Chessboard";
import { MARKER_TYPE, Markers } from "../lib/cm-chessboard/src/extensions/markers/Markers.js";
import { Accessibility } from "../lib/cm-chessboard/src/extensions/accessibility/Accessibility.js";
import { PROMOTION_DIALOG_RESULT_TYPE, PromotionDialog } from "../lib/cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js";


function cmStart() {
    let boards = document.getElementsByClassName("cm-board");

    for (element of boards) {
        createBoard(element);
    }
}

window.onload = cmStart()


function createBoard(element) {
    const fen = element.textContent.trim();
    const orientation = boardOrientation(element, fen);

    // Remove FEN string from page.
    element.innerHTML = "";
//    createSimpleBoard(element, fen, orientation);
     console.log(createSimpleBoard(element, fen, orientation));
}


const emptyFen = "8/8/8/8/8/8/8/8";


function createSimpleBoard(element,
                           fen=emptyFen,
                           orientation=false) {
    return new Chessboard(element, {
        assetsUrl: "./",
        position: fen,
        orientation: orientation || boardOrientation(element, fen),
        style: {
            borderType: BORDER_TYPE.none,
            pieces: { file: "_ankicm-standard.svg" },
            // animationDuration: 300,
        },
        extensions: [
            {class: Markers, props: {autoMarkers: MARKER_TYPE.square,
                                     sprite: "_ankicm-markers.svg"}},
            {class: PromotionDialog},
            {class: Accessibility, props: {visuallyHidden: true}}
        ],
    });
}


// function createInteractiveBoard(element, fen=false) {
//     const board = createSimpleBoard(element, fen);
//     console.log(board);
//     board.props.chessgame = fen ? new Chess(fen) : new Chess();

//     // board.enableMoveInput(inputHandler, COLOR.white)
//     return board;
// }


// const myboard = createInteractiveBoard(document.getElementById("myboard"));
// console.log(myboard);


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


