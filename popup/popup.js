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
// possible issue with DOM extension | also possible to do with web components
HTMLElement.prototype.setActive_HTMLElement = function (active) {
    active ?
        this.classList.add('active') :
        this.classList.remove('active');
};
const sessionInitButton = document.getElementById("session-init-button");
const setSessionActive = (active) => {
    chrome.storage.local.set({ isActiveSession_local: active });
};
const getSessionActive = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['isActiveSession_local'], (response) => {
            response['isActiveSession_local'] === undefined ?
                reject(undefined) : resolve(response['isActiveSession_local']);
        });
    });
};
const activeSessionToggle = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield getSessionActive();
    try {
        if (sessionInitButton) {
            setSessionActive(!response);
            sessionInitButton.setActive_HTMLElement(!response);
            sessionInitButton.innerText = `${yield getSessionActive()}`;
            console.log(response);
        }
        else {
            throw new Error(`sessionInitButton not found`);
        }
    }
    catch (error) {
        console.error(error);
    }
});
// run at start to set up button
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (sessionInitButton) {
                const response = yield getSessionActive();
                if (response === undefined)
                    setSessionActive(false);
                else {
                    sessionInitButton.setActive_HTMLElement(response);
                    sessionInitButton.innerText = `${response}!`;
                }
                sessionInitButton.addEventListener('click', activeSessionToggle);
            }
            else {
                throw new Error(`sessionInitButton is not found`);
            }
        }
        catch (error) {
            console.error(error);
        }
    });
})();
