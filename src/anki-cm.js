import { COLOR, Chessboard, BORDER_TYPE } from "../cm-chessboard/src/Chessboard";
import {MARKER_TYPE, Markers} from "../cm-chessboard/src/extensions/markers/Markers.js";
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
        style: { pieces: { file: "_standard.svg", } },
        extensions: [
            {class: Markers, props: {autoMarkers: MARKER_TYPE.square}},
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
