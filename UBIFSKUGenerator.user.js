// ==UserScript==
// @name         UBIF SKU Generator
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Generated SKU numbers for parts without numbers
// @author       You
// @match        https://portal.ubif.net/*
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFSKUGenerator.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFSKUGenerator.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    var run = false;
    var updated = false;
    var start = setInterval(function() {
        if (window.location.href.includes("https://portal.ubif.net/pos/inventory/tracking") &&
            !run && !updated && !isExist(".in-stock-table input.form-control")) {
            console.log("RUN");
            run = true;
            var highest = 0;
            var items = document.querySelectorAll('.in-stock-table tr');
            for (var i = 1; i < items.length; i++) { // Getting the largest number present
                var label = items[i].getElementsByTagName('td')[1];
                var text = label.innerText
                if (text.length > 0) {
                    var num = convStr(text);
                    if (num > highest) {
                        highest = num;
                    }
                }
            }
            for (var a = 1; a < items.length; a++) {
                var labelb = items[a].getElementsByTagName('td')[1];
                if (labelb.innerText.length == 0) {
                    highest++;
                    // labelb.innerHTML = '<span>' + convNum(highest) + '</span>';
                    labelb.innerText += convNum(highest);
                    labelb.style.color = "#00cc00";
                    labelb.setAttribute("id", "suggested")
                    updated = true;
                }
            }
            if (!updated) {
                run = false;
            }
        } else if (!window.location.href.includes("https://portal.ubif.net/pos/inventory/tracking") && run) {
            run = false;
            updated = false;
        } else if (isExist(".in-stock-table input.form-control") || !isExist('#suggested')) {
            run = false;
            updated = false;
        }
    }, 500); // Runs every second
})();

function convNum(num) {
    var str = "";
    var size = num.toString().length;
    if (size < 10) {
        for (var i = 0; i < 10 - size; i++) {
            str += '0';
        }
    }
    return (str + num.toString());
}

function convStr(str) {
    var short_str = "";
    var clipped = false;
    for (var i = 0; i < str.length; i++) {
        if (!clipped) {
            if (str[i] != '0' || str[i] != ' ') {
                clipped = true;
                short_str += str[i];
            }
        } else {
            short_str += str[i];
        }
    }
    return Number(short_str);
}

/**
 * isExist - checks to see if an dom object exists while using
 * a css selector to find it.
 *
 * @param selector - String
 * @return boolean
 */
function isExist(selector) {
    if (document.querySelectorAll(selector).length > 0) {
        return true;
    } else {
        return false;
    }
}
