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
type highlight = 'clicked' | 'hovered'

// GLOBAL VARIABLES ------------||

// set inital active session
let activeSession: boolean = false;

// for hover timeout function
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

        const translationJS = await import(chrome.runtime.getURL('/ext_modules/translation.js'))
        translate = translationJS.translate
        if(!translate) throw new Error('Translate not found. Possible import failure.')

        // word-selection.js
        const wordSelectionJS = await import(chrome.runtime.getURL('/ext_modules/word-selection.js'))
        selectWordAtCursor = wordSelectionJS.selectWordAtCursor
        if(!selectWordAtCursor) throw new Error ('wordSelect not found. Possible import failure')

        // get inital isActiveSession_local value, set to activeSession
        const response = await chrome.storage.local.get(['isActiveSession_local'])
        const sessionResponse = response['isActiveSession_local']

        if([true, false].includes(sessionResponse)) activeSession = sessionResponse
        else {

            // this may throw an error on first load, revisit how storage/options syncing should work
            chrome.storage.local.set({'isActiveSession_local': false}, () => {
                console.log('bingo')
            })
            throw new Error(`sesionResponse not found: ${sessionResponse}`)
        }

    } catch(error) {
        console.error(error)
    }
})()

// change activeSession here when storage is updated by popup
chrome.storage.onChanged.addListener(updateActiveSessionStatus)

// EL for hovering and clicking
// CREATE / DELETE THESE AS ACTIVESESSION IS TOGGLED
document.addEventListener('mousemove', (event) => processHoverEvent(event)) 
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

    if (clickedElement.nodeName == 'SPAN' && clickedElement.classList.contains('highlight-box-clicked')) {
        removeHighlightFromWord(clickedElement, 'bingo_change this later')
    } else {
        highlightWord(event, clickedElement, 'clicked')
    }
}

function processHoverEvent(event: MouseEvent) {

    if(!activeSession) return
    // add options to turn on off??
    event.preventDefault()

    const hoveredElement: HTMLElement | null = <HTMLElement>event.target

    switch (checkSpan(hoveredElement)) {
        case 'clicked': return
        case 'hovered': return
        case false:
    }

    const wordAtCursor: WordSelection | null = selectWordAtCursor(event, hoveredElement)
    if (!wordAtCursor) return

    // delay using gloabl hoverDelay variable
    const timeout = setTimeout(async () => {
        // this should not run selectword again
        const span: HTMLSpanElement | undefined = highlightWord(event, hoveredElement, 'hovered')
        
        const translatedText = await translate(wordAtCursor.word, fromLang, toLang)
        if(span) displayQuickTranslation(translatedText, span)
    }, hoverDelay)

    document.addEventListener('mousemove', () => {
        clearTimeout(timeout)
    })
}

function checkSpan(element: HTMLElement): highlight | false {
    if (element.nodeName !== 'SPAN') return false
    else if (element.classList.contains(`highlight-box-hovered`)) return 'hovered'
    else if (element.classList.contains(`highlight-box-clicked`)) return 'clicked'
    return false
}

function highlightWord(event: MouseEvent,
    elementAtCursor: HTMLElement, highlight: highlight): HTMLSpanElement | undefined {
    
    const wordAtCursor: WordSelection | null = selectWordAtCursor(event, elementAtCursor)
    
    if (!wordAtCursor) return
    const {
        word: selectedWord,
        wordStartIndex: selectedStart,
        wordEndIndex: selectedEnd,
        nodes,
        nodeIndex
    } = wordAtCursor
    
    console.log(`Word ${highlight}: ${selectedWord}`)

    const span: HTMLSpanElement = createSpanElement(selectedWord, highlight);

    // split text node before and after selected word
    (nodes[nodeIndex] as Text).splitText(selectedStart).splitText(selectedEnd-selectedStart)

    const nextNode: Node | undefined = nodes[nodeIndex + 1]
    const nextNode_2: Node | undefined = nodes[nodeIndex + 2]
    if (!nextNode || !nextNode_2) throw new Error('Missing node.')

    // remove middle split node
    elementAtCursor.removeChild(nextNode)

    // append between remaining split nodes
    elementAtCursor.insertBefore(span, nextNode_2)

    return span
}

function removeHighlightFromWord(elementAtCursor: HTMLSpanElement, selectedWord: string) {

    const textNode: Text = document.createTextNode(selectedWord)
    const elementAtCursorParent: ParentNode | null = elementAtCursor.parentNode

    // replace span with textNode and normalize
    try {
        if (!elementAtCursorParent) {
            throw new Error(`elementAtCursorParent not found. ${elementAtCursorParent}`)
        }

        elementAtCursorParent.insertBefore(textNode, elementAtCursor)
        elementAtCursor.remove()
        elementAtCursorParent.normalize()
    } catch (error) {
        console.error(error)
    }
}

function createSpanElement(selectedWord: string, highlight: highlight): HTMLSpanElement {

    // create span
    const span = document.createElement("span")
    span.innerText = selectedWord
    span.classList.add(`highlight-box-${highlight}`)

    if (highlight === 'clicked') console.log('put a fuction here')

    if (highlight === 'hovered') {
        span.addEventListener('mouseout', () => {
            removeHighlightFromWord(span, selectedWord)
        })
    }
    
    return span;
}

async function displayQuickTranslation(translatedText: string | null, span: HTMLSpanElement){    

    const div = document.createElement("div")
    div.classList.add('quick-translation-box')
    div.innerText = translatedText ? translatedText : 'No translation.'
    span.appendChild(div)
  
    console.log(`DISPLAY TEST: ${translatedText}`)
}