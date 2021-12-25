// // interface for HTMLElement prototype method
// interface HTMLElementWrapper extends HTMLElement {
//     setActive: (active: boolean) => void
//     element: HTMLElement
// }

// // interface HTMLElementWrapperCon {
// //     new(ele: HTMLElement): HTMLElementWrapper
// // }

// interface StorageResponse {
//     readonly [isActiveSession_local: string]: boolean
// }

// const HTMLElementWrapper = function (this: HTMLElementWrapper, element: HTMLElement){
//     this.element = element
// }

// HTMLElementWrapper.prototype.setActive = function(active: boolean) {
//     active ? this.classList.add('active') : this.classList.remove('active')
// }

// // function create(HTMLElementWrapper: HTMLElementWrapperCon, tree: HTMLElement): HTMLElementWrapper {
// //     return new HTMLElementWrapper(tree)
// // }

// // TOGGLE ACTIVE SESSION
// // const tree: HTMLElement | null = document.getElementById("session-init-button")
// // const sessionInitButton: HTMLElementWrapper = create(HTMLElementWrapper, tree)

// const tree: HTMLElement | null = document.getElementById("session-init-button")
// const sessionInitButton: HTMLElementWrapper = new HTMLElementWrapper(tree)

// const setSessionActive = (active: boolean): void => {
//     chrome.storage.local.set({isActiveSession_local: active})
// -----------------------------
// interface for HTMLElement prototype method
// interface HTMLElement {
//     setActive: (active: boolean) => void
// }

interface HTMLElementWrapper extends HTMLElement {
    setActive: (active: boolean) => void
    element: HTMLElement
}

interface StorageResponse {
    readonly [isActiveSession_local: string]: boolean
}

// HTMLElement.prototype.setActive = function(active: boolean) {
//     active ? this.classList.add('active') : this.classList.remove('active')
// }

const HTMLElementWrapper = function (this: HTMLElementWrapper, element: HTMLElement) {
    this.element = element

    // return this.element
}

HTMLElementWrapper.prototype.setActive = function(active: boolean) {
    active ? this.classList.add('active') : this.classList.remove('active')
}

// TOGGLE ACTIVE SESSION
const tree: HTMLElement | null = document.getElementById("session-init-button")
const sessionInitButton: HTMLElement = new HTMLElementWrapper(tree)


const setSessionActive = (active: boolean): void => {
    chrome.storage.local.set({isActiveSession_local: active})
}

const getSessionActive = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(
            ['isActiveSession_local'], (res: StorageResponse ) => {
                res['isActiveSession_local'] === undefined ?
                reject() : resolve(res['isActiveSession_local'])
        })
    })
}

const activeSessionToggle = async (): Promise<void> => {
    const res: boolean = await getSessionActive()
    
    try {
        if (sessionInitButton) {
            setSessionActive(!res)
            sessionInitButton.setActive(!res)
            sessionInitButton.innerHTML = `${await getSessionActive()}`
        } else {
            throw new Error(`sessionInitButton is type ${typeof sessionInitButton}`)
        }
    } catch (error) {
        console.log(error)
    }
}

// run at start to set up button
const setupSessionInitButton = ( async function() {
    try {
        if (sessionInitButton) {
            sessionInitButton.addEventListener("click", () => activeSessionToggle())
            setSessionActive(false)
            sessionInitButton.innerHTML = `${await getSessionActive()}`
        } else {
            throw new Error(`sessionInitButton is type ${typeof sessionInitButton}`)
        }
    } catch (error) {
        console.log(error)
    }
})()