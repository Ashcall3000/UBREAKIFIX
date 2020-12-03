// ==UserScript==
// @name         UBIF RT Leads
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Creates a user interface more readable for mobile devices.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @include      https://ubifsupport.zendesk.com/hc/en-us/requests/new*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/SearchElements.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFRTLeads.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFRTLeads.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==
var part_button = null;
(function() {
    var leads_check_run = setInterval(function() {
        if (checkURL("https://portal.ubif.net/pos/aqleads/edit/")) {
            // Runs Program
            // We hide the original table
            if (!checkExist("#mobile-table")) {
                find("div.table-hold").setAttribute("hidden", "");
                find("div.table-hold").id = "old-table";
                createTable();
                updateData();
            } else {
                updateData();
            }
        }
    }, 1000);
})();

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
    var sku = findByAttribute("td", "ng-if", "isLeadReserveOrNoReserve() || isReturn()", "", "", find("#old-table")).innerText;
    var item = findByAttribute("td", "ng-click", "editSaleItem(saleItem, true)", "", "", find("#old-table")).innerText;
    var serial = findByAttribute("td", "ng-if", "!isSaleItemService(saleItem) && hasSaleItemLabel(saleItem)", "", "", find("#old-table"));
    if (serial != null) {
        serial = serial.innerText.substring(6);
        find("#serial-data").innerText = serial;
    }
    var amount = findByAttribute("span", "ng-if", "!saleItem.inventory.store_item.item.is_service", "", "", find("#old-table")).innerText;
    find("#item-data").innerText = item;
    find("#sku-data").innerText = sku;
    find("#available-data").innerText = amount;
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
