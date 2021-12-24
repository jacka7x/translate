"use strict";
// (async () => {
//     const src = chrome.extension.getURL('word-selection.js');
//     const contentScript = await import(src);
//     contentScript.main();
// })()
console.log("test");
const script = document.createElement('script');
script.setAttribute("type", "module");
script.setAttribute("src", chrome.runtime.getURL('word-selection.js'));
const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
head.insertBefore(script, head.lastChild);
const getCurrentMousePosition = (event) => {
    return [event.clientX, event.clientY];
};
document.addEventListener("click", (event) => console.log(`Mouse Postion: ${getCurrentMousePosition(event)}`));
