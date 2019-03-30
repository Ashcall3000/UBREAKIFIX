// ==UserScript==
// @name         UBIF Email Reject
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Adds a button to add dummy email.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFEmailReject.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFEmailReject.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var check = true;
    var run = setInterval(function() {
        if (isExist("#customer-email") && check) {
            var input = document.querySelector("#email label");
            input.innerHTML += '<button id="reject">Reject</button>';
            document.getElementById('reject').addEventListener("click", addText);
            check = false;
        } else if (!isExist("#customer-email") && !check) {
            check = true;
        }
    }, 1000); // Runs every second.
})();

function addText() {
    console.log("EMAIL REJECTED");
    var button = document.getElementById('reject');
    button.innerHTML = 'REJECTED';
    button.disabled = true;
    setField(document.getElementById('customer-email'), 'input', 'decline@customer.com');
}

/**
 * isExist - checks to see if an dom object exists while using
 * a css selector to find it.
 *
 * @param selector - String
 * @return boolean
 */
function isExist(selector) {
    if (document.querySelectorAll(selector).length > 0) {
        return true;
    } else {
        return false;
    }
}

/* Function to emulate events being fired. Mainly for a click event.
*/
function eventFire(el, etype) {
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        var ev_obj = document.createEvent('Events');
        ev_obj.initEvent(etype, true, false);
        el.dispatchEvent(ev_obj);
    }
}

function setField(el, etype, text) {
    if (etype == "input") {
        el.value = text;
    } else if (etype == "click") {
        el.checked = text;
    }
    eventFire(el, etype);
}
