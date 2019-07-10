// ==UserScript==
// @name         UBIF Email Reject
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  Adds a button to add dummy email.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/FindElement.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFEmailReject.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFEmailReject.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var created = true;
    var run = setInterval(function() {
        if (checkElement("#customer-email") && created) {
            addHTML('#email label', '<button id="reject" class="btn btn-cancel push-left fastclickable">Reject</button>');
            findElement('#reject').addEventListener("click", addText);
            created = false;
        } else if (!checkElement("#customer-email") && !created) {
            created = true;
        }
    }, 1000); // Runs every second.
})();

function addText() {
    console.log("EMAIL REJECTED");
    addHTML('#reject', 'REJECTED');
    setField('#customer-email', 'input', 'decline@customer.com');
}
