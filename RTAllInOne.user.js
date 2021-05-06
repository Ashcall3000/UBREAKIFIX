// ==UserScript==
// @name         RT All In One
// @namespace    http://tampermonkey.net/
// @version      1.2.4
// @description  Makes the UBIF RT experience more automated so that you can spend more time doing the repair and less on the paperwork.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/SearchElements.js
// @require      https://github.com/serratus/quaggaJS/raw/master/dist/quagga.min.js
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
(function () {
    var check_run = setInterval(function () {
        if (checkURL('https://portal.ubif.net/store-ops/timeclock') && !checkExist('#update-button')) { // Check to see if update button is there
            createTagAppend(find('.portal-actions'), 'button', 'update-button', 'btn blue left-icon fastclickable', 'Update Script', 'background-color: rgb(38, 156, 216); color: white;');
            createTag(find('#update-button'), 'span', '', 'fa fa-fw fa-refresh');
            find('#update-button').addEventListener('click', function () {
                window.open('https://github.com/Ashcall3000/UBREAKIFIX/raw/master/RTAllInOne.user.js');
            });
        }
        // Runs on the lead page
        if (checkURL('https://portal.ubif.net/pos/aqleads/edit/')) {
            if (lead_page_ran == RAN_WAITING) {
                lead_page_ran = leadPage();
            }
        } else {
            lead_page_ran = RAN_WAITING;
        }
        // Runs on select device page
        if (checkURL('https://portal.ubif.net/pos/device-type-select/lead/')) {
            if (select_device_ran == RAN_WAITING) {
                select_device_ran = selectDevicePage();
            }
        } else {
            select_device_ran = RAN_WAITING;
        }
        // Runs on Continue page
        if (checkURL('https://portal.ubif.net/pos/device-repair-select/')) {
            if (create_workorder_ran == RAN_WAITING) {
                create_workorder_ran = createWorkOrderPage();
                imei = '';
                device_type = '';
                part_button = null;
            }
        } else {
            create_workorder_ran = RAN_WAITING;
        }
        // Runs on Work Order Page
        if (checkURL('https://portal.ubif.net/pos/checkout-new/')) {
            if (workorder_ran == RAN_WAITING) {
                workOrderPage();
                workorder_ran = RAN_WORKED;
            }
            if (checkExist('#ticket-button') && checkExist('span.bg-repair-in-progress')) {
                if (find('#ticket-button').innerText == 'Generate Ticket') {
                    find('#ticket-button').innerText = 'Close Ticket'
                }
            }
        } else {
            Waiter.clearSingle('ticket-button');
            workorder_ran = RAN_WAITING;
        }
    }, 500);
}());


