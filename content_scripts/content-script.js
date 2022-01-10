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
// dynamic import modules
(() => __awaiter(void 0, void 0, void 0, function* () {
    const translationJS = yield import(chrome.runtime.getURL('../modules/translation.js'));
    translate = translationJS.translate;
    // check this and change?
    const wordSelectionJS = yield import(chrome.runtime.getURL('../modules/word-selection.js'));
    selectWordAtCursor = wordSelectionJS.wordSelectionImport;
    if (!selectWordAtCursor) {
        throw new Error(`wordSelect not found. Possible import failure`);
    }
    else {
        document.addEventListener('click', (event) => processClickEvent(event));
    }
}))();
// init functions to set by dynamic import
let selectWordAtCursor;
let translate;
// set inital active session / get if there is a setting already
let activeSession = false;
new Promise((resolve, reject) => {
    chrome.storage.local.get(['isActiveSession_local'], (response) => {
        !response['isActiveSession_local'] ?
            reject() : resolve(response['isActiveSession_local']);
    });
}).then((response) => { if (response === (true || false))
    activeSession = response; })
    .catch((response) => { throw new Error(`Wrong isActiveSession_local response: ${response}`); });
// change activeSession here when storage is updated by popup
chrome.storage.onChanged.addListener(updateActiveSessionStatus);
function updateActiveSessionStatus(changes) {
    var _a;
    activeSession = (_a = changes['isActiveSession_local']) === null || _a === void 0 ? void 0 : _a['newValue'];
}
function processClickEvent(event) {
    if (!activeSession)
        return;
    // add to options (turn on/off)
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
    if (!wordAtCursor)
        return;
    const { word: selectedWord, wordStartIndex: selectedStart, wordEndIndex: selectedEnd, nodes, nodeIndex } = wordAtCursor;
    // put here temp for testing
    try {
        translate(selectedWord, 'en', 'ko');
    }
    catch (e) {
        console.log(e);
    }
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
