const wordSelectionImport = (() => {
    function wordSelect(pos) {
        console.log(`Got word at ${pos}`);
    }
    return wordSelect;
})();
export { wordSelectionImport };
