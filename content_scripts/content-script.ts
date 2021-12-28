interface MouseCoordinates {
    [index: number]: number
}

// dynamic import word-selection.js
(async () => {
    const wordSelectionJS: string = chrome.runtime.getURL('/content_scripts/word-selection.js')
    const contentScript = await import(wordSelectionJS)
    wordSelect = contentScript.wordSelectionImport

    if(!wordSelect){
        throw new Error (`wordSelect not found. Possible import failure`)
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

// export {}