
interface StorageResponse {
    readonly [isActiveSession_local: string]: boolean
}

interface HTMLElement{
    setActive_HTMLElement(active: boolean): void
}

// possible issue with DOM extension | also possible to do with web components
HTMLElement.prototype.setActive_HTMLElement = function(active: boolean){
    active ? 
        this.classList.add('active') :
        this.classList.remove('active')
}

const sessionInitButton: HTMLElement | null = document.getElementById("session-init-button")

const setSessionActive = (active: boolean): void => {
    chrome.storage.local.set({isActiveSession_local: active})
}

const getSessionActive = (): Promise<boolean | undefined> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['isActiveSession_local'], (response: StorageResponse) => {
                response['isActiveSession_local'] === undefined ?
                reject(undefined) : resolve(response['isActiveSession_local'])
        })
    })
}

const activeSessionToggle = async (): Promise<void> => {

    const response: boolean | undefined = await getSessionActive()
    try {
        if (sessionInitButton) {
            setSessionActive(!response)
            sessionInitButton.setActive_HTMLElement(!response)
            sessionInitButton.innerText = `${await getSessionActive()}`
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
        if (sessionInitButton) {
            const response: boolean | undefined = await getSessionActive()
            if (response === undefined) setSessionActive(false)
            else {
                sessionInitButton.setActive_HTMLElement(response)
                sessionInitButton.innerText = `${response}!`
            }
            
            sessionInitButton.addEventListener('click', activeSessionToggle)
        } else {
            throw new Error(`sessionInitButton is not found`)
        }
    } catch (error) {
        console.error(error)
    }
})()