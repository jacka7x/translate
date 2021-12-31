interface StorageResponse {
    readonly [isActiveSession_local: string]: boolean
}

class DOMWrapper {
    // null check in constructor
    element!: HTMLElement
  
    constructor(id: string) {
        try{
            if (document.getElementById(id) !== null) {
                this.element = document.getElementById(id) as HTMLElement
            } else {
                throw new Error(`Element with ID "${id}" does not exist. Failed to set element in DOMWrapper`)
            }
        } catch (error) {
            console.error(error)
        }
        
    }

    get() {
        return this.element
    }
  
    setActive(active: boolean) {
        active ? 
            this.element.classList.add('active') :
            this.element.classList.remove('active')
    }

    innerHTML(html: string) {
        this.element.innerHTML = html
    }

    aaddEventListener(event: keyof HTMLElementEventMap, callback: Function) {
        console.log('hello')
        this.element.addEventListener(event, () => callback)
        console.log(this.element.attributes)
    }
}

const sessionInitButton: DOMWrapper = new DOMWrapper("session-init-button")

const setSessionActive = (active: boolean): void => {
    chrome.storage.local.set({isActiveSession_local: active})
}

const getSessionActive = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(
            ['isActiveSession_local'], (response: StorageResponse ) => {
                response['isActiveSession_local'] === undefined ?
                reject() : resolve(response['isActiveSession_local'])
        })
    })
}

const activeSessionToggle = async (): Promise<void> => {
    console.log('clicked')
    const response: boolean = await getSessionActive()
    try {
        if (sessionInitButton.get()) {
            setSessionActive(!response)
            sessionInitButton.setActive(!response)
            sessionInitButton.innerHTML(`${await getSessionActive()}`)
            console.log(response)
        } else {
            throw new Error(`sessionInitButton not found`)
        }
    } catch (error) {
        console.error(error)
    }
}

// run at start to set up button
( async function() {
    try {
        if (sessionInitButton.element) {
            console.log(sessionInitButton)
            setSessionActive(false)

            // remove innerHTML
            sessionInitButton.innerHTML(`${await getSessionActive()}!`)
            sessionInitButton.aaddEventListener('click', activeSessionToggle)
        } else {
            throw new Error(`sessionInitButton is type ${typeof sessionInitButton}`)
        }
    } catch (error) {
        console.log(error)
    }
})()