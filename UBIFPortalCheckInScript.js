// ==UserScript==
// @name         UBIF Portal Check-In Script
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Prompts user for information to format into the condition notes.
// @author       Christopher Sullivan
// @match        https://portal.ubif.net/pos/device-repair-select/existing/*
// @include      https://portal.ubif.net/pos/device-repair-select/existing/*
// @include      https://portal.ubif.net/*
// @downloadURL  
// @run-at document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    var test = true;
    var run = setInterval(function() {
        var check_exist = setInterval(function() {
            if (document.getElementsByClassName("condition-notes")[0] != null) {
                if (test) {
                    document.getElementsByClassName("condition-notes")[0].value = "This is a test.";
                    // console.log("Exists!");
                    var PC = prompt("Passcode for the device: ", "NA");
                    var ACC = prompt("Accessories with the device: ", "NA");
                    var PCM = prompt("Prefered Contact Method: ", "NA");
                    var COND = prompt("Condition of the device: ", "NA");
                    var DESC = prompt("Description of issue with device: ", "NA");
                    var org_text = document.getElementsByClassName("condition-notes")[0];
                    document.getElementsByTagName("input")[3].value = PC;
                    PC = "PC: " + ((PC == null || PC == "") ? "NA" : PC);
                    ACC = "\n| ACC: " + ((ACC == null || ACC == "") ? "NA" : ACC);
                    PCM = "\n| PCM: " + ((PCM == null || PCM == "") ? "NA" : PCM);
                    COND = "\n| COND: " + ((COND == null || COND == "") ? "NA" : COND);
                    DESC = "\n| DESC: " + ((DESC == null || DESC == "") ? "NA" : DESC);
                    org_text = (org_text == null) ? "" : "\n | " + document.getElementsByClassName("condition-notes")[0].value;
                    if (document.getElementsByClassName("condition-notes")[0] != null) {
                        // console.log(PC + ACC + PCM + COND + DESC + org_text);
                        document.getElementsByClassName("condition-notes")[0].value = PC + ACC + PCM + COND + DESC + org_text;
                        test = false;
                    } else {
                        console.log("Not Found");
                    }
                    clearInterval(check_exist);
                } else {
                    console.log("NOPE");
                }
            }
        }, 1000); // check every 1 second
        test = (document.getElementsByClassName("condition-notes")[0] == null);
    }, 10000); // run every 10 seconds
})
();
