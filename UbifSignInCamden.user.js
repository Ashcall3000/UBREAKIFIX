// ==UserScript==
// @name         UbifSignInCamden
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Creates buttons on the sign in popup to select which user you are.
// @author       Christopher Sullivan
// @include        https://portal.ubif.net/*
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalCheckInScript.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalCheckInScript.user.js
// @grant        none
// ==/UserScript==


var names = ['Christopher', 'Syed', 'Andrew', 'Eddie'];
var passcodes = ['693769', '519880', '896716', '791605'];

(function() {
    'use strict';
    
    var test = true; // Program hasn't run yet.
    // Run program every second.
    var run = setInterval(function() {
        if (document.getElementsByClassName("modal-sm")[0] != null && test) {
            test = false;
            var element = document.getElementsByClassName("modal-sm")[0];
            if (element.querySelector(".modal-title").innerText == "Enter your PIN") {
                var location = element.querySelector("div.modal-content:nth-child(1)");
                var para = document.createElement("div");
                para.className = "modal-body";
                var text = "";
                for (var i = 0; i < names.length; i++) {
                     text += "<button id=\"" + i + "\">" + names[i] + "</button>";
                }
                location.appendChild(para);
                para.innerHTML += text;
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
    element.dispatchEvent(new Event("input", {bubbles:true}));
    document.querySelector("button.btn:nth-child(2)").dispatchEvent(new Event("click", {bubbles:true}));
}
