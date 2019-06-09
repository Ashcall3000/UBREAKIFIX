// ==UserScript==
// @name         UBIF Portal Check-In Script
// @namespace    http://tampermonkey.net/
// @version      1.3.3
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
            addHTML('body div', '<div id="backdrop" class="modal-backdrop fade in" modal-animation-class="fade" modal-in-class="in" ng-style="{\'z-index\': 1040 + ' +
                    '(index &amp;&amp; 1 || 0) + index*10}" modal-backdrop="modal-backdrop" modal-animation="true" style="z-index: 1051;"></div>');
            // Create the body
            createBox('PASSCODE', 'Passcode:', 'What is the passcode or password for the device?');
            addHTML('#add_loc', '<style>input {position: absolute;opacity: 0;cursor: pointer;height: 13px;width: 13px;z-index: 10;-ms-transform: scale(2.5);' +
                    ' /* IE */-moz-transform: scale(2.5); /* FF */-webkit-transform: scale(2.5); /* Safari and Chrome */-o-transform: scale(2.5); /* Opera */' +
                    'transform: scale(2.5);padding: 0px;left:30px;top:8px;}#keypad {padding-left: 220px;}.checkbox {width: 35px;height: 35px;background: ' +
                    '#ddd;margin: 5px 5px;border-radius: 100%;position: relative;box-shadow: 0px 1px 3px rgba(0,0,0,0.5);}.checkbox label {display: block;width:' +
                    ' 30px;height: 30px;border-radius: 100px;transition: all .5s ease;cursor: pointer;position: absolute;top: 3px;left: 2px;z-index: 0;background:' +
                    ' #333;box-shadow:inset 0px 1px 3px rgba(0,0,0,0.5);}.checkbox:before {position: absolute;color: white;top: 0px;left: 10px;height: 0px;z-index:' +
                    ' 1;font-weight: bold;font-size: 24px;}.checkbox input[type=checkbox]:checked + label {background: #26ca28;}#but1:before {content: "1";}' +
                    '#but2:before {content: "2";}#but3:before {content: "3";}#but4:before {content: "4";}#but5:before {content: "5";}#but6:before {content: "6";}' +
                    '#but7:before {content: "7";}#but8:before {content: "8";}#but9:before {content: "9";}button {width: 135px;color: white;background: red;box-shadow:' +
                    'inset 0px 1px 3px rgba(0,0,0,0.5);border-radius: 100px;font-weight: bold;font-size: 16px;}</style><div id="keypad"><table><tbody><tr>' +
                    '<th><div id="but1" class="checkbox"><input type="checkbox" value="1" id="checkbox1" name="" style="width: 13px;"><label for="checkbox1"></label>' +
                    '</div></th><th><div id="but2" class="checkbox"><input type="checkbox" value="2" id="checkbox2" name="" style="width: 13px;"><label for="checkbox2">' +
                    '</label></div></th><th><div id="but3" class="checkbox"><input type="checkbox" value="3" id="checkbox3" name="" style="width: 13px;"><label' +
                    ' for="checkbox3"></label></div></th></tr><tr><th><div id="but4" class="checkbox"><input type="checkbox" value="4" id="checkbox4" name="" style' +
                    '="width: 13px;"><label for="checkbox4"></label></div></th><th><div id="but5" class="checkbox"><input type="checkbox" value="5" id="checkbox5" ' +
                    'name="" style="width: 13px;"><label for="checkbox5"></label></div></th><th><div id="but6" class="checkbox"><input type="checkbox" value="6" ' +
                    'id="checkbox6" name="" style="width: 13px;"><label for="checkbox6"></label></div></th></tr><tr><th><div id="but7" class="checkbox"><input type' +
                    '="checkbox" value="7" id="checkbox7" name="" style="width: 13px;"><label for="checkbox7"></label></div></th><th><div id="but8" class="checkbox">' +
                    '<input type="checkbox" value="8" id="checkbox8" name="" style="width: 13px;"><label for="checkbox8"></label></div></th><th><div id="but9" ' +
                    'class="checkbox"><input type="checkbox" value="9" id="checkbox9" name="" style="width: 13px;"><label for="checkbox9"></label></div></th>' +
                    '</tr></tbody></table><button id="clear_button">CLEAR</button></div>');
            findElement('tbody').addEventListener('click', keypad);
            findElement('#clear_button').addEventListener('click', function() {
                var el = findElement('#update_info');
                el.value = el.value.substring(el.value.indexOf(']') + 1);
                if (el.value.charAt(0) == ' ' || el.value.charAt(0) == '\n') {
                    el.value = el.value.substring(1);
                }
                var list = findElements('tbody input');
                for (var i = 0; i < list.length; i++) {
                    list[i].checked = false;
                }
            });
            if (!passfield) {
                window++;
                nextWindow(window);
            }
            findElement('#update_info').value = saved_pc;
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

