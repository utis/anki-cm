import { COLOR, Chessboard, BORDER_TYPE, FEN } from "../lib/cm-chessboard/src/Chessboard";
import { MARKER_TYPE, Markers } from "../lib/cm-chessboard/src/extensions/markers/Markers.js";
import { Accessibility } from "../lib/cm-chessboard/src/extensions/accessibility/Accessibility.js";
import { PROMOTION_DIALOG_RESULT_TYPE, PromotionDialog } from "../lib/cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js";

import AnkiQuery from "./queryboard.js";

export default function cmStart() {
    let boards = document.getElementsByClassName("cm-board");

    for (element of boards) {
       createBoard(element);
    }
}


var myboards;

const defaultBoardProps = {
    assetsUrl: "./", // No subdirs on Anki on iPhone.
    style: {
        borderType: BORDER_TYPE.none,
        pieces: { file: "_ankicm-standard.svg" }, // There's also _ankicm-staunty.svg
        // animationDuration: 300,
    },
};

const defaultBoardExtensions = [
    { class: Markers, props: { autoMarkers: MARKER_TYPE.square,
                               sprite: "_ankicm-markers.svg"
                             }},
    { class: PromotionDialog },
    { class: Accessibility, props: { visuallyHidden: true }}
];


const interactiveBoardExtensions = [ 
    { class: AnkiQuery },
    ...defaultBoardExtensions 
];


function createBoard(element) {
    const fen =
          (element.textContent.trim() != "")
          ? element.textContent.trim()
          : false // FIXME: Sensible default?
    ;
    
    const orientation = boardOrientation(element, fen);
    const type = element.dataset.type || 'simple';

    const extensions =
        (element.dataset.type == 'query')
        ? interactiveBoardExtensions
        : defaultBoardExtensions
    ;

    const board = new Chessboard(element, {
            position: fen,
            orientation: orientation,
            extensions: extensions,
            ...defaultBoardProps,
    });

    return board;
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

window.onload = cmStart()
