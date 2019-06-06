// ==UserScript==
// @name         UBIF Portal Auto Fill Script
// @namespace    http://tampermonkey.net/
// @version      1.2.2
// @description  Auto fills update notes to expidite the procedure.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/FindElement.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalAutoFill.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalAutoFill.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var ran = false;
    var status = null;
    var start = setInterval(function() {
        if (checkURL("https://portal.ubif.net/pos/checkout-new/") && checkElement(".editor-add-in")) {
            if (!ran) {
                status = findElement(".editor-add-in").value;
                ran = true;
            } else {
                var new_status = findElement(".editor-add-in").value;
                if (new_status != status) {
                    var val_list = findElements("select.editor-add-in option");
                    var val = "";
                    val_list.forEach(function(el) {
                        if (el.value == new_status) {
                            val = el.innerText;
                        }
                    });
                    switch (val) {
                        case "Awaiting Approval":
                            setText("none", "Device has been repaired and passed tests.");
                            break;
                        case "Awaiting Callback":
                            setText("none", "Awaiting callback from the customer.");
                            break;
                        case "Awaiting Device":
                            setText("none", "Awaiting for the customer to bring in their device.");
                            break;
                        case "Awaiting Repair":
                            setText("none", "Parts are in stock for the repair and is slotted to be repaired.")
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
                    status = findElement(".editor-add-in").value;
                    ran = false;
                }
            }
        } else if (checkURL("https://portal.ubif.net/pos/aqleads/edit/") && checkElement(".timeline > create-aqlead-note")) {
            if (!ran) {
                status = findElement("select.form-control").value;
                ran = true;
                var val_list = findElements("select.form-control option");
                var val = "";
                val_list.forEach(function(el) {
                    if (el.value == status) {
                        val = el.innerText;
                    }
                });
                var text = "";
                switch (val) {
                    case "Awaiting Customer":
                        text = "We set the part aside and are ready for you to come in at your earliest convenience.";
                        break;
                }
                console.log("HERE");
                console.log(text);
                findElement(".placeholder-text").innerText = text;
                setField(".placeholder-text", 'input', text);
                findElement(".placeholder-text").setAttribute("placeholder", "");
            } else if (findElement(".placeholder-text").innerText == "\n") {
                ran = false;
            }
            //"select.form-control:nth-child(1)"
        }
    }, 250); // Checks every 1/4 seconds.
})();

function setText(disp, text) {
    findElement(".note-placeholder").style = "display: " + disp + ";";
    findElement(".note-editable").innerHTML = text;
    setField(".note-editable", 'input', text);
}
