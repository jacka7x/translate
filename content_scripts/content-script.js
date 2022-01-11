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
let timeout;
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
        const translationJS = yield import(chrome.runtime.getURL('../ext_modules/translation.js'));
        translate = translationJS.translate;
        if (!translate)
            throw new Error('Translate not found. Possible import failure.');
        // word-selection.js
        const wordSelectionJS = yield import(chrome.runtime.getURL('../ext_modules/word-selection.js'));
        selectWordAtCursor = wordSelectionJS.selectWordAtCursor;
        if (!selectWordAtCursor)
            throw new Error('wordSelect not found. Possible import failure');
        // get inital isActiveSession_local value, set to activeSession
        const response = yield chrome.storage.local.get(['isActiveSession_local']);
        const sessionResponse = response['isActiveSession_local'];
        if ([true, false].includes(sessionResponse))
            activeSession = sessionResponse;
        else
            throw new Error(`sesionResponse not found: ${sessionResponse}`);
    }
    catch (error) {
        console.error(error);
    }
}))();
// change activeSession here when storage is updated by popup
chrome.storage.onChanged.addListener(updateActiveSessionStatus);
// EL for hovering and clicking
document.addEventListener('mousemove', (event) => hoverEventTimeoutStart(event, hoverDelay));
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
    if (clickedElement.nodeName == 'SPAN' && clickedElement.classList.contains('selected')) {
        removeHilightFromWord(clickedElement);
    }
    else {
        hilightWord(event, clickedElement, 'clicked');
    }
}
function processHoverEvent(event) {
    if (!activeSession)
        return;
    // add options to turn on off??
    event.preventDefault();
    const hoveredElement = event.target;
    if (hoveredElement.nodeName == 'SPAN' && hoveredElement.classList.contains('selected')) {
        // stuff if there is already a click/hover span there
    }
    else {
        const wordAtCursor = selectWordAtCursor(event, hoveredElement);
        if (!wordAtCursor)
            return;
        console.log(wordAtCursor.word);
        hilightWord(event, hoveredElement, 'hovered');
        // maybe move this?
        // displayQuickTranslation(event, hoveredElement)
    }
}
// works using global 'timeout' variable
function hoverEventTimeoutStart(event, delay) {
    clearTimeout(timeout);
    timeout = setTimeout(() => processHoverEvent(event), delay);
}
function displayQuickTranslation(event, hoveredElement) {
    return __awaiter(this, void 0, void 0, function* () {
        const wordAtCursor = selectWordAtCursor(event, hoveredElement);
        if (!wordAtCursor)
            return;
        const text = wordAtCursor.word;
        const rects = wordAtCursor.rects;
        const translatedText = yield translate(text, fromLang, toLang);
        translationPopupBox(translatedText, rects);
        console.log(`DISPLAY TEST: ${translatedText}`);
    });
}
function hilightWord(event, elementAtCursor, hilight) {
    const wordAtCursor = selectWordAtCursor(event, elementAtCursor);
    if (!wordAtCursor)
        return;
    const { word: selectedWord, wordStartIndex: selectedStart, wordEndIndex: selectedEnd, nodes, nodeIndex } = wordAtCursor;
    console.log(`Word ${hilight}: ${selectedWord}`);
    const span = createSpanElement(selectedWord, hilight);
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
}
function removeHilightFromWord(elementAtCursor) {
    const textNode = document.createTextNode(elementAtCursor.innerText);
    const elementAtCursorParent = elementAtCursor.parentNode;
    // replace span with textNode and normalize
    elementAtCursorParent === null || elementAtCursorParent === void 0 ? void 0 : elementAtCursorParent.insertBefore(textNode, elementAtCursor);
    elementAtCursor.remove();
    elementAtCursorParent === null || elementAtCursorParent === void 0 ? void 0 : elementAtCursorParent.normalize();
}
function createSpanElement(selectedWord, hilight) {
    // create span
    const span = document.createElement("span");
    span.innerText = selectedWord;
    span.classList.add(`hilight-box-${hilight}`);
    // alter span based on clicked/hovered input
    if (hilight === 'clicked')
        span.classList.add('selected');
    if (hilight === 'hovered') {
        span.addEventListener('mouseout', () => {
            removeHilightFromWord(span);
        });
    }
    return span;
}
function translationPopupBox(text, rects) {
    var _a, _b;
    try {
        if (!rects[0])
            throw new Error('Failed to get rects for selected word');
        // make into function
        const div = document.createElement("div");
        div.classList.add('quick-translation-box');
        div.innerText = text ? text : "No Translation.";
        document.body.appendChild(div);
        const offset = parseInt(window.getComputedStyle(div).height);
        div.style.top = `${((_a = rects[0]) === null || _a === void 0 ? void 0 : _a.y) - offset}px`;
        div.style.left = `${(_b = rects[0]) === null || _b === void 0 ? void 0 : _b.x}px`;
    }
    catch (error) {
        console.error(error);
    }
}
