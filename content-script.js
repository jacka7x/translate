"use strict";
console.log("content-script.js started");
let isActiveSession = false;
const getCurrentMousePosition = (event) => {
    return [event.clientX, event.clientY];
};
document.addEventListener("click", (event) => console.log(`Mouse Postion: ${getCurrentMousePosition(event)}`));
// export default isActiveSession;
