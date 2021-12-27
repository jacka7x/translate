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
    const src = chrome.runtime.getURL('/content_scripts/word-selection.js');
    const contentScript = yield import(src);
    wordSelect = contentScript.wordSelectionImport;
    if (!wordSelect) {
        throw new Error(`wordSelect type: ${typeof wordSelect}`);
    }
}))();
let wordSelect = undefined;
const getCurrentMousePosition = (event) => {
    return [event.clientX, event.clientY];
};
document.addEventListener("click", (event) => {
    console.assert(wordSelect, `wordSelect type: ${typeof wordSelect}`);
    try {
        if (!wordSelect) {
            throw new Error(`wordSelect type: ${typeof wordSelect}`);
        }
        else {
            wordSelect(getCurrentMousePosition(event));
        }
    }
    catch (error) {
        console.error(error);
    }
});
export {};
