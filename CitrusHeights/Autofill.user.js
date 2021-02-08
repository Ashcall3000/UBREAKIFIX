// ==UserScript==
// @name         Autofill
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Makes keeping work orders upto date more easily and faster.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/Search.js
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/Waiter.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/Autofill.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/Autofill.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==
var SAMSUNG = 1;
var GOOGLE = 2;
var ASURION = 3;
var NORMAL = 0;
// if (autofill_run !== undefined) {
//     clearInterval(autofill_run);
// }
var AutofillWaiter = new Waiter();
AutofillWaiter.addSingle('autofill-run', function() {
    if (!checkURL('https://portal.ubif.net/pos/checkout-new/') || !getData('autorun-run')) {
        console.log('Closing AutoFill Script');
        AutofillWaiter.clearAllSingles("Autofill");
        AutofillWaiter.clearAllTables();
        return;
    }
    if (!checkExist('#createnote')) {
        console.log('Add Create Note If')
        note_button_run = addCreateNote();
    }
    if (!checkExist('#autofill')) {
        fill_button_run = addAutoFill();
    }
    if (!checkExist('#auto_note_button') && checkExist('div.header-buttons') && !checkExist('div.timeline-content textarea')) {
        var auto_button = createTag(find('div.header-buttons'), 'button', 'auto_note_button', 'btn blue fastclickable', 'Text');
        auto_button.style.backgroundColor = '#269CD8';
        auto_button.style.color = 'white';
        auto_button.addEventListener('click', autoUpdate);
        sleep(1000).then(() => {
            setButtonText();
        });
        find(".editor-add-in").addEventListener('click', function() {
            if (find(".note-editable").innerText == "") {
                setText("none", "Update Time.");
            }
        });
    }
    if (!checkExist('#voicemail-button')) {
        var voicemail = createTag(find('div.right-buttons'), 'button', 'voicemail-button', 'btn btn-warning left-icon fastclickable', 'Left Voicemail');
        createTag(voicemail, 'span', '', 'button-icon fa fa-fw fa-phone-square');
        find('#voicemail-button').addEventListener('click', voicemailClick);
        var talked = createTag(find('div.right-buttons'), 'button', 'talk-customer-button', 'btn btn-warning left-icon fastclickable', 'Talked to Customer', 'margin-right: 10px;');
        createTag(talked, 'span', '', 'button-icon fa fa-fw fa-phone');
        find('#talk-customer-button').addEventListener('click', talkedClick);
    }
}, 1000);
AutofillWaiter.addSingle('auto-button-update', function() {
    if (checkExist('#auto_note_button')) {
        setButtonText();
    } else if (!checkURL('https://portal.ubif.net/pos/checkout-new/')){
        AutofillWaiter.clearSingle('auto-button-update');
    }
    if (findAll('#voicemail-button').length > 1) {
        remove('#voicemail-button');
        find('#voicemail-button').addEventListener('click', voicemailClick);
    }
    if (findAll('#talk-customer-button').length > 1) {
        remove('#talk-customer-button');
        find('#talk-customer-button').addEventListener('click', talkedClick);
    }
}, 2500);
function voicemailClick() {
    console.log('Voicemail Click:', "Called and left a voicemail.");
    addText("Called and left a voicemail.");
}
function talkedClick() {
    console.log('Talked Click:', "Called and talked to customer.")
    addText("Called and talked to customer.");
}
function getStatusText() {
    var number = find('select.editor-add-in').value;
    var options = findAll('select.editor-add-in option');
    for (var i = 0; i < options.length; i++) {
        if (options[i].value == number) {
            return options[i].innerText;
        }
    }
}
var update_text = ["Device has been repaired and is going through a quality inspection.",
                    "Awaiting callback from the customer.",
                    "Awaiting for the customer to bring in their device.",
                    "Parts are in stock for the repair and is slotted to be repaired.",
                    "Customer has declined the repair and has up to 60 days to pickup there device before it is recycled.",
                    "Customer has abandoned the device and is sloted to be recycled.",
                    "Need to order parts for the device. Will take 3 to 5 business days for shipping.",
                    "Currently diagnosing the device to give customer a repair quote.",
                    "The device is currently being repaired.",
                    "The device is repaired and ready for pickup.",
                    "We were not able to repair the device and is ready for pickup. If not picked up within 60 days will be slotted to be recycled.",
                    "Called and left a voicemail.",
                    "Called and talked to customer.",
                    "Update Time."];
