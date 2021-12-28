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
        try {
            if (document.getElementById(id) !== null) {
                this.element = document.getElementById(id);
            }
            else {
                throw new Error(`Element with ID "${id}" does not exist. Failed to set element in DOMWrapper`);
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    get() {
        return this.element;
    }
    setActive(active) {
        active ?
            this.element.classList.add('active') :
            this.element.classList.remove('active');
    }
    innerHTML(html) {
        this.element.innerHTML = html;
    }
    addEventListener(event, callback) {
        this.element.addEventListener(event, () => callback);
    }
}
// adds the setActive method to HTMLELement's prototype
// could use insead of class wrapper
// interface HTMLElement{
//     element: HTMLElement
//     setActive: (value: boolean) => void
// }
// Object.defineProperty(HTMLElement.prototype, 'setActive', {
//     value: function(active: HTMLElement): void {
//         active ? 
//             this.classList.add('active') :
//             this.classList.remove('active')
//     }
// })
const sessionInitButton = new DOMWrapper("session-init-button");
const setSessionActive = (active) => {
    chrome.storage.local.set({ isActiveSession_local: active });
};
const getSessionActive = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['isActiveSession_local'], (response) => {
            response['isActiveSession_local'] === undefined ?
                reject() : resolve(response['isActiveSession_local']);
        });
    });
};
const activeSessionToggle = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield getSessionActive();
    try {
        if (sessionInitButton.get()) {
            setSessionActive(!response);
            sessionInitButton.setActive(!response);
            sessionInitButton.innerHTML(`${yield getSessionActive()}`);
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
            if (sessionInitButton.element) {
                setSessionActive(false);
                sessionInitButton.innerHTML(`${yield getSessionActive()}`);
                sessionInitButton.addEventListener("click", activeSessionToggle);
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
