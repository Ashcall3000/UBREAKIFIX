/**
 * find
 * function to find an element by Css selector, if element is given
 * then will search within that element for element with the css selector.
 *
 * @param css - String that's a css selector
 * @param element - Element object from document
 * @return Element Object
 */
function find(css, element=false) {
    if (element !== false) {
        return element.querySelector(css);
    } else {
        return document.querySelector(css);
    }
}

function findInFrame(frame, css) {
    return frame.contentWindow.document.querySelector(css);
}

function findAllInFrame(frame, css) {
    return frame.contentWindow.document.querySelectorAll(css);
}

/**
 * findAll
 * function to find elements by css selector, if element is given
 * then will search within that element for element with the css selector.
 *
 * @param css - String that's a css selector
 * @param element - Element obect from document
 * @return Element Object Array
 */
function findAll(css, element=false) {
    if (element !== false) {
        return element.querySelectorAll(css);
    } else {
        return document.querySelectorAll(css);
    }
}

/**
 * findByText
 * function to find element by css selector and then finds which element
 * that contains the given text. Will search within an element object if given.
 *
 * @param css - String CSS selector
 * @param text - String text to find in element
 * @param element - Element object to search in
 * @return Element Object
 */
function findByText(css, text, element=false) {
    var els = findAll(css, element);
    for (var i = 0; i < els.length; i++) {
        if (els[i].innerText != "" && els[i].innerText.includes(text)) {
            return els[i];
        }
    }
}

/**
 * findAllByText
 * function to find elements by  css selector and then finds which elemnts
 * that contains the given text. Will search within an element if given.
 *
 * @param css - String CSS selector
 * @param text - String text to find in element
 * @param element - Element object to search in
 * @return Element Object Array
 */
function findAllByText(css, text, element=false) {
    var els = findAll(css, element);
    var list = [];
    for (var i = 0; i < els.length; i++) {
        if (els[i].innerText != "" && els[i].innerText.includes(text)) {
            list.push(els[i]);
        }
    }
    return list;
}

/**
 * findSibling
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
function findSibling(css, css_sib, text="", element=false) {
    var el;
    if (text !== "") {
        el = findByText(css, text, element);
    } else {
        el = find(css, element);
    }
    var els = findAll(css_sib, el.parentNode);
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
 * findByAttribute
 * Function that finds an element based upon its attribute and the value of
 * that attribute. Can narrow down the search using text within the element, or
 * by finding the next sibling of an element.
 *
 * @param css - String CSS Selector
 * @param attribute - String the title of the attribute
 * @param value - String the text value of the attribute
 * @param css_sib - String CSS Selector of Next Sibling
 * @param text - String to find in non-sibling element
 * @param element - Element Object to search in
 * @return Element Object
 */
function findByAttribute(css, attribute, value, css_sib="", text="", element=false) {
    var els = [];
    if (css_sib !== "") {
        els.push(findSibling(css, css_sib, text, element));
    } else if (text !== "") {
        els = findAllByText(css, text, element);
    } else {
        els = findAll(css, element);
    }
    for (var i = 0; i < els.length; i++) {
        if (els[i].getAttribute(attribute) == value) {
            return els[i];
        }
    }
    return false;
}

/**
 * removeElement
 * function that finds element and then removes the element from the DOM.
 *
 * @param css
 * @param text
 * @param css_sib
 * @param element
 */
function remove(css, text="", css_sib="", element=false) {
    var el;
    if (typeof(css) == "string") {
        if (css_sib !== "") {
            el = findSibling(css, css_sib, text, element);
        } else if (text !== "") {
            el = findByText(css, text, element);
        } else {
            el = find(css, element);
        }
    } else {
        el = css;
    }
    el.parentNode.removeChild(el);
}

/**
 * check - checks to see if an dom object exists while using
 * a css selector to find it.
 *
 * @param css - String
 * @param element - Element Object from document
 * @return boolean
 */
function checkExist(css, element=false) {
    if (findAll(css, element).length > 0) {
        return true;
    } else {
        return false;
    }
}

function checkExistInFrame(frame, css) {
    if (findAllInFrame(frame, css).length > 0) {
        return true;
    } else {
        return false;
    }
}

function findPreviousTag(tag, element) {
    if (element.parentNode.tagName == tag.toUpperCase()) {
        return element.parentNode;
    }
    return findPreviousTag(tag, element.parentNode);
}

/**
 * checkURL
 * function that checks to see if the given url is in the page url.
 *
 * @param url - String
 * @return Boolean
 */
