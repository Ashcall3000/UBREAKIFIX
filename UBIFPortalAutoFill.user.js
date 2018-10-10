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
