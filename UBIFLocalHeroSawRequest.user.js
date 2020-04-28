// ==UserScript==
// @name         UBIF Local Hero Saw Request
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Helps the user create a saw request for the local hero program
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @include      https://ubifsupport.zendesk.com/hc/en-us/requests/new*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/FindElement.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFLocalHeroSawRequest.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFLocalHeroSawRequest.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

(function() {
    var local_hero_check = false; // Whether or not the page says the repair is a local hero repair or not
    var button_created = false; // Whether the button to run script has been added to page.
    
    var run = setInterval(function() {
        // Checking if script isn't running in an iFrame
        if (window === window.parent) { // Script is running in the main window
            console.log("Running in Main Window");
            if (checkURL('https://portal.ubif.net/pos/checkout-new/')) {
                console.log('Running in Portal');
                if (checkText(findElement('p.device-name').textContent, 'LOCAL HERO') && checkText(findElement('p.device-name').textContent, 'SAMSUNG')) {
                    local_hero_check = true;
                    if (!button_created && checkElement('#wrap > div > div.portal-header.row > div.col-xs-12.col-md-6.portal-actions > div')) { // If in Portal and at work order with print drop down button
                        button_created = true;
                        var el = createElement(findElement('#wrap > div > div.portal-header.row > div.col-xs-12.col-md-6.portal-actions > div'), 'button', 'local_hero_saw_request', 'btn fastclickable', 'Saw Request');
                        el.style.backgroundColor = '#EDD05A';
                        el.style.color = 'white';
                    }
                }
            } else if (checkURL('https://ubifsupport.zendesk.com/hc/en-us/requests/new')) {
                console.log('Running in Samsungs Saw Request');
            } else { // If the script is running and it isn't on the above pages
                // Resetting data
                local_hero_check = false;
                button_created = false;
            }
        } else { // Script is running in the iFrame
            console.log("Running in an iFrame");
        }
    }, 500);
})();

/**
 * checkText
 * function to check if a given text is in a string.
 *
 * @param text - string that will be checked
 * @param check - string that might be in given string
 * @return Boolean
 */
function checkText(text, check) {
    if (text.toUpperCase().includes(check)) {
        return true;
    }
    return false;
}

/**
 * createElement
 * function that creates an element on the page at a given location and
 * returns the created element.
 *
 * @param loc - element to prepend to. 
 * @param tag - the tag of the element
 * @param id - id of new element
 * @param el_class - class of new element
 * @param text - the inner text of the new element
 */
function createElement(loc, tag, id='', el_class='', text='') {
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
    loc.prepend(element);
    return element;
}
