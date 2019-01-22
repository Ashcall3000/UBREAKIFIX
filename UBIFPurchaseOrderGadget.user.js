// ==UserScript==
// @name         UBIF Purchase Order Gadget Script
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  Helps the user create a gadgetfix po in the ubreakifix system.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/pos/purchasing/edit/*
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPurchaseOrderGadget.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPurchaseOrderGadget.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var gadget_frame_created = false; // Whether iframe for gadgetfix has been added to the page or not.
    var gadget_vendor_selected = false; // Whether the vendor drop down menu is selected for gadgetfix or not.
    var run = setInterval(function() {
        console.log("RUN");
        // Runs to see if the current vendor is Gadgetfix or not.
        var selector = document.querySelector("select.ng-dirty");
        var select_list = document.querySelectorAll("select.ng-dirty option");
        var select_val = "";
        if (selector != null && select_list != null) {
            select_list.forEach(function(el) {
                if (selector.value == el.value) {
                    select_val = el.innerText;
                }
            });
        }
        if (selector != null && !gadget_frame_created && select_val == "GadgetFix") {
            gadget_vendor_selected = true;
            gadget_frame_created = createFrame();
        }
        if (document.querySelector("iframe") == null) {
            gadget_frame_created = false;
        }
    }, 1000); // Runs every 5 seconds
})();

function createFrame() {
    var site_url = prompt("Paste the Gadgetfix URL into the text field", "https://www.GadgetFix.com");
    document.querySelector("#pos-left-content > div:nth-child(2)").innerHTML += "<iframe src=\""
    + site_url + "\" style=\"height: 300px; width: 100%; border: none; margin-bottom: 15px;\"></iframe>";
    return true;
}
