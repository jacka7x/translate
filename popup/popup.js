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
HTMLElement.prototype.setActive = function (active) {
    active ? this.classList.add('active') : this.classList.remove('active');
};
// TOGGLE ACTIVE SESSION
const sessionInitButton = document.getElementById("session-init-button");
const setSessionActive = (active) => {
    chrome.storage.local.set({ isActiveSession_local: active });
};
const getSessionActive = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['isActiveSession_local'], function (res) {
            res.isActiveSession_local === undefined ?
                reject() : resolve(res.isActiveSession_local);
        });
    });
};
const activeSessionToggle = () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield getSessionActive();
    setSessionActive(!res);
    sessionInitButton.setActive(!res);
    sessionInitButton.innerHTML = `${yield getSessionActive()}`;
});
// run at start to set up button
const setupSessionInitButton = (function () {
    return __awaiter(this, void 0, void 0, function* () {
        sessionInitButton.addEventListener("click", () => activeSessionToggle());
        setSessionActive(false);
        sessionInitButton.innerHTML = `${yield getSessionActive()}`;
    });
})();
