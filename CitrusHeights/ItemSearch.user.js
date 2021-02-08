// ==UserScript==
// @name         Item Search
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Helps users to serach for items and print labels.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/Search.js
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/Waiter.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/ItemSearch.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/ItemSearch.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==
//var ignored = false;
var ItemSearchWaiter = new Waiter();
ItemSearchWaiter.addSingle('item-search-run', function() {
    var html_to_add = '<div id="custom_search_div" class="custom-search col-xs-12 col-sm-12" style="margin-bottom:10px;"><div id="search-dropdown-div" class="col-xs-12 col-sm-2"><select id="item-select"><option value="Work Order">Work Order</option><option value="Part Order">Purchase Order</option><option value="Item">Exact Item</option></select></div><div id="search-input-div" class="col-xs-12 col-sm-9"><input type="text" id="item-search" name="item-search" placeholder="Search for Exact Item"></div><div id="search-button-div" class="col-xs-12 col-sm-1"><button id="search-button" type="button" class="btn btn-confirm fastclickable">Search Item</button></div></div>';
    if (checkExist('.portal-table-buttons')) {
        if ((!checkURL("https://portal.ubif.net/pos/inventory") && !checkExist('#item-dropdown-div')) || !getData('item-search-run')) {
            ItemSearchWaiter.clearAllSingles('Item Searcher');
            ItemSearchWaiter.clearAllTables();
            return;
        }
        if (checkURL("https://portal.ubif.net/pos/inventory") && !checkExist('#item-dropdown-div')) {
            var divs = findAll('.portal-table-buttons div');
            divs[0].setAttribute('class', 'col-xs-12 col-sm-3');
            divs[1].setAttribute('class', 'col-xs-12 col-sm-2 move-up-5');
            divs[6].setAttribute('class', 'col-xs-12 col-sm-4 beta-up-6');
            var dropdown_div = createTagAppend(find('.portal-table-buttons'), 'div', 'item-dropdown-div', 'col-xs-12 col-sm-2 move-up-5');
            createDropdown(dropdown_div, ['Print Buyback Label', 'Work Order', 'Purchase Order', 'Exact Item'], 'item-dropdown');
            createTagAppend(find('.portal-table-buttons'), 'div', 'item-button-div', 'col-xs-12 col-sm-1 move-up-5');
            createTag(find('#item-button-div'), 'button', 'item-button', 'btn btn-confirm fastclickable', 'Item Search');
            find('#item-button').addEventListener('click', itemSearch);
            find('input.ui-autocomplete-input').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    if (searchCheck()) {
                        itemSearch();
                    } else if (checkAP()) {
                        itemAPSearch();
                    }
                }
            });
        }
    }
});

ItemSearchWaiter.addSingle('item-search-button', function() {
    if (!checkURL("https://portal.ubif.net/pos/inventory")) {
        ItemSearchWaiter.clearSingle('item-search-button');
    } else if (checkExist('#item-button')) {
        find('#item-button').disabled = !searchCheck();
    }
});

function searchCheck() {
    var text = find('input.ui-autocomplete-input').value;
    var reg=/^[0-9]*[-]?[0-9]*$/;
    if (reg.test(text)) {
        if (text.indexOf('-') > 2 && (text.length - text.indexOf('-') - 1) == 10) {
            return true;
        }
    }
    return false;
}

function checkAP() {
    var text = find('input.ui-auotcomplete-input').value;
    if (text.length > 15 && !text.includes(' ')) {
        if (text.includes('APL') || text.includes('APA')) {
            return true;
        }
    }
    return false;
}

function itemAPSearch() {

}

