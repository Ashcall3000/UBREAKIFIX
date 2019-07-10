// ==UserScript==
// @name         UbifSignInCamden
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Creates buttons on the sign in popup to select which user you are.
// @author       Christopher Sullivan
// @include        https://portal.ubif.net/*
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UbifSignInCamden.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UbifSignInCamden.user.js
// @grant        none
// ==/UserScript==


var names = ['Syed', 'Eddie', 'Martin', 'Armando'];
var passcodes = ['519880', '791605', '164438', '200211'];

(function() {
    'use strict';

    var test = true; // Program hasn't run yet.
    // Run program every second.
    var run = setInterval(function() {
        if (checkElement(".modal-sm") && test) {
            test = false;
            var element = findElement(".modal-sm");
            if (findElementByText(".modal-title", "Enter your PIN")) {
                var location = findElement("div.modal-content:nth-child(1)");
                var para = document.createElement("div");
                para.className = "modal-body";
                var text = "";
                for (var i = 0; i < names.length; i++) {
                    text += '<button id="' + i + '" class="btn btn-cancel push-left fastclickable">' + names[i] + '</button>';
                }
                location.appendChild(para);
                para.innerHTML += text;
                for (var i = 0; i < name.length; i++) {
                    findElement('#' + i).addEventListener("click", function() {
                        var element = findElement("#pin-entry");
                        setField(element, "input", passcodes[this.id]);
                        eventFire("button.btn:nth-child(2)", "click");
                    });
                }
            } else if (!test && checkElement(".modal-sm")) {
                test = false;
            }
        }
    }, 1000)
})();

