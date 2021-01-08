// ==UserScript==
// @name         RT All In One
// @namespace    http://tampermonkey.net/
// @version      1.0.4
// @description  Makes the UBIF RT experience more automated so that you can spend more time doing the repair and less on the paperwork.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/SearchElements.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/RTAllInOne.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/RTAllInOne.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==
var RAN_WORKED = 1;
var RAN_FAILED = -1;
var RAN_WAITING = 0;
var lead_page_ran = RAN_WAITING;
var select_device_ran = RAN_WAITING;
var create_workorder_ran = RAN_WAITING;
var workorder_ran = RAN_WAITING;
(function() {
    var check_run = setInterval(function() {
        if (checkURL('https://portal.ubif.net/store-ops/timeclock') && !checkExist('#update-button')) { // Check to see if update button is there
            createTagAppend(find('.portal-actions'), 'button', 'update-button', 'btn blue left-icon fastclickable', 'Update Script', 'background-color: rgb(38, 156, 216); color: white;');
            createTag(find('#update-button'), 'span', '', 'fa fa-fw fa-refresh');
            find('#update-button').addEventListener('click', function() {
                window.open('https://github.com/Ashcall3000/UBREAKIFIX/raw/master/RTAllInOne.user.js');
            });
        }
        // Runs on the lead page
        if (checkURL('https://portal.ubif.net/pos/aqleads/edit/') && lead_page_ran == RAN_WAITING) {
            lead_page_ran = leadPage();
        } else {
            lead_page_ran = RAN_WAITING;
        }
        // Runs on select device page
        if (checkURL('https://portal.ubif.net/pos/device-type-select/lead/') && select_device_ran == RAN_WAITING) {
            select_device_ran = selectDevicePage();
        } else {
            select_device_ran = RAN_WAITING;
        }
        // Runs on Continue page
        if (checkURL('https://portal.ubif.net/pos/device-repair-select/') && create_workorder_ran == RAN_WAITING) {
            create_workorder_ran = createWorkOrderPage();
            imei = '';
            device_type = '';
            part_button = null;
        } else {
            create_workorder_ran = RAN_WAITING;
        }
        // Runs on Work Order Page
        if (checkURL('https://portal.ubif.net/pos/checkout-new/')) {
            if (workorder_ran == RAN_WAITING) {
                workOrderPage();
                workorder_ran = true;
            } else {
                workorder_ran = RAN_WAITING;
            }
            if (checkExist('#ticket-button') && checkExist('span.bg-repair-in-progress')) {
                if (find('#ticket-button').innerText == 'Generate Ticket') {
                    find('#ticket-button').innerText = 'Close Ticket'
                }
            }
        }
    }, 500);
}());

/**
            Start Lead Page Section
*/
// List of iPhone Device Names
var iphone_list = [
    'iPhone 12',
    'iPhone 12 Pro',
    'iPhone 12 Mini',
    'iPhone 12 Pro Max',
    'iPhone SE (2nd Gen)',
    'iPhone 11',
    'iPhone 11 Pro',
    'iPhone 11 Pro Max',
    'iPhone XS Max',
    'iPhone XS',
    'iPhone XR',
    'iPhone X',
    'iPhone 8',
    'iPhone 8 Plus',
    'iPhone 7',
    'iPhone 7 Plus',
    'iPhone 6S',
    'iPhone 6S Plus',
    'iPhone 6',
    'iPhone 6 Plus'
];
// List of Samsung Galaxy Device Names
var samsung_list = [
    'Samsung Galaxy Note 20',
    'Samsung Galaxy Note 20 Ultra',
    'Samsung Galaxy Note 10',
    'Samsung Galaxy Note 10 Plus',
    'Samsung Galaxy Note 9',
    'Samsung Galaxy Note 8',
    'Samsung Galaxy S20',
    'Samsung Galaxy S20 FE',
    'Samsung Galaxy S20 Ultra',
    'Samsung Galaxy S20 Plus',
    'Samsung Galaxy S20 5G',
    'Samsung Galaxy S10 Plus',
    'Samsung Galaxy S10',
    'Samsung Galaxy S10e',
    'Samsung Galaxy S10 Lite',
    'Samsung Galaxy S10 5G',
    'Samsung Galaxy S9',
    'Samsung Galaxy S9 Plus',
    'Samsung Galaxy S8',
    'Samsung Galaxy S8 Plus',
    'Samsung Galaxy S7',
    'Samsung Galaxy S7 Edge',
    'Samsung Galaxy A71',
    'Samsung Galaxy A70',
    'Samsung Galaxy A51',
    'Samsung Galaxy A50',
    'Samsung Galaxy A21',
    'Samsung Galaxy A20',
    'Samsung Galaxy A11',
    'Samsung Galaxy A10',
    'Samsung Galaxy A10e'

];

