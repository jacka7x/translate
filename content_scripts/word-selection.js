const wordSelectionImport = (() => {
    const getCurrentMousePosition = (event) => {
        return { cursor_x: event.clientX, cursor_y: event.clientY };
    };
    function wordSelect(event) {
        // Solution from: https://stackoverflow.com/questions/4311715/how-to-get-position-of-every-character/4359182 | https://jsfiddle.net/abrady0/ggr5mu7o/
        // change to object cursor.x cursor.y etc
        const { cursor_x, cursor_y } = getCurrentMousePosition(event);
        // why childnodes[0], what about other nodes?
        // childnode is just the text node? What about other elements?
        const parentElt = event.target.childNodes;
        console.log(cursor_x, cursor_y);
        console.log(event.target);
        console.log(event.target.childNodes);
        // console.log(event.target.childNodes[0])
        // console.log(event.target.childNodes[0].textContent)
        // if (parentElt.nodeName !== '#text') {
        //     console.log('didn\'t click on text node');
        //     return null;
        // }
        for (let n = 0; n < parentElt.length; n++) {
            let range = document.createRange();
            // textContent gets all child nodes and removes any HTML markup?
            let words = parentElt[n].textContent.split(' ');
            let start = 0;
            let end = 0;
            for (let i = 0; i < words.length; i++) {
                let word = words[i];
                end = start + word.length;
                range.setStart(parentElt[n], start);
                try { // something bad going on here 
                    range.setEnd(parentElt[n], end);
                }
                catch (error) {
                    console.error(error);
                }
                // not getBoundingClientRect as word could wrap
                let rects = range.getClientRects();
                let clickedRect = isClickInRects(rects);
                if (clickedRect) {
                    const span = document.createElement('span');
                    span.textContent = "test";
                    span.classList.add('selected');
                    const newText = parentElt[n].textContent.split(' ');
                    newText[i] = span;
                    parentElt[n].textContent = newText;
                    return [word, start, end, clickedRect];
                }
                start = end + 1;
            }
        } // for loop
        function isClickInRects(rects) {
            for (var i = 0; i < rects.length; ++i) {
                var r = rects[i];
                if (r.left < cursor_x && r.right > cursor_x &&
                    r.top < cursor_y && r.bottom > cursor_y) {
                    return r;
                }
            }
            return false;
        }
        return null;
    }
    return wordSelect;
})();
export { wordSelectionImport };
