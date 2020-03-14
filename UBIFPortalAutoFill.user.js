// ==UserScript==
// @name         UBIF Portal Auto Fill Script
// @namespace    http://tampermonkey.net/
// @version      1.2.4
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
    var user_set = false;
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
                        case "Quality Inspection":
                            setText("none", "Device has been repaired and is going through a quality inspection.");
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
                            if (!user_set) {
                                findElement('#custom-tabset > div.panel-body > div > div.tab-pane.active > div:nth-child(1) > sales-text-editor-buttons > div > div.right-buttons > button').addEventListener('click', setUser);
                                user_set = true;
                            }
                            break;
                        case "Repair in Progress":
                            setText("none", "The device is currently being repaired.");
                            if (!user_set) {
                                findElement('#custom-tabset > div.panel-body > div > div.tab-pane.active > div:nth-child(1) > sales-text-editor-buttons > div > div.right-buttons > button').addEventListener('click', setUser);
                                user_set = true;
                            }
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
                user_set = false;
            }
            //"select.form-control:nth-child(1)"
        }
    }, 250); // Checks every 1/4 seconds.
})();

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function setUser() {
    var name = '\n' + findElement('.user-hold').innerText;
    console.log(name);
    eventFire('#wrap > div > div.portal-pos.with-sidebar > div > div > workorder-tab-list > div > div > div.tab-pane.active > div:nth-child(1) > div.col-xs-12.col-lg-6.customer-info > customer-info-only-card > div > div.card-title > workorder-actions > div > div.dropdown.small > ul > li:nth-child(4) > a', 'click');
    sleep(250).then(() => {
        console.log(findElements('body > div.modal.fade.fastclickable.portal-base.assign-tech-modal.in > div > div > div.modal-body.max-500 > div > table > tbody > tr'));
        eventFire("body > div.modal.fade.fastclickable.portal-base.assign-tech-modal.in > div > div > div.modal-body.max-500 > div > table > tbody > tr", 'click', name);
    })
    sleep(500).then(() => {
        eventFire('body > div.modal.fade.fastclickable.portal-base.assign-tech-modal.in > div > div > div.modal-header > h3 > button', 'click');
    })
}

function setText(disp, text) {
    findElement(".note-placeholder").style = "display: " + disp + ";";
    findElement(".note-editable").innerHTML = text;
    setField(".note-editable", 'input', text);
}
