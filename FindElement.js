// ==UserScript==
// @name         FindElement
// @version      0.1
// @description  Functions used to find elements in the DOM
// ==/UserScript==

const FINDER = true;

/**
 * findElement
 * function to find an element by Css selector, if element is given
 * then will search within that element for element with the css selector.
 *
 * @param css - String that's a css selector
 * @param element - Element object from document
 * @return Element Object
 */
function findElement(css, element=false) {
    if (element !== false) {
        return element.querySelector(css);
    } else {
        return document.querySelector(css);
    }
}

/**
 * findElements
 * function to find elements by css selector, if element is given
 * then will search within that element for element with the css selector.
 *
 * @param css - String that's a css selector
 * @param element - Element obect from document
 * @return Element Object Array
 */
function findElements(css, element=false) {
    if (element !== false) {
        return element.querySelectorAll(css);
    } else {
        return document.querySelectorAll(css);
    }
}

/**
 * findElementByText
 * function to find element by css selector and then finds which element
 * that contains the given text. Will search within an element object if given.
 *
 * @param css - String CSS selector
 * @param text - String text to find in element
 * @param element - Element object to search in
 * @return Element Object
 */
function findElementByText(css, text, element=false) {
    var els = findElements(css, element);
    for (var i = 0; i < els.length; i++) {
        if (els[i].innerText != "" && els[i].innerText.contains(text)) {
            return els[i];
        }
    }
}

/**
 * findElementsByText
 * function to find elements by  css selector and then finds which elemnts
 * that contains the given text. Will search within an element if given.
 *
 * @param css - String CSS selector
 * @param text - String text to find in element
 * @param element - Element object to search in
 * @return Element Object Array
 */
function findElementsByText(css, text, element=false) {
    var els = findElements(css, element);
    var list;
    for (var i = 0; i < els.length; i++) {
        if (els[i].innerText != "" && els[i].innerText.contains(text)) {
            list.push(els[i]);
        }
    }
    return list;
}

/**
 * findElementSibling
 * function to find the next sibling of element found either using a css selector
 * or css selector that contains text. Will find the next Sibling using css_sib as
 * a css selector. Will search within an element if given.
 *
 * @param css - String CSS Selector
 * @param css_sib - String CSS Selector of Next Sibling
 * @param text - String to find in non-sibling element
 * @param element - Element Object to search in
 * @return Element Object
 */
function findElementSibling(css, css_sib, text="", element=false) {
    var el;
    if (text !== "") {
        el = findElementByText(css, text, element);
    } else {
        el = findElement(css, element);
    }
    var els = findElements(css_sib, el.parentNode);
    if (els.length > 1) {
        for (var i = 0; i < els.length; i++) {
            if (els[i] != el) {
                return els[i];
            }
        }
    } else {
        return els[0];
    }
}

/**
 * isExist - checks to see if an dom object exists while using
 * a css selector to find it.
 *
 * @param selector - String
 * @return boolean
 */
function check(selector) {
    if (document.querySelectorAll(selector).length > 0) {
        return true;
    } else {
        return false;
    }
}

/**
 * eventFire
 * function that will fire a given event on element. If css parameter given
 * is an element object it will not search for the element and fire on that
 * given object. If css parameter is css selector text it will then search
 * for the element. If text is given it will search for an element with the
 * the css selector that contains that text. If css_sib is given it will search
 * for a sibling of the original css selector that matches that css within the
 * parent node. If element is given it will do any of the searches within that
 * given element. The etype parameter can be a type such as click and will add
 * on to make 'onClick'. Otherwise will just fire a even to trigger events
 * assosiated with the element.
 *
 * @param css - Element Object or String CSS Selector
 * @param etype  - String of Event Type to fire
 * @param text - String of text to search for
 * @param css_sib - String CSS Selector to find in parent of css
 * @param element - Element Object to search within
 */
function eventFire(css, etype, text="", css_sib="", element=false) {
    var el;
    if (typeof(css) == "string") {
        if (css_sib !== "") {
            el = findElementSibling(css, css_sib, text, element);
        } else if (text !== "") {
            el = findElementByText(css, text, element);
        } else {
            el = findElement(css, element);
        }
    } else {
        el = css;
    }
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        var ev_obj = document.createEvent('Events');
        ev_obj.initEvent(etype, true, false);
        el.dispatchEvent(ev_obj);
    }
}

/**
 * setField
 * function that will  update a field by either giving it text of by checking the box.
 * The etype is a string param that should either be 'input' for a text field or 'click'
 * for a check box. The text param is for if the element is a text field or check box, if
 * it's a check box it must be updated with true or false for the click state and text will
 * will be a string for the text wanting to be put in the textfield. If css param is a css
 * selector then it will search for the element using that selector. If text_search element
 * is a string it will try to find an element with that text in it. If css_sib is a css
 * selector it will search for a sibling of css that can be selected with css_sib. If
 * element is given an Element Object it will search within that Element to find the
 * element wanted.
 *
 * @param css - Element Object or String CSS Selector
 * @param etype - Either 'input' or 'click'
 * @param text - Either String or Boolean
 * @param text_search - String to search for
 * @param css_sib - String CSS Selector to find
 * @param element - Element Object to search in
 */
