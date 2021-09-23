// ==UserScript==
// @name         UBIF Button Updater
// @namespace    http://tampermonkey.net/
// @version      1.0.4
// @description  Adds a button to assign the workorder to the current user.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/FindElement.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFButtonUpdater.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFButtonUpdater.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var created = false;
    var button_text = "";
    var note_button = '#paneled-side-bar > div > div.bar-buttons > button.btn.blue.fastclickable';
    var run = setInterval(function() {
        if (checkElement(note_button) && !created) {
            created = true;
            var el = makeElement(findElement('#wrap > div > div.portal-header.row > div.col-xs-12.col-md-6.portal-actions > div'), 'button', 'auto_note_button', 'btn blue fastclickable', 'Text');
            el.style.backgroundColor='#269CD8';
            el.style.color='white';
            el.addEventListener('click', autoUpdate);
            setButtonText();
        } else if (!checkElement(note_button) && created) {
            created = false;
        } else {
            if (checkElement('#auto_note_button')) {
                var elm = findElement('#auto_note_button');
                var current_status = findElement('#wrap > div > div.portal-pos.with-sidebar > div > div > workorder-tab-list > div > ul > li.active > a > tab-heading > div > div:nth-child(4) > span').textContent;
                if (elm.textContent == current_status) {
                    setButtonText();
                } else if (elm.textContent == "Not Available") {
                    setButtonText();
                } else if (checkSamsungOrGoogle() != 0) {
                    setButtonText();
                }
            }
        }
    }, 500);
})();

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function getSwitchText(status) {
    var check = checkSamsungOrGoogle();
    var gspn = true;
    if (check == 1) {
        if (findElementByText('button', 'GSPN')) {
            gspn = false;
        }
    }
    if (status == "Awaiting Diag") {
        return "Diag in Progress";
    } else if (status == "Awaiting Repair") {
        if (check == 1 && !gspn) {
            return "Auto Create GSPN";
        }
        return "Repair in Progress";
    } else if (status == "Diag in Progress") {
        return "Repair in Progress";
    } else if (status == "Repair in Progress") {
        if (check == 1 || check == 2 || check == 3) {
            return "Quality Inspection";
        } else {
            return "Repaired - RFP";
        }
    } else if (status == "Quality Inspection" && check != 1 && check != 2) {
        return "Repaired - RFP";
    } else {
        return "Not Available";
    }
}

function checkSamsungOrGoogle() {
    var google = '#portal-alert-bar > div > div.alert.portal-alert.alert-danger > span > button';
    if (findElementByText('div.partner-hold', 'SAMSUNG')) {
        return 1;
    } else if (checkElement(google) && findElement(google).textContent.includes("Diag App")) {
        return 2;
    } else if (findElementByText('div.partner-hold', 'ASURION')) {
        return 3;
    } else {
        console.log("Not Google or Samsung");
        return 0;
    }
}

function setButtonText() {
    var el = findElement("#auto_note_button");
    var current_status = findElement('#wrap > div > div.portal-pos.with-sidebar > div > div > workorder-tab-list > div > ul > li.active > a > tab-heading > div > div:nth-child(4) > span').textContent;
    el.textContent = getSwitchText(current_status);
    if (el.textContent == "Not Available") {
        el.disabled = true;
    } else {
        el.disabled = false;
    }
}

function autoUpdate() {
    var current_status = findElement('#wrap > div > div.portal-pos.with-sidebar > div > div > workorder-tab-list > div > ul > li.active > a > tab-heading > div > div:nth-child(4) > span').textContent;
    var note_button = '#paneled-side-bar > div > div.bar-buttons > button.btn.blue.fastclickable';
    var gspn_div = 'body > div.modal.fade.fastclickable.portal-base.repair-ticket-create.in > div > div > div.modal-body';
    var running = false;
    if (findElement('#auto_note_button').textContent.includes('GSPN')) {
        eventFire('button', 'click', 'GSPN');
        console.log('Clicked GSPN');
        var create_repair_ticket = setInterval(function() {
            if (findElementByText('.modal-dialog button', 'Create Repair Ticket')) {
                eventFire('.modal-dialog button', 'click', 'Create Repair Ticket');
                clearInterval(create_repair_ticket);
            }
        }, 250);
        var close_ticket_window = setInterval(function() {
            if (findElementByText('.modal-dialog button', 'Close')) {
                eventFire('.modal-dialog button', 'click', 'Close');
                clearInterval(close_ticket_window);
            }
        }, 250);
        var note_button_interval = setInterval(function() {
            if (checkElement(note_button) && !checkElement(gspn_div)) {
                eventFire(note_button, 'click');
                clearInterval(note_button_interval);
            }
        }, 250);
    } else {
        eventFire(note_button, 'click');
    }
    var status_change_interval = setInterval(function() {
        console.log('Status change interval');
        if (!checkElement(gspn_div) && !checkElement('#paneled-side-bar.closed') && !running) {
            console.log('IF statement for status change interval');
            running = true;
            sleep(250).then(() => {
                var text = getSwitchText(current_status);
                var els = findElements("div.extra-actions > select > option");
                var to_select = 0;
                for ( ; to_select < els.length; to_select++) {
                    if (els[to_select].textContent == text) {
                        findElement("div.extra-actions > select").value = to_select;
                        break;
                    }
                }
                angular.element('div.extra-actions > select').triggerHandler('change');
            })
            sleep(800).then(() => {
                eventFire('#custom-tabset > div.panel-body > div > div.tab-pane.active > div:nth-child(1) > sales-text-editor-buttons > div.buttons-hold.clearfix > div.right-buttons > button', 'click');
            })
            setButtonText();
            running = false;
            clearInterval(status_change_interval);
        }
    }, 500);
}

function makeElement(loc, tag, id='', el_class='', text='') {
    var elm = document.createElement(tag);
    if (id != '') {
        elm.setAttribute('id', id);
    }
    if (el_class != '') {
        elm.setAttribute('class', el_class);
    }
    if (text != '') {
        elm.innerText = text;
    }
    loc.prepend(elm);
    return elm;
}