function itemSearch() {
    var select_all_css = '#wrap > div > div.portal-pos > div > div:nth-child(2) > div:nth-child(2) > div > div > div:nth-child(1) > div > div > div > div:nth-child(2) > span:nth-child(2) > div > ul > li:nth-child(1) > a';
    // Test number for citrus heights. 401163-0000004936
    var item = find('input.ui-autocomplete-input').value;
    var sku = item.substring(0, item.indexOf('-'));
    var serial = item.substring(item.indexOf('-') + 1);
    var search_type = find('#item-dropdown').value;
    setField('input.ui-autocomplete-input', 'input', sku);
    ItemSearchWaiter.addTable(function(table_number) {
        if (findByText('.portal-table span', sku)) {
            ItemSearchWaiter.clearTable(table_number);
        }
    }, 250);
    ItemSearchWaiter.addTable(function(table_number) {
        find('a', findByText('.portal-table tr', sku)).click();
        ItemSearchWaiter.clearTable(table_number);
    }, 250);
    ItemSearchWaiter.addTable(function(table_number) {
        if (findByText('button', '9 checked')) {
            ItemSearchWaiter.clearTable(table_number);
        } else {
            if (findAllByText('button', 'checked').length > 1) {
                findAllByText('button', 'checked')[1].click();
                ItemSearchWaiter.clearTable(table_number);
            } else if (findByText('button', 'status')) {
                ItemSearchWaiter.checkButtonClick('status');
            }
        }
    }, 250);
    ItemSearchWaiter.addTable(function(table_number) {
        if (findByText('button', '9 checked') && checkExist('.table-hold tr')) {
            setField(find('.portal-panel input.form-control'), 'input', serial);
        } else if (findByText('a', 'Check All')) {
            runAngularTrigger(select_all_css, 'click');
            find(select_all_css).click();
            setField(find('.portal-panel input.form-control'), 'input', serial);
        }
        if (find('.portal-panel input.form-control').value == serial &&
                findByText('small', '#' + sku)) {
            ItemSearchWaiter.clearTable(table_number);
        }
    }, 250);
    ItemSearchWaiter.addTable(function(table_number) {
        if (findByText('tr', serial)) {
            var element = findByText('tr', serial);
            if ((search_type == "Work Order" || search_type == "Print Buyback Label") && findAll('a', element)[1]) {
                findAll('a', element).forEach(function(elem) {
                    if (elem.getAttribute('href').includes('checkout-new')) {
                        elem.click();
                    }
                });
                if (search_type == "Print Buyback Label") {
                    printBuyBackLabel();
                }
            } else if (search_type == "Purchase Order" && find('a', element)) {
                find('a', element).click();
            }
            ItemSearchWaiter.clearTable(table_number);
        }
    }, 250);
    /**
    // step_1 = false;
    // start_1 = setInterval(function() {
    //     if (findByText('.portal-table span', sku)) {
    //         step_1 = true;
    //         clearInterval(start_1);
    //     }
    // }, 250);
    // step_2 = false;
    // start_2 = setInterval(function() {
    //     if (step_1) {
    //         var view = find('a', findByText('.portal-table tr', sku));
    //         eventFire(view, 'click');
    //         step_2 = true;
    //         clearInterval(start_2);
    //     }
    // }, 250);
    // step_3 = false;
    // start_3 = setInterval(function() {
    //     if (step_2) {
    //         if (findByText('button', '9 checked')) {
    //             console.log('9 Check Step 3');
    //             step_3 = true;
    //             clearInterval(start_3);
    //         } else {
    //             if (findAllByText('button', 'checked').length > 1) {
    //                 eventFire(findAllByText('button', 'checked')[1], 'click');
    //                 console.log('Some Check Step 3');
    //                 step_3 = true;
    //                 clearInterval(start_3);
    //             } else if (findByText('button', 'status')) {
    //                 eventFire(findByText('button', 'status'), 'click');
    //                 console.log('None Check Step 3');
    //                 step_3 = true;
    //                 clearInterval(start_3);
    //             }
    //         }
    //     }
    // },250);

    step_4 = false;
    start_4 = setInterval(function() {
        if (step_3) {
            if (findByText('button', '9 checked') && checkExist('.table-hold tr')) {
                console.log('9 Check ', serial);
                setField(find('.portal-panel input.form-control'), 'input', serial);
            } else if (findByText('a', 'Check All')) {
                console.log('Some Check ', serial);
                runAngularTrigger(select_all_css, 'click');
                eventFire(find(select_all_css), 'click');
                setField(find('.portal-panel input.form-control'), 'input', serial);
            }
            if (find('.portal-panel input.form-control').value == serial &&
                    findByText('small', '#' + sku)) {
                step_4 = true;
                clearInterval(start_4);
            }
        }
    }, 250);
    step_5 = false;
    start_5 = setInterval(function() {
        if (step_4) {
            if (findByText('tr', serial)) {
                var element = findByText('tr', serial);
                if ((search_type == "Work Order" || search_type == "Print Buyback Label") && findAll('a', element)[1]) {
                    findAll('a', element).forEach(function(elem) {
                        if (elem.getAttribute('href').includes('checkout-new')) {
                            eventFire(elem, 'click');
                        }
                    });
                    if (search_type == "Print Buyback Label") {
                        printBuyBackLabel();
                    }
                } else if (search_type == "Purchase Order" && find('a', element)) {
                    eventFire(find('a', element), 'click');
                }
                step_5 = true;
                clearInterval(start_5);
            }
        }
    }, 250); */
}

function printBuyBackLabel() {
    ItemSearchWaiter.addTable(function(table_number) {
        if (checkExist('.header-buttons div button.dropdown-toggle') && !checkExist('#item-search-check')) {
            console.log('Clicking');
            find('.header-buttons div button.dropdown-toggle').click();
            createTag(find('body'), 'div', 'item-search-check');
            ItemSearchWaiter.clearTable(table_number);
        }
    }, 250);
    ItemSearchWaiter.addTable(function(table_number) {
        if (ItemSearchWaiter.checkButtonClick(table_number, 'Print All Buyback Item Labels', 'li a') && checkExist('#item-search-check')) {
            ItemSearchWaiter.clearTable(table_number);
            console.log('Printing');
            remove('#item-search-check');
            localStorage.setItem('item-search', 'done');
            runAngularTrigger(findByText('a', 'Print All Buyback Item Labels'), 'click');
        }
    }, 1000);
    /**
    step_6 = false;
    start_6 = setInterval(function() {
        if (checkExist('.header-buttons div button.dropdown-toggle')) {
            eventFire('.header-buttons div button.dropdown-toggle', 'click');
            step_6 = true;
            clearInterval(start_6);
        }
    }, 250);
    step_7 = false;
    start_7 = setInterval(function() {
        if (step_6) {
            if (findByText('a', 'Print All Buyback Item Labels')) {
                runAngularTrigger('#wrap > div > div.portal-header.row > div.col-xs-12.col-md-4.portal-actions > div > div > ul > li:nth-child(4) > a', 'click');
                step_7 = true;
            }
            if (findByText('a', 'Print All W.O. Labels')) {
                runAngularTrigger('#wrap > div > div.portal-header.row > div.col-xs-12.col-md-6.portal-actions > div > div > ul > li:nth-child(3) > a', 'click');
                step_7 = true;
            }
        }
        if (step_7) {
            clearInterval(start_7);
        }
    }, 1000);
    */
}
