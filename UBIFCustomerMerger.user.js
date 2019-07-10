// ==UserScript==
// @name         UBIF Customer Merger
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  When checking in customer and they already exists. Helps merge data.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/FindElement.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFCustomerMerger.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFCustomerMerger.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    // First Name, Last Name, Email, Phone, Ext, Alt Phone, Desc, Addresss, City, State, Zip, Buisness
    var ran = false;
    var start = setInterval(function() {
        if (!ran && checkURL("https://portal.ubif.net/pos/repair/workorder/") && findElementByText("h3", "CUSTOMER ALREADY EXISTS")) {
             console.log("Adding Event");
            findElementByText("button", "YES").addEventListener("click", setCookieData());
            ran = true;
        } else if (ran && !checkURL("https://portal.ubif.net/pos/repair/workorder/")) {
            console.log("Cleared");
            ran = false;
        } else if (ran && checkURL("https://portal.ubif.net/pos/repair/workorder/") && findElementByText("h3", "EDIT CUSTOMER")) {
            var btn = document.createElement("BUTTON");
            btn.innerHTML = "Merge Customer";
            btn.id = "merge_customer";
            btn.classList.add("btn");
            btn.classList.add("btn-cancel");
            btn.classList.add("push-left");
            btn.classList.add("fastclickable");
            findElement('.modal-title').appendChild(btn);
            btn.addEventListener("click", function() {
                console.log("Merging Customers");
                setData(getCookie());
            });
            ran = false;
        }
    }, 1000); // Checks every 1 second.
})();

function setCookieData() {
    console.log("Making Cookies");
    makeCookie(0, getEl("First Name"));
    makeCookie(1 , getEl("Last Name"));
    makeCookie(2 , getEl("Email"));
    makeCookie(3 , getEl("Phone"));
    makeCookie(4 , getEl("Extension"));
    makeCookie(5 , getEl("Alternate Phone"));
    makeCookie(6 , getEl("Description"));
    makeCookie(7 , getEl("Address Line"));
    makeCookie(8 , getEl("City"));
    makeCookie(9 , getEl("State"));
    makeCookie(10 , getEl("ZIP/Postal Code"));
    makeCookie(11 , getEl("Business Name"));
}

function makeCookie(index, value) {
    var d = new Date();
    d.setTime(d.getTime() + (10*60*1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = "data" + String(index) + "=" + value + ";" + expires + ";path=/";
}

function getCookie() {
    console.log("Get Cookie");
    var data = [];
    for (var i = 0; i < 12; i++) {
        data.push("");
    }
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    var index = 0;
    for (var i = 0; i < ca.length; i++) {
        var name = ca[i].split('=')[0];
        var value = ca[i].split('=')[1];
        if (name.includes("data")) {
            var num = parseInt(name.substring(5));
            data[num] = value;
            index++;
        }
    }
    return data;
}

function getData() {
    var temp = [];
    temp.push(getEl("First Name")); // 0
    temp.push(getEl("Last Name")); // 1
    temp.push(getEl("Email")); // 2
    temp.push(getEl("Phone")); // 3
    temp.push(getEl("Extension")); // 4
    temp.push(getEl("Alternate Phone")); // 5
    temp.push(getEl("Description")); // 6
    temp.push(getEl("Address Line")); // 7
    temp.push(getEl("City")); // 8
    temp.push(getEl("State")); // 9
    temp.push(getEl("ZIP/Postal Code")); // 10
    temp.push(getEl("Business Name")); // 11
    console.log(temp);
    return temp;
}

function setData(data) {
    console.log("Setting Data");
    console.log(data);
    var temp = getData();
    setEl("First Name", data[0]);
    setEl("Last Name", data[1]);
    setEl("Email", data[2]);
    setEl("Phone", data[3]);
    setEl("Extension", data[4]);
    setEl("Alternate Phone", data[5]);
    setEl("Description", data[6]);
    setEl("Address Line", data[7]);
    setEl("City", data[8]);
    setEl("State", data[9]);
    setEl("ZIP/Postal Code", data[10]);
    setEl("Business Name", data[11]);
    if (temp[3] != data[3] && data[5] == "" && temp[5] == "") {  // if phone numbers don't match and both do not have alternate numbers
        setEl("Alternate Phone", temp[3]);
    } else if (temp[3] != data[3] && data[5] != "" && data[5] != temp[5]) { // if phone numbers don't match and new customer has Alternate Number
        setEl("Alternate Phone", data[5]);
        setEl("Description", temp[3]);
    } else if (temp[3] != data[3] && temp[5] != "" && data[5] != temp[5]) { // if phone numbers don't match and only old customer has alternate number
        setEl("Alternate Phone", temp[3]);
        setEl("Description", temp[5]);
    } else if (temp[3] == data[3] && temp[5] != data[5] && data[5] != "" && temp[5] != "") { // if alternate numbers don't match and both have alternate numbers
        setEl("Alternate Phone", data[5]);
        setEl("Description", temp[5]);
    } else {
        setEl("Alternate Phone", (data[5] != "") ? data[5] : temp[5]);
    }
}

function getEl(search) {
    return findElementSibling("label", "input", search).value;
}

function setEl(search, text) {
    setField("label", "input", text, search, "input");
}