// Button to remove part
var part_button = null;
var imei = '';
var device_type = '';

function leadPage() {
    var close_window = setInterval(function() {
        if (findByText('span', 'Dismiss')) {
            findByText('span', 'Dismiss').click();
            clearInterval(close_window);
        }
        if (checkExist('#mobile-table')) {
            clearInterval(close_window);
        }
    }, 250);
    // Hide the original table
    if (!checkExist('#mobile-table') && !findByText('span', 'Dismiss')) { // Checks to see if we created new table yet
        if (checkExist('div.table-hold')) {
            find('div.table-hold').setAttribute('hidden', '');
            find('div.table-hold').id = 'old-table';
            // Create New Table
            createLeadTable();
            // Update Data in New Table
            updateLeadTable();
            return RAN_WORKED;
        }
    }
    return RAN_WAITING;
}

function createLeadTable() {
    var start_loc = find('sale-item-list');
    var main_div = createTag(start_loc, 'div', 'mobile-table', 'table-hold');
    var main_table = createTag(main_div, 'table', '', 'table portal-table flatTable table-stripped table-responsive');
    // Item Header Row
    var tr = createTag(main_table, 'tr', '', 'header-row');
    var thd = createTag(tr, 'th', '', 'center-data');
    createTag(thd, 'div', '', '', 'Item');
    // Item Data Row
    tr = createTagAppend(main_table, 'tr', '', '');
    thd = createTag(tr, 'td', '', 'center-data');
    createTag(thd, 'span', 'item-data', '');
    // SKU Header Row
    tr = createTagAppend(main_table, 'tr', '', 'header-row');
    thd = createTag(tr, 'th', '', 'center-data');
    createTag(thd, 'div', '', '', 'SKU');
    // SKU Data Row
    tr = createTagAppend(main_table, 'tr', '', '');
    thd = createTag(tr, 'td', '', 'center-data');
    createTag(thd, 'span', 'sku-data', '');
    // Serial Header Row
    tr = createTagAppend(main_table, 'tr', '', 'header-row');
    thd = createTag(tr, 'th', '', 'center-data');
    createTag(thd, 'div', '', '', 'Serial');
    // Serial Data Row
    tr = createTagAppend(main_table, 'tr', '', '');
    thd = createTag(tr, 'td', '', 'center-data');
    createTag(thd, 'span', 'serial-data', '');
    // Amount Available Header Row
    tr = createTagAppend(main_table, 'tr', '', 'header-row');
    thd = createTag(tr, 'th', '', 'center-data');
    createTag(thd, 'div', '', '', 'Available');
    // Amount Available Data Row
    tr = createTagAppend(main_table, 'tr', '', '');
    thd = createTag(tr, 'td', '', 'center-data');
    createTag(thd, 'span', 'available-data', '');
    // Remove Part Header Row
    tr = createTagAppend(main_table, 'tr', '', 'header-row');
    thd = createTag(tr, 'th', '', 'center-data');
    createTag(thd, 'div', '', '', 'Remove Part');
    // Remove Part Data Row
    tr = createTagAppend(main_table, 'tr', '', '');
    createTag(tr, 'td', 'remove-part-td', 'center-data');
}

