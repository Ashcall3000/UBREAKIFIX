// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @require http://code.jquery.com/jquery-3.3.1.min.js
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/pos/purchasing/edit/*
// @include      https://gadgetfix.com/customer/order/detail/*
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFGadgetfixOrderPopulator.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFGadgetfixOrderPopulator.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

$(function() {
    'use strict';

    // Your code here...
    var gadget_button_created = false; // Wether button has been added to gadgetfix page.
    var part_list = [];
    var run = setInterval(function() {
        // Runs on the GadgetFix page to put all part items into an array
        if ($("table.table-border")[0] != null) {
            // Add button to page
            if (!gadget_button_created) {
                $("#lhc_status_container").innerHTML += '<button id="copy" style="position: fixed; '
                    + 'z-index: 5; right: 1px; top: 100px; background-color: #4CAF50; border: none;'
                    + 'color: white;">COPY</button>';
                gadget_button_created = true;
                $("#copy").bind('click', getTableGadget());
            }
        }
    }, 10000); // Runs every ten seconds
})();
            
function getTableGadget() {
    $("table.table-border > tbody > tr").each(function(el) {
        var item_num = $(el).find("p").first().innerHTML;
        var price_amoun = $(el).find("i-right").first().innerHTML;
        var quan_amoun = $(el).find("i-center").first().innerHTML;
        var total_amoun = $(el).find("i-right").eq(1).innerHTML;
        part_list.push(new part(item_num, price_amoun, quan_amoun, total_amoun);
    });
}

function part(item, price, quan, total) {
    this.item = item; // Item number from GadgetFix
    this.price = price; // Price of the part
    this.quan = quan; // How many of the part is being ordered. 
    this.total = total; // Total price for the parts ie price * quan
}
