// ==UserScript==
// @name         UBIF Pixel Scan Data
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Adds a button to open a window to give barcodes for pixel testing.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/HelperFunctions.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPixelScanData.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPixelScanData.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==
(function() {
    'use strict';

    var PixelWaiter = new Waiter();
    PixelWaiter.addSingle("pixel-scan-run", function() {
        if (!checkURL('https://portal.ubif.net/pos/checkout-new/')) {
            PixelWaiter.clearSingle("pixel-scan-run");
        }
        if (findByAttribute('a', 'href', 'https://sites.google.com/a/ubreakifix.com/ubifdiag/') && !checkExist('#pixel_scan_button')) {
            var button = createTagAppend(findByAttribute('a', 'href', ''), 'button', 'pixel_scan_button', 'btn btn-confirm', 'Pixel Scan Data');
            button.addEventListener('click', pixelScanWindow);
        }
    });

    function pixelScanWindow() {
        var store_email = find('li.store-select span').textContent.replace(/\s/g, "") + '@ubreakifix.com';
        var imei = findSibling('label', 'span', 'IMEI:').textContent;
        var password = findByAttribute('a', 'href', 'https://sites.google.com/a/ubreakifix.com/ubifdiag/').textContent;
        var body = createPopup("PIXEL BARCODE DATA");
        createTag(body, 'table', 'pixel-table', 'table portal-table table-striped ng-table');
        createTag(find('#pixel-table'), 'thead', )
        var table = createTable(body, ['BARCODES'], 3);
        var img_url_start = 'https://www.barcodesinc.com/generator/image.php?code=';
        var img_url_end = '&style=197&type=C128B&xres=2&font=5';
        var img_url_end_small = '&style=197&type=C128B&xres=1&font=5';
        createTagAppend(find('#table-td-0-0'), 'a').setAttribute('href', 'https://www.barcodesinc.com/generator/');
        var image_1 = createTag(find('#table-td-0-0 a'), 'img');
        image_1.setAttribute('src', img_url_start + store_email + img_url_end_small);
        image_1.setAttribute('alt', 'the barcode printer: free barcode generator');
        image_1.setAttribute('border', '0');
        createTagAppend(find('#table-td-0-1'), 'a').setAttribute('href', 'https://www.barcodesinc.com/generator/');
        var image_2 = createTag(find('#table-td-0-1 a'), 'img');
        image_2.setAttribute('src', img_url_start + imei + img_url_end);
        image_2.setAttribute('alt', 'the barcode printer: free barcode generator');
        image_2.setAttribute('border', '0');
        createTagAppend(find('#table-td-0-2'), 'a').setAttribute('href', 'https://www.barcodesinc.com/generator/');
        var image_3 = createTag(find('#table-td-0-2 a'), 'img');
        image_3.setAttribute('src', img_url_start + password + img_url_end);
        image_3.setAttribute('alt', 'the barcode printer: free barcode generator');
        image_3.setAttribute('border', '0');
        findAll('#create-table img').forEach((item, i) => {
            item.style.margin="40px";
            item.style.height="120px";
            item.style.width="460px";
        });
    }
})();
