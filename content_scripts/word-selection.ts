interface MouseCoordinates {
    [index: number]: number;
}

const wordSelectionImport = (() => {
    
    function wordSelect(pos: MouseCoordinates) {
        console.log(`Got word at ${pos}`)
    }
    
    return wordSelect
})()

export { wordSelectionImport }