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
// it works!!!!!!!!!!!!!!!!!!!!!!!!!!! 
// sessionInitButton.element.addEventListener... (need to add .element)
// class SpecialButton {
//     element;
//     constructor(id) {
//         // super()
//       this.element = document.getElementById(id);
//     }
//     setActive(active: boolean) {
//         active ? 
//             this.element.classList.add('active') :
//             this.element.classList.remove('active')
//     }
// }
// adds the setActive method to HTMLELement's prototype
Object.defineProperty(HTMLElement.prototype, 'setActive', {
    enumerable: false,
    writable: false,
    value: function (active) {
        active ?
            this.classList.add('active') :
            this.classList.remove('active');
    }
});
const sessionInitButton = document.getElementById("session-init-button");
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
        if (sessionInitButton) {
            setSessionActive(!res);
            sessionInitButton.setActive(!res);
            sessionInitButton.innerHTML = `${yield getSessionActive()}`;
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
            if (sessionInitButton) {
                sessionInitButton.addEventListener("click", () => activeSessionToggle());
                setSessionActive(false);
                sessionInitButton.innerHTML = `${yield getSessionActive()}`;
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
