// ==UserScript==
// @name         Settings
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Controlls Settings for the various scripts
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/Search.js
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/Waiter.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/Settings.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/Settings.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==
var option_titles = ['AutoFill', 'Image Checker', 'Item Search', 'Pixel Scan', 'Check-in', 'Work Order Issue'];
var autofill_on = true;

const SettingWaiter = new Waiter();
SettingWaiter.addSingle('settings-run', function () {
    if (checkExist('ul.bar-two') && !checkExist('#settings-button')) {
        var li = createTagAppend(find('ul.bar-two'), 'li', 'settings-button', 'dropdown');
        var a = createTag(li, 'a', '', 'fastclickable');
        createTag(a, 'i', '', 'fa fa-fw fa-gear fa-lg');
        li.addEventListener('click', function () {
            var popup = createPopup('SETTINGS');
            createTableVertical(popup, option_titles);
            var popup_bottom = find('#popup-bottom');
            createTag(popup_bottom, 'button', 'save-button', 'btn btn-success fastclickable pull-right', 'Save Settings').addEventListener('click', saveSettings);
            createTagAppend(popup_bottom, 'button', 'download-button', 'btn blue pull-left left-icon fastclickable', 'Download Scripts', 'background-color: rgb(38, 156, 216); color: white;');
            createTag(find('#download-button'), 'span', '', 'fa fa-fw fa-download');
            createSettingFillin();
        });
    }
});

var values = ['autofill_on', 'image_checker_on', 'item_search_on', 'pixel_scan_on', 'checkin_on', 'workorder_issue_on'];
var ids = ['autofill_on_checkbox', 'image_checker_on_checkbox', 'item_search_on_checkbox', 'pixel_scan_on_checkbox', 'checkin_on_checkbox', 'workorder_issue_on_checkbox'];
var titles = ['Run Autofill Script', 'Run Image Checker Script', 'Run Item Search Script', 'Run Pixel Scan Script', 'Run Check-In Script', 'Run Workorder Issue Script'];
var run_titles = ['autofill-run', 'image-checker-run', 'item-search-run', 'pixel-scan-run', 'checkin-run', 'workorder-issue-run'];

function createSettingFillin() {
    for (var i = 0; i < values.length; i++) {
        console.log(values[i]);
        var td = find('#table-td-' + i + '-0');
        var div = createTag(td, 'div', '', 'pull-left');
        createInput(div, 'checkbox', values[i], '', ids[i], 'pull-left').checked = true;
        createTag(div, 'p', '', 'pull-left', titles[i]);
        var id_string = '#' + ids[i];
        find(id_string).checked = getData(run_titles[i]);
    }
}

function saveSettings() {
    for (var i = 0; i < value.length; i++) {
        var id_string = '#' + ids[i];
        setData(run_titles[i], find(id_string).checked);
    }
}