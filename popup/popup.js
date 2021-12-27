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
class DOMWrapper {
    constructor(id) {
        this.element = document.getElementById(id);
    }
    setActive(active) {
        active ?
            this.element.classList.add('active') :
            this.element.classList.remove('active');
    }
}
// adds the setActive method to HTMLELement's prototype
// Object.defineProperty(HTMLElement.prototype, 'setActive', {
//     value: function(active: HTMLElement): void {
//         active ? 
//             this.classList.add('active') :
//             this.classList.remove('active')
//     }
// })
const sessionInitButton = new DOMWrapper("session-init-button");
console.log(sessionInitButton);
const setSessionActive = (active) => {
    chrome.storage.local.set({ isActiveSession_local: active });
};
const getSessionActive = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['isActiveSession_local'], (res) => {
            res['isActiveSession_local'] === undefined ?
                reject() : resolve(res['isActiveSession_local']);
        });
    });
};
const activeSessionToggle = () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield getSessionActive();
    try {
        if (sessionInitButton.element) {
            setSessionActive(!res);
            sessionInitButton.setActive(!res);
            sessionInitButton.element.innerHTML = `${yield getSessionActive()}`;
        }
        else {
            throw new Error(`sessionInitButton is type ${typeof sessionInitButton}`);
        }
    }
    catch (error) {
        console.log(error);
    }
});
// run at start to set up button
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (sessionInitButton.element) {
                sessionInitButton.element.addEventListener("click", () => activeSessionToggle());
                setSessionActive(false);
                sessionInitButton.element.innerHTML = `${yield getSessionActive()}`;
            }
            else {
                throw new Error(`sessionInitButton is type ${typeof sessionInitButton}`);
            }
        }
        catch (error) {
            console.log(error);
        }
    });
})();
