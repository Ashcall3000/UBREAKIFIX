// ==UserScript==
// @name         UBIF Portal Check-In Script
// @namespace    http://tampermonkey.net/
// @version      1.1.8
// @description  Prompts user for information to format into the condition notes.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalCheckInScript.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalCheckInScript.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // Variables for array in input tag name.
    var test = true; // Program hasn't run yet.
    var run = setInterval(function() { // Runs the script every 1 second
        if (document.location.href.includes("https://portal.ubif.net/pos/device-repair-select/") &&
           document.getElementsByClassName("condition-notes")[0] != null && test) { // Only runs on specific URL that has element with that class name
            test = false; // Program has run.
            // variables
            var saved_pc = document.getElementsByTagName("input")[3].value;
            var pc = prompt("Passcode for the device: ", (saved_pc == null || saved_pc == "") ? "NA" : saved_pc);
            var acc = prompt("Accessories with the device: ", "NA");
            var pcm = prompt("Prefered Contact Method: ", "NA");
            var cond = prompt("Condition of the device: ", "NA");
            var desc = prompt("Description of issue with device: ", "NA");
            var el_cond = document.getElementsByClassName("condition-notes")[0];
            var el_accs = document.getElementsByClassName("checklist-item");
            var org_text = el_cond.value; // Gets the original text that is in the field.
            var acc_up = acc.toUpperCase(); // To check values inside text.
            var text = "PC: " + ((pc == null || pc == "") ? "NA" : pc)
                        + "\n| ACC: " + ((acc == null || acc == "") ? "NA" : acc)
                        + "\n| PCM: " + ((pcm == null || pcm == "") ? "NA" : phoneNumberConvert(pcm))
                        + "\n| COND: " + ((cond == null || cond == "") ? "NA" : cond)
                        + "\n| DESC: " + ((desc == null || desc == "") ? "NA" : desc)
                        + ((org_text == null || org_text == "") ? "" : ("\n | " + org_text));
            setField(document.getElementsByTagName("input")[3], "input", pc); // Puts PC into Passcode field.
            setField(el_cond, "input", text);
            var acc_array = acc_up.split(" ");
            for (var i = 0; i < acc_array.length; i++) {
                for (var j = 0; j < el_accs.length; j++) {
                    if (el_accs[j].innerText.toUpperCase().includes(acc_array[i])) {
                        setField(el_accs[j].querySelector("input"), "click", true);
                    }
                }
            }
        } else if (!test && !document.location.href.includes("https://portal.ubif.net/pos/device-repair-select/")) {
            test = true; // Program can run again.
        }
    }, 1000);
})
();

function phoneNumberConvert(text) {
    for (var i = 0; i < text.length; i++) {
        if (text.charAt(i).isNaN() && text.charAt(i) != ' ') {
            return text;
        }
    }
    if (text.includes(' ')) {
        text.replace(' ', '');
    }
    var phone = text.substring(0,3) + '-';
    if (text.length > 7) {
        phone += text.substring(3,6) + '-' + text.substring(6,10);
    } else {
        phone += text.substring(3,7);
    }
    return phone;
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