function updateLeadTable() {
    // Moves the remove part button to new spot.
    if (checkExist('div.action-buttons')) { // Checks if button exists
        if (part_button === null) { // Checks if Variable has value ie has been moved.
            console.log("running");
            part_button = find('div.action-buttons');
            find('#remove-part-td').append(part_button);
            find('button', part_button).append(document.createTextNode('Remove Part'));
            //replaceClass(find('button', part_button), 'icon-only', 'left-icon');
        }
    } else { // Button doesn't exist
        part_button = null;
    }
    // Grabbing the imei
    if (findByText('div.device-detail', 'IMEI')) {
        imei = find('div.details', findByText('div.device-detail', 'IMEI')).innerText;
    }
    var sku = findByAttribute('td', 'ng-if', 'isLeadReserveOrNoReserve() || isReturn()', '', '', find('#old-table'));
    if (sku != null) {
        sku = sku.innerText;
        find('#sku-data').innerText = sku;
    }
    var device_name = findSibling('label', 'div.details', 'Device').textContent;
    var item = findByAttribute('td', 'ng-click', 'editSaleItem(saleItem, true)', '', '', find('#old-table'));
    if (item != null) {
        item = item.innerText;
        if (device_name == '') {
            device_type = getDeviceName(item);
        } else {
            device_type = device_name;
        }
        find('#item-data').innerText = item;
    }
    var serial = findByAttribute('td', 'ng-if', '!isSaleItemService(saleItem) && hasSaleItemLabel(saleItem)', '', '', find('#old-table'));
    if (serial) {
        serial = serial.innerText.substring(6);
        find('#serial-data').innerText = serial;
    }
    var amount = findByAttribute('span', 'ng-if', '!saleItem.inventory.store_item.item.is_service', '', '', find('#old-table'));
    if (amount != null) {
        amount = amount.innerText;
    }
    if (checkExist('#mobile-table')) {
        if (item) {
            find('#item-data').innerText = item;
        } else {
            find('#item-data').innerText = "Error";
        }
        if (sku) {
            find('#sku-data').innerText = sku;
        } else {
            find('#sku-data').innerText = "Error";
        }
        if (amount) {
            find('#available-data').innerText = amount;
        } else {
            find('#available-data').innerTExt = "Error";
        }
    }
}

function getDeviceName(text) {
    if (text.includes('Samsung')) {
        var index = inArray(text, samsung_list);
        if (index != -1) {
            return samsung_list[index];
        }
    } else if (text.includes('iPhone')) {
        var index = inArray(text, iphone_list);
        if (index != -1) {
            return iphone_list[index];
        }
    }
    return '';
}
/**
            End Lead Page Section
*/
function selectDevicePage() {
    if (!findByText('button', 'Continue')) { // Checking to see if we can just create the workorder or not
        if (!checkExist('div.selected') && device_type != '') { // Checking to see if the device is already selected
            setField('#device-type-searchbox', 'input', device_type.trim() + ' Repair');
            Waiter.addTable(function(table_number) {
                if (!findByText('a', 'Device not found:') && find('#device-type-searchbox').value != '') { // Checks to see if portal says device not found
                    if (!checkButtonClick(table_number, device_type.trim() + ' Repair'), 'a') {
                        setField('#device-type-searchbox', 'input', device_type.replace(' Plus', '+'));
                    }
                } else if (findByText('a', 'Device not found:')) {
                    Waiter.clearTable(table_number);
                }
            }, 1000, );
            Waiter.addTable(function(table_number) {
                if (!findByText('a', 'Device not found:') && find('#device-type-searchbox').value != device_type.replace(' Plus', '+')) {
                    if (checkButtonClick(table_number, device_type.replace(' Plus', '+'), 'a')) {
                        Waiter.tableClearBefore(table_number);
                    } else {
                        setField('#device-type-searchbox', 'input', device_type);
                    }
                } else if (findByText('a', 'Device not found:')) {
                    Waiter.clearTable(table_number);
                }
            });
            Waiter.addTable(function(table_number) {
                if (!findByText('a', 'Device not found:') && find('#device-type-searchbox').value != device_type) {
                    if (!checkButtonClick(table_number, device_type, 'a')) {
                        Waiter.tableClearBefore(table_number);
                    }
                } else if (findByText('a', 'Device not found:')) {
                    Waiter.clearTable(table_number);
                }
            });
        }
        Waiter.addTable(function(table_number) {
            var imei_field = findByAttribute('input', 'ng-model', 'deviceData.imei'); // Grab the imei field
            if (imei_field) { // Check if imei field is on the page or not
                if (checkExist('div.selected')) { // Double check to make sure device has been selected
                    Waiter.clearTable(table_number); // Stop the interval
                    if (imei_field.value.length != 15) { // checking if the imie field is already filled
                        if (imei.length == 15) { // Checking to see if the imei on lead is the full imei
                            setField(imei_field, 'input', imei);
                        } else {
                            setField(imei_field, 'input', imei + '0');
                            var guess = 1;
                            var imei_guess = setInterval(function() { // We start guessing what the last digit is
                                if (findByAttribute('div', 'ng-if', 'isImeiInvalid()')) { // checks to see if text invalid is there or not
                                    if (findByAttribute('div', 'ng-if', 'isImeiInvalid()').textContent == 'Invalid') { // Checks to see if the Imei is valid or not
                                        setField(imei_field, 'input', imei + guess.toString());
                                        guess += 1;
                                    }
                                } else if (findByText('button', 'Continue')) {
                                    clearInterval(imei_guess);
                                }
                            }, 500);
                        }
                    }
                }
            }
        });
    }
    Waiter.addTable(function(table_number) {
        if (findByText('button', 'Continue')) { // Checks to see if the button can be clicked
            if (!findByText('button', 'Continue').disabled) { // Checks to see if we can click the button
                var serial_field = findByAttribute('input', 'ng-model', 'deviceData.serial');
                var imei_field = findByAttribute('input', 'ng-model', 'deviceData.imei');
                if (serial_field.value == imei_field.value ||
                    serial_field.value == imei ||
                    serial_field.value == imei.substring(0, 14)) { // Checks to see if imei and serial are equal or if serial is equal to lead imei
                    setField(serial_field, 'input', '');
                }
                checkButtonClick(table_number, 'Continue');
            }
        }
    });
    return RAN_WORKED;
}

