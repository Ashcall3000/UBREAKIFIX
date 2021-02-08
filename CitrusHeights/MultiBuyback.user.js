// ==UserScript==
// @name         Multi Buyback
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Lets user to print multiple mulitple buy back labels. Needs ItemSearch to be installed to work.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/Search.js
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/Waiter.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/MultiBuyback.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/MultiBuyback.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==
//var ignored = false;
const BuybackWaiter = new Waiter();
var buyback_size = 0;
BuybackWaiter.addSingle('multi-buyback-run', function() {
    console.log('Multi Buyback Running');
    if (!checkURL('https://portal.ubif.net/pos/inventory') || !getData('multibuyback-run')) {
        buyback_list = [];
        buyback_size = 0;
        if (localStorage['buyback-length'] <= 0) {
            BuybackWaiter.clearAllSingles("BuyBack");
            BuybackWaiter.clearAllTables();
            return;
        }
    } else {
        if (checkExist('div.header-buttons') && !checkExist('#multi-buyback-button')) {
            createTagAppend(find('div.header-buttons'), 'button', 'multi-buyback-button', 'btn btn-confirm left-icon fastclickable', 'Multi Buyback');
            createTag(find('#multi-buyback-button'), 'span', '', 'fa fa-barcode');
            find('#multi-buyback-button').addEventListener('click', function() {
                localStorage.setItem('buyback-length', 0);
                var popup = createPopup('Multi BuyBack');
                createTag(popup, 'div', 'buyback-form', '', '').setAttribute('style', 'width:80%;margin-left:10%;');
                createNewInput();
                createTagAppend(popup, 'button', 'add-new-buyback', 'btn btn-dark fastclickable', 'Add Another Item', 'width:80%;margin-left:10%;').addEventListener('click', createNewInput);
                createTagAppend(find('#popup-bottom'), 'button', 'multi-buyback-submit', 'btn btn-confirm fastclickable', 'Start Printing', 'width:100%;').addEventListener('click', createPrintList);
                findByText('button', 'Close').addEventListener('click', function() {
                    buyback_size = 0;
                });
                find('input.buyback-input').focus();
            });
        }
    }
});

function createPrintList() {
    console.log('Create Print List');
    var input_list = findAll('input.buyback-input');
    localStorage.setItem('buyback-length', input_list.length);
    BuybackWaiter.addTable(function(table_number) {
        if (!findByText('button', 'Close')) {
            BuybackWaiter.clearTable(table_number);
        }
    });
    console.log('Input List Length:', input_list.length);
    for (var i = 0; i < input_list.length; i++) {
        if (input_list[i].value != '') {
            console.log('Item', i + ':', input_list[i].value);
            localStorage.setItem('buyback-item-' + i, input_list[i].value);
            BuybackWaiter.addTable(function(table_number) {
                if (checkExist('div.search-input input') && find('div.search-input input').value == '') {
                    console.log("Index:", table_number - 1);
                    setField('div.search-input input', 'input', localStorage['buyback-item-' + (table_number - 1)]);
                    localStorage.setItem('item-search', 'not complete');
                } else if (checkExist('div.search-input input') && find('div.search-input input').value == localStorage['buyback-item-' + (table_number - 1)]) {
                    if (!findByText('button', 'Item Search').disabled) {
                        findByText('button', 'Item Search').click();
                    }
                } else if (localStorage['item-search'] == 'done') {

                    BuybackWaiter.checkButtonClick(table_number, 'Items', '#inventory');
                }
            });
        }
    }
    BuybackWaiter.checkButtonClick(0, 'Close');

}

function createNewInput() {
    buyback_size += 1;
    var div = createTagAppend(find('#buyback-form'), 'div', 'item-number-' + buyback_size + '-div');
    createTag(div, 'label', '', 'item-number-' + String(buyback_size), 'Item Number: ' + String(buyback_size));
    createTagAppend(div, 'br', '', 'item-number-' + String(buyback_size));
    var input = createInputAppend(div, 'text', '', '', '', 'item-number-' + String(buyback_size) + ' buyback-input', 'width:80%');
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            findByText('button', 'Add Another Item').click();
        }
    });
    var button = createTagAppend(div, 'button', 'item-number-' + String(buyback_size), 'btn btn-cancel fastclickable', 'Remove', 'width:20%');
    button.addEventListener('click', function(e) {
        console.log('.' + e.target.id);
        remove('#' + e.target.id + '-div');
    });
    input.focus();
}
