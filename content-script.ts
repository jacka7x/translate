console.log("content-script.js started")

interface MouseCoordinates {
    [index: number]: number;
}

const getCurrentMousePosition: 
    (event: MouseEvent) => MouseCoordinates = (event) => {
        return [event.clientX, event.clientY]
}

document.addEventListener("click", (event) => console.log(`Mouse Postion: ${getCurrentMousePosition(event)}`))