function createWorkOrderPage() {
    if (!Waiter.isEmpty()) {
        Waiter.clearAllTables();
    }
    Waiter.addTable(function(table_number) {
        console.log('Table Number:', table_number);
        if (!findByText('button', 'Create Work Order')) { // Checks to see if you can't create the work order yet
            if (findByText('div.repair-info-title', 'Cracked Screen')) { // A samsung repair checks for cracked screen option
                findByText('div.repair-info-title', 'Cracked Screen').click(); // Samsung repair saying it's a cracked screen.
            }
            if (checkExist('div.warranty-reason > select')) { // Checks to see if the out of warranty drop down is available
                find('div.warranty-reason > select').value = 0; // Set reason as Impact Damage
                runAngularTrigger('div.warranty-reason > select', 'change');
            }
            checkButtonClick(table_number, 'Out Of Warranty');
        } else { // this means you can create the work order
            checkButtonClick(table_number, 'Create Work Order');
        }
    });
    Waiter.addTable(function(table_number) {
        console.log('Table Number:', table_number);
        if (findByText('button', 'Submit and Open Work Order')) {
            if (checkExist('#customer-email')) {
                if (find('#customer-email').value == '') {
                    setField('#customer-email', 'input', 'decline@customer.com');
                }
                Waiter.clearTable(table_number);
            }
        }
    });
    Waiter.addTable(function(table_number) {
        console.log('Table Number:', table_number);
        checkButtonClick(table_number, 'Submit and Open Work Order');
    });
    return RAN_WORKED;
}