function checkURL(url) {
    return document.location.href.includes(url);
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
            el = findSibling(css, css_sib, text, element);
        } else if (text !== "") {
            el = findByText(css, text, element);
        } else {
            el = find(css, element);
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
            el = findSibling(css, css_sib, text_search, element);
        } else if (text_search !== "") {
            el = findByText(css, text_search, element);
        } else {
            el = find(css, element);
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

/**
 * addHTML
 * function that adds text to the html at the given doc html location.
 *
 * @param css - String css selector
 * @param add_text - Text to add as innerHTML
 * @param search_text - Text to search for to find element
 * @param element - Searches in given element
 */
function addHTML(css, add_text, search_text="", element=false) {
    var input = find(css, element);
    if (search_text != "") {
        input = findByText(css, search_text, element);
    }
    input.innerHTML += add_text;
}

/**
 * createTagBefore
 * function that creates an element on the page at a given location and
 * appends that element then returns the created the element.
 *
 * @param loc - element to prepend to.
 * @param node - index of child nodes
 * @param tag - the tag of the element
 * @param id - id of new element
 * @param el_class - class of new element
 * @param text - the inner text of the new element
 */
function createTagBefore(loc, node, tag, id='', el_class='', text='', style='') {
    var element = document.createElement(tag);
    if (id != '') {
        element.setAttribute('id', id);
    }
    if (el_class != '') {
        element.setAttribute('class', el_class);
    }
    if (text != '') {
        element.innerText = text;
    }
    if (style != '') {
        element.setAttribute('style', style);
    }
    loc.insertBefore(element, loc.childNodes[node]);
    return element;
}

/**
 * createTagAppend
 * function that creates an element on the page at a given location and
 * appends that element then returns the created the element.
 *
 * @param loc - element to prepend to.
 * @param tag - the tag of the element
 * @param id - id of new element
 * @param el_class - class of new element
 * @param text - the inner text of the new element
 */
function createTagAppend(loc, tag, id='', el_class='', text='', style='') {
    var element = document.createElement(tag);
    if (id != '') {
        element.setAttribute('id', id);
    }
    if (el_class != '') {
        element.setAttribute('class', el_class);
    }
    if (text != '') {
        element.innerText = text;
    }
    if (style != '') {
        element.setAttribute('style', style);
    }
    loc.append(element);
    return element;
}

/**
 * createTag
 * function that creates an element on the page at a given location and
 * returns the created element.
 *
 * @param loc - element to prepend to.
 * @param tag - the tag of the element
 * @param id - id of new element
 * @param el_class - class of new element
 * @param text - the inner text of the new element
 */
function createTag(loc, tag, id='', el_class='', text='', style='') {
    var element = document.createElement(tag);
    if (id != '') {
        element.setAttribute('id', id);
    }
    if (el_class != '') {
        element.setAttribute('class', el_class);
    }
    if (text != '') {
        element.innerText = text;
    }
    if (style != '') {
        element.setAttribute('style', style);
    }
    loc.prepend(element);
    return element;
}

function addClass(loc, class_name) {
    if (!loc.className.includes(class_name)) {
        loc.className += ' ' + class_name;
    }
}

function replaceClass(loc, original_class_name, new_class_name) {
    if (loc.className.includes(original_class_name)) {
        var old_class = loc.className;
        loc.className = old_class.replaceAll(original_class_name, new_class_name);
    }
}

function removeClass(loc, class_name) {
    replaceClass(loc, class_name, '');
}

function itemInArray(item, array) {
    for (var i = 0; i < array.length; i++) {
        if (item == array[i]) {
            return true;
        }
    }
    return false;
}
/**
 * createDropdown
 * function that creates a select dropdown list given a location and list of
 * strings for the title of the options. The value and title will be the same
 * value. ID and el_class are for the class of the select element.
 *
 * @param loc - Element to prepend to.
 * @param items - the array of strings used for the list
 * @param id - id of the select element
 * @param el_class - the class of the select element
 */
function createDropdown(loc, items, id='', el_class='') {
    var text = '';
    items.forEach(function(item) {
        text += '<option value="' + item + '">' + item + '</option>';
    });
    var dropdown = createTag(loc, 'select', id, el_class);
    dropdown.innerHTML = text;
}

/**
 * runAngularTrigger
 * function that gets around scope issues with chrome extensions.
 * adds the script that needs to be run to trigger an angular trigger on the page.
 * then removes the code.
 *
 * @param css - css selector inside the angular.element call
 * @param trigger - the name of the trigger in .triggerHandler
 */
function runAngularTrigger(css, trigger) {
    var code = "angular.element('" + css + "').triggerHandler('" + trigger + "');";
    createTag(find('body'), 'script', 'angular', '', code).nodeType='text/javascript';
    remove('#angular');
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
