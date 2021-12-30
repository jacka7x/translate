"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// dynamic import word-selection.js
(() => __awaiter(void 0, void 0, void 0, function* () {
    const wordSelectionJS = chrome.runtime.getURL('/content_scripts/word-selection.js');
    const contentScript = yield import(wordSelectionJS);
    selectWordAtCursor = contentScript.wordSelectionImport;
    if (!selectWordAtCursor) {
        throw new Error(`wordSelect not found. Possible import failure`);
    }
    else {
        document.addEventListener("click", (event) => hilightWord(event));
    }
}))();
// remove any--------------------->
let selectWordAtCursor = undefined;
function hilightWord(event) {
    const wordAtCursor = selectWordAtCursor(event);
    if (!wordAtCursor)
        return null;
    const selectedWord = wordAtCursor.word;
    const selectedStart = wordAtCursor.wordStartIndex;
    const selectedEnd = wordAtCursor.wordEndIndex;
    const clickedElement = wordAtCursor.clickedElement;
    const nodes = wordAtCursor.nodes;
    const nodeIndex = wordAtCursor.nodeIndex;
    console.log(`Selected word: ${selectedWord}`);
    // create span element
    const mySpan = document.createElement("span");
    mySpan.classList.add('selected');
    mySpan.innerText = selectedWord;
    mySpan.style.color = "red";
    mySpan.style.backgroundColor = "yellow";
    // split text node before and after selected word and delete middle node
    nodes[nodeIndex].splitText(selectedStart).splitText(selectedEnd - selectedStart);
    const nextNode = nodes[nodeIndex + 1];
    const nextNode_2 = nodes[nodeIndex + 2];
    if (!nextNode || !nextNode_2)
        throw new Error('Missing node.');
    const nextNodeParent = nextNode.parentNode;
    if (!nextNodeParent)
        throw new Error('Missing parent of node.');
    nextNodeParent.removeChild(nextNode);
    // append at position
    clickedElement.insertBefore(mySpan, nextNode_2);
}
