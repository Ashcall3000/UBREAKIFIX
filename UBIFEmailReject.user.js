// ==UserScript==
// @name         UBIF Email Reject
// @namespace    http://tampermonkey.net/
// @version      1.1.1
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
    var aCreated = true;
    var nameCreated = true;
    var run = setInterval(function() {
        if (checkElement("#customer-email") && created) {
            addHTML('#email label', '<button id="reject" class="btn btn-cancel push-left fastclickable">Reject</button>');
            findElement('#reject').addEventListener("click", addText);
            created = false;
        } else if (!checkElement("#customer-email") && !created) {
            created = true;
        }
        if (checkElement("#customer-address-line-1") && aCreated) {
            addHTML('#address_line_1 label', '<button id="declined" class="btn btn-cancel push-left fastclickable">Declined</button>');
            findElement('#declined').addEventListener('click', addAddText);
            aCreated = false;
        } else if (!checkElement('#customer-address-line-1') && !aCreated) {
            aCreated = true;
        }
        if (checkElement("#customer-given_name") && nameCreated) {
            if (findElement("#customer-given_name").value.length == 0 && findElement("#customer-family_name").value.includes(" ")) {
                nameCreated = false;
                var first = '';
                var last = findElement('#customer-family_name').value;
                var start = last.indexOf(' ');
                if (start != -1) {
                    first = last.substring(0,start);
                    last = last.substring(start);
                    setField('#customer-given_name', 'input', first);
                    setField('#customer-family_name', 'input', last);
                }
            }
        } else if (!checkElement('#customer-given_name') && !nameCreated) {
            nameCreated = true;
        }
    }, 1000); // Runs every second.
})();

function addText() {
    setField('#customer-email', 'input', 'decline@customer.com');
}

function addAddText() {
    console.log('here');
    setField('#customer-address-line-1', 'input', '*');
    setField('#customer-city', 'input', '*');
    setField('#customer-state', 'input', '*');
    setField('#customer-zip', 'input', '*');
}
