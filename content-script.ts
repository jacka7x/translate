(async () => {
    const src = chrome.runtime.getURL('word-selection.js');
    const contentScript = await import(src);
    contentScript.wordSelectionTest();

    console.log(contentScript)
})()


// const script = document.createElement('script');
//     script.setAttribute("type", "module");
//     script.setAttribute("src", chrome.runtime.getURL('word-selector.js'));
//     const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
//     head.insertBefore(script, head.lastChild);

interface MouseCoordinates {
    [index: number]: number;
}

const getCurrentMousePosition: 
    (event: MouseEvent) => MouseCoordinates = (event) => {
        return [event.clientX, event.clientY]
}

document.addEventListener("click", (event) => {
    console.log(`Mouse Postion: ${ getCurrentMousePosition(event) }`)
})