function workOrderPage() {
    if (!Waiter.isEmpty()) {
        Waiter.clearAllTables();
    }
    Waiter.addTable(function(table_number) { // Add button the change progress of repair
        if (!checkExist('#ticket-button') && checkExist('div.header-buttons')) {
            var auto_note_button = createTag(find('div.header-buttons'), 'button', 'ticket-button', 'btn blue fastclickable', 'Generate Ticket', 'background-color: rgb(38, 156, 216); color: white;');
            auto_note_button.addEventListener('click', function() {
                if (button.innerText == 'Generate Ticket') {
                    if (find('span.only-name').innerText.includes('IPHONE')) {
                        iPhoneinProgress();
                    } else if (find('span.only-name').innerText.includes('SAMSUNG')) {
                        inProgressSamsung();
                    }
                } else if (button.innerText == 'Close Ticket') {
                    if (find('span.only-name').innerText.includes('IPHONE')) {
                        iPhoneCloseTicket();
                    } else if (find('span.only-name').innerText.includes('SAMSUNG')) {
                        samsungCloseTicket();
                    }
                }
            });
        }
        if (!checkExist('#scan-open-button') && checkExist('div.table-card')) {
            createTagBefore(find('div.table-card'), 1, 'button', 'scan-open-button', 'btn btn-cancel fastclickable', 'Scan Parts', 'width: 100%');
            find('#scan-open-button').addEventListener('click', function() {
                if (findByAttribute('img.fastclickable', 'ng-click', 'openScanItemsModal()')) {
                    findByAttribute('img.fastclickable', 'ng-click', 'openScanItemsModal()').click();
                }
            });
        }
        if (checkExist('#ticket-button') && checkExist('#scan-open-button')) {
            Waiter.clearTable(table_number);
        }
    }, 500);
    // add button to open scan dialog if there is a part that hasn't been scanned yet
    var workorder_scan_button_run = setInterval(function() {
        if (!checkExist('#scan-camera-button') && findByText('h3.modal-title', 'VERIFY ITEM LABELS/SERIALS')
            && findByAttribute('img.fastclickable', 'ng-click', 'openScanItemsModal()')) {
            // Create button
            createTagBefore(find('div.barcode-start'), 1, 'button', 'scan-camera-button', 'btn btn-cancel fastclickable', 'Open Scanner', 'width: 100%');
            find('#scan-camera-button').addEventListener('click', function() {
                if (findByText('button', 'Cannot Scan Label')) {
                    findByText('button', 'Cannot Scan Label').click();
                }
            });
        } else if (!findByAttribute('img.fastclickable', 'ng-click', 'openScanItemsModal()')) {
            clearInterval(workorder_scan_button_run);
        }
    }, 500);

    // page opens to scan items
    // Add button to open camera and scan part to the dialog
    // auto click cannot scan label and select field to type in for scanner
    // Put the Samsung device in progress
    // check if it's Samsung and if so click Create GSPN Repair Ticket button
    // click Create Repair Ticket button
    // click close button
    // put the repair into progress

}
var note_button = '#paneled-side-bar > div > div.bar-buttons > button.btn.blue.fastclickable';

function iPhoneinProgress() {
    createNote('Repair in Progress', 'Device is being repaired.');
    Waiter.addTable(function(table_number) {
        checkButtonClick(table_number, 'Create Repair Ticket');
    });
    Waiter.addTable(function(table_number) {
        checkButtonClick(table_number, 'Proceed');
    });
}

function iPhoneCloseTicket() {
    createNote('Quality Inspection', 'Device is repaired and is going through testing.');
    Waiter.addTable(function(table_number) {
        checkButtonClick(table_number, 'Add', 'button.btn-confirm');
    });
    Waiter.addTable(function(table_number) {
        checkButtonClick(table_number, 'Test Complete');
    });
    Waiter.addTable(function(table_number) {
        checkButtonClick(table_number, 'Done');
    });
    Waiter.addTable(function(table_number) {
        if (checkExist('div.toast-message')) {
            sleep(250).then(() => {
                Waiter.clearTable(table_number)
            })
        }
    });
    Waiter.addTable(function(table_number) {
        if (checkExist('span.bg-quality-inspection')) {
            createNote('Repaired - RFP', 'Device is repaired and ready to be returned to the customer.', 1000);
            Waiter.clearTable(table_number);
        }
    });
    Waiter.addTable(function(table_number) {
        checkButtonClick(table_number, 'Add', 'button.btn-confirm');
    });
    Waiter.addTable(function(table_number) {
        checkButtonClick(table_number, 'Check Out', 'span.hover-text');
    });
    Waiter.addTable(function(table_number) {
        if (checkButtonClick(table_number, 'TRADE CREDIT')) {
            Waiter.clearAllTables();
        }
    });
}

