// ==UserScript==
// @name         New Userscript for portal
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://portal.ubif.net/*
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
                    labelb.innerText += convNum(highest);
                    labelb.style.color = "#00cc00";
                    updated = true;
                }
            }
            if (!updated) {
                run = false;
            }
        } else if (!window.location.href.includes("https://portal.ubif.net/pos/inventory/tracking") && run) {
            run = false;
            updated = false;
        } else if (isExist(".in-stock-table input.form-control")) {
            run = false;
            updated = false;
        }
    }, 500); // Runs every second
})();

function convNum(num) {
    var str = "";
    var size = Math.floor(num / 10);
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