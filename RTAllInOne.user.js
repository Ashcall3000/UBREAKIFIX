// ==UserScript==
// @name         RT All In One
// @namespace    http://tampermonkey.net/
// @version      1.0.0
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
            create_workorder_ran = createWorkOrderPage();;
        } else {
            create_workorder_ran = RAN_WAITING;
        }
        // Runs on Work Order Page
        if (checkURL('https://portal.ubif.net/pos/checkout-new/') && workorder_ran == RAN_WAITING) {
            workOrderPage();
            workorder_ran = true;
        } else {
            workorder_ran = RAN_WAITING;
        }
    }, 500);
}());

/**
            Start Lead Page Section
*/
// List of iPhone Device Names
var iphone_list = [
    "iPhone 12 Pro Max",
    "iPhone 12 Pro",
    'iPhone 12',
    'iPhone 12 Mini',
    'iPhone SE (2nd Gen)',
    'iPhone 11 Pro Max',
    'iPhone 11 Pro',
    'iPhone 11',
    'iPhone XS Max',
    'iPhone XS',
    'iPhone XR',
    'iPhone X',
    'iPhone 8 Plus',
    'iPhone 8',
    'iPhone 7 Plus',
    'iPhone 7',
    'iPhone 6S Plus',
    'iPhone 6S',
    'iPhone 6 Plus',
    'iPhone 6'
];
// List of Samsung Galaxy Device Names
var samsung_list = [
    'Samsung Galaxy Note 20 Ultra',
    'Samsung Galaxy Note 20',
    'Samsung Galaxy Note 10 Plus',
    'Samsung Galaxy Note 10',
    'Samsung Galaxy Note 9',
    'Samsung Galaxy Note 8',
    'Samsung Galaxy S20 FE',
    'Samsung Galaxy S20 Ultra',
    'Samsung Galaxy S20 Plus',
    'Samsung Galaxy S20 5G',
    'Samsung Galaxy S20',
    'Samsung Galaxy S10 Plus',
    'Samsung Galaxy S10e',
    'Samsung Galaxy S10 Lite',
    'Samsung Galaxy S10 5G',
    'Samsung Galaxy S10',
    'Samsung Galaxy S9 Plus',
    'Samsung Galaxy S9',
    'Samsung Galaxy S8 Plus',
    'Samsung Galaxy S8',
    'Samsung Galaxy S7 Edge',
    'Samsung Galaxy S7',
    'Samsung Galaxy A71',
    'Samsung Galaxy A70',
    'Samsung Galaxy A51',
    'Samsung Galaxy A50',
    'Samsung Galaxy A21',
    'Samsung Galaxy A20',
    'Samsung Galaxy A11',
    'Samsung Galaxy A10e',
    'Samsung Galaxy A10'

];

// Button to remove part
var part_button = null;

function leadPage() {
    // Hide the original table
    if (!checkExist('#mobile-table')) { // Checks to see if we created new table yet
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
            //setData('part-button', find('div.action-buttons'));
            find('#remove-part-td').append(part_button);
            find('button', part_button).append(document.createTextNode('Remove Part'));
            replaceClass(find('button', part_button), 'icon-only', 'left-icon');
        }
    } else { // Button doesn't exist
        part_button = null;
    }
    // Grabbing the imei
    if (findByText('div.device-detail', 'IMEI')) {
        setData('imei', find('div.details', findByText('div.device-detail', 'IMEI')).innerText);
    }
    var sku = findByAttribute('td', 'ng-if', 'isLeadReserveOrNoReserve() || isReturn()', '', '', find('#old-table'));
    if (sku != null) {
        sku = sku.innerText;
    }
    var device_name = findSibling('label', 'div.details', 'Device').textContent;
    var item = findByAttribute('td', 'ng-click', 'editSaleItem(saleItem, true)', '', '', find('#old-table'));
    if (item != null) {
        item = item.innerText;
        if (device_name == '') {
            setData('device-type', getDeviceName(item));
        } else {
            setData('device-type', device_name);
        }
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
        find('#item-data').innerText = item;
        find('#sku-data').innerText = sku;
        find('#available-data').innerText = amount;
    }
}

