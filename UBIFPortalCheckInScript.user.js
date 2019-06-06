// ==UserScript==
// @name         UBIF Portal Check-In Script
// @namespace    http://tampermonkey.net/
// @version      1.3.1
// @description  Prompts user for information to format into the condition notes.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/FindElement.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalCheckInScript.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalCheckInScript.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

var window = 0;
var pc = "";
var acc = "";
var pcm = "";
var cond = "";
var desc = "";

(function() {
    'use strict';

    // Variables for array in input tag name.
    var test = true; // Program hasn't run yet.
    var google_test = true; // If button wasn't added for google devices then true
    var run = setInterval(function() { // Runs the script every 1 second
        if (checkURL("https://portal.ubif.net/pos/device-repair-select/") && checkElement(".condition-notes") && test) {
            test = false; // Program has run.
            var passfield = findElementSibling('label', 'input', 'Passcode:');
            var saved_pc = "";
            if (passfield) {
                saved_pc = ((!passfield) ? "" : passfield.value);
            }
            // Creates the gray backdrop
            addHTML('body div', '<div id="backdrop" class="modal-backdrop fade in" modal-animation-class="fade" modal-in-class="in" ng-style="{\'z-index\': 1040 + (index &amp;&amp; 1 || 0) + index*10}" modal-backdrop="modal-backdrop" modal-animation="true" style="z-index: 1051;"></div>');
            // Create the body
            createBox('PASSCODE', 'Passcode:', 'What is the passcode or password for the device?');
            if (!passfield) {
                window++;
                nextWindow(window);
            }
            findElement('#update_info').value = saved_pc;
            findElement('#update_button').addEventListener('click', cancelBox);
            findElement('#update_info').addEventListener('keypress', gotoNext);
        } else if (!test && !checkURL("https://portal.ubif.net/pos/device-repair-select/")) {
            test = true; // Program can run again.
            window = 0;
            pc = "";
            acc = "";
            pcm = "";
            cond = "";
            desc = "";
        }
    }, 1000);
})
();

function updateNotes() {
    var el_cond = findElement(".condition-notes");
    var el_accs = findElements(".checklist-item");
    var org_text = el_cond.value;
    var acc_up = acc.toUpperCase();
    var text =  "PC: " + ((pc == null || pc == "") ? "NA" : pc)
                + "\n| ACC: " + ((acc == null || acc == "") ? "NA" : acc)
                + "\n| PCM: " + ((pcm == null || pcm == "") ? "NA" : pcm)
                + "\n| COND: " + ((cond == null || cond == "") ? "NA" : cond)
                + "\n| DESC: " + ((desc == null || desc == "") ? "NA" : desc)
                + ((org_text == null| org_text == "") ? "" : ("\n | " + org_text));
    setField(".condition-notes", "input", text);
}

function createBox(title, second_title, text) {
    var html = '<div id="update_box" modal-render="true" tabindex="-1" role="dialog" class="modal fade fastclickable portal-base kbase-training-modal in"' +
    'modal-animation-class="fade" modal-in-class="in" ng-style="{\'z-index\': 1050 + index*10, display: \'block\'}" ng-click="close($event)"' +
    'modal-window="modal-window" window-class="portal-base kbase-training-modal" size="md" index="1" animate="animate" modal-animation="true"' +
    'style="z-index: 1060; display: block;"><div class="modal-dialog modal-md" ng-class="size ? \'modal-\' + size : \'\'">' +
    '<div class="modal-content" modal-transclude=""><div id="requiredTraining"><div class="modal-header"><h3 id="update_title" ' +
    'class="modal-title">Device Check In<button id="update_button" type="button" class="btn btn-default fastclickable show" ng-class="buttonRemindMe">' +
    'Cancel</button></h3></div><div class="modal-body"><div class="row move-down-20" id="update_prompt">' + text + '</div>' +
    '<div class="row"></div><label id="update_label">' + second_title + '</label><textarea id="update_info" wrap="soft"></textarea></div></div></div></div></div></div>';
    addHTML("body div", html);
}

function deleteBox(css) {
    var element = findElement(css);
    var child = element.lastElementChild;
    while (child) {
        element.removeChild(child);
        child = element.lastElementChild;
    }
    element.parentNode.removeChild(element);
}

function nextWindow(number) {
    var title = "";
    var second_title = "";
    var text = "";
    if (number == 0) {
        second_title = "Passcode:";
        text = "What is the passcode or password for the device being checked?";
    } else if (number == 1) {
        second_title = "Accessories:";
        text = "What are the accessories being checked in with the device?";
        pc = removeal(findElement('#update_info').value);
    } else if (number == 2) {
        second_title = "Prefered Contact Method:";
        text = "In what way does the customer prefer to be contacted during the process of the repair?"
        acc = removeal(findElement('#update_info').value);
    } else if (number == 3) {
        second_title = "Condition:";
        text = "What is the condition of the device being checked in?";
        pcm = findElement('#update_info').value;
        pcm = phoneNumberConvert(removeal(pcm));
    } else if (number == 4) {
        second_title = "Description:";
        text = "Describe the reason the customer is bring in their device today:";
        cond = removeal(findElement('#update_info').value);
    }
    if (number < 5) {
        findElement('#update_label').innerText = second_title;
        findElement('#update_prompt').innerText = text;
        findElement('#update_info').value = "";
    } else {
        desc = removeal(findElement('#update_info').value);
        cancelBox();
        updateNotes();
    }
}

function gotoNext(event) {
    if (event.which == 13) {
        window++;
        nextWindow(window);
    }
}

function cancelBox() {
    deleteBox('#backdrop');
    deleteBox('#update_box');
}

function removeal(text) {
    var temp = "";
    for (var i = 0; i < text.length; i++) {
        var c = text.charAt(i); 
        if (c != '\n') {
            temp += c;
        }
    }
    return temp;
}

function phoneNumberConvert(text) {
    var temp = "";
    for (var i = 0; i < text.length; i++) {
        var c = text.charAt(i);
        if (isNaN(c) && c != ' ' && c != '/' && c != '-' && c != '.') {
            return text;
        } else if (c != ' ' && c != '/' && c != '-' && c != '.') {
            temp += c;
        }
    }
    var phone = temp.substring(0,3) + '-';
    if (temp.length > 7) {
        phone += temp.substring(3,6) + '-' + temp.substring(6,10);
    } else {
        phone += temp.substring(3,7);
    }
    return phone;
}
