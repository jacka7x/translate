interface StorageResponse {
    readonly [isActiveSession_local: string]: boolean
}

interface HTMLElement{
    setActive: (value: boolean) => void
}

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
    value: function(active: HTMLElement): void {
        active ? 
            this.classList.add('active') :
            this.classList.remove('active')
    }
})

const sessionInitButton: HTMLElement | null = document.getElementById("session-init-button")

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
( async function() {
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