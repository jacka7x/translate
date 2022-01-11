
interface MouseCoordinates {
    x: number
    y: number
}

interface WordSelection {
    word: string
    wordStartIndex: number
    wordEndIndex: number
    nodes: NodeList 
    nodeIndex: number
    rects: DOMRectList
}

function getCurrentMousePosition(event: MouseEvent): MouseCoordinates {
    return { x: event.clientX, y: event.clientY }
}

function isClickInRects
    (rects: DOMRectList, cursorPosition: MouseCoordinates): DOMRect | false {

    for (let rect of rects) {
        if (!rect) continue

        // check cursor is within bounds of rect
        if (rect.left < cursorPosition.x && rect.right > cursorPosition.x && 
            rect.top < cursorPosition.y && rect.bottom > cursorPosition.y ) 
        {     
            return rect;
        }
    }
    return false;
}

function checkForClickedWord
    (cursorPosition: MouseCoordinates, elementAtCursor: HTMLElement): WordSelection | null {
    
    const nodes: NodeList = elementAtCursor.childNodes;

    // check nodelist
    for(let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {

        const node: Node | undefined = nodes[nodeIndex]
        if(!node || !node.textContent || node.nodeType !== 3) continue            

        // set up an empty range
        let wordRange: Range = document.createRange();
        let wordList: string[] = node.textContent.split(' ')
        let wordStartIndex: number = 0;
        let wordEndIndex: number = 0;

        // check string of words from textnode
        for (let word of wordList) {
            if(!word) {
                wordStartIndex++
                continue
            }
            
            // build range around each word
            wordEndIndex = wordStartIndex + word.length;
            wordRange.setStart(node, wordStartIndex);
            wordRange.setEnd(node, wordEndIndex);

            // get range dimensions, then check if cursor is within
            let rects: DOMRectList = wordRange.getClientRects();
            let rectAtCursor: DOMRect | false = isClickInRects(rects, cursorPosition)

            if (rectAtCursor) {  
                return {
                    word,
                    wordStartIndex,
                    wordEndIndex,
                    nodes,
                    nodeIndex,
                    rects
                }
            } else {
                // go to next word
                wordStartIndex = wordEndIndex + 1;
            }           
        }
    }

    // no word/node in selected element clicked
    return null
}

function selectWordAtCursor(event: MouseEvent, elementAtCursor: HTMLElement): WordSelection | null {

    const selectedWord: WordSelection | null 
        = checkForClickedWord(getCurrentMousePosition(event), elementAtCursor)
    if(selectedWord) return selectedWord        
    return null
}
    
export { selectWordAtCursor }