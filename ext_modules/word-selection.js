function getCurrentMousePosition(event) {
    return { x: event.clientX, y: event.clientY };
}
function isClickInRects(rects, cursorPosition) {
    for (let rect of rects) {
        if (!rect)
            continue;
        // check cursor is within bounds of rect
        if (rect.left < cursorPosition.x && rect.right > cursorPosition.x &&
            rect.top < cursorPosition.y && rect.bottom > cursorPosition.y) {
            return rect;
        }
    }
    return false;
}
function checkForClickedWord(cursorPosition, elementAtCursor) {
    const nodes = elementAtCursor.childNodes;
    // check nodelist
    for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
        const node = nodes[nodeIndex];
        if (!node || !node.textContent || node.nodeType !== 3)
            continue;
        // set up an empty range
        let wordRange = document.createRange();
        let wordList = node.textContent.split(' ');
        let wordStartIndex = 0;
        let wordEndIndex = 0;
        // check string of words from textnode
        for (let word of wordList) {
            if (!word) {
                wordStartIndex++;
                continue;
            }
            // build range around each word
            wordEndIndex = wordStartIndex + word.length;
            wordRange.setStart(node, wordStartIndex);
            wordRange.setEnd(node, wordEndIndex);
            // get range dimensions, then check if cursor is within
            let rects = wordRange.getClientRects();
            let rectAtCursor = isClickInRects(rects, cursorPosition);
            if (rectAtCursor) {
                return {
                    word,
                    wordStartIndex,
                    wordEndIndex,
                    nodes,
                    nodeIndex,
                    rects
                };
            }
            else {
                // go to next word
                wordStartIndex = wordEndIndex + 1;
            }
        }
    }
    // no word/node in selected element clicked
    return null;
}
function selectWordAtCursor(event, elementAtCursor) {
    const selectedWord = checkForClickedWord(getCurrentMousePosition(event), elementAtCursor);
    if (selectedWord)
        return selectedWord;
    return null;
}
export { selectWordAtCursor };
