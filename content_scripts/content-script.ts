interface MouseCoordinates {
    [index: number]: number
}

// dynamic import word-selection.js
(async () => {
    const src = chrome.runtime.getURL('/content_scripts/word-selection.js')
    const contentScript = await import(src)
    wordSelect = contentScript.wordSelectionImport

    if(!wordSelect){
        throw new Error (`wordSelect type: ${typeof wordSelect}`)
    }
})()


let wordSelect: ((pos: MouseCoordinates) => void) | undefined = undefined


const getCurrentMousePosition: (event: MouseEvent) => MouseCoordinates = 
    (event) => {
        return [event.clientX, event.clientY]
}

document.addEventListener("click", (event) => {
    console.assert(wordSelect, `wordSelect type: ${typeof wordSelect}`)
    
    try {
        if(!wordSelect) {
            throw new Error (`wordSelect type: ${typeof wordSelect}`)
        } else {
            wordSelect(getCurrentMousePosition(event))
        }
    } catch (error) {
        console.error(error)
    }
})