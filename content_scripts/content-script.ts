interface WordSelection {
    word: string
    wordStartIndex: number
    wordEndIndex: number
    nodes: NodeList 
    nodeIndex: number
}

interface chromeOnChange {
    [key: string]: chrome.storage.StorageChange
}

type supportedLang = 'en' | 'ko'

// INITAL LOAD START -----------||

// dynamic import modules
(async () => {
    const translationJS = await import(chrome.runtime.getURL('../modules/translation.js'))
    translate = translationJS.translate

    // check this and change?
    const wordSelectionJS = await import(chrome.runtime.getURL('../modules/word-selection.js'))
    selectWordAtCursor = wordSelectionJS.wordSelectionImport

    if(!selectWordAtCursor){
        throw new Error (`wordSelect not found. Possible import failure`)
    } else {
        document.addEventListener('click', (event) => processClickEvent(event))
    }
})()

// init functions to set by dynamic import
let selectWordAtCursor: ((event: MouseEvent, clickedElement: HTMLElement) => WordSelection)
let translate: (inputText: string, fromLang: supportedLang, toLang: supportedLang) => string | null

// set inital active session
let activeSession: boolean = false;

// get inital isActiveSession_local value, set to activeSession
(async () => {
    try{
        const response = await chrome.storage.local.get(['isActiveSession_local'])
        const sessionResponse = response['isActiveSession_local']
        if(sessionResponse === true || sessionResponse === false) activeSession = sessionResponse
        else throw new Error(`sesionResponse not found: ${sessionResponse}`)
    } catch(error) {
        console.error(error)
    }
})()

// change activeSession here when storage is updated by popup
chrome.storage.onChanged.addListener(updateActiveSessionStatus)

// INITAL LOAD END -----------||

function updateActiveSessionStatus(changes: chromeOnChange) {
    activeSession = changes['isActiveSession_local']?.['newValue']
}

function processClickEvent(event: MouseEvent): void {

    if(!activeSession) return

    // add to options (turn on/off)
    event.preventDefault()

    // const cursorPosition: MouseCoordinates = getCurrentMousePosition(event)
    const clickedElement: HTMLElement | null = <HTMLElement>event.target

    if (clickedElement.nodeName == 'SPAN' && clickedElement.classList.contains('selected')) {
        removeHilightFromWord(clickedElement)
    } else {
        hilightWord(event, clickedElement)
    }
}

function hilightWord(event: MouseEvent, clickedElement: HTMLElement): void {
    
    if (!selectWordAtCursor) throw new Error("selectWordAtCurson not found")
    const wordAtCursor: WordSelection = selectWordAtCursor(event, clickedElement)
    
    if (!wordAtCursor) return
    const {
        word: selectedWord,
        wordStartIndex: selectedStart,
        wordEndIndex: selectedEnd,
        nodes,
        nodeIndex
    } = wordAtCursor

    // put here temp for testing
    try { translate(selectedWord, 'en', 'ko') } catch(e) { console.log(e) }
    
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