// #region LeadPage
/**
            Start Lead Page Section
*/
// List of iPhone Device Names
var iphone_list = [
    'iPhone 12 Pro',
    'iPhone 12 Mini',
    'iPhone 12 Pro Max',
    'iPhone 12',
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
    'Samsung Galaxy Note 21 Ultra'
    'Samsung Galaxy Note 21',
    'Samsung Galaxy S21 Ultra',
    'Samsung Galaxy S21 Plus',
    'Samsung Galaxy S21',
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
var imei = '';
var device_type = '';

function leadPage() {
    var close_window = setInterval(function () {
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
    var strongs = findAllByText('strong', 'Label');
    if (strongs.length > 1) {
        window.localStorage['parts_amount'] = 2;
        window.localStorage['part-serial2'] = strongs[1].parentElement.innerText.substring(7);
    } else {
        window.localStorage['parts_amount'] = 1;
    }
    window.localStorage['part-serial'] = strongs[0].parentElement.innerText.substring(7);
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
// #endregion
//#region SelectDevicePage
function selectDevicePage() {
    if (!findByText('button', 'Continue') || findByText('button', 'Continue').disabled) { // Checking to see if we can just create the workorder or not
        if (!checkExist('div.selected') && device_type != '') { // Checking to see if the device is already selected
            setField('#device-type-searchbox', 'input', device_type.trim() + ' Repair');
            Waiter.addTable(function (table_number) {
                console.log('First Table');
                if (checkExist('div.selected')) {
                    Waiter.clearTablesBefore(2);
                } else if (checkExist('ul.search-dropdown li')) {
                    if (!findByText('a', 'Device not found:') && find('#device-type-searchbox').value != '') { // Checks to see if portal says device not found
                        if (!checkButtonClick(table_number, device_type.trim() + ' Repair', 'a')) {
                            setField('#device-type-searchbox', 'input', device_type.replace(' Plus', '+'));
                        } else {
                            Waiter.clearTablesBefore(2);
                        }
                    } else if (findByText('a', 'Device not found:')) {
                        setField('#device-type-searchbox', 'input', device_type.replace(' Plus', '+'));
                        sleep(250).then(() => {
                            Waiter.clearTable(table_number);
                        });
                    }
                }
            });
            Waiter.addTable(function (table_number) {
                console.log('Second Table');
                if (checkExist('ul.search-dropdown li')) {
                    if (!findByText('a', 'Device not found:') && find('#device-type-searchbox').value == device_type.replace(' Plus', '+')) {
                        if (checkButtonClick(table_number, device_type.replace(' Plus', '+'), 'a')) {
                            Waiter.clearTablesBefore(2);
                        } else {
                            setField('#device-type-searchbox', 'input', device_type);
                        }
                    } else if (findByText('a', 'Device not found:')) {
                        setField('#device-type-searchbox', 'input', device_type);
                        sleep(250).then(() => {
                            Waiter.clearTable(table_number);
                        });
                    }
                }
            });
            Waiter.addTable(function (table_number) {
                console.log('Third Table');
                if (checkExist('ul.search-dropdown li')) {
                    if (!findByText('a', 'Device not found:') && find('#device-type-searchbox').value == device_type) {
                        if (!checkButtonClick(table_number, device_type, 'a')) {
                            Waiter.clearTablesBefore(table_number);
                        }
                    } else if (findByText('a', 'Device not found:')) {
                        Waiter.clearTable(table_number);
                    }
                }
            });
        }
        Waiter.addTable(function (table_number) {
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
                            var imei_guess = setInterval(function () { // We start guessing what the last digit is
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
    Waiter.addTable(function (table_number) {
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
//#endregion
//#region CreateWorkOrderPage
function createWorkOrderPage() {
    if (!Waiter.isEmpty()) {
        Waiter.clearAllTables();
    }
    Waiter.addSingle('samsung-warranty', function () {
        if (findByText('button', 'Standard Work Order')) {
            if (checkExist('#customer-email')) {
                if (find('#customer-email').value == '') {
                    setField('#customer-email', 'input', 'decline@customer.com');
                }
            }
            findByText('button', 'Standard Work Order').click();
            Waiter.clearSingle('samsung-warranty');
        }
        if (!checkURL('https://portal.ubif.net/pos/device-repair-select/')) {
            Waiter.clearSingle('samsung-warranty');
        }
    })
    Waiter.addTable(function (table_number) {
        console.log('Table Number:', table_number);
        if (!findByText('button', 'Create Work Order')) {
            // Might be samsung lets check
            // It's a samsung
            if (findByText('div.repair-info-title', 'Cracked Screen')) { // A samsung repair checks for cracked screen option
                findByText('div.repair-info-title', 'Cracked Screen').click(); // Samsung repair saying it's a cracked screen.
            }
            if (checkExist('div.warranty-reason > select')) { // Checks to see if the out of warranty drop down is available
                find('div.warranty-reason > select').value = 0; // Set reason as Impact Damage
                runAngularTrigger('div.warranty-reason > select', 'change');
            }
            checkButtonClick(table_number, 'Out Of Warranty');
        } else {
            // Not a samsung
            checkButtonClick(table_number, 'Create Work Order');
        }
    });
    Waiter.addTable(function (table_number) {
        // Check if it's samsung or an iphone
        if (!findByText('button', 'Create Work Order')) {
            if (findByText('button', 'Out Of Warranty')) {
                Waiter.clearTable(table_number);
            }
        } else {
            checkButtonClick(table_number, 'Create Work Order');
        }
    });
    Waiter.addTable(function (table_number) {
        if (findByText('button', 'Out Of Warranty')) {
            if (findByText('button', 'Out Of Warranty').disabled) {
                checkButtonClick(table_number, 'Cracked Screen', 'div.repair-info-title');
            } else {
                checkButtonClick(table_number, 'Out Of Warranty');
            }
        } else {
            Waiter.clearTable(table_number);
        }
    });
    Waiter.addTable(function (table_number) {
        if (findByText('button', 'Out Of Warranty')) {
            if (findByText('button', 'Out Of Warranty').disabled) {
                if (checkExist('div.warranty-reason > select')) { // Checks to see if the out of warranty drop down is available
                    find('div.warranty-reason > select').value = 0; // Set reason as Impact Damage
                    runAngularTrigger('div.warranty-reason > select', 'change');
                    Waiter.clearTable(table_number);
                }
            } else {
                checkButtonClick(table_number, 'Out Of Warranty');
            }
        } else {
            Waiter.clearTable(table_number);
        }
    });
    Waiter.addTable(function (table_number) {
        if (findByText('button', 'Out Of Warranty')) {
            checkButtonClick(table_number, 'Out Of Warranty');
        } else {
            Waiter.clearTable(table_number);
        }
    })
    Waiter.addTable(function (table_number) {
        if (!checkButtonClick(table_number, 'Yes')) {
            if (findByText('button', 'Submit and Open Work Order')) {
                Waiter.clearTable(table_number);
            }
        }
    });
    Waiter.addTable(function (table_number) {
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
    Waiter.addCheckButtonTable('Submit and Open Work Order');
    return RAN_WORKED;
}
//#endregion
//#region WorkOrderPage
function workOrderPage() {
    if (!Waiter.isEmpty()) {
        Waiter.clearAllTables();
    }
    Waiter.addSingle('ticket-button', function () { // Add button the change progress of repair
        if (!checkExist('#ticket-button') && checkExist('div.header-buttons')) {
            var auto_note_button = createTag(find('div.header-buttons'), 'button', 'ticket-button', 'btn blue fastclickable', 'Generate Ticket', 'background-color: rgb(38, 156, 216); color: white;');
            auto_note_button.addEventListener('click', function () {
                if (find('#ticket-button').innerText == 'Generate Ticket') {
                    if (find('span.only-name').innerText.includes('IPHONE')) {
                        iPhoneinProgress();
                    } else if (find('span.only-name').innerText.includes('SAMSUNG')) {
                        inProgressSamsung();
                    }
                } else if (find('#ticket-button').innerText == 'Close Ticket') {
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
            find('#scan-open-button').addEventListener('click', function () {
                if (findByAttribute('img.fastclickable', 'ng-click', 'openScanItemsModal()')) {
                    findByAttribute('img.fastclickable', 'ng-click', 'openScanItemsModal()').click();
                }
            });
        }
    }, 1000);
    Waiter.addTable(function (table_number) {
        checkButtonClick(table_number, 'Scan Parts');
    })
    Waiter.addTable(function (table_number) {
        checkButtonClick(table_number, 'Cannot Scan Label');
    });
    Waiter.addTable(function (table_number) {
        if (checkExist('div.barcode-scan input')) {
            setField('div.barcode-scan input', 'input', window.localStorage['part-serial']);
            Waiter.clearTable(table_number);
        }
    });
    Waiter.addTable(function (table_number) {
        checkButtonClick(table_number, 'Submit');
    });
    if (window.localStorage['parts-amount'] > 1) {
        Waiter.addTable(function (table_number) {
            checkButtonClick(table_number, 'Cannont Scan Label');
        });
        Waiter.addTable(function (table_number) {
            if (checkExist('div.barcode-scan input')) {
                setField('div.barcode-scan input', 'input', window.localStorage['part-serial2']);
                Waiter.clearTable(table_number);
            }
        });
        Waiter.addTable(function (table_number) {
            checkButtonClick(table_number, 'Submit');
        });
    }
    Waiter.addTable(function (table_number) {
        checkButtonClick(table_number, 'Proceed');
    });
    // add button to open scan dialog if there is a part that hasn't been scanned yet
    var workorder_scan_button_run = setInterval(function () {
        if (!checkExist('#scan-camera-button') && findByText('h3.modal-title', 'VERIFY ITEM LABELS/SERIALS')
            && findByAttribute('img.fastclickable', 'ng-click', 'openScanItemsModal()') && checkExist('div.barcode-start')) {
            // Create button
            createTagBefore(find('div.barcode-start'), 1, 'button', 'scan-camera-button', 'btn btn-cancel fastclickable', 'Open Scanner', 'width: 100%');
            find('#scan-camera-button').addEventListener('click', function () {
                if (findByText('button', 'Cannot Scan Label')) {
                    findByText('button', 'Cannot Scan Label').id = 'scan-label-button';
                    find('#scan-label-button').click();
                    if (!checkExist('#interactive')) {
                        createScanner();
                    }
                }
            });
        } else if (checkExist('div.scan-sale-items-modal div.modal-row') && !checkExist('#interactive') && !checkExist('#scan-camera-button')) {
            createTagAppend(find('div.scan-sale-items-modal div.modal-row'), 'button', 'scan-camera-button', 'btn btn-cancel fastclickable', 'Open Scanner', 'width: 100%');
            find('#scan-camera-button').addEventListener('click', function () {
                if (!checkExist('#interactive')) {
                    createScanner();
                }
            });
        }
        if (checkExist('#interactive') && checkExist('#scan-camera-button')) {
            remove('#scan-camera-button');
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

function createScanner() {
    Waiter.addTable(function (table_number) {
        if (checkExist('div.barcode-scan input')) {
            find('div.barcode-scan input').id = 'barcode-scan-field';
            createTagAppend(findByAttribute('div', 'ng-if', '!isAllInventoryScanned()'), 'div', 'interactive', 'viewport');
            addHTML('#interactive', '<input type="file" />');
            addHTML('#interactive', '<video autoplay="true" preload="auto" src(unknown) muted="true" playsinline="true"></video>' +
                '<canvas class="drawingBuffer" width="640" height="480"');

            createTag(find('#interactive'), 'button', 'stop-camera-button', 'btn btn-cancel fastclickable', 'Close Camera', 'width: 100%');
            find('#interactive').addEventListener('click', function () {
                Quagga.stop();
                remove('#interactive');
            })
            Waiter.clearTable(table_number);
            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    constraints: {
                        width: 1280,
                        height: 720
                    },
                    numOfWorkers: 8,
                    locate: true,
                    target: document.querySelector('#interactive.viewport')    // Or '#yourElement' (optional)
                },
                decoder: {
                    readers: ["code_128_reader"]
                },
                halfSample: false,
                frequency: 25,
                patchSize: "medium"
                // locate: false,
                // area: {
                //     top:"50%",
                //     right: "50%",
                //     left: "50%",
                //     bottom: "50%"
                // }
            }, function (err) {
                if (err) {
                    console.log(err);
                    return
                }
                console.log("Initialization finished. Ready to start");
                Quagga.start();
            });
            console.log('Going to run On Detected');
            Quagga.onDetected(function (data) {
                if (data.codeResult) {
                    if (data.codeResult.code.lenght > 10 && data.codeResult.code.includes('-')) {
                        setField('#barcode-scan-field', 'input', data.codeResult.code);
                        Quagga.stop();
                        remove('#interactive');
                    } else if (data.codeResult.code.length == 10) {
                        setField('#barcode-scan-field', 'input', data.codeResult.code);
                        Quagga.stop();
                        remove('#interactive');
                    } else {
                        setField('#barcode-scan-field', 'input', data.codeResult.code);
                    }
                }
            });
            // Quagga.onProcessed(function(result) {
            //     if (result.codeResult) {
            //         if (result.codeResult.code.lenght > 10 && result.codeResult.code.includes('-')) {
            //             setField('#barcode-scan-field', 'input', result.codeResult.code);
            //             Quagga.stop();
            //             remove('#interactive');
            //         } else if (result.codeResult.code.length == 10) {
            //             setField('#barcode-scan-field', 'input', result.codeResult.code);
            //             Quagga.stop();
            //             remove('#interactive');
            //         } else {
            //             setField('#barcode-scan-field', 'input', result.codeResult.code);
            //         }
            //     }
            // });
        }
    });
}

var note_button = '#paneled-side-bar > div > div.bar-buttons > button.btn.blue.fastclickable';

function iPhoneinProgress() {
    if (!Waiter.isEmpty()) {
        Waiter.clearAllTables();
    }
    createNote('Repair in Progress', 'Device is being repaired.');
    Waiter.addCheckButtonTable('Create Repair Ticket');
    Waiter.addCheckButtonTable('Proceed');
}

function iPhoneCloseTicket() {
    if (!Waiter.isEmpty()) {
        Waiter.clearAllTables();
        console.log('Clear Table');
    }
    createNote('Quality Inspection', 'Device is repaired and is going through testing.');
    console.log('Setting Work Order to Quality Inspection');
    Waiter.addCheckButtonTable('Add', 'button.btn-confirm');
    Waiter.addCheckButtonTable('Test Complete');
    Waiter.addCheckButtonTable('Done');
    Waiter.addTable(function (table_number) {
        if (checkExist('div.toast-message')) {
            sleep(250).then(() => {
                Waiter.clearTable(table_number)
            });
        }
    });
    Waiter.addTable(function (table_number) {
        if (checkExist('span.bg-quality-inspection')) {
            createNote('Repaired - RFP', 'Device is repaired and ready to be returned to the customer.', 1000);
            Waiter.clearTable(table_number);
        }
    });
    Waiter.addCheckButtonTable('Add', 'button.btn-confirm');
    Waiter.addCheckButtonTable('Check Out', 'span.hover-text');
    Waiter.addTable(function (table_number) {
        if (checkButtonClick(table_number, 'TRADE CREDIT')) {
            Waiter.clearAllTables();
        }
    });
}

function inProgressSamsung() {
    if (!Waiter.isEmpty()) {
        Waiter.clearAllTables();
    }
    Waiter.addCheckButtonTable('Create GSPN Repair Ticket');
    Waiter.addCheckButtonTable('Create Repair Ticket');
    Waiter.addCheckButtonTable('Close', '.modal-dialog button');
    Waiter.addTable(function (table_number) {
        if (checkExist('div.extra-actions > select > option')) {
            createNote('Repair in Progress', 'Device is being repaired.');
            Waiter.clearAllTables();
        }
    });
}

function samsungCloseTicket() {
    if (!Waiter.isEmpty()) {
        Waiter.clearAllTables();
    }
    createNote('Quality Inspection', 'Device is reapired and going through testing.');
    Waiter.addCheckButtonTable('Add', 'button.btn-confirm');
    Waiter.addCheckButtonTable('Test Complete');
    Waiter.addCheckButtonTable('Done');
    Waiter.addTable(function (table_number) {
        if (checkExist('div.toast-message')) {
            sleep(250).then(() => {
                Waiter.clearTable(table_number)
            })
        }
    });
    Waiter.addTable(function (table_number) {
        if (checkExist('span.bg-quality-inspection')) {
            if (checkExist('#paneled-side-bar.closed')) {
                find(note_button).click();
            }
            sleep(250).then(() => {
                Waiter.clearTable(table_number);
            })
        }
    })
    Waiter.addTable(function (table_number) {
        if (checkExist('span.bg-quality-inspection')) {
            if (!checkExist('#paneled-side-bar.closed')) {
                var els = findAll('div.extra-actions > select > option');
                for (var i = 0; i < els.length; i++) {
                    if (els[i].innerText == 'Repaired - RFP') {
                        find('select.editor-add-in').value = i;
                        break;
                    }
                }
            }
            // write in progress in field
            find('.note-placeholder').style = 'display: none;';
            find('.note-editable').innerHTML = 'Device is repaired and ready to be returned to the customer.';
            setField('.note-editable', 'input', 'Device is repaired and ready to be returned to the customer.');
            find('select.editor-add-in').click();
            runAngularTrigger('div.extra-actions > select', 'change');
            if (find('#private').checked) {
                find('#private').click();
            }
            Waiter.clearTable(table_number);
        }
    });
    Waiter.addTable(function (table_number) {
        if (findByAttribute('select', 'ng-model', 'selectedOptions.gspn_defect_category_type_id')) {
            var selector_1 = findByAttribute('select', 'ng-model', 'selectedOptions.gspn_defect_category_type_id');
            var selector_2 = findByAttribute('select', 'ng-model', 'selectedOptions.gspn_defect_code_id');
            var selector_3 = findByAttribute('select', 'ng-model', 'selectedOptions.gspn_repair_code_id');
            selector_1.id = 'selector-1';
            selector_2.id = 'selector-2';
            selector_3.id = 'selector-3';
            selector_1.value = 8;
            runAngularTrigger('#selector-1', 'change');
            selector_2.value = 2;
            runAngularTrigger('#selector-2', 'change');
            runAngularTrigger('#selector-2', 'click');
            selector_3.value = 1;
            runAngularTrigger('#selector-3', 'change');
            Waiter.clearTable(table_number);
        }
    })
    Waiter.addTable(function (table_number) {
        if (!checkButtonClick(table_number, 'Yes')) {
            if (findByText('button.btn-confirm', 'Add')) {
                Waiter.clearTable(table_number);
            }
        }
    });
    Waiter.addCheckButtonTable('Add', 'Button.btn-confirm');
    Waiter.addCheckButtonTable('Test Complete');
    Waiter.addCheckButtonTable('Done');
    Waiter.addCheckButtonTable('Check Out', 'span.hover-text');
    Waiter.addTable(function (table_number) {
        if (checkButtonClick(table_number, 'TRADE CREDIT')) {
            Waiter.clearAllTables();
        }
    });
}

// Total sleep time 350
//#endregion
//#region HelperFunctions
/**
            Helper Functions
*/
function createNote(status, text, sleep_time = 0) {
    find(note_button).click();
    sleep(sleep_time + 500).then(() => {
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
        /*sleep(sleep_time + 250).then(() => {
            findByText('button', 'Create Note').click();
        });
        sleep(sleep_time + 350).then(() => {
            find(note_button).click();
        });*/
    });
    return sleep_time + 600;
}

function checkButtonClick(table_number, title, selector = 'button') {
    console.log('Table Number:', table_number);
    console.log('Text:', title);
    console.log('Selector:', selector);
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
    single_list: [], // Tables that run independentally
    waiting_list: [],
    table_list: [],
    addSingle: function (name, orderCheck, check_time = 500) {
        Waiter.single_list[name] = setInterval(function () {
            orderCheck();
        }, check_time);
    },
    clearSingle: function (name) {
        if (Waiter.single_list[name] != null) {
            clearInterval(Waiter.single_list[name]);
        }
    },
    clearAllSingles: function () {
        for (var name in Waiter.single_list) {
            clearInterval(Waiter.single_list[name]);
        }
    },
    addCheckButtonTable: function (title, selector = 'button', check_time = 1000, clearCondition = false) {
        return Waiter.addTable(function (table_number) {
            var button = findByText(selector, title);
            if (button) {
                if (!button.disabled) {
                    button.click();
                    sleep(250).then(() => {
                        Waiter.clearTable(table_number);
                    });
                }
            }
        });
    },
    addTable: function (orderCheck, check_time = 1000, clearCondition = false) {
        var table_number = Waiter.waiting_list.length;
        Waiter.table_list.push(false);
        Waiter.waiting_list.push(setInterval(Waiter.checkTable, check_time, table_number, orderCheck, clearCondition));
        return table_number; // Returns current index
    },
    checkTable: function (table_number, orderCheck, clearCondition) {
        if (clearCondition == false) {
            if (table_number > 0) {
                if (Waiter.table_list[table_number - 1]) {
                    orderCheck(table_number);
                }
            } else {
                console.log('Waiter, Clear: False, Table Number:', table_number, 'Order Check:', orderCheck);
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
    clearTable: function (table_number) {
        if (table_number < Waiter.table_list.length &&
            table_number < Waiter.waiting_list.length) {
            Waiter.table_list[table_number] = true;
            clearInterval(Waiter.waiting_list[table_number]);
        }
    },
    clearTablesBefore: function (table_number) {
        for (var i = 0; i <= table_number; i++) {
            Waiter.clearTable(i);
        }
    },
    tableClearBefore: function (table_number) {
        for (var i = 0; i <= table_number; i++) {
            if (!Waiter.table_list[i]) {
                return false;
            }
        }
        return true;
    },
    clearAllTables: function () {
        console.log('-----Clear All Tables-----');
        console.log('Amount of Tables:', Waiter.amountOfTables());
        for (var i = 0; i < Waiter.waiting_list.length; i++) {
            clearInterval(Waiter.waiting_list[i]);
        }
        Waiter.waiting_list = [];
        Waiter.table_list = [];
    },
    amountOfTables: function () {
        return Waiter.waiting_list.length;
    },
    isEmpty: function () {
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

function getSelectorForElement(element) {
    let path;
    while (element) {
        let subSelector = element.localName;
        if (!subSelector) {
            break;
        }
        subSelector = subSelector.toLowerCase();
        var parent = element.parentElement;
        if (parent) {
            var sameTagSiblings = parent.children;
            if (sameTagSiblings.lenght > 1) {
                let nameCount = 0;
                var index = [...sameTagSiblings].findIndex((child) => {
                    if (element.localName === child.localName) {
                        nameCount++;
                    }
                    return child === elem;
                }) + 1;
                if (index > 1 && nameCount > 1) {
                    subSelector += ':nth-child(' + index + ')';
                }
            }
        }
        path = subSelector + (path ? '>' + path : '');
        element = parent;
    }
}
//#endregion