function keypad(event) {
    if (event.target.id.includes('checkbox')) {
        var element = findElement('#update_info');
        var num = event.target.id.substring(8);
        if (!element.value.includes('Pattern[')) {
            element.value = 'Pattern[] ' + element.value;
        }
        var start = 0;
        var text = "";
        if (event.target.checked) {
            start = element.value.indexOf(']');
            text = element.value.substring(0, start) + num;
            text += element.value.substring(start);
        } else {
            start = element.value.indexOf(num);
            text = element.value.substring(0, start);
            text += element.value.substring(start + 1);
        }
        element.value = text;
    }
}

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
    //setField("input", 'input', (pc == null || pc == "") ? "NA" : pc, 'Passcode:', 'label');
}

function createBox(title, second_title, text) {
    var html = '<div id="update_box" modal-render="true" tabindex="-1" role="dialog" class="modal fade fastclickable portal-base kbase-training-modal in"' +
    'modal-animation-class="fade" modal-in-class="in" ng-style="{\'z-index\': 1050 + index*10, display: \'block\'}" ng-click="close($event)"' +
    'modal-window="modal-window" window-class="portal-base kbase-training-modal" size="md" index="1" animate="animate" modal-animation="true"' +
    'style="z-index: 1060; display: block;"><div class="modal-dialog modal-md" ng-class="size ? \'modal-\' + size : \'\'">' +
    '<div class="modal-content" modal-transclude=""><div id="requiredTraining"><div class="modal-header"><h3 id="update_title" ' +
    'class="modal-title">Device Check In<button id="update_button" type="button" class="btn btn-default fastclickable show" ng-class="buttonRemindMe">' +
    'Cancel</button></h3></div><div class="modal-body"><div class="row move-down-20" id="update_prompt">' + text + '</div>' +
    '<div class="row"></div><label id="update_label">' + second_title + '</label><textarea id="update_info" wrap="soft"></textarea><button id="skip_button"' +
    ' type="button" class="btn btn-default" style="width:50%">Skip</button><button id="submit_button" type="button" class="btn btn-default" style="width:50%">' +
    'Submit</button></div><div id="add_loc"></div></div></div></div></div></div>';
    addHTML("body div", html);
    findElement('#update_button').addEventListener('click', cancelBox);
    findElement('#update_info').addEventListener('keypress', gotoNext);
    findElement('#submit_button').addEventListener('click', function() {
        window++;
        nextWindow(window);
    });
    findElement('#skip_button').addEventListener('click', function() {
        findElement('#update_info').value = "NA";
        window++;
        nextWindow(window);
    });
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
    var element = findElement('#update_info');
    if (number == 0) {
        second_title = "Passcode:";
        text = "What is the pattern or password for the device being checked?";
    } else if (number == 1) {
        second_title = "Accessories:";
        text = "What accessories are being checked in with the device?";
        pc = removeal(element.value);
        if (element.value.includes("Pattern[")) {
            pc += ']';
        }
    } else if (number == 2) {
        second_title = "Prefered Contact Method:";
        text = "How should the customer be updated about their repair?"
        acc = removeal(element.value);
    } else if (number == 3) {
        second_title = "Condition:";
        text = "What is the condition of the device being checked in?";
        pcm = element.value;
        pcm = phoneNumberConvert(removeal(pcm));
    } else if (number == 4) {
        second_title = "Description:";
        text = "Describe what the issue with the customers device:";
        cond = removeal(element.value);
    }
    if (number < 5) {
        findElement('#update_label').innerText = second_title;
        findElement('#update_prompt').innerText = text;
        element.value = "";
        findElement('#add_loc').innerHTML = '';
    } else {
        desc = removeal(element.value);
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
    var start = 0;
    var end = 0;
    var check = false;
    for (var j = 0; j < text.length; j++) {
        var d = text.charAt(j);
        if (d != ' ' && d != '/' && d != '-' && d != '.') {
            if (!isNaN(d)) {
                temp += d;
                if (!check) {
                    check = true;
                    start = j;
                }
            } else if (temp.length < 7) {
                temp = "";
                start = 0;
                check = false;
            } else if (temp.length >= 7) {
                end = j;
                break;
            }
        }
    }
    if (temp.length >= 7) {
        var phone = temp.substring(0,3) + '-';
        if (temp.length > 7) {
            phone += temp.substring(3,6) + '-' + temp.substring(6,10);
        } else {
            phone += temp.substring(3,7);
        }
        temp = text.substring(0, start);
        temp += (text.charAt(start - 1) != ' ') ? ' ' : '';
        temp += phone;
        temp += (text.charAt(end + 1) != ' ') ? ' ' : '';
        temp += text.substring(end);
        return temp;
    } else {
        return text;
    }
}