// interface for HTMLElement prototype method
interface HTMLElement {
    setActive: (active: boolean) => void
}

HTMLElement.prototype.setActive = function(active: boolean) {
    active ? this.classList.add('active') : this.classList.remove('active')
}

// TOGGLE ACTIVE SESSION
const sessionInitButton: HTMLElement = document.getElementById("session-init-button")!

const setSessionActive = (active: boolean): void => {
    chrome.storage.local.set({isActiveSession_local: active})
}

const getSessionActive = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['isActiveSession_local'], function (res) {
            res.isActiveSession_local === undefined ?
                reject() : resolve(res.isActiveSession_local)
        })
    })
}

const activeSessionToggle = async (): Promise<void> => {
    const res: boolean = await getSessionActive()
    
    setSessionActive(!res)
    sessionInitButton.setActive(!res)
    sessionInitButton.innerHTML = `${await getSessionActive()}`
}

// run at start to set up button
const setupSessionInitButton = ( async function() {
    sessionInitButton.addEventListener("click", () => activeSessionToggle())
    setSessionActive(false)
    sessionInitButton.innerHTML = `${await getSessionActive()}`
})()