"use strict";
console.log("content-script.js started");
const getCurrentMousePosition = (event) => {
    return [event.clientX, event.clientY];
};
document.addEventListener("click", (event) => console.log(`Mouse Postion: ${getCurrentMousePosition(event)}`));