function getDeviceName(text) {
    if (text.contains('Samsung')) {
        var index = inArray(text, samsung_list);
        if (index != -1) {
            return samsung_list[index];
        }
    } else if (text.contains('iPhone')) {
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
    // Checking to see if we can just create the workodrer or not
    if (!findByText('button', 'Continue')) {
        // Checking to see if the device is already selected
        if (!checkExist('div.selected') && getData('device-type') != '') {
            // Setting input field with device name and repair ie "iPhone 11 Repair"
            setField('#device-type-searchbox', 'input', getData('device-type') + ' Repair');
            var set_device_step_1 = RAN_WAITING;
            // Setting interval to check every second to if it worked
            var set_device_run_1 = setInterval(function() {
                // Checks to see if portal says device not found
                if (!findByText('a', 'Device not found:') && find('#device-type-searchbox').value != '') {
                    // Checks to see if device was found
                    if (findByText('a', getData('device-type') + ' Repair')) {
                        findByText('a', getData('device-type') + ' Repair').click();
                        set_device_step_1 = RAN_WORKED;
                        clearInterval(set_device_run_1);
                    }
                } else { // Portal says device wasn't found
                    set_device_step_1 = RAN_FAILED;
                    clearInterval(set_device_run_1);
                    // Portal is weird and changes ' Plus' to '+' for the device but not the item name
                    setField('#device-type-searchbox', 'input', getData('device-type').replace(' Plus', '+'));
                }
            }, 1000);
            var set_device_step_2 = RAN_WAITING;
            var set_device_run_2 = setInterval(function() {
                // Check to see if step one worked or not
                if (set_device_step_1 == RAN_FAILED) {
                    // Checks to see if portal says device not found
                    if (!findByText('a', 'Device not found:') && find('#device-type-searchbox').value != getData('device-type').replace(' Plus', '+')) {
                        // check to see if device was found
                        if (findByText('a', getData('device-type').replace(' Plus', '+'))) {
                            findByText('a', getData('device_type').replace(' Plus', '+')).click();
                            set_device_step_2 = RAN_WORKED;
                            clearInterval(set_device_run_2);
                        }
                    } else {
                        set_device_step_2 = RAN_FAILED;
                        clearInterval(set_device_run_2);
                        // Portal is weird and doesn't like the word repair after the device name sometimes
                        setField('#device-type-searchbox', 'input', getData('device-type'));
                    }
                } else if (set_device_step_1 == RAN_WORKED) {
                    clearInterval(set_device_run_2);
                }
            }, 1000);
            var set_device_step_3 = RAN_WAITING;
            var set_device_run_3 = setInterval(function() {
                // Check to see if step 2 worked or not
                if (set_device_step_2 == RAN_FAILED) {
                    // Checks to see if Portal Says device not found
                    if (!findByText('a', 'Device not found:') && find('#device-type-searchbox').value != getData('device-type')) {
                        // Checks to see if device was found
                        if (findByText('a', getData('device-type'))) {
                            findByText('a', getData('device-type')).click();
                            set_device_step_3 = RAN_WORKED;
                            clearInterval(set_device_run_3);
                        }
                    } else { // We were not able to find the device and device has to set manually
                        set_device_step_3 = RAN_FAILED;
                        clearInterval(set_device_run_3);
                    }
                // Check to see if any of the other steps were successfull or not
                } else if (set_device_step_1 == RAN_WORKED || set_device_step_2 == RAN_WORKED) {
                    clearInterval(set_device_run_3);
                }
            }, 1000);
        }
        // Search for and run imei fill section
        var imei_ran_1 = setInterval(function() {
            // Grab the IMEI field
            var imei_field = findByAttribute('input', 'ng-model', 'deviceData.imei');
            // Checking if IMEI field is on the page or not
            if (imei_field) {
                // check to make sure device has been selected
                if (checkExist('div.selected')) {
                    clearInterval(imei_ran_1);
                    // Checking if IMEI field is filled or not
                    if (imei_field.value.length != 15) {
                        // Checking to see if the IMEI  on lead is the full imei
                        if (getData('imei').length == 15) {
                            setField(imei_field, 'input', getData('imei'));
                        } else {
                            setField(imei_field, 'input', getData('imei') + '0');
                            var guess = 1;
                            // We start guessing what the last digit is
                            var imei_guess = setInterval(function() {
                                // checks to see if text invalid is there or not
                                if (findByAttribute('div', 'ng-if', 'isImeiInvalid()')) {
                                    // Checks to see if the Imei is valid or not
                                    if (findByAttribute('div', 'ng-if', 'isImeiInvalid()').textContent == 'Invalid') {
                                        setField(imei_field, 'input', getData('imei') + guess.toString());
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
        }, 1000);
    }
    var select_device_click = setInterval(function() {
        // Checks to see if the button is there to click
        if (findByText('button', 'Continue')) {
            if (!findByText('button', 'Continue').disabled) {
                var serial_field = findByAttribute('input', 'ng-model', 'deviceData.serial');
                var imei_field = findByAttribute('input', 'ng-model', 'deviceData.imei');
                // Checks to see if imei and serial are equal or if serial is equal to lead imei
                if (serial_field.value == imei_field.value ||
                    serial_field.value == getData('imei') ||
                    serial_field.value == getData('imei').substring(0, 14)) {
                    // Clear serial field
                    setField(serial_field, 'input', '');
                }
                clearInterval(select_device_click);
                console.log('Click Continue');
                //findByText('button', 'Continue').click();
            }
        }
    }, 1000);
    return RAN_WORKED;
}

function createWorkOrderPage() {
    // Runs everysecond
    var create_workorder_run = setInterval(function() {
        // Checks to see if you can create the work order yet or not
        if (!findByText('button', 'Create Work Order')) {
            // A samsung repair checks for cracked screen option
            if (findByText('div.repair-info-title', 'Cracked Screen')) {
                // Samsung repair saying it's a cracked screen.
                findByText('div.repair-info-title', 'Cracked Screen').click();
            }
            // Checks to see if the out of warranty drop down is available
            if (checkExist('div.warranty-reason > select')) {
                // Set reason as Impact Damage
                find('div.warranty-reason > select').value = 0;
                runAngularTrigger('div.warranty-reason > select', 'change');
            }
            // Checks to see if we can click button to Continue
            if (findByText('button', 'Out Of Warranty')) {
                findByText('button', 'Out Of Warranty').click();
                clearInterval(create_workorder_run);
            }
        } else {
            // Click Continue
            findByText('button', 'Create Work Order').click();
            clearInterval(create_workorder_run);
        }
    }, 500);
    return RAN_WORKED;
}

function workOrderPage() {
    // Add button the change progress of repair
    var workorder_button_create_run = setInterval(function() {
        if (!checkExist('#auto-note-button') && checkExist('div.header-buttons')) {
            createTag(find('div.header-buttons'), 'button', 'auto-note-button', 'btn blue fastclickable', 'Generate Ticket', 'background-color: rgb(38, 156, 216); color: white;');
        }
        if (!checkExist('#scan-open-button') && checkExist('div.table-card')) {
            createTagBefore(find('div.table-card'), 1, 'button', 'scan-open-button', 'btn btn-cancel fastclickable', 'Scan Parts', 'width: 100%');
            find('#scan-open-button').addEventListener('click', function() {
                if (findByAttribute('img.fastclickable', 'ng-click', 'openScanItemsModal()')) {
                    findByAttribute('img.fastclickable', 'ng-click', 'openScanItemsModal()').click();
                }
            });
        }
        if (checkExist('#auto-note-button') && checkExist('#scan-open-button')) {
            clearInterval(workorder_button_create_run);
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

/**
            Helper Functions
*/

function inArray(item, array) {
    for (var i = 0; i < array.length; i++) {
        if (item == array[i]) {
            return i;
        }
    }
    return -1;
}

function getData(key) {
    return window.localStorage.getItem([key]);
}

function setData(key, item) {
    window.localStorage.setItem(key, item);
}
