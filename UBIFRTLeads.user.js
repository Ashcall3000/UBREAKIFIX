// ==UserScript==
// @name         UBIF RT Leads
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Creates a user interface more readable for mobile devices.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/SearchElements.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFRTLeads.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFRTLeads.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==
var part_button = null;
var device_type = "";
var imei = "";
(function() {
    var leads_check_run = setInterval(function() {
        // Runs on the lead itself
        if (checkURL("https://portal.ubif.net/pos/aqleads/edit/")) {
            // Runs Program
            // We hide the original table
            if (!checkExist("#mobile-table")) {
                if (checkExist('div.table-hold')) {
                    find("div.table-hold").setAttribute("hidden", "");
                    find("div.table-hold").id = "old-table";
                    createTable();
                }
                updateData();
            } else {
                updateData();
            }
        // If we are the device select page from a lead.
        } else if (checkURL("https://portal.ubif.net/pos/device-type-select/lead/")) {
            if (!findByText('button', 'Create Work Order')) {
                // Filling out the IMEI
                if (imei != "" && imei.length == 15) {
                    if (findByAttribute('input', 'ng-model', 'deviceData.imei')) {
                        setField(findByAttribute('input', 'ng-model', 'deviceData.imei'), 'input', imei);
                    }
                }
                // If device isn't already selected.
                if (!checkExist('div.device-type-sub-hold') && device_type != "") {
                    setField('#device-type-searchbox', 'input', device_type);
                    sleep(250).then(() => {
                        findByText('a', device_type + 'Repair').click();
                    });
                }
                clickContinue("Continue");
            } else {
                if (findByText('button', 'CHECK ALL')) {
                    findByText('button', 'CHECK ALL').click();
                    findByText('button', 'CHECK ALL').click();
                    clickContinue('Create Work Order');
                    resetVariables();
                }
            }
        }
    }, 1000);
})();

function resetVariables() {
    part_button = null;
    device_type = "";
    imei = "";
}

function clickContinue(text) {
    var click_continue = setInterval(function() {
        console.log("Trying to Click");
        if (findByText('button', text)) {
            if (!findByAttribute('button', 'disabled', 'disabled', "", text)) {
                clearInterval(click_continue);
                findByText('button', text).click();
            }
        }
    }, 500);
}

function updateData() {
    // Moves the remove part button to new spot.
    if (checkExist("div.action-buttons")) { // Checks if button exists
        if (part_button === null) { // Checks if Variable has value ie has been moved.
            part_button = find("div.action-buttons");
            find("#remove-part-td").appendChild(part_button);
            find("button", part_button).appendChild(document.createTextNode("*** Remove Part"));
            replaceClass(find("button", part_button), "icon-only", "left-icon");
        }
    } else { // Button doesn't exist
        part_button = null;
    }
    // Grabbing the imei
    if (findByText('div.device-detial', 'IMEI')) {
        imei = find('div.details', findByText('div.device-detial', 'IMEI').innerText);
    }
    var sku = findByAttribute("td", "ng-if", "isLeadReserveOrNoReserve() || isReturn()", "", "", find("#old-table"));
    if (sku != null) {
        sku = sku.innerText;
    }
    var item = findByAttribute("td", "ng-click", "editSaleItem(saleItem, true)", "", "", find("#old-table"));
    if (item != null) {
        item = item.innerText;
        var end = item.indexOf('Glass');
        device_type = item.substring(0, end);
    }
    var serial = findByAttribute("td", "ng-if", "!isSaleItemService(saleItem) && hasSaleItemLabel(saleItem)", "", "", find("#old-table"));
    if (serial) {
        serial = serial.innerText.substring(6);
        find("#serial-data").innerText = serial;
    }
    var amount = findByAttribute("span", "ng-if", "!saleItem.inventory.store_item.item.is_service", "", "", find("#old-table"));
    if (amount != null) {
        amount = amount.innerText;
    }
    if (checkExist("#mobile-table")) {
        find("#item-data").innerText = item;
        find("#sku-data").innerText = sku;
        find("#available-data").innerText = amount;
    }
}

function createTable() {
    var start_loc = find('sale-item-list');
    var main_div = createTag(start_loc, "div", "mobile-table", "table-hold");
    var main_table = createTag(main_div, "table", "", "table portal-table flatTable table-stripped table-responsive");
    // Item Header Row
    var tr = createTag(main_table, "tr", "", "header-row");
    var thd = createTag(tr, "th", "", "center-data");
    createTag(thd, "div", "", "", "Item");
    // Item Data Row
    tr = createTagAppend(main_table, "tr", "", "");
    thd = createTag(tr, "td", "", "center-data");
    createTag(thd, "span", "item-data", "");
    // SKU Header Row
    tr = createTagAppend(main_table, "tr", "", "header-row");
    thd = createTag(tr, "th", "", "center-data");
    createTag(thd, "div", "", "", "SKU");
    // SKU Data Row
    tr = createTagAppend(main_table, "tr", "", "");
    thd = createTag(tr, "td", "", "center-data");
    createTag(thd, "span", "sku-data", "");
    // Serial Header Row
    tr = createTagAppend(main_table, "tr", "", "header-row");
    thd = createTag(tr, "th", "", "center-data");
    createTag(thd, "div", "", "", "Serial");
    // Serial Data Row
    tr = createTagAppend(main_table, "tr", "", "");
    thd = createTag(tr, "td", "", "center-data");
    createTag(thd, "span", "serial-data", "");
    // Amount Available Header Row
    tr = createTagAppend(main_table, "tr", "", "header-row");
    thd = createTag(tr, "th", "", "center-data");
    createTag(thd, "div", "", "", "Available");
    // Amount Available Data Row
    tr = createTagAppend(main_table, "tr", "", "");
    thd = createTag(tr, "td", "", "center-data");
    createTag(thd, "span", "available-data", "");
    // Remove Part Header Row
    tr = createTagAppend(main_table, "tr", "", "header-row");
    thd = createTag(tr, "th", "", "center-data");
    createTag(thd, "div", "", "", "Remove Part");
    // Remove Part Data Row
    tr = createTagAppend(main_table, "tr", "", "");
    createTag(tr, "td", "remove-part-td", "center-data");
}
