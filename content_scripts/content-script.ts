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
type hilight = 'clicked' | 'hovered'

// GLOBAL VARIABLES ------------||

// set inital active session
let activeSession: boolean = false;

// for hover timeout function
let timeout: number
const hoverDelay: number = 100;

// translation variables
let fromLang: supportedLang = 'en'
let toLang: supportedLang = 'ko'

// init functions to set by dynamic import
let selectWordAtCursor: (event: MouseEvent, clickedElement: HTMLElement) => WordSelection | null
let translate: (inputText: string, fromLang: supportedLang, toLang: supportedLang) => Promise <string | null>

// INITAL LOAD ------------------||

// dynamic import modules // event listeners //
(async () => {
    try {

        const translationJS = await import(chrome.runtime.getURL('../ext_modules/translation.js'))
        translate = translationJS.translate
        if(!translate) throw new Error('Translate not found. Possible import failure.')

        // word-selection.js
        const wordSelectionJS = await import(chrome.runtime.getURL('../ext_modules/word-selection.js'))
        selectWordAtCursor = wordSelectionJS.selectWordAtCursor
        if(!selectWordAtCursor) throw new Error ('wordSelect not found. Possible import failure')

        // get inital isActiveSession_local value, set to activeSession
        const response = await chrome.storage.local.get(['isActiveSession_local'])
        const sessionResponse = response['isActiveSession_local']

        if([true, false].includes(sessionResponse)) activeSession = sessionResponse
        else throw new Error(`sesionResponse not found: ${sessionResponse}`)

    } catch(error) {
        console.error(error)
    }
})()

// change activeSession here when storage is updated by popup
chrome.storage.onChanged.addListener(updateActiveSessionStatus)

// EL for hovering and clicking
document.addEventListener('mousemove', (event) => hoverEventTimeoutStart(event, hoverDelay)) 
document.addEventListener('click', (event) => processClickEvent(event))

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
        hilightWord(event, clickedElement, 'clicked')
    }
}

function processHoverEvent(event: MouseEvent) {

    if(!activeSession) return
    // add options to turn on off??
    event.preventDefault()

    const hoveredElement: HTMLElement | null = <HTMLElement>event.target
    
    if (hoveredElement.nodeName == 'SPAN' && hoveredElement.classList.contains('selected')) {
        // stuff if there is already a click/hover span there
    } else {

        const wordAtCursor: WordSelection | null = selectWordAtCursor(event, hoveredElement)
        if (!wordAtCursor) return

        console.log(wordAtCursor.word)

        hilightWord(event, hoveredElement, 'hovered')

        // maybe move this?
        // displayQuickTranslation(event, hoveredElement)
    }
}

// works using global 'timeout' variable
function hoverEventTimeoutStart(event: MouseEvent, delay: number): void {
    clearTimeout(timeout)
    timeout = setTimeout(() => processHoverEvent(event), delay)
}

async function displayQuickTranslation(event: MouseEvent, hoveredElement: HTMLElement){

    const wordAtCursor: WordSelection | null = selectWordAtCursor(event, hoveredElement)
    
    if (!wordAtCursor) return
    const text = wordAtCursor.word
    const rects = wordAtCursor.rects
    const translatedText = await translate(text, fromLang, toLang)

    translationPopupBox(translatedText, rects);

    console.log(`DISPLAY TEST: ${translatedText}`)
}

function hilightWord(event: MouseEvent, elementAtCursor: HTMLElement, hilight: hilight): void {
    
    const wordAtCursor: WordSelection | null = selectWordAtCursor(event, elementAtCursor)
    
    if (!wordAtCursor) return
    const {
        word: selectedWord,
        wordStartIndex: selectedStart,
        wordEndIndex: selectedEnd,
        nodes,
        nodeIndex
    } = wordAtCursor
    
    console.log(`Word ${hilight}: ${selectedWord}`)

    const span: HTMLSpanElement = createSpanElement(selectedWord, hilight);

    // split text node before and after selected word
    (nodes[nodeIndex] as Text).splitText(selectedStart).splitText(selectedEnd-selectedStart)

    const nextNode: Node | undefined = nodes[nodeIndex + 1]
    const nextNode_2: Node | undefined = nodes[nodeIndex + 2]
    if (!nextNode || !nextNode_2) throw new Error('Missing node.')

    // remove middle split node
    elementAtCursor.removeChild(nextNode)

    // append between remaining split nodes
    elementAtCursor.insertBefore(span, nextNode_2)
}

function removeHilightFromWord(elementAtCursor: HTMLSpanElement) {

    const textNode: Text = document.createTextNode(elementAtCursor.innerText)
    const elementAtCursorParent: ParentNode | null = elementAtCursor.parentNode

    // replace span with textNode and normalize
    elementAtCursorParent?.insertBefore(textNode, elementAtCursor)
    elementAtCursor.remove()
    elementAtCursorParent?.normalize()
}

function createSpanElement(selectedWord: string, hilight: hilight): HTMLSpanElement {

    // create span
    const span = document.createElement("span")
    span.innerText = selectedWord
    span.classList.add(`hilight-box-${hilight}`)

    // alter span based on clicked/hovered input
    if (hilight === 'clicked') span.classList.add('selected')
    if (hilight === 'hovered') {
        span.addEventListener('mouseout', () => {
            removeHilightFromWord(span)
        })
    }

    return span;
}

function translationPopupBox(text: string | null, rects: DOMRectList) {
    try {

        if (!rects[0]) throw new Error('Failed to get rects for selected word')

        // make into function
        const div = document.createElement("div")
        div.classList.add('quick-translation-box')
        div.innerText = text ? text : "No Translation."
        document.body.appendChild(div)

        const offset: number = parseInt(window.getComputedStyle(div).height)
        div.style.top = `${rects[0]?.y - offset}px`
        div.style.left = `${rects[0]?.x}px`

    } catch (error) {
        console.error(error)
    }
}