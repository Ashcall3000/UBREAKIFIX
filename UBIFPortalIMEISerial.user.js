// ==UserScript==
// @name         UBIF Portal IMEI Serial
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Forces the employee to add a serial and or IMEI for the device.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/FindElement.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalIMEISerial.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalIMEISerial.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var button = '#pos-sidebar form button';
    var device_main_page = '#pos-left-content div.selected-device-card';
    var device_select_page = 'device-types-list';
    var pixel = false;
    var start = setInterval(function() {
        if (checkElement('div.imei-verify')) {
            if (checkElement(device_main_page)) {
                if (findElementByText('h4', 'Pixel')) {
                    pixel = true;
                }
            } else if (checkElement(device_select_page)) {
                if (findElementByText('h4', 'PIXEL')) {
                    pixel = true;
                }
            }
            if (!pixel) {
                var inputs = findElements('div.imei-verify input');
                if (allnumeric(inputs[0].value) || serial_check(inputs[1].value)) {
                    findElement(button).disabled = false;
                } else {
                    findElement(button).disabled = true;
                }
            }
        } else {
            pixel = false;
        }
    }, 250);
})();

function allnumeric(input_text) {
    var numbers = /^[0-9]+$/;
    if (input_text.match(numbers) && input_text.length == 15 && !findElement('div.validation-indicator').textContent.includes('Invalid')) {
        return true;
    } else {
        return false;
    }
}

function serial_check(text) {
    var checks = ['DEAD', 'NOT FOUND', 'NONE', 'NOT APPLICABLE', 'GET LATER'];
    for (var i = 0; i < checks.length; i++) {
        if (text.toUpperCase().includes(checks[i])) {
            console.log("Serial Override");
            return true;
        }
    }
    if (text.length >= 6 && !checkElement('#pos-sidebar > div > div.sidebar-container.sidebar-actions-hold.dsh-minus > div > device-check-in-info > form > div.imei-verify > div:nth-child(2) > div > div')) {
        return true;
    } else {
        return false;
    }
}
