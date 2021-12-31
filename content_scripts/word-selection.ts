const wordSelectionImport = (() => {
    interface MouseCoordinates {
        x: number
        y: number
    }

    interface WordSelection {
        word: string
        wordStartIndex: number
        wordEndIndex: number
        clickedElement: HTMLElement
        nodes: NodeList 
        nodeIndex: number
    }

    function getCurrentMousePosition(event: MouseEvent): MouseCoordinates {
        return { x: event.clientX, y: event.clientY }
    }

    function isClickInRects
        (rects: DOMRectList, cursorPosition: MouseCoordinates): DOMRect | false {

        for (let i = 0; i < rects.length; i++) {

            let rect = rects[i]
            if (!rect) continue

            if (rect.left < cursorPosition.x && rect.right > cursorPosition.x && 
                rect.top < cursorPosition.y && rect.bottom > cursorPosition.y ) 
            {     
                return rect;
            }
        }
        return false;
    }

    function checkForClickedWord
        (cursorPosition: MouseCoordinates, event: MouseEvent): WordSelection | null {

        // Solution from: https://stackoverflow.com/questions/4311715/how-to-get-position-of-every-character/4359182 | https://jsfiddle.net/abrady0/ggr5mu7o/
        
        const clickedElement: HTMLElement | null = <HTMLElement>event.target
        const nodes: NodeList = clickedElement.childNodes;
        console.log(clickedElement)

        // check nodelist
        for(let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {

            const node: Node | undefined = nodes[nodeIndex]
            if(!node || !node.textContent || node.nodeType !== 3) continue            

            // set up a range
            let wordRange: Range = document.createRange();
            let wordList: string[] = node.textContent.split(' ')
            let wordStartIndex: number = 0;
            let wordEndIndex: number = 0;
            // check string of words from textnode

            for (let i = 0; i < wordList.length; ++i) {

                let word = wordList[i];
                if(!word) {
                    wordStartIndex++
                    continue
                }
                
                wordEndIndex = wordStartIndex + word.length;
                wordRange.setStart(node, wordStartIndex);
                wordRange.setEnd(node, wordEndIndex);

                // get range dimesions/coordinates
                let rects: DOMRectList = wordRange.getClientRects();
                let clickedRect: DOMRect | false = isClickInRects(rects, cursorPosition)

                if (clickedRect) {   
                    return { 
                        word, wordStartIndex, wordEndIndex, clickedElement, nodes, nodeIndex 
                    }
                } else {
                    wordStartIndex = wordEndIndex + 1;
                }           
            }
        }

        // no word/node in selected element clicked
        return null
    }
    
    function selectWordAtCursor(event: MouseEvent) {

        const cursorPosition: MouseCoordinates = getCurrentMousePosition(event)
        const selectedWord: WordSelection | null = checkForClickedWord(cursorPosition, event)
        if(selectedWord) return selectedWord
           
        console.log('didn\'t click on text node')
        return null;
    }
    
    return selectWordAtCursor
})()

export { wordSelectionImport }