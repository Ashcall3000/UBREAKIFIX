// ==UserScript==
// @name         UBIF Worker Assign
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Adds a button to assign the workorder to the current user.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/FindElement.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFWorkerAssign.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFWorkerAssign.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var created = false;
    var assign_text = '#wrap > div > div.portal-pos.with-sidebar > div > div > workorder-tab-list > div > div > div.tab-pane.active > div:nth-child(1) > div.col-xs-12.col-lg-6.customer-info > customer-info-only-card > div > div.card-title > workorder-actions > div > div.dropdown.small > ul > li:nth-child(4) > a';
    var run = setInterval(function() {
        console.log(checkElement(assign_text));
        if (checkElement(assign_text) && !created) {
            created = true;
            console.log("first");
            var el = makeElement(findElement('#wrap > div > div.portal-header.row > div.col-xs-12.col-md-6.portal-actions > div'), 'button', 'assign_user', 'btn btn-cancel fastclickable', 'Assign User');
            el.addEventListener('click', setUser);
        } else if (!checkElement(assign_text) && created) {
            created = false;
        }
    }, 1000); // Runs every second.
})();

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}


function setUser() {
    var name = '\n' + findElement('.user-hold').innerText;
    console.log(name);
    eventFire('#wrap > div > div.portal-pos.with-sidebar > div > div > workorder-tab-list > div > div > div.tab-pane.active > div:nth-child(1) > div.col-xs-12.col-lg-6.customer-info > customer-info-only-card > div > div.card-title > workorder-actions > div > div.dropdown.small > ul > li:nth-child(4) > a', 'click');
    sleep(500).then(() => {
        console.log(findElements('body > div.modal.fade.fastclickable.portal-base.assign-tech-modal.in > div > div > div.modal-body.max-500 > div > table > tbody > tr'));
        eventFire("body > div.modal.fade.fastclickable.portal-base.assign-tech-modal.in > div > div > div.modal-body.max-500 > div > table > tbody > tr", 'click', name);
    })
    sleep(1000).then(() => {
        eventFire('body > div.modal.fade.fastclickable.portal-base.assign-tech-modal.in > div > div > div.modal-header > h3 > button', 'click');
    })
}

function makeElement(loc, tag, id='', el_class='', text='') {
    var elm = document.createElement(tag);
    if (id != '') {
        elm.setAttribute('id', id);
    }
    if (el_class != '') {
        elm.setAttribute('class', el_class);
    }
    if (text != '') {
        elm.innerText = text;
    }
    loc.prepend(elm);
    return elm;
}
