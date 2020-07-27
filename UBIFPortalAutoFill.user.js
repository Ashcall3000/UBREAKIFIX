// ==UserScript==
// @name         UBIF Portal Auto Fill Script
// @namespace    http://tampermonkey.net/
// @version      1.4.0
// @description  Auto fills update notes to expidite the procedure.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/Searcher.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalAutoFill.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalAutoFill.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

var SAMSUNG = 1;
var GOOGLE = 2;
var ASURION = 3;
var NORMAL = 0;
var note_button_run = false;
var fill_button_run = false;
var run = setInterval(function() {
    if (note_button_run && fill_button_run && checkExist('#auto_note_button')) {
        clearInterval(run);
    }
    if (!note_button_run) {
        note_button_run = addCreateNote();
    }
    if (!fill_button_run) {
        fill_button_run = addAutoFill();
    }
    if (!checkExist('#auto_note_button') && checkExist('#wrap > div > div.portal-header.row > div.col-xs-12.col-md-6.portal-actions > div')) {
        var auto_button = createTag(find('#wrap > div > div.portal-header.row > div.col-xs-12.col-md-6.portal-actions > div'), 'button', 'auto_note_button', 'btn blue fastclickable', 'Text');
        auto_button.style.backgroundColor = '#269CD8';
        auto_button.style.color = 'white';
        auto_button.addEventListener('click', autoUpdate);
        sleep(1000).then(() => {
            setButtonText();
        });
    }
}, 500);
var auto_button_update = setInterval(function() {
    if (checkExist('#auto_note_button')) {
        setButtonText();
    } else if (!checkURL('https://portal.ubif.net/pos/checkout-new/')){
        clearInterval(auto_button_update);
    }
}, 2500);
function getStatusText() {
    var number = find('select.editor-add-in').value;
    var options = findAll('select.editor-add-in option');
    for (var i = 0; i < options.length; i++) {
        if (options[i].value == number) {
            return options[i].innerText;
        }
    }
}
function addAutoFill() {
    if (checkExist('select.editor-add-in')) {
        find('select.editor-add-in').addEventListener('click', function() {
            var title = getStatusText();
            switch (title) {
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
                    setText("none", "Parts are in stock for the repair and is slotted to be repaired.");
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
                    break;
                case "Repair in Progress":
                    setText("none", "The device is currently being repaired.");
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
        });
        return true;
    }
    return false;
}
function addCreateNote() {
    if (findByText('button', 'Create Note')) {
        var add_create_note_run = false;
        var add_auto_fill_run = false;
        findByText('button', 'Create Note').addEventListener('click', function() {
            var create_note_button = setInterval(function() {
                if (add_create_note_run && add_auto_fill_run) {
                    clearInterval(create_note_button);
                }
                if (!add_auto_fill_run) {
                    add_auto_fill_run = addAutoFill();
                }
                if (!add_create_note_run) {
                    add_create_note_run = addCreateNote();
                }
            }, 1000);
        });
        return true;
    }
    return false;
}
function setText(disp, text) {
    find(".note-placeholder").style = "display: " + disp + ";";
    find(".note-editable").innerHTML = text;
    setField(".note-editable", 'input', text);
}
function setButtonText() {
    var button = find('#auto_note_button');
    var current_status = getStatusText();
    button.textContent = getSwitchText(current_status);
    button.disabled = (button.textContent == "Not Available");
}
function checkSamsungOrGoogle() {
    // 1 = SAMSUNG
    // 2 = GOOGLE
    // 3 = ASURION
    // 0 = NORMAL
    var google = '#portal-alert-bar > div > div.alert.portal-alert.alert-danger > span > button';
    if (findByText('div.partner-hold', 'SAMSUNG')) {
        return SAMSUNG;
    } else if (checkExist(google) && find(google).textContent.includes("Diag App")) {
        return GOOGLE;
    } else if (findByText('div.partner-hold', 'ASURION')) {
        return ASURION;
    } else {
        return NORMAL;
    }
}
function findSatuses(text) {
    var status = "Not Available";
    findAll('.editor-add-in option').forEach(function (el) {
        if (el.innerText.includes(text)) {
            status = el.innerText;
        }
    });
    return status;
}
function getSwitchText(status) {
    var check = checkSamsungOrGoogle();
    var gspn = true;
    if (check == SAMSUNG) {
        if (findByText('button', 'GSPN')) {
            gspn = false;
        }
    }
    if (status == "Awaiting Diag") {
        return findSatuses("Diag in Progress");
    } else if (status == "Awaiting Repair") {
        if (check == SAMSUNG && !gspn) {
            return "Auto Create GSPN";
        }
        return "Repair in Progress";
    } else if (status == "Diag in Progress") {
        return "Repair in Progress";
    } else if (status == "Repair in Progress") {
        if ("Not Available" != findSatuses("Repaired - RFP")) {
            return "Repaired - RFP";
        } else {
            return "Quality Inspection";
        }
    } else if (status == "Quality Inspection" && check != SAMSUNG && check != GOOGLE) {
        return "Repaired - RFP";
    } else {
        return "Not Available";
    }
}
function autoUpdate() {
    var current_status = find('#wrap > div > div.portal-pos.with-sidebar > div > div > workorder-tab-list > div > ul > li.active > a > tab-heading > div > div:nth-child(4) > span').textContent;
    var note_button = '#paneled-side-bar > div > div.bar-buttons > button.btn.blue.fastclickable';
    var gspn_div = 'body > div.modal.fade.fastclickable.portal-base.repair-ticket-create.in > div > div > div.modal-body';
    if (find('#auto_note_button').textContent.includes('GSPN')) {
        eventFire('button', 'click', 'GSPN');
        console.log('Clicked GSPN');
        var create_repair_ticket = setInterval(function () {
            if (findByText('.modal-dialog button', 'Create Repair Ticket')) {
                eventFire('.modal-dialog button', 'click', 'Create Repair Ticket');
                clearInterval(create_repair_ticket);
            }
        }, 250);
        var close_ticket_window = setInterval(function () {
            if (findByText('.modal-dialog button', 'Close')) {
                eventFire('.modal-dialog button', 'click', 'Close');
                clearInterval(close_ticket_window);
            }
        }, 250);
        var note_button_interval = setInterval(function () {
            if (checkExist(note_button) && !checkExist(gspn_div)) {
                eventFire(note_button, 'click');
                clearInterval(note_button_interval);
            }
        }, 250);
    } else {
        eventFire(note_button, 'click');
    }
    sleep(250).then(() => {
        if (!checkExist(gspn_div) && !checkExist('#paneled-side-bar.closed')) {
            var text = getSwitchText(current_status);
            var els = findAll('div.extra-actions > select > option');
            for (var i = 0; i < els.length; i++) {
                if (els[i].innerText == text) {
                    find('select.editor-add-in').value = i;
                    break;
                }
            }
            eventFire('select.editor-add-in', 'click');
            runAngularTrigger('div.extra-actions > select', 'change');
            sleep(500).then(() => {
                eventFire('button', 'click', 'Create Note');
            });
            sleep(2500).then(() => {
                eventFire(note_button, 'click');
            });
        }
    });
}