function inProgressSamsung() {
    if (!Waiter.isEmpty()) {
        Waiter.clearAllTables();
    }
    Waiter.addTable(function(table_number) {
        checkButtonClick('Create GSPN Repair Ticket');
    });
    Waiter.addTable(function(table_number) {
        checkButtonClick('Create Repair Ticket');
    });
    Waiter.addTable(function(table_number) {
        checkButtonClick('Close', '.modal-dialog button');
    });
    Waiter.addTable(function(table_number) {
        createNote('Repair in Progress', 'Device is bieng repaired.');
        Waiter.clearAllTables();
    });
}

function samsungCloseTicket() {}

// Total sleep time 350
function createNote(status, text, sleep_time=0) {
    find(note_button).click();
    sleep(sleep_time + 250).then(() => {
        if (!checkExist('#paneled-side-bar.closed')) {
            var els = findAll('div.extra-actions > select > option');
            for (var i = 0; i < els.length; i++) {
                if (els[i].innerText == status) {
                    find('select.editor-add-in').value = i;
                    break;
                }
            }
        }
        // write in progress in field
        find('.note-placeholder').style = 'display: none;';
        find('.note-editable').innerHTML = text;
        setField('.note-editable', 'input', text);
        find('select.editor-add-in').click();
        runAngularTrigger('div.extra-actions > select', 'change');
        if (find('#private').checked) {
            find('#private').click();
        }
        sleep(sleep_time + 250).then(() => {
            findByText('button', 'Create Note').click();
        });
        sleep(sleep_time + 350).then(() => {
            find(note_button).click();
        });
    });
    return sleep_time + 600;
}

/**
            Helper Functions
*/

function checkButtonClick(table_number, title, selector='button') {
    var button = findByText(selector, title);
    if (button) {
        if (!button.disabled) {
            button.click();
            sleep(250).then(() => {
                Waiter.clearTable(table_number);
            });
            return true;
        }
    }
    return false;
}

var Waiter = {
    waiting_list: [],
    table_list: [],
    addTable: function(orderCheck, check_time=1000, clearCondition=false) {
        var table_number = this.waiting_list.length;
        this.table_list.push(false);
        this.waiting_list.push(setInterval(Waiter.checkTable, check_time, table_number, orderCheck, clearCondition));
        return this.waiting_list.length - 1; // Returns current index
    },
    checkTable: function(table_number, orderCheck, clearCondition) {
        if (clearCondition == false) {
            if (table_number > 0) {
                if (Waiter.table_list[table_number - 1]) {
                    orderCheck(table_number);
                }
            } else {
                orderCheck(table_number);
            }
        } else if (clearCondition.typeof == 'function') {
            if (!clearCondition()) {
                if (table_number > 0) {
                    if (Waiter.table_list[table_number - 1]) {
                        orderCheck(table_number);
                    }
                } else {
                    orderCheck(table_number);
                }
            } else {
                Waiter.clearAllTables();
            }
        }
    },
    clearTable: function(table_number) {
        if (table_number < Waiter.table_list.length &&
            table_number < Waiter.waiting_list.length) {
            Waiter.table_list[table_number] = true;
            clearInterval(Waiter.waiting_list[table_number]);
        }
    },
    tableClearBefore: function(table_number) {
        for (var i = 0; i <= table_number; i++) {
            if (!Waiter.table_list[i]) {
                return false;
            }
        }
        return true;
    },
    clearAllTables: function() {
        for (var i = 0; i < Waiter.waiting_list.length; i++) {
            clearInterval(Waiter.waiting_list[i]);
        }
        Waiter.waiting_list = [];
        Waiter.table_list = [];
    },
    amountOfTables: function() {
        return Waiter.waiting_list.length;
    },
    isEmpty: function() {
        if (Waiter.amountOfTables() > 0) {
            return false;
        }
        return true;
    }
}

function inArray(item, array) {
    for (var i = 0; i < array.length; i++) {
        if (item.includes(array[i])) {
            return i;
        }
    }
    return -1;
}

function replaceClass(loc, original_class_name, new_class_name) {
    if (loc.className.includes(original_class_name)) {
        var old_class = loc.className;
        loc.className = old_class.replaceAll(original_class_name, new_class_name);
    }
}
