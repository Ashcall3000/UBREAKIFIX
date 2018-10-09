// ==UserScript==
// @name         UBIF Portal Check-In Script
// @namespace    http://tampermonkey.net/
// @version      1.0.5
// @description  Prompts user for information to format into the condition notes.
// @author       Christopher Sullivan
// @match        https://portal.ubif.net/pos/device-repair-select/existing/*
// @include      https://portal.ubif.net/pos/device-repair-select/existing/*
// @include      https://portal.ubif.net/*
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalCheckInScript.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalCheckInScript.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    var event = new Event('change', { bubbles: true }); // Event used to update changes for page.
    var test = true; // Used to test if page has been loaded previously/already.
    var run = setInterval(function() {
        var check_exist = setInterval(function() {
            if (document.getElementsByClassName("condition-notes")[0] != null) {
                if (test) {
                    // variables
                    var pc = prompt("Passcode for the device: ", "NA");
                    var acc = prompt("Accessories with the device: ", "NA");
                    var pcm = prompt("Prefered Contact Method: ", "NA");
                    var cond = prompt("Condition of the device: ", "NA");
                    var desc = prompt("Description of issue with device: ", "NA");
                    var el_cond = document.getElementsByClassName("condition-notes")[0];
                    var org_text = el_cond.value;
                    // setting values
                    document.getElementsByTagName("input")[3].value = pc; // Settings Passcode field on page
                    document.getElementsByTagName("input")[3].dispatchEvent(event);
                    var text = "PC: " + ((pc == null || pc == "") ? "NA" : pc)
                        + "\n| ACC: " + ((acc == null || acc == "") ? "NA" : acc)
                        + "\n| PCM: " + ((pcm == null || pcm == "") ? "NA" : pcm)
                        + "\n| COND: " + ((cond == null || cond == "") ? "NA" : cond)
                        + "\n| DESC: " + ((desc == null || desc == "") ? "NA" : desc)
                        + ((org_text == null) ? "" : ("\n | " + org_text));
                    if (el_cond != null) {
                        el_cond.value = text;
                        el_cond.dispatchEvent(event);
                        test = false;
                    }
                    clearInterval(check_exist);
                }
            }
        }, 1000); // check every 1 second
        test = (document.getElementsByClassName("condition-notes")[0] == null);
    }, 10000); // run every 10 seconds
})
();
