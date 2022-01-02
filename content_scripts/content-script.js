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
        document.addEventListener('click', (event) => processClickEvent(event));
    }
}))();
let selectWordAtCursor;
let activeSession = false;
chrome.storage.onChanged.addListener(updateActiveSessionStatus);
function updateActiveSessionStatus(changes) {
    var _a;
    activeSession = (_a = changes['isActiveSession_local']) === null || _a === void 0 ? void 0 : _a['newValue'];
}
function processClickEvent(event) {
    if (!activeSession)
        return;
    event.preventDefault();
    // const cursorPosition: MouseCoordinates = getCurrentMousePosition(event)
    const clickedElement = event.target;
    if (clickedElement.nodeName == 'SPAN' && clickedElement.classList.contains('selected')) {
        removeHilightFromWord(clickedElement);
    }
    else {
        hilightWord(event, clickedElement);
    }
}
function hilightWord(event, clickedElement) {
    if (!selectWordAtCursor)
        throw new Error("selectWordAtCurson not found");
    const wordAtCursor = selectWordAtCursor(event, clickedElement);
    const { word: selectedWord, wordStartIndex: selectedStart, wordEndIndex: selectedEnd, nodes, nodeIndex } = wordAtCursor;
    console.log(`Selected word: ${selectedWord}`);
    const span = createSpanElement(selectedWord);
    // split text node before and after selected word
    nodes[nodeIndex].splitText(selectedStart).splitText(selectedEnd - selectedStart);
    const nextNode = nodes[nodeIndex + 1];
    const nextNode_2 = nodes[nodeIndex + 2];
    if (!nextNode || !nextNode_2)
        throw new Error('Missing node.');
    // remove middle split node
    clickedElement.removeChild(nextNode);
    // append between remaining split nodes
    clickedElement.insertBefore(span, nextNode_2);
}
function removeHilightFromWord(clickedElement) {
    const textNode = document.createTextNode(clickedElement.innerText);
    const clickedElementParent = clickedElement.parentNode;
    // replace span with textNode and normalize
    clickedElementParent === null || clickedElementParent === void 0 ? void 0 : clickedElementParent.insertBefore(textNode, clickedElement);
    clickedElement.remove();
    clickedElementParent === null || clickedElementParent === void 0 ? void 0 : clickedElementParent.normalize();
}
function createSpanElement(selectedWord) {
    const span = document.createElement("span");
    span.classList.add('selected');
    span.innerText = selectedWord;
    span.style.color = "red";
    span.style.backgroundColor = "yellow";
    return span;
}
