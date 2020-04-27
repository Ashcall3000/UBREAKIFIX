// ==UserScript==
// @name         UBIF Portal Auto Fill Script
// @namespace    http://tampermonkey.net/
// @version      1.3.0
// @description  Auto fills update notes to expidite the procedure.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/FindElement.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalAutoFill.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalAutoFill.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var created = false;
    var button_text = "";
    var note_button = '#paneled-side-bar > div > div.bar-buttons > button.btn.blue.fastclickable';
    var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

    var ran = false;
    var status = null;
    var user_set = false;
    var start = setInterval(function() {
        // Auto Button
        if (isChrome) {
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
        }
        // Auto Fill
        if (checkURL("https://portal.ubif.net/pos/checkout-new/") && checkElement(".editor-add-in")) {
            if (!ran) {
                status = findElement(".editor-add-in").value;
                ran = true;
            } else {
                var new_status = findElement(".editor-add-in").value;
                if (new_status != status) {
                    var val_list = findElements("select.editor-add-in option");
                    var val = "";
                    val_list.forEach(function(el) {
                        if (el.value == new_status) {
                            val = el.innerText;
                        }
                    });
                    switch (val) {
                        case "Quality Inspection":
                            setText("none", "Device has been repaired and is going through a quality inspection.");
                            break;
                        case "Awaiting Callback":
                            setText("none", "Awaiting callback from the customer.");
                            break;
                        case "Awaiting Device":
                            setText("none", "Awaiting for the customer to bring in their device.");
                            break;
                        case "Awaiting Repair":
                            setText("none", "Parts are in stock for the repair and is slotted to be repaired.")
                            break;
                        case "Declined - RFP":
                            setText("none", "Customer has declined the repair and has upto 30 days to pickup there device before it is recycled.");
                            break;
                        case "Device Abandoned":
                            setText("none", "Customer has abandoned the device and is sloted to be recycled.");
                            break;
                        case "Need to Order Parts":
                            setText("none", "Need to order parts for the device. Will take 3 to 5 business days for shipping.");
                            break;
                        case "Diag in Progress":
                            setText("none", "Currently diagnosing the device to give customer a repair quote.");
                            if (!user_set) {
                                findElement('#custom-tabset > div.panel-body > div > div.tab-pane.active > div:nth-child(1) > sales-text-editor-buttons > div > div.right-buttons > button').addEventListener('click', setUser);
                                user_set = true;
                            }
                            break;
                        case "Repair in Progress":
                            setText("none", "The device is currently being repaired.");
                            if (!user_set) {
                                findElement('#custom-tabset > div.panel-body > div > div.tab-pane.active > div:nth-child(1) > sales-text-editor-buttons > div > div.right-buttons > button').addEventListener('click', setUser);
                                user_set = true;
                            }
                            break;
                        case "Repaired - RFP":
                            setText("none", "The device is repaired and ready for pickup.");
                            break;
                        case "Unrepairable - RFP":
                            setText("none", "We were not able to repair the device and is ready for pickup. If not picked up within 30 days will be slotted to be recycled.");
                            break;
                        default:
                            setText("block", "");
                    }
                    status = findElement(".editor-add-in").value;
                    ran = false;
                }
            }
        } else if (checkURL("https://portal.ubif.net/pos/aqleads/edit/") && checkElement(".timeline > create-aqlead-note")) {
            if (!ran) {
                status = findElement("select.form-control").value;
                ran = true;
                var val_list = findElements("select.form-control option");
                var val = "";
                val_list.forEach(function(el) {
                    if (el.value == status) {
                        val = el.innerText;
                    }
                });
                var text = "";
                switch (val) {
                    case "Awaiting Customer":
                        text = "We set the part aside and are ready for you to come in at your earliest convenience.";
                        break;
                }
                console.log("HERE");
                console.log(text);
                findElement(".placeholder-text").innerText = text;
                setField(".placeholder-text", 'input', text);
                findElement(".placeholder-text").setAttribute("placeholder", "");
            } else if (findElement(".placeholder-text").innerText == "\n") {
                ran = false;
                user_set = false;
            }
            //"select.form-control:nth-child(1)"
        }
    }, 250); // Checks every 1/4 seconds.
})();

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function setUser() {
    var name = '\n' + findElement('.user-hold').innerText;
    console.log(name);
    eventFire('#wrap > div > div.portal-pos.with-sidebar > div > div > workorder-tab-list > div > div > div.tab-pane.active > div:nth-child(1) > div.col-xs-12.col-lg-6.customer-info > customer-info-only-card > div > div.card-title > workorder-actions > div > div.dropdown.small > ul > li:nth-child(4) > a', 'click');
    sleep(250).then(() => {
        console.log(findElements('body > div.modal.fade.fastclickable.portal-base.assign-tech-modal.in > div > div > div.modal-body.max-500 > div > table > tbody > tr'));
        eventFire("body > div.modal.fade.fastclickable.portal-base.assign-tech-modal.in > div > div > div.modal-body.max-500 > div > table > tbody > tr", 'click', name);
    })
    sleep(500).then(() => {
        eventFire('body > div.modal.fade.fastclickable.portal-base.assign-tech-modal.in > div > div > div.modal-header > h3 > button', 'click');
    })
}

function setText(disp, text) {
    findElement(".note-placeholder").style = "display: " + disp + ";";
    findElement(".note-editable").innerHTML = text;
    setField(".note-editable", 'input', text);
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
