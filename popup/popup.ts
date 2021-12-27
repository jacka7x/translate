interface StorageResponse {
    readonly [isActiveSession_local: string]: boolean
}

// fix this (delete)
interface HTMLElement{
    element: HTMLElement
    setActive: (value: boolean) => void
}

class DOMWrapper {
    element
  
    constructor(id: string) {
        this.element = document.getElementById(id)
    }
  
    setActive(active: boolean) {
        active ? 
            // how to deal with this null check?
            this.element.classList.add('active') :
            this.element.classList.remove('active')

    }

    setInnerHtml(html: string) {
        // how to deal with this null check?
        this.element.innerHTML = html

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

const sessionInitButton: DOMWrapper | null = new DOMWrapper("session-init-button")
console.log(sessionInitButton)

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
        if (sessionInitButton.element) {
            setSessionActive(!res)
            sessionInitButton.setActive(!res)
            sessionInitButton.element.innerHTML = `${await getSessionActive()}`
        } else {
            throw new Error(`sessionInitButton is type ${typeof sessionInitButton}`)
        }
    } catch (error) {
        console.log(error)
    }
}

// run at start to set up button
( async function() {
    try {
        if (sessionInitButton.element) {
            sessionInitButton.element.addEventListener("click", () => activeSessionToggle())
            setSessionActive(false)
            sessionInitButton.element.innerHTML = `${await getSessionActive()}`
        } else {
            throw new Error(`sessionInitButton is type ${typeof sessionInitButton}`)
        }
    } catch (error) {
        console.log(error)
    }
})()