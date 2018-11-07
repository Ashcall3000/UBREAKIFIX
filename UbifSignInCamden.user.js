// ==UserScript==
// @name         UbifSignInCamden
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Creates buttons on the sign in popup to select which user you are.
// @author       Christopher Sullivan
// @include        https://portal.ubif.net/*
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalCheckInScript.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalCheckInScript.user.js
// @grant        none
// ==/UserScript==


var names = ['Christopher', 'Syed', 'Andrew', 'Eddie'];
var passcodes = ['693769', '0000', '0000', '0000'];

(function() {
    'use strict';

    // Your code here...
    var test = true; // Program hasn't run yet.
    // Run program every second.
    var run = setInterval(function() {
        if (document.getElementsByClassName("modal-sm")[0] != null && test) {
            test = false;
            var element = document.getElementsByClassName("modal-sm")[0];
            if (element.querySelector(".modal-title").innerText == "Enter your PIN") {
                var location = element.querySelector(".modal-body");
                var org_text = location.innerHTML;
                var text = "<div class=\"row\">";
                for (var i = 0; i < names.length; i++) {
                     text += "<button id=\"" + i + "\">" + names[i] + "</button>";
                }
                text += "</div>";
                location.innerHTML = text + org_text;
                for (var j = 0; j < names.length; j++) {
                    document.getElementById(j).addEventListener("click", buttonClick);
                }
            }
        } else if (!test && document.getElementsByClassName("modal-sm")[0] == null) {
            test = true;
        }
    }, 1000)
})();

function buttonClick() {
    console.log(passcodes[this.id]);
    var element = document.getElementById("pin-entry");
    element.value = passcodes[this.id];
    element.dispatchEvent(new Event("input", {bubbles: true}));
    document.querySelector("form.ng-pristine").dispatchEvent(new Event("submit"));

}
