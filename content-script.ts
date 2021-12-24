// (async () => {
//     const src = chrome.extension.getURL('word-selection.js');
//     const contentScript = await import(src);
//     contentScript.main();
// })()
console.log("test")
const script = document.createElement('script');
    script.setAttribute("type", "module");
    script.setAttribute("src", chrome.runtime.getURL('word-selection.js'));
    const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
    head.insertBefore(script, head.lastChild);



// import { wordSelectionTest } from './word-selection.js'

// wordSelectionTest()

// let isActiveSession: boolean = false;

interface MouseCoordinates {
    [index: number]: number;
}

const getCurrentMousePosition: 
    (event: MouseEvent) => MouseCoordinates = (event) => {
        return [event.clientX, event.clientY]
}

document.addEventListener("click", (event) => console.log(`Mouse Postion: ${getCurrentMousePosition(event)}`))

