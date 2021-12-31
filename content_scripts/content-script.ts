// dynamic import word-selection.js
(async () => {
    const wordSelectionJS: string = chrome.runtime.getURL('/content_scripts/word-selection.js')
    const contentScript = await import(wordSelectionJS)
    selectWordAtCursor = contentScript.wordSelectionImport

    if(!selectWordAtCursor){
        throw new Error (`wordSelect not found. Possible import failure`)
    } else {
        document.addEventListener('click', (event) => processClickEvent(event))
    }
})()

interface WordSelection {
    word: string
    wordStartIndex: number
    wordEndIndex: number
    nodes: NodeList 
    nodeIndex: number
}

// remove any--------------------->
let selectWordAtCursor: ((event: MouseEvent) => WordSelection) | any = undefined

function processClickEvent(event: MouseEvent) {
    // event.preventDefault()

    // const cursorPosition: MouseCoordinates = getCurrentMousePosition(event)
    const clickedElement: HTMLElement | null = <HTMLElement>event.target

    if (clickedElement.nodeName == 'SPAN' && clickedElement.classList.contains('selected')) {
        removeHilightFromWord(clickedElement)
    } else {
        hilightWord(event, clickedElement)
    }
}

function hilightWord(event: MouseEvent, clickedElement: HTMLElement): null | void {

    const wordAtCursor: WordSelection = selectWordAtCursor(event, clickedElement)
    if (!wordAtCursor) return null

    const {
        word: selectedWord,
        wordStartIndex: selectedStart,
        wordEndIndex: selectedEnd,
        nodes,
        nodeIndex
    } = wordAtCursor
    
    console.log(`Selected word: ${selectedWord}`)

    const span: HTMLSpanElement = createSpanElement(selectedWord);

    // split text node before and after selected word
    (nodes[nodeIndex] as Text).splitText(selectedStart).splitText(selectedEnd-selectedStart)

    const nextNode: Node | undefined = nodes[nodeIndex + 1]
    const nextNode_2: Node | undefined = nodes[nodeIndex + 2]
    if (!nextNode || !nextNode_2) throw new Error('Missing node.')

    // remove middle split node
    clickedElement.removeChild(nextNode)

    // append between remaining split nodes
    clickedElement.insertBefore(span, nextNode_2)
}

function removeHilightFromWord(clickedElement: HTMLSpanElement) {

    const textNode: Text = document.createTextNode(clickedElement.innerText)
    const clickedElementParent: ParentNode | null = clickedElement.parentNode

    // replace span with textNode and normalize
    clickedElementParent?.insertBefore(textNode, clickedElement)
    clickedElement.remove()
    clickedElementParent?.normalize()
}

function createSpanElement(selectedWord: string): HTMLSpanElement {
    const span = document.createElement("span")
    span.classList.add('selected')
    span.innerText = selectedWord
    span.style.color = "red"
    span.style.backgroundColor = "yellow";
    return span;
}