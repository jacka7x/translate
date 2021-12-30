// dynamic import word-selection.js
(async () => {
    const wordSelectionJS: string = chrome.runtime.getURL('/content_scripts/word-selection.js')
    const contentScript = await import(wordSelectionJS)
    selectWordAtCursor = contentScript.wordSelectionImport

    if(!selectWordAtCursor){
        throw new Error (`wordSelect not found. Possible import failure`)
    } else {
        document.addEventListener("click", (event) => hilightWord(event) )
    }
})()

interface WordSelection {
    word: string
    wordStartIndex: number
    wordEndIndex: number
    clickedElement: HTMLElement
    nodes: NodeList 
    nodeIndex: number
}

// remove any--------------------->
let selectWordAtCursor: ((event: MouseEvent) => WordSelection) | any = undefined

function hilightWord(event: MouseEvent): null | void {

    const wordAtCursor: WordSelection = selectWordAtCursor(event)
    if (!wordAtCursor) return null

    const selectedWord: string = wordAtCursor.word
    const selectedStart: number = wordAtCursor.wordStartIndex
    const selectedEnd: number = wordAtCursor.wordEndIndex
    const clickedElement: HTMLElement = wordAtCursor.clickedElement
    const nodes: NodeList = wordAtCursor.nodes
    const nodeIndex: number = wordAtCursor.nodeIndex
    
    console.log(`Selected word: ${selectedWord}`)

    // create span element
    const mySpan: HTMLSpanElement = document.createElement("span")
    mySpan.classList.add('selected')
    mySpan.innerText = selectedWord
    mySpan.style.color = "red"
    mySpan.style.backgroundColor = "yellow";

    // split text node before and after selected word and delete middle node
    (nodes[nodeIndex] as Text).splitText(selectedStart).splitText(selectedEnd-selectedStart)

    const nextNode: Node | undefined = nodes[nodeIndex + 1]
    const nextNode_2: Node | undefined = nodes[nodeIndex + 2]
    if (!nextNode || !nextNode_2) throw new Error('Missing node.')

    const nextNodeParent: ParentNode | null = nextNode.parentNode
    if (!nextNodeParent) throw new Error('Missing parent of node.')
    nextNodeParent.removeChild(nextNode)

    // append at position
    clickedElement.insertBefore(mySpan, nextNode_2)
}