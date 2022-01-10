// INTERFACES ----------------||

interface WordSelection {
    word: string
    wordStartIndex: number
    wordEndIndex: number
    nodes: NodeList 
    nodeIndex: number
    rects: DOMRectList
}

interface chromeOnChange {
    [key: string]: chrome.storage.StorageChange
}

type supportedLang = 'en' | 'ko'

// GLOBAL VARIABLES ------------||

// set inital active session
let activeSession: boolean = false;

// for hover timeout function
let timeout: number
const hoverDelay: number = 300;

// translation variables
let fromLang: supportedLang = 'en'
let toLang: supportedLang = 'ko'

// init functions to set by dynamic import
let selectWordAtCursor: ((event: MouseEvent, clickedElement: HTMLElement) => WordSelection)
let translate: (inputText: string, fromLang: supportedLang, toLang: supportedLang) => Promise <string | null>

// INITAL LOAD ------------------||

// dynamic import modules // event listeners //
(async () => {
    const translationJS = await import(chrome.runtime.getURL('../ext_modules/translation.js'))
    translate = translationJS.translate

    // check this and change?
    const wordSelectionJS = await import(chrome.runtime.getURL('../ext_modules/word-selection.js'))
    selectWordAtCursor = wordSelectionJS.wordSelectionImport

    if(!selectWordAtCursor){
        throw new Error (`wordSelect not found. Possible import failure`)
    } else {
        document.addEventListener('click', (event) => processClickEvent(event))
    }

    // get inital isActiveSession_local value, set to activeSession
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

// translate word on hover (change to pointermove?)
document.addEventListener('mousemove', (event) => hoverEvent(event, hoverDelay)) 

// FUNCTIONS ------------||

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

function processHoverEvent(event: MouseEvent) {

    if(!activeSession) return

    // add options to turn on off??
    event.preventDefault()

    const hoveredElement: HTMLElement | null = <HTMLElement>event.target

    if (hoveredElement.nodeName == 'SPAN' && hoveredElement.classList.contains('selected')) {
        // get information saved in span
    } else {
        displayQuickTranslation(event, hoveredElement)
    }
}

// works using global 'timeout' variable
function hoverEvent(event: MouseEvent, delay: number): void {
    clearTimeout(timeout)
    timeout = setTimeout(() => processHoverEvent(event), delay)
}

async function displayQuickTranslation(event: MouseEvent, hoveredElement: HTMLElement){
    if (!selectWordAtCursor) throw new Error("selectWordAtCurson not found")
    const wordAtCursor: WordSelection = selectWordAtCursor(event, hoveredElement)
    
    if (!wordAtCursor) return
    const text = wordAtCursor.word
    const rects = wordAtCursor.rects
    const translatedText = await translate(text, fromLang, toLang)

    translationPopupBox(translatedText, rects);

    console.log(`DISPLAY TEST: ${translatedText}`)
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
    try { translate(selectedWord, fromLang, toLang) } catch(e) { console.log(e) }
    
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
    span.style.backgroundColor = "yellow"
    span.style.borderRadius = "1.2rem"
    return span;
}

function translationPopupBox(text: string | null, rects: DOMRectList) {
    console.log(rects[0]?.x)

    // make into function
    const div = document.createElement("div")
    div.classList.add('quick-translation-box')
    div.innerText = text ? text : "No Translation."
    document.body.appendChild(div)


    console.log()
    console.log(div.style.height);
    div.style.top = `${rects[0]?.y - parseInt(window.getComputedStyle(div).height)}px`
    div.style.left = `${rects[0]?.x}px`

    console.log(div.style)
}