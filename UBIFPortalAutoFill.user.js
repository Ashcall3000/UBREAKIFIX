// ==UserScript==
// @name         UBIF Portal Auto Fill Script
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Auto fills update notes to expidite the procedure.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/pos/checkout-new/*
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalAutoFill.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalAutoFill.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    var status = document.getElementsByClassName("editor-add-in")[0].value;
    var text = "";
    var event = new Event('change', { bubbles: true }); // Event used to update changes for page.
    var run = setInterval(function() {
        var new_status = document.getElementsByClassName("editor-add-in")[0].value;
        if (new_status != status) {
            switch (new_status) {
                case 0:
                    text = '"Device has been repaired and passed tests."';
                    break;
                case 1:
                    text = '"Awaiting callback from the customer."';
                    break;
                case 2:
                    text = '"Awaiting for customer to bring in the device."';
                    break;
                case 6:
                    text = '"Customer has declined the repair and has upto 30 days to pickup there device before it is recycled."';
                    break;
                case 7:
                    text = '"Customer has abandoned the device and is sloted to be recycled."';
                    break;
                case 9:
                    text = '"Need to order a part for the device. Will take 3 to 5 buisness days for shipping."';
                    break;
                case 10:
                    text = '"Device is currently being repaired."';
                    break;
                case 11:
                    text = '"Device is repaired and ready for pickup."';
                    break;
                case 12:
                    text = '"Device was not able to be repaired and is ready for pickup."';
            }
            status = new_status;
            document.getElementsByClassName("note-placeholder")[0].style = "display: none;";
            document.getElementsByClassName("btn-confirm")[4].disabled = false;
            var text_area = document.getElementsByClassName("note-editable")[0];
            text_area.innerHTML = text;
            text_area.dispatchEvent(event);
        }
    }, 1000); // Checks every second.
    /*
    0 Awaiting Approval
    1 Aw Call
    2 Aw Dev
    3 Aw Diag
    4 Aw Parts
    5 Aw Repair
    6 Declined
    7 Abandoned 
    8 Diag
    9 Need to order
    10 In Prog
    11 RFP
    12 URFP
    elements class "editor-add-in" #0 value 
    elements class "note-editable' #0 innerHTML with quotes is the text area
    elements class "note-placeholder" #0 style "display: none;" Make place holder text disapear.
    elements class "btn-confirm" #4 Create Note button
    */
})();
