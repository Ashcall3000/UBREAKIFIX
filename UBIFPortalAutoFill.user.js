// ==UserScript==
// @name         UBIF Portal Auto Fill Script
// @namespace    http://tampermonkey.net/
// @version      1.1.4
// @description  Auto fills update notes to expidite the procedure.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalAutoFill.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalAutoFill.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var start = setInterval(function() {
        if (window.location.href.includes("https://portal.ubif.net/pos/checkout-new/")) {
            var status = document.getElementsByClassName("editor-add-in")[0].value;
            var run = setInterval(function() {
                var new_status = document.getElementsByClassName("editor-add-in")[0].value;
                if (new_status != status) {
                    var val_list = document.querySelectorAll("select.editor-add-in option");
                    var val = "";
                    val_list.forEach(function(el) {
                        if (el.value == new_status) {
                            val = el.innerText;
                        }
                    });
                    switch (val) {
                        case "Awaiting Approval":
                            setText("none", false, "Device has been repaired and passed tests.");
                            break;
                        case "Awaiting Callback":
                            setText("none", false, "Awaiting callback from the customer.");
                            break;
                        case "Awaiting Device":
                            setText("none", false, "Awaiting for the customer to bring in their device.");
                            break;
                        case "Declined - RFP":
                            setText("none", false, "Customer has declined the repair and has upto 30 days to pickup there device before it is recycled.");
                            break;
                        case "Device Abandoned":
                            setText("none", false, "Customer has abandoned the device and is sloted to be recycled.");
                            break;
                        case "Need to Order Parts":
                            setText("none", false, "Need to order parts for the device. Will take 3 to 5 business days for shipping.");
                            break;
                        case "Diag in Progress":
                            setText("none", false, "Currently diagnosing the device to give customer a repair quote.");
                            break;
                        case "Repair in Progress":
                            setText("none", false, "The device is currently being repaired.");
                            break;
                        case "Repaired - RFP":
                            setText("none", false, "The device is repaired and ready for pickup.");
                            break;
                        case "Unrepairable - RFP":
                            setText("none", false, "We were not able to rerpair the device and is ready for pickup. If not picked up within 30 days will be sloted to be recycled.");
                            break;
                        default:
                            setText("block", true, "");
                    }
                    status = new_status;
                }
            }, 1000); // Checks every second.
        }
    }, 2000); // Checks every 2 seconds.
})();

/* Function to emulate events being fired. Mainly for a click event.
*/
function eventFire(el, etype) {
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        var ev_obj = document.createEvent('Events');
        ev_obj.initEvent(etype, true, false);
        el.dispatchEvent(ev_obj);
    }
}

function setText(disp, disa, text) {
    document.getElementsByClassName("note-placeholder")[0].style = "display: " + disp + ";";
    document.getElementsByClassName("btn-confirm")[4].disabled = disa;
    var text_area = document.getElementsByClassName("note-editable")[0];
    text_area.innerHTML = text;
    eventFire(text_area, 'input');
}
