// ==UserScript==
// @name         Image Check
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Makes sure that the customer takes a picture of the device during check in.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/Search.js
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/Waiter.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/ImageCheck.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/ImageCheck.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==
//var ignored = false;
var site = 'https://portal.ubif.net/pos/checkout-new/';
var textarea_selector = 'div.timeline-content textarea';
var ImageWaiter = new Waiter();
ImageWaiter.addSingle('image-checker', function() {
    if ((!checkURL(site) && !checkExist(textarea_selector)) || !getData('image-check-run')) {
        ImageWaiter.clearAllSingles("ImageWaiter");
        ImageWaiter.clearAllTables();
        ignored = false;
        return;
    } else if (checkURL(site) && checkExist(textarea_selector) && !checkExist('span.auto-note img')) {
        // if (!ignored) {
        //     disablePrint();
        // } else {
        //     enablePrint();
        // }
        if (!checkExist('#image-button')) {
            findAll('div.split-button button').forEach((item, i) => {
                addClass(item, 'print-button');
            });
            // Create Button to open take picture mode.
            var div = createTag(find('div.header-buttons-with-sidebar'), 'div', 'camera-div', 'btn-group split-button');
            var cam_button = createTag(div, 'button', 'image-button', 'btn left-icon btn-warning fastclickable', 'Open Camera');
            createTag(cam_button, 'span', '', 'fa fa-fw fa-camera');
            var toggle = createTagAppend(div, 'button', '', 'btn dropdown-toggle btn-warning');
            toggle.setAttribute('data-toggle', 'dropdown');
            createTag(toggle, 'span', '', 'caret');
            var menu = createTagAppend(div, 'ul', '', 'dropdown-menu portal-dropdown-menu');
            var li = createTag(menu, 'li');
            li.setAttribute('role', 'menuitem');
            var butt = createTag(li, 'a', '', 'fastclickable', 'Ignore Camera');
            butt.addEventListener('click', function() {
                var popup = createPopup('CHECK DEVICE PICTURE');
                createTag(popup, 'center', '', '', 'Please make sure to take a picture of the device. Just click the button "Open Camera" to take a picture of the device.');
                var popbut = createTag(find('#popup-bottom'), 'button', '', 'btn btn-warning', 'I was unable to take a picture of the device');
                popbut.style.width='100%';
                popbut.addEventListener('click', function() {
                    //ignored = true;
                    //enablePrint();
                    findByText('button', 'Close').click();
                });
            });
            cam_button.addEventListener('click', function() {
                console.log('Camera Open Clicked');
                ImageWaiter.addTable(function(table_number) {
                    if (checkExist('div.closed')) {
                        //ImageWaiter.checkButtonClick(table_number, 'NOTES', 'button.blue span');
                        find('div.bar-buttons button.blue').click();
                        sleep(100).then(() => {
                            ImageWaiter.clearTable(table_number);
                        });
                    } else {
                        ImageWaiter.clearTable(table_number);
                    }
                }, 250);
                ImageWaiter.addTable(function(table_number) {
                    if (findByAttribute('button', 'title', 'Take/Upload Photos')) {
                        findByAttribute('button', 'title', 'Take/Upload Photos').click();
                        sleep(100).then(() => {
                            ImageWaiter.clearTable(table_number);
                        });
                    }
                }, 250);
                ImageWaiter.addTable(function(table_number) {
                    if (findByAttribute('a', 'ng-click', 'selectTakePhotos()')) {
                        findByAttribute('a', 'ng-click', 'selectTakePhotos()').click();
                        ImageWaiter.clearAllTables();
                    }
                }, 250);
            });
        }
    }
});

function disablePrint() {
    findAll('div.split-button button.print-button').forEach((button, i) => {
        if (!button.disabled) {
            button.disabled = true;
        }
    });
}

function enablePrint() {
    findAll('div.split-button button.print-button').forEach((button, i) => {
        if (button.disabled) {
            button.disabled = false;
        }
    });
}
