// ==UserScript==
// @name         UBIF Portal Auto Fill Script
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  Auto fills update notes to expidite the procedure.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalAutoFill.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalAutoFill.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var start = setInterval(function() {
        if (window.location.href.includes("https://portal.ubif.net/pos/checkout-new/")) {
            var status = document.getElementsByClassName("editor-add-in")[0].value;
            var text = "";
            var event = new Event('change', { bubbles: true }); // Event used to update changes for page.
            var run = setInterval(function() {
                var new_status = document.getElementsByClassName("editor-add-in")[0].value;
                if (new_status != status) {
                    if (new_status == 0) {
                        setText('Device has been repaired and passed tests.');
                    } else if (new_status == 1) {
                        setText('Awaiting callback from the customer.');
                    } else if (new_status == 2) {
                        setText('Awaiting for customer to bring in the device.');
                    } else if (new_status == 6) {
                        setText('Customer has declined the repair and has upto 30 days to pickup there device before it is recycled.');
                    } else if (new_status == 7) {
                        setText('Customer has abandoned the device and is sloted to be recycled.');
                    } else if (new_status == 9) {
                        setText('Need to order a part for the device. Will take 3 to 5 buisness days for shipping.');
                    } else if (new_status == 10) {
                        setText('Device is currently being repaired.');
                    } else if (new_status == 11) {
                        setText('Device is repaired and ready for pickup.');
                    } else if (new_status == 12) {
                        setText('Device was not able to be repaired and is ready for pickup.');
                    } else {
                        document.getElementsByClassName("note-placeholder")[0].style = "display: block;";
                        document.getElementsByClassName("btn-confirm")[4].disabled = true;
                        var text_area = document.getElementsByClassName("note-editable")[0];
                        text_area.innerHTML = "";
                        eventFire(text_area, 'input');
                    }
                    status = new_status;
                }
            }, 1000); // Checks every second.
        }
    }, 2000); // Checks every 2 seconds.
})();

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

function setText(text) {
    document.getElementsByClassName("note-placeholder")[0].style = "display: none;";
    document.getElementsByClassName("btn-confirm")[4].disabled = false;
    var text_area = document.getElementsByClassName("note-editable")[0];
    text_area.innerHTML = text;
    eventFire(text_area, 'input');
}
