// ==UserScript==
// @name         FindElement
// @version      0.1
// @description  Functions used to find elements in the DOM
// ==/UserScript==

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
