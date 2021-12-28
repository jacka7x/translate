function findClickedWord(parentElt, x, y) {
    if (parentElt.nodeName !== '#text') {
        console.log('didn\'t click on text node');
        return null;
    }
    var range = document.createRange();
    var words = parentElt.textContent.split(' ');
    var start = 0;
    var end = 0;
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        end = start+word.length;
        range.setStart(parentElt, start);
        range.setEnd(parentElt, end);
        // not getBoundingClientRect as word could wrap
        var rects = range.getClientRects();
        var clickedRect = isClickInRects(rects);
        if (clickedRect) {
            return [word, start, clickedRect];
        }
        start = end + 1;
    }
    
    function isClickInRects(rects) {
        for (var i = 0; i < rects.length; ++i) {
            var r = rects[i]
            if (r.left<x && r.right>x && r.top<y && r.bottom>y) {            
                return r;
            }
        }
        return false;
    }
    return null;
}
function onClick(e) {
    var elt = document.getElementById('info');
    var clicked = findClickedWord(e.target.childNodes[0], e.clientX, e.clientY);
    elt.innerHTML = 'Nothing Clicked';
    if (clicked) {
        var word = clicked[0];
        var start = clicked[1];
        var r = clicked[2];
        elt.innerHTML = 'Clicked: ('+r.top+','+r.left+') word:'+word+' at offset '+start; 
    }
}

document.addEventListener('click', onClick);