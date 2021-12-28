// dynamic import word-selection.js
(async () => {
    const wordSelectionJS: string = chrome.runtime.getURL('/content_scripts/word-selection.js')
    const contentScript = await import(wordSelectionJS)
    wordSelect = contentScript.wordSelectionImport

    if(!wordSelect){
        throw new Error (`wordSelect not found. Possible import failure`)
    }
})()

// remove any
let wordSelect: ((event: MouseEvent) => Array<[string, any, any, any]>) | undefined = undefined


document.addEventListener("click", (event) => {
    console.assert(wordSelect, `wordSelect type: ${typeof wordSelect}`)
    
    try {
        if(!wordSelect) {
            throw new Error (`wordSelect not found.`)
        } else {
            // remove any
            const selectedWordDetails: Array<[string, any, any, any]> = wordSelect(event)

            // change to object and use destructuting/
            const selectedWord = selectedWordDetails[0]
            const selectedStart = selectedWordDetails[1]
            const selectedEnd = selectedWordDetails[2]
            const selectedArea = selectedWordDetails[3]
            
            console.log(`Selected word: ${selectedWord}`)
            console.log(selectedArea)
            console.log(selectedStart)
            console.log(selectedEnd)
        }
    } catch (error) {
        console.error(error)
    }
})