function addAutoFill() {
    if (checkExist('select.editor-add-in') && !checkExist('#autofill')) {
        createTag(find('select.editor-add-in'), 'div', 'autofill', '', '');
        find('select.editor-add-in').addEventListener('click', function() {
            var title = getStatusText();
            var index = -1;
            if (title == "Quality Inspection") {
                index = 0;
            } else if (title == "Awaiting Callback") {
                index = 1;
            } else if (title == "Awaiting Device") {
                index = 2;
            } else if (title == "Awaiting Repair") {
                index = 3;
            } else if (title == "Declined - RFP") {
                index = 4;
            } else if (title == "Device Abandoned") {
                index = 5;
            } else if (title == "Need to Order Parts") {
                index = 6;
            } else if (title == "Diag in Progress") {
                index = 7;
            } else if (title == "Repair in Progress") {
                index = 8;
            } else if (title == "Repaired - RFP") {
                index = 9;
            } else if (title == "Unrepairable - RFP") {
                index = 10;
            }
            if (index != -1) {
                setText("none", update_text[index]);
            }
        });
        return true;
    }
    return false;
}
function addCreateNote() {
    if (findByText('button', 'Create Note')) {
        createTag(findByText('button', 'Create Note'), 'div', 'createnote', '', '');
        var add_create_note_run = false;
        var add_auto_fill_run = false;
        findByText('button', 'Create Note').addEventListener('click', function() {
            AutofillWaiter.addSingle('create-note-button', function() {
                if (add_create_note_run && add_auto_fill_run) {
                    AutofillWaiter.clearSingle('create-note-button');
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
function addText(text) {
    var items = ["Called and left a voicemail.", "Called and talked to customer."];
    var old_text = find('.note-editable').innerText;
    if (old_text == '' || itemInArray(old_text, items)) {
        setText("none", text);
    } else {
        setText("none", old_text + ' ' + text);
    }
}
function setText(disp, text) {
    if (itemInArray(text, update_text) ||
            find('.note-editable').textContent == "") {
        find(".note-placeholder").style = "display: " + disp + ";";
        find(".note-editable").innerHTML = text;
        setField(".note-editable", 'input', text);
    }
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
        findByText('button', 'GSPN').click();
        console.log('Clicked GSPN');
        var create_repair_ticket = setInterval(function () {
            if (findByText('.modal-dialog button', 'Create Repair Ticket')) {
                findByText('.modal-dialog button', 'Create Repair Ticket').click();
                clearInterval(create_repair_ticket);
            }
        }, 250);
        var close_ticket_window = setInterval(function () {
            if (findByText('.modal-dialog button', 'Close')) {
                findByText('.modal-dialog button', 'Close').click();
                clearInterval(close_ticket_window);
            }
        }, 250);
        var note_button_interval = setInterval(function () {
            if (checkExist(note_button) && !checkExist(gspn_div)) {
                find(note_button).click();
                clearInterval(note_button_interval);
                sleep(1500).then(() => {
                    setButtonText();
                    find('#auto_note_button').click();
                });
            }
        }, 250);
    } else {
        find(note_button).click();
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
            find('select.editor-add-in').click();
            runAngularTrigger('div.extra-actions > select', 'change');
            if (find("#private").checked) {
                find("#private").click();
            }
            sleep(250).then(() => {
                findByText('button', 'Create Note').click();
            });
            sleep(350).then(() => {
                find(note_button).click();
            });
        }
    });
}
function checkButtonClick(title, selector='button') {
    var button = findByText(selector, title);
    if (button) {
        if (!button.disabled) {
            button.click();
            return true;
        }
    }
    return false;
}
function switchButton(id, button_class, icon_type, text) {
    if (checkExist('div.pay-type')) {
        addClass(find('button.' + button_class, find('div.pay-type')), 'ng-hide');
        find('button.' + button_class, find('div.pay-type')).id = 'org-' + id;
        createTag(find('div.pay-type'), 'button', id, 'btn ' + button_class + ' pay-type-btn fastclickable');
        createTag(find('#' + id), 'span', '', 'pay-type-content', text);
        createTag(find('#' + id + ' span'), 'i', '',  'fa ' + icon_type + ' fa-fw');
        find('#' + id).addEventListener('click', function(element) {
            openCheckOutPopup(id);
        });
    }
}
var popup_list = [
    'The Device was Returned to the Customer',
    'The Device is Still at the Store'
];
function createCheckOutButton(main_div, index) {
    console.log('index:', index);
    var butt = createTag(main_div, 'button', index.toString(), 'btn btn-confirm btn-fastclickable', popup_list[index]);
    butt.style.width = '100%';
    butt.style.padding = '10px';
    butt.style.margin = '10px';
    butt.addEventListener('click', function(element) {
        AutofillWaiter.addTable(function(table_number) {
            AutofillWaiter.checkButtonClick(table_number, 'Notes', 'span.hover-text');
            // find('div.bar-buttons button.blue').click();
            // sleep(250).then(() => {
            //     ImageWaiter.clearTable(table_number);
            // });
        });
        AutofillWaiter.addTable(function(table_number) {
            setText('none', popup_list[element.target.id] + '.');
            sleep(100).then(() => {
                AutofillWaiter.clearTable(table_number);
            });
        });
        AutofillWaiter.addTable(function(table_number) {
            AutofillWaiter.checkButtonClick(table_number, 'Create Note');
        });
        AutofillWaiter.addTable(function(table_number) {
            if (checkExist('div.toast-message')) {
                sleep(100).then(() => {
                    AutofillWaiter.clearTable(table_number)
                });
            }
        }, 250);
        AutofillWaiter.addTable(function(table_number) {
            AutofillWaiter.checkButtonClick(table_number, 'Check Out', 'span.hover-text');
        });
        AutofillWaiter.addTable(function(table_number) {
            if (checkExist('#id-credit')) {
                find('#org-checkout').click();
                console.log('Click: Credit Card');
                find('#org-credit').click();
                AutofillWaiter.clearTable(table_number);
                checkButtonClick('Close');
            } else if (checkExist('#id-trade-credit')) {
                find('#org-trade-credit').click();
                find('#org-trade-credit');
                AutofillWaiter.clearTable(table_number);
                checkButtonClick('Close');
            } else if (checkExist('#id-cash')) {
                find('#org-cash').click();
                console.log('Click: Cash');
                AutofillWaiter.clearTable(table_number);
                checkButtonClick('Close');
            } else if (checkExist('#id-gift-card')) {
                find('#org-gift-card').click();
                console.log('Click: Gift Card');
                AutofillWaiter.clearTable(table_number);
                checkButtonClick('Close');
            }
        });
    });
}
function openCheckOutPopup(id_of_fake) {
    var main_div = createPopup('Test Check Out');
    createTag(main_div, 'div', 'id-' + id_of_fake);
    for (var i = 0; i < popup_list.length; i++) {
        createCheckOutButton(main_div, i);
    }
}
AutofillWaiter.addSingle('checkout-popup', function() {
    if (findByText('span.hover-text', 'Check Out')) {
        if (findByAttribute('button', 'ng-click', 'clickMakePayment(GIFT_CARD)') &&
                   !checkExist('#gift-card')) {
            if (!findByAttribute('button.ng-hide', 'ng-click', 'clickMakePayment(GIFT_CARD)')) {
                switchButton('gift-card', 'btn-info', 'fa-gift', 'Gift Card');
            }
       } else if (findByAttribute('button', 'ng-click', 'clickMakePayment(CASH)') &&
                    !checkExist('#cash')) {
            if (!findByAttribute('button.ng-hide', 'ng-click', 'clickMakePayment(CASH)')) {
                switchButton('cash', 'btn-success', 'fa-money', 'Cash');
            }
        } else if (findByAttribute('button', 'ng-click', 'clickMakePayment(CREDIT)') &&
                    !checkExist('#credit')) {
            if (!findByAttribute('button.ng-hide', 'ng-click', 'clickMakePayment(CREDIT)')) {
                switchButton('credit', 'btn-warning', 'fa-credit-card', 'Credit');
            }
        } else if (findByAttribute('button', 'ng-click', 'clickMakePayment(TRADE_CREDIT)') &&
            !checkExist('#trade-credit')) {
            if (!findByAttribute('button.ng-hide', 'ng-click', 'clickMakePayment(TRADE_CREDIT)')) {
                switchButton('trade-credit', 'btn-default', 'fa-building', 'Trade Credit');
            }
        }
    }
});