function setField(css, etype, text, text_search="", css_sib="", element=false) {
    var el;
    if (typeof(css) == "string") {
        if (css_sib !== "") {
            el = findElementSibling(css, css_sib, text_search, element);
        } else if (text_search !== "") {
            el = findElementByText(css, text_search, element);
        } else {
            el = findElement(css, element);
        }
    } else {
        el = css;
    }
    if (etype == "input") {
        el.value = text;
    } else if (etype == "click") {
        el.checked = text;
    }
    eventFire(el, etype);
} * @return Element Object
 */
function findElementByText(css, text, element=false) {
    var els = findElements(css, element);
    for (var i = 0; i < els.length; i++) {
        if (els[i].innerText != "" && els[i].innerText.contains(text)) {
            return els[i];
        }
    }
}

/**
 * findElementsByText
 * function to find elements by  css selector and then finds which elemnts
 * that contains the given text. Will search within an element if given.
 *
 * @param css - String CSS selector
 * @param text - String text to find in element
 * @param element - Element object to search in
 * @return Element Object Array
 */
function findElementsByText(css, text, element=false) {
    var els = findElements(css, element);
    var list;
    for (var i = 0; i < els.length; i++) {
        if (els[i].innerText != "" && els[i].innerText.contains(text)) {
            list.push(els[i]);
        }
    }
    return list;
}

/**
 * findElementSibling
 * function to find the next sibling of element found either using a css selector
 * or css selector that contains text. Will find the next Sibling using css_sib as
 * a css selector. Will search within an element if given.
 *
 * @param css - String CSS Selector
 * @param css_sib - String CSS Selector of Next Sibling
 * @param text - String to find in non-sibling element
 * @param element - Element Object to search in
 * @return Element Object
 */
function findElementSibling(css, css_sib, text="", element=false) {
    var el;
    if (text !== "") {
        el = findElementByText(css, text, element);
    } else {
        el = findElement(css, element);
    }
    var els = findElements(css_sib, el.parentNode);
    if (els.length > 1) {
        for (var i = 0; i < els.length; i++) {
            if (els[i] != el) {
                return els[i];
            }
        }
    } else {
        return els[0];
    }
}

/**
 * isExist - checks to see if an dom object exists while using
 * a css selector to find it.
 *
 * @param selector - String
 * @return boolean
 */
function check(selector) {
    if (document.querySelectorAll(selector).length > 0) {
        return true;
    } else {
        return false;
    }
}

/**
 * eventFire
 * function that will fire a given event on element. If css parameter given
 * is an element object it will not search for the element and fire on that
 * given object. If css parameter is css selector text it will then search
 * for the element. If text is given it will search for an element with the
 * the css selector that contains that text. If css_sib is given it will search
 * for a sibling of the original css selector that matches that css within the
 * parent node. If element is given it will do any of the searches within that
 * given element. The etype parameter can be a type such as click and will add
 * on to make 'onClick'. Otherwise will just fire a even to trigger events
 * assosiated with the element.
 *
 * @param css - Element Object or String CSS Selector
 * @param etype  - String of Event Type to fire
 * @param text - String of text to search for
 * @param css_sib - String CSS Selector to find in parent of css
 * @param element - Element Object to search within
 */
function eventFire(css, etype, text="", css_sib="", element=false) {
    var el;
    if (typeof(css) == "string") {
        if (css_sib !== "") {
            el = findElementSibling(css, css_sib, text, element);
        } else if (text !== "") {
            el = findElementByText(css, text, element);
        } else {
            el = findElement(css, element);
        }
    } else {
        el = css;
    }
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        var ev_obj = document.createEvent('Events');
        ev_obj.initEvent(etype, true, false);
        el.dispatchEvent(ev_obj);
    }
}

/**
 * setField
 * function that will  update a field by either giving it text of by checking the box.
 * The etype is a string param that should either be 'input' for a text field or 'click'
 * for a check box. The text param is for if the element is a text field or check box, if
 * it's a check box it must be updated with true or false for the click state and text will
 * will be a string for the text wanting to be put in the textfield. If css param is a css
 * selector then it will search for the element using that selector. If text_search element
 * is a string it will try to find an element with that text in it. If css_sib is a css
 * selector it will search for a sibling of css that can be selected with css_sib. If
 * element is given an Element Object it will search within that Element to find the
 * element wanted.
 *
 * @param css - Element Object or String CSS Selector
 * @param etype - Either 'input' or 'click'
 * @param text - Either String or Boolean
 * @param text_search - String to search for
 * @param css_sib - String CSS Selector to find
 * @param element - Element Object to search in
 */
function setField(css, etype, text, text_search="", css_sib="", element=false) {
    var el;
    if (typeof(css) == "string") {
        if (css_sib !== "") {
            el = findElementSibling(css, css_sib, text_search, element);
        } else if (text_search !== "") {
            el = findElementByText(css, text_search, element);
        } else {
            el = findElement(css, element);
        }
    } else {
        el = css;
    }
    if (etype == "input") {
        el.value = text;
    } else if (etype == "click") {
        el.checked = text;
    }
    eventFire(el, etype);
}
