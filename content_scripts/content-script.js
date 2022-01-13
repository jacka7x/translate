"use strict";
// INTERFACES ----------------||
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// GLOBAL VARIABLES ------------||
// set inital active session
let activeSession = false;
// for hover timeout function
const hoverDelay = 100;
// translation variables
let fromLang = 'en';
let toLang = 'ko';
// init functions to set by dynamic import
let selectWordAtCursor;
let translate;
// INITAL LOAD ------------------||
// dynamic import modules // event listeners //
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const translationJS = yield import(chrome.runtime.getURL('/ext_modules/translation.js'));
        translate = translationJS.translate;
        if (!translate)
            throw new Error('Translate not found. Possible import failure.');
        // word-selection.js
        const wordSelectionJS = yield import(chrome.runtime.getURL('/ext_modules/word-selection.js'));
        selectWordAtCursor = wordSelectionJS.selectWordAtCursor;
        if (!selectWordAtCursor)
            throw new Error('wordSelect not found. Possible import failure');
        // get inital isActiveSession_local value, set to activeSession
        const response = yield chrome.storage.local.get(['isActiveSession_local']);
        const sessionResponse = response['isActiveSession_local'];
        if ([true, false].includes(sessionResponse))
            activeSession = sessionResponse;
        else {
            // this may throw an error on first load, revisit how storage/options syncing should work
            chrome.storage.local.set({ 'isActiveSession_local': false }, () => {
                console.log('bingo');
            });
            throw new Error(`sesionResponse not found: ${sessionResponse}`);
        }
    }
    catch (error) {
        console.error(error);
    }
}))();
// change activeSession here when storage is updated by popup
chrome.storage.onChanged.addListener(updateActiveSessionStatus);
// EL for hovering and clicking
// CREATE / DELETE THESE AS ACTIVESESSION IS TOGGLED
document.addEventListener('mousemove', (event) => processHoverEvent(event));
document.addEventListener('click', (event) => processClickEvent(event));
// FUNCTIONS ------------||
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
    if (clickedElement.nodeName == 'SPAN' && clickedElement.classList.contains('highlight-box-clicked')) {
        removeHighlightFromWord(clickedElement, 'bingo_change this later');
    }
    else {
        highlightWord(event, clickedElement, 'clicked');
    }
}
function processHoverEvent(event) {
    if (!activeSession)
        return;
    // add options to turn on off??
    event.preventDefault();
    const hoveredElement = event.target;
    switch (checkSpan(hoveredElement)) {
        case 'clicked': return;
        case 'hovered': return;
        case false:
    }
    const wordAtCursor = selectWordAtCursor(event, hoveredElement);
    if (!wordAtCursor)
        return;
    // delay using gloabl hoverDelay variable
    const timeout = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
        // this should not run selectword again
        const span = highlightWord(event, hoveredElement, 'hovered');
        const translatedText = yield translate(wordAtCursor.word, fromLang, toLang);
        if (span)
            displayQuickTranslation(translatedText, span);
    }), hoverDelay);
    document.addEventListener('mousemove', () => {
        clearTimeout(timeout);
    });
}
function checkSpan(element) {
    if (element.nodeName !== 'SPAN')
        return false;
    else if (element.classList.contains(`highlight-box-hovered`))
        return 'hovered';
    else if (element.classList.contains(`highlight-box-clicked`))
        return 'clicked';
    return false;
}
function highlightWord(event, elementAtCursor, highlight) {
    const wordAtCursor = selectWordAtCursor(event, elementAtCursor);
    if (!wordAtCursor)
        return;
    const { word: selectedWord, wordStartIndex: selectedStart, wordEndIndex: selectedEnd, nodes, nodeIndex } = wordAtCursor;
    console.log(`Word ${highlight}: ${selectedWord}`);
    const span = createSpanElement(selectedWord, highlight);
    // split text node before and after selected word
    nodes[nodeIndex].splitText(selectedStart).splitText(selectedEnd - selectedStart);
    const nextNode = nodes[nodeIndex + 1];
    const nextNode_2 = nodes[nodeIndex + 2];
    if (!nextNode || !nextNode_2)
        throw new Error('Missing node.');
    // remove middle split node
    elementAtCursor.removeChild(nextNode);
    // append between remaining split nodes
    elementAtCursor.insertBefore(span, nextNode_2);
    return span;
}
function removeHighlightFromWord(elementAtCursor, selectedWord) {
    const textNode = document.createTextNode(selectedWord);
    const elementAtCursorParent = elementAtCursor.parentNode;
    // replace span with textNode and normalize
    try {
        if (!elementAtCursorParent) {
            throw new Error(`elementAtCursorParent not found. ${elementAtCursorParent}`);
        }
        elementAtCursorParent.insertBefore(textNode, elementAtCursor);
        elementAtCursor.remove();
        elementAtCursorParent.normalize();
    }
    catch (error) {
        console.error(error);
    }
}
function createSpanElement(selectedWord, highlight) {
    // create span
    const span = document.createElement("span");
    span.innerText = selectedWord;
    span.classList.add(`highlight-box-${highlight}`);
    if (highlight === 'clicked')
        console.log('put a fuction here');
    if (highlight === 'hovered') {
        span.addEventListener('mouseout', () => {
            removeHighlightFromWord(span, selectedWord);
        });
    }
    return span;
}
function displayQuickTranslation(translatedText, span) {
    return __awaiter(this, void 0, void 0, function* () {
        const div = document.createElement("div");
        div.classList.add('quick-translation-box');
        div.innerText = translatedText ? translatedText : 'No translation.';
        span.appendChild(div);
        console.log(`DISPLAY TEST: ${translatedText}`);
    });
}
