// Variables for what page we are on and if we have run it yet
var workorder_page = false;
var item_page = false;
var create_wo_page = false;
var device_select_page = false;
var repair_detail_page = false;
var lead_page = false;

// Variables for the URLs
var portal_base_url = "https://portal.ubif.net/"
var device_repair_select_url = portal_base_url + "pos/device-repair-select/";
var checkout_new_url = portal_base_url + "pos/checkout-new/";
var leads_url = portal_base_url + "pos/aqleads/edit/";
var inventory_url = portal_base_url + "pos/inventory/";
var repair_select_url = portal_base_url + "pos/repair/workorder/";

// Variables for scripts
var dummy_workorder_script = false;

// Single Runners for scripts
var ItemSearchWaiter = new Waiter();
var AutofillWaiter = new Waiter();
var CreateWOWaiter = new Waiter();
var DummyWOWaiter = new Waiter();
var MultiBuybackWaiter = new Waiter();
var PixelScanWaiter = new Waiter();
var SignInWaiter = new Waiter();
var CheckInWaiter = new Waiter();
var WOIssueWaiter = new Waiter();
var run_item_search = 'run-item-search';
var run_autofill = 'run-autofill';
var run_create_wo = 'run-create-wo';
var run_dummy_wo = 'run-dummy-wo';
var run_multi_buyback = 'run-multi-buyback';
var run_pixel_scan = 'run-pixel-scan';
var run_sign_in = 'run-sign-in';
var run_check_in = 'run-check-in';
var run_wo_issue = 'run-wo-issue';

var ContentWaiter = new Waiter();
ContentWaiter.addSingle('content-waiter', function() {
    // Condition note Page
    if (checkURL(device_repair_select_url) && !repair_detail_page) {
        if (checkExist(".condition-notes")) {
            runCheckInScript();
            repair_detail_page = true;
        }
    } else if (!checkURL(device_repair_select_url) && repair_detail_page) {
        repair_detail_page = false;
    }
    // Work order Page
    if (checkURL(checkout_new_url) && !workorder_page) {
        runAutoFillScript();
        runPixelScanScript();
        runWorkOrderIssueScript();
        workorder_page = true;
    } else if (!checkURL(checkout_new_url) && workorder_page) {
        workorder_page = false;
    }
    if ((checkURL(repair_select_url) || checkURL(leads_url)) && !dummy_wo_script) {
        runDummyWorkorderScript();
        dummy_workorder_script = true;
    } else if (!(checkURL(repair_select_url) || checkURL(leads_url)) && dummy_workorder_script) {
        dummy_workorder_script = false;
    }
    if (checkURL(inventory_url) && !item_page) {
        runItemSearchScript();
        runMultiBuybackScript();
        item_page = true;
    } else if (!checkURL(inventory_url) && item_page) {
        item_page = false;
    }
}, 500);

/*
 * START CHECK IN SCRIPT FUNCTIONS
 */

var PASSCODE = 0, ACCESSORIES = 1, CONTACT = 2, CONDITION = 3, DESCRIPTION = 4, CHECKLIST = 5;
var passcode = '';
var phone_number = '';
var checklist;
var tabs = [
    "PASSCODE",
    "ACCESSORIES",
    "CONTACT",
    "CONDITION",
    "DESCRIPTION",
    "CHECKLIST"
];

var shorts = [
    "PC: ",
    "ACC: ",
    "PCM: ",
    "COND: ",
    "DESC: "
];

var titles = [
    "Passcode:",
    "Accessories:",
    "Prefered Contact Method:",
    "Condition:",
    "Description:",
    "Component Checklist:"
];

var prompts = [
    "What is the pattern or password for the device being checked?",
    "What accessories are being checked in with the device?",
    "How should the customer be updated about their repair?",
    "What is the condition of the device being checked in?",
    "Describe what the issue with the customers device?"
];

function runCheckInScript() {
    CheckInWaiter.addSingle(run_check_in, function() {
        if (checkExist('#check-in-button')) {
            CheckInWaiter.clearSingle(run_check_in);
        }
        if (checkExist(".condition-notes") && !checkExist('#check-in-button')) {
            var check_in_button = createTag(findByText('div.panel-body', 'Physical Appearance'), 'button', 'check-in-button', 'btn btn-open-checkin', 'Open Check In');
            check_in_button.style.width = '100%';
            check_in_button.style.padding = '10px';
            check_in_button.style.fontSize = '14px';
            find('#check-in-button').addEventListener('click', createCheckIn);
            find('#check-in-button').click();
        }
    });
}

function createCheckIn() {
    var org_text = find('.condition-notes').value;
    if (findByText('label', 'Passcode:')) {
        passcode = findSibling('label', 'input', 'Passcode:').value;
    }
    var tab_number = 0;

    createTag(find('body'), 'div', 'main-check-in');
    var html = '<div id="backdrop" class="modal-backdrop fade in" modal-animation-class="fade" modal-in-class="in" ng-style="{\'z-index\': 1040 + (index &amp;&amp; 1 || 0) + index*10}" modal-backdrop="modal-backdrop" modal-animation="true" style="z-index: 1040;"></div><div id="pixel-scan-data-body" modal-render="true" tabindex="-1" role="dialog" class="modal fade fastclickable in" modal-animation-class="fade" modal-in-class="in" ng-style="{\'z-index\': 1050 + index*10, display: \'block\'}" ng-click="close($event)" modal-window="modal-window" size="lg" index="0" animate="animate" modal-animation="true" style="z-index: 1050; display: block;"><div class="modal-dialog modal-lg" ng-class="size ? \'modal-\' + size : \'\'"><div id="check-in" class="modal-content" modal-transclude=""></div></div></div>';
    addHTML('#main-check-in', html);
    createTagAppend(find('#check-in'), 'div', 'tabs-add', 'tab');
    var tabs_html = '';
    var length = 100 / tabs.length;
    for (var i = 0; i < tabs.length; i++) {
        tabs_html += '<button id="' + tabs[i] + '-tab-button" class="tablinks btn btn-default" style="width:' + length + '%" onclick="openTab(event, \'' + tabs[i] + '\')">' + tabs[i] + '</button>';
    }
    addHTML('#tabs-add', tabs_html);
    for (var i = 0; i < tabs.length; i++) {
        find('#' + tabs[i] + '-tab-button').addEventListener('click', function(e) {
            openTab(e, tabs[getNumber(e.currentTarget.id)]);
        })
    }

    for (var i = 0; i < tabs.length; i++) {
        createTagAppend(find('#check-in'), 'div', tabs[i] + '-tab', 'tabcontent');
    }

    // Creates tabs section
    for (var i = 0; i < tabs.length; i++) {
        console.log('#' + tabs[i] + '-tab');
        createTag(find('#' + tabs[i] + '-tab'), 'div', tabs[i] + '-header', 'modal-header');
        createTag(find('#' + tabs[i] + '-header'), 'h3', '', 'modal-title', titles[i]);
        createTagAppend(find('#' + tabs[i] + '-tab'), 'div', tabs[i] + '-body', 'modal-body');
        createTag(find('#' + tabs[i] + '-body'), 'div', '', 'row move-down-20', prompts[i]);
        createTagAppend(find('#' + tabs[i] + '-body'), 'div', '', 'row');
        createTagAppend(find('#' + tabs[i] + '-body'), 'label', '', '', titles[i]);
        if (i < tabs.length - 1) {
            createTagAppend(find('#' + tabs[i] + '-body'), 'textarea', tabs[i] + '-info');
            find('#' + tabs[i] + '-info').style.width = '100%'
        }
        createTagAppend(find('#' + tabs[i] + '-body'), 'div', tabs[i] + '-buttons');
        if (i > 0) {
            createTagAppend(find('#' + tabs[i] + '-buttons'), 'button', tabs[i] + '-back', 'btn btn-default btn-tab', 'Back');
            find('#' + tabs[i] + '-back').style.width = '100%';
            find('#' + tabs[i] + '-back').addEventListener('click', function(evt) {
                prevTab(evt)
            });
        }
        if (i < tabs.length - 1) {
            console.log(i + ' <', tabs.length - 1);
            createTagAppend(find('#' + tabs[i] + '-buttons'), 'button', tabs[i] + '-next', 'btn btn-default btn-tab', 'Next');
            find('#' + tabs[i] + '-next').style.width = '100%';
            find('#' + tabs[i] + '-next').addEventListener('click', function(evt) {
                nextTab(evt);
            });
            if (i > 0) {
                find('#' + tabs[i] + '-back').style.width = '50%';
                find('#' + tabs[i] + '-next').style.width = '50%';
            } else if (tabs.length - 1 == i) {
                find('#' + tabs[i] + '-back').style.width = '100%';
            }
        }
        createTagAppend(find('#' + tabs[i] + '-body'), 'div', tabs[i] + '-add-loc');
        find('#' + tabs[i] + '-add-loc').style.padding = '10px';
    }

    createTagAppend(find('#check-in'), 'button', 'check-in-submit', 'btn btn-default btn-tab btn-submit', 'Submit').style.width = '100%';
    find('#check-in-submit').addEventListener('click', function() {
        //console.log('ORG_TEXT:', org_text);
        submitData();
    });

    createTagAppend(find('#check-in'), 'button', 'tab-cancel', 'btn btn-cancel-check-in', 'Cancel');
    find('#tab-cancel').style.width = '100%';
    find('#' + tabs[tabs.length - 1] + '-add-loc').style.height = '330px';

    if (checkExist('three-state-button-list div')) {
        checklist = find('three-state-button-list');
        find('#' + tabs[tabs.length - 1] + '-add-loc').append(checklist);
        find('#' + tabs[tabs.length - 1] + '-add-loc').style.padding = '10px';
        find('#' + tabs[tabs.length - 1] + '-back').style.width = '100%';
    } else {
        findByText('button', tabs[tabs.length - 1]).disabled = true;
        find('#' + tabs[tabs.length - 2] + '-next').disabled = true;
    }

    find('#tab-cancel').addEventListener('click', removeCheckIn);

    eventFire('#' + tabs[0] + '-tab-button', 'click');

    addHTML('#' + tabs[PASSCODE] + '-add-loc', '<style>input {position: absolute;opacity: 0;cursor: pointer;height: 13px;width: 13px;z-index: 10;-ms-transform: scale(2.5);' +
            ' /* IE */-moz-transform: scale(2.5); /* FF */-webkit-transform: scale(2.5); /* Safari and Chrome */-o-transform: scale(2.5); /* Opera */' +
            'transform: scale(2.5);padding: 0px;left:30px;top:8px;}#keypad {padding-left: 42%;}.checkbox {width: 35px;height: 35px;background: ' +
            '#ddd;margin: 5px 5px;border-radius: 100%;position: relative;box-shadow: 0px 1px 3px rgba(0,0,0,0.5);}.checkbox label {display: block;width:' +
            ' 30px;height: 30px;border-radius: 100px;transition: all .5s ease;cursor: pointer;position: absolute;top: 3px;left: 2px;z-index: 0;background:' +
            ' #333;box-shadow:inset 0px 1px 3px rgba(0,0,0,0.5);}.checkbox:before {position: absolute;color: white;top: 0px;left: 10px;height: 0px;z-index:' +
            ' 1;font-weight: bold;font-size: 24px;}.checkbox input[type=checkbox]:checked + label {background: #26ca28;}#but1:before {content: "1";}' +
            '#but2:before {content: "2";}#but3:before {content: "3";}#but4:before {content: "4";}#but5:before {content: "5";}#but6:before {content: "6";}' +
            '#but7:before {content: "7";}#but8:before {content: "8";}#but9:before {content: "9";}button {width: 135px;color: white;background: red;box-shadow:' +
            'inset 0px 1px 3px rgba(0,0,0,0.5);border-radius: 100px;font-weight: bold;font-size: 16px;}</style><div id="keypad"><table><tbody><tr>' +
            '<th><div id="but1" class="checkbox"><input type="checkbox" value="1" id="checkbox1" name="" style="width: 13px;"><label for="checkbox1"></label>' +
            '</div></th><th><div id="but2" class="checkbox"><input type="checkbox" value="2" id="checkbox2" name="" style="width: 13px;"><label for="checkbox2">' +
            '</label></div></th><th><div id="but3" class="checkbox"><input type="checkbox" value="3" id="checkbox3" name="" style="width: 13px;"><label' +
            ' for="checkbox3"></label></div></th></tr><tr><th><div id="but4" class="checkbox"><input type="checkbox" value="4" id="checkbox4" name="" style' +
            '="width: 13px;"><label for="checkbox4"></label></div></th><th><div id="but5" class="checkbox"><input type="checkbox" value="5" id="checkbox5" ' +
            'name="" style="width: 13px;"><label for="checkbox5"></label></div></th><th><div id="but6" class="checkbox"><input type="checkbox" value="6" ' +
            'id="checkbox6" name="" style="width: 13px;"><label for="checkbox6"></label></div></th></tr><tr><th><div id="but7" class="checkbox"><input type' +
            '="checkbox" value="7" id="checkbox7" name="" style="width: 13px;"><label for="checkbox7"></label></div></th><th><div id="but8" class="checkbox">' +
            '<input type="checkbox" value="8" id="checkbox8" name="" style="width: 13px;"><label for="checkbox8"></label></div></th><th><div id="but9" ' +
            'class="checkbox"><input type="checkbox" value="9" id="checkbox9" name="" style="width: 13px;"><label for="checkbox9"></label></div></th>' +
            '</tr></tbody></table><button id="clear_button">CLEAR</button></div>');

    find('tbody').addEventListener('click', keypad);
    find('#clear_button').addEventListener('click', function() {
        var el = find('#' + tabs[PASSCODE] + '-info');
        el.value = el.value.substring(el.value.indexOf(']') + 1);
        if (el.value.charAt(0) == ' ' || el.value.charAt(0) == '\n') {
            el.value = el.value.substring(1);
        }
        var list = findAll('tbody input');
        for (var i = 0; i < list.length; i++) {
            list[i].checked = false;
        }
    });

    DButTable.makeDescButtons();
    DButTable.makeContactButtons();
    DButTable.makeAccButtons();
    DButTable.makeCondButtons();
    DButTable.printButtons(tabs[DESCRIPTION]);
    DButTable.printButtons(tabs[CONTACT]);
    DButTable.printButtons(tabs[ACCESSORIES]);
    DButTable.printButtons(tabs[CONDITION]);

    if (findByText('label', 'Passcode:')) {
        console.log('Passcode:', passcode);
        if (passcode.includes('Pattern[')) {
            var text = passcode.substring(8, passcode.indexOf(']'));
            console.log('Text:', text);
            for (var i = 0; i < text.length; i++) {
                console.log('find:', '#' + 'checkbox' + text[i]);
                find('#' + 'checkbox' + text[i]).click();
            }
        } else {
            find('#' + tabs[PASSCODE] + '-info').value = passcode;
        }
    }

    var area_items = findAll('#check-in textarea');
    for (var i = 0; i < area_items.length; i++) {
        area_items[i].style.height = '60px';
        if (i != CONTACT) {
            area_items[i].addEventListener('keypress', function(e) {
                console.log(event.keyCode);
                if (event.keyCode == 13) {  // Enter Key
                    console.log('ID:', e.currentTarget.id);
                    var num = getNumber(e.currentTarget.id);
                    console.log('NUM:', num);
                    console.log('Find:', '#' + tabs[num] + '-next');
                    console.log('Found:', find('#' + tabs[num] + '-next'));
                    find('#' + tabs[num] + '-next').click();
                }
            });
        } else {
            area_items[i].addEventListener('keypress', function(e) {
                console.log(event.keyCode);
                if (event.keyCode == 13) {  // Enter Key
                    console.log('ID:', e.currentTarget.id);
                    var num = getNumber(e.currentTarget.id);
                    console.log('NUM:', num);
                    console.log('Find:', '#' + tabs[num] + '-next');
                    console.log('Found:', find('#' + tabs[num] + '-next'));
                    find('#' + tabs[num] + '-next').click();
                } else if (event.keyCode != 32) {  // Not Space Key
                    var text = e.currentTarget.value + String.fromCharCode(e.keyCode);
                    text = phoneNumberConvert(text);
                    e.currentTarget.value = text.substring(0, text.length - 1);
                }
            });
        }
    }

    for (var i = 0; i < shorts.length; i++) {
        if (org_text.includes(shorts[i]) && i != PASSCODE) {
            var start = org_text.indexOf(shorts[i]) + shorts[i].length;
            var end = start + org_text.substring(start).indexOf('|');
            console.log(org_text.substring(start, end));
            if (org_text.substring(start, end).trim() != 'NA') {
                find('#' + tabs[i] + '-info').value = org_text.substring(start, end);
            }
        }
    }

    var i_end = shorts.length - 1;
    var start = org_text.indexOf(shorts[i_end]) + shorts[i_end].length;
    start = org_text.indexOf('|', start) + 1;
    console.log("START:", start);
    console.log("END:", org_text.length);
    console.log("ORG STRING:", org_text.substring(start));
    find('.condition-notes').value = org_text.substring(start);
    //setField('.condition-notes', 'input', org_text.substring(start));
}

function phoneNumberConvert(text) {
    var temp = "";
    var start = 0;
    var end = 0;
    var check = false;
    console.log("Text:", text);
    for (var i = 0; i < text.length; i++) {
        var d = text.charAt(i);
        if (d != ' ' && d != '/' && d != '-' && d != '.') {
            if (!isNaN(d)) {  // If character is a number
                temp += d;
                if (temp.length == 1) {
                    start = i;
                }
            } else if (temp.length > 10 || temp.length < 10) {
                temp = "";
            }
            if (temp.length == 10) {
                end = i;
                break;
            }
        }
    }
    if (temp.length == 10) {
        console.log("Start:", start);
        console.log("End:", end);
        console.log("Temp:", temp);
        var new_text = "";
        temp = temp.substring(0,3) + '-' + temp.substring(3,6) + '-' + temp.substring(6,10);
        new_text = text.substring(0, start) + temp + text.substring(end + 1);
        return new_text
    }
    return text;
}

function grabPhoneNumber(text) {
    var temp = "";
    var start = 0;
    if (text.includes('-')) {
        count = 0;
        for (var j = 0; j < text.length; j++) {
            if (text.charAt(j) == '-') {
                count++;
            }
        }
        if (count < 2) {
            return "";
        } else {
            start = text.indexOf('-') - 3;
            if (start < 0) {
                start = 0;
            }
            temp = text.substring(start, start + 12).replaceAll('-', '');
        }
    }
    return temp;
}

function submitData() {
    var org_text = find('.condition-notes').value.trim();
    var text = '';
    var passcode = '';
    for (var i = 0; i < shorts.length; i++) {
        var temp = find('#' + tabs[i] + '-info').value.trim();
        text += shorts[i];
        text += (temp.trim() == '') ? 'NA' : temp;
        text += ' |\n';
    }
    text += ((org_text == null || org_text == '') ? '' : org_text);
    setField('.condition-notes', 'input', text.replace('[object MouseEvent]', ''));
    phone_number = grabPhoneNumber(find('#' + tabs[CONTACT] + '-info').value);
    if (findByText('label', 'Passcode:')) {
        console.log('Find:', findSibling('label', 'input', 'Passcode:'));
        console.log('Value:', find('#' + tabs[PASSCODE] + '-info').value);
        passcode = find('#' + tabs[PASSCODE] + '-info').value;
    }
    removeCheckIn();
    if (passcode != '') {
        setField(findSibling('label', 'input', 'Passcode:'), 'input', passcode);
    }
    if (phone_number != "") {
        var add_button_loc = findByText("div.submit-btn-hold div div", "Create Work Order");
        var create_button = find("button.full-submit");
        create_button.addEventListener("click", function() {
            var step_1 = false;
            var start_1 = setInterval(function() {
                if (checkExist("div.bar-buttons button.yellow")) {
                    find("div.bar-buttons button.yellow").click();
                    step_1 = true;
                    clearInterval(start_1);
                }
            }, 250);
            var step_2 = false;
            var start_2 = setInterval(function() {
                if (step_1 && findByAttribute("input", "name", "customer_phone")) {
                    clearInterval(start_2);
                    var els_numbers = [];
                    var numbers = [];
                    els_numbers.push(findByAttribute("input", "name", "customer_phone"));
                    els_numbers.push(findByAttribute("input", "name", "alternate_phone"));
                    els_numbers.push(findByAttribute("input", "name", "alternate_phone_2"));
                    console.log("Step: 1");
                    for (var i = 0; i < els_numbers.length; i++) {
                        if (els_numbers[i] != null) {
                            numbers.push(els_numbers[i].value.replaceAll('-', ''));
                        } else {
                            numbers.push("");
                        }
                        if (i != 0 && numbers[0] == numbers[i]) {
                            setField(els_numbers[i], "input", "");
                            numbers[i] = "";
                        }
                    }
                    console.log("Step: 2");
                    for (var j = 1; j < els_numbers.length; j++) {
                        if (numbers[j] == "") {
                            setField(els_numbers[j], "input", phone_number);
                            console.log("Phone Number:", phone_number);
                            find("i.fa-circle", els_numbers[j].parentNode).click();
                            sleep(100).then(() => {
                                console.log("CLICK");
                                findByText("button", "Save Info").click();
                                step_2 = true;
                            });
                            break;
                        }
                    }
                    phone_number = "";
                }
            }, 250);
            var step_3 = false;
            var start_3 = setInterval(function() {
                if (step_2) {
                    step_3 = true;
                    find("div.bar-buttons button.yellow").click();
                    clearInterval(start_3);
                }
            }, 250);
        });
    }
}

function removeCheckIn() {
    if (checklist) {
        findSibling('h4', 'div.row', 'Component Checklist').append(checklist);
    }
    remove('#main-check-in');
    DButTable.clearTable();
}

function nextTab(evt) {
    var current_tab = getNumber(evt.currentTarget.id);
    if (current_tab + 1 < tabs.length) {
        console.log('#' + tabs[current_tab + 1] + '-tab-button');
        eventFire('#' + tabs[current_tab + 1] + '-tab-button', 'click');
    }
}

function prevTab(evt) {
    var current_tab = getNumber(evt.currentTarget.id);
    if (current_tab > 0) {
        console.log('#' + tabs[current_tab - 1] + '-tab-button');
        eventFire('#' + tabs[current_tab - 1] + '-tab-button', 'click');
    }
}

function openTab(evt, tab_name) {
    var tab_content = findAll('.tabcontent');
    for (var i = 0; i < tab_content.length; i++) {
        tab_content[i].style.display = 'none';
    }

    var tab_links = findAll('.tablinks');
    for (var i = 0; i < tab_links.length; i++) {
        tab_links[i].className = tab_links[i].className.replace(' active', '');
    }

    find('#' + tab_name + '-tab').style.display = 'block';
    evt.currentTarget.className += ' active';
    tab_number = getNumber(tab_name);

    find('#' + tab_name + '-info').focus();
}

function getNumber(tab_name) {
    if (tab_name.includes('-')) {
        tab_name = tab_name.substring(0, tab_name.indexOf('-'));
    }
    for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].includes(tab_name)) {
            return i;
        }
    }
    return 0;
}

function keypad(event) {
    if (event.target.id.includes('checkbox')) {
        var element = find('#' + tabs[PASSCODE] + '-info');
        var num = event.target.id.substring(8);
        if (!element.value.includes('Pattern[')) {
            element.value = 'Pattern[] ' + element.value;
        }
        var start = 0;
        var text = "";
        if (event.target.checked) {
            start = element.value.indexOf(']');
            text = element.value.substring(0, start) + num;
            text += element.value.substring(start);
        } else {
            start = element.value.indexOf(num);
            text = element.value.substring(0, start);
            text += element.value.substring(start + 1);
        }
        element.value = text;
    }
}

var DButTable = {
    buttons: [],
    all_buttons: [],
    makeDescButtons: function() {
        this.all_buttons.push(new DButton(tabs[DESCRIPTION] + '-desc', 'Water Damage', ' Due to the unpredictable nature of water damage, we are not responsible for any loss of functionalities.'));
        this.all_buttons.push(new DButton(tabs[DESCRIPTION] + '-desc', 'Unable to Test', ' We were unable to fully test the device so we cannot be responsible for any loss of functionalities.'));
        this.all_buttons.push(new DButton(tabs[DESCRIPTION] + '-desc', 'Frame Bend', ' With any bend in the frame there is a chance the motherboard has been damaged. If that is the case there might be loss of some functionalities to the device.'));
        this.all_buttons.push(new DButton(tabs[DESCRIPTION] + '-desc', 'Data Retrieval', ' Because we were not able to verify the data that needs to be recovered. We will consider it a successful data salvage as long as a large chunk or a lot of the data was recovered.'));
        this.all_buttons.push(new DButton(tabs[DESCRIPTION] + '-desc', 'Extreme Damage', ' With extreme amounts of damage to the device it is hard to verify if there was any damage to the motherboard. If this is the case there might be loss of some functionalities to the device.'));
        this.all_buttons.push(new DButton(tabs[DESCRIPTION] + '-desc', 'Screen Protector', ' We may have to remove the screen protector during the repair process. We apologize for any convience this may cause, but we will try out best to work around the accessories attached to your device.'));
        this.all_buttons.push(new DButton(tabs[DESCRIPTION] + '-desc', 'Data Reflash', ' This will delete all the data that is on your device. If the Google or Apple account is still attached to this device it will trigger a FRP lock which requires you to know your login in credentials for that account.'));
        this.all_buttons.push(new DButton(tabs[DESCRIPTION] + '-desc', 'Asurion Repair', ' Asurion Repair.'));
        this.all_buttons.push(new DButton(tabs[DESCRIPTION] + '-desc', 'Assurant Repair', ' Assurant Repair.'));
        this.all_buttons.push(new DButton(tabs[DESCRIPTION] + '-desc', 'Verizon Extended Warranty', ' Verizon Extended Warranty.'));
    },
    makeContactButtons: function() {
        this.all_buttons.push(new DButton(tabs[CONTACT] + '-desc', 'Call', ' Call the Customer.'));
        this.all_buttons.push(new DButton(tabs[CONTACT] + '-desc', 'Text', ' Text the Customer.'));
        this.all_buttons.push(new DButton(tabs[CONTACT] + '-desc', 'Email', ' Email the customer.'));
        this.all_buttons.push(new DButton(tabs[CONTACT] + '-desc', 'Will Return', ' Customer will return for the device.'));
    },
    makeAccButtons: function() {
        this.all_buttons.push(new DButton(tabs[ACCESSORIES] + '-desc', 'Sim Card', 'Sim Card. '));
      	this.all_buttons.push(new DButton(tabs[ACCESSORIES] + '-desc', 'SD Card', 'SD Card. '));
        this.all_buttons.push(new DButton(tabs[ACCESSORIES] + '-desc', 'Case', 'Case. '));
        this.all_buttons.push(new DButton(tabs[ACCESSORIES] + '-desc', 'Charge Cord', 'Charging Cord. '));
        this.all_buttons.push(new DButton(tabs[ACCESSORIES] + '-desc', 'S-Pen', 'S-Pen. '));
        this.all_buttons.push(new DButton(tabs[ACCESSORIES] + '-desc', 'Missing S-Pen', 'The S-Pen is missing. '));
    },
    makeCondButtons : function() {
      	this.all_buttons.push(new DButton(tabs[CONDITION] + '-desc', 'Slight Scuffing', ' Device has slight scuffing on the housing.'));
      	this.all_buttons.push(new DButton(tabs[CONDITION] + '-desc', 'Average Scuffing', ' Device has some heavier scuffs here and there on the housing.'));
      	this.all_buttons.push(new DButton(tabs[CONDITION] + '-desc', 'Heavy Scuffing', ' Device has deep scratches and heavy scuffing on the housing.'));
      	this.all_buttons.push(new DButton(tabs[CONDITION] + '-desc', 'Screen Broken', ' Device screen is broken.'));
      	this.all_buttons.push(new DButton(tabs[CONDITION] + '-desc', 'LCD Broken', ' The LCD is broken.'));
      	this.all_buttons.push(new DButton(tabs[CONDITION] + '-desc', 'LCD Good', ' The LCD is good.'));
        this.all_buttons.push(new DButton(tabs[CONDITION] + '-desc', 'Frame Bend', ' There is a bend in the frame of the device.'));
    },
    clearTable : function() {
        this.all_buttons = [];
    },
    printButtons : function(type) {
        for (var num = 0; num < this.all_buttons.length; num++) {
            if (this.all_buttons[num].id.includes(type)) {
                this.buttons.push(this.all_buttons[num]);
            }
        }
        var bar_row = 4;
        var len = this.buttons.length;
        var text = '';
        var width = (len < bar_row) ? parseInt(100 / len) : parseInt(100 /  bar_row);
        var count = false;
        for(var i = 0; i < len; i++) {
            if (len > bar_row && len - i < bar_row && !count && i % bar_row == 0) {
                width = parseInt(100 / (len - i));
                 count = true;
            }
            createTagAppend(find('#' + type + '-add-loc'), 'button', this.buttons[i].id, 'btn btn-default desc-button', this.buttons[i].title).style.width = (width + '%');
        }
        find('#' + type + '-add-loc').addEventListener('click', function(e) {
            console.log(e.target.textContent);
            console.log('DButTable Length:', DButTable.all_buttons.length);
            for (var i = 0; i < DButTable.all_buttons.length; i++) {
                if (DButTable.all_buttons[i].title.includes(e.target.textContent)) {
                    var butt = DButTable.all_buttons[i];
                    var textarea = find('#' + tabs[getNumber(e.target.id)] + '-info');
                    if (textarea.value.includes(butt.text)) {
                        var temp = textarea.value;
                        textarea.value = temp.replace(butt.text, '');
                    } else {
                        textarea.value += butt.text;
                    }
                }
            }
        });
        this.buttons = [];
    }
};

function DButton(id, title, text) {
    this.title = title;
    this.text = text;
    this.id = id;
}

/*
 * END CHECK IN SCRIPT FUNCTIONS
 */

/*
 * START AUTO FILL SCRIPT FUNCTIONS
 */

var SAMSUNG = 1;
var GOOGLE = 2;
var ASURION = 3;
var NORMAL = 0

function runAutoFillScript() {
    AutofillWaiter.addSingle(run_check_in, function() {
        if (!checkURL(checkout_new_url)) {
            console.log('Closing AutoFill Script');
            AutoFillWaiter.clearSingle(run_check_in);
            AutofillWaiter.clearAllSingles();
            AutofillWaiter.clearAllTables();
        }
        if (!checkExist('#createnote')) {
            console.log('Add Create Note If')
            note_button_run = addCreateNote();
        }
        if (!checkExist('#autofill')) {
            fill_button_run = addAutoFill();
        }
        if (!checkExist('#auto_note_button') && checkExist('div.header-buttons')) {
            var auto_button = createTag(find('div.header-buttons'), 'button', 'auto_note_button', 'btn blue fastclickable', 'Text');
            auto_button.style.backgroundColor = '#269CD8';
            auto_button.style.color = 'white';
            auto_button.addEventListener('click', autoUpdate);
            sleep(1000).then(() => {
                setButtonText();
            });
            find(".editor-add-in").addEventListener('click', function() {
                if (find(".note-editable").innerText == "") {
                    setText("none", "Update Time.");
                }
            });
        }
        if (!checkExist('#voicemail-button')) {
            var voicemail = createTag(find('div.right-buttons'), 'button', 'voicemail-button', 'btn btn-warning left-icon fastclickable', 'Left Voicemail');
            createTag(voicemail, 'span', '', 'button-icon fa fa-fw fa-phone-square');
            find('#voicemail-button').addEventListener('click', voicemailClick);
            var talked = createTag(find('div.right-buttons'), 'button', 'talk-customer-button', 'btn btn-warning left-icon fastclickable', 'Talked to Customer', 'margin-right: 10px;');
            createTag(talked, 'span', '', 'button-icon fa fa-fw fa-phone');
            find('#talk-customer-button').addEventListener('click', talkedClick);
        }
    }, 1000);
    AutofillWaiter.addSingle('auto-button-update', function() {
        if (checkExist('#auto_note_button')) {
            setButtonText();
        } else if (!checkURL(checkout_new_url)){
            AutofillWaiter.clearSingle('auto-button-update');
        }
        if (findAll('#voicemail-button').length > 1) {
            remove('#voicemail-button');
            find('#voicemail-button').addEventListener('click', voicemailClick);
        }
        if (findAll('#talk-customer-button').length > 1) {
            remove('#talk-customer-button');
            find('#talk-customer-button').addEventListener('click', talkedClick);
        }
    }, 2500);
    AutofillWaiter.addSingle('checkout-popup', function() {
        if (findByText('span.hover-text', 'Check Out')) {
            if (findByAttribute('button', 'ng-click', 'clickMakePayment(GIFT_CARD)') &&
                    !checkExist('#gift-card')) {
                if (!findByAttribute('button.ng-hide', 'ng-click', 'clickMakePayment(GIFT_CARD)')) {
                    switchButton('gift-card', 'btn-info', 'fa-gift', 'Gift Card');
                }
        } else if (findByAttribute('button', 'ng-click', 'clickMakePayment(CASH)') &&
                        !checkExist('#cash')) {
                if (!findByAttribute('button.ng-hide', 'ng-click', 'clickMakePayment(CASH)')) {
                    switchButton('cash', 'btn-success', 'fa-money', 'Cash');
                }
            } else if (findByAttribute('button', 'ng-click', 'clickMakePayment(CREDIT)') &&
                        !checkExist('#credit')) {
                if (!findByAttribute('button.ng-hide', 'ng-click', 'clickMakePayment(CREDIT)')) {
                    switchButton('credit', 'btn-warning', 'fa-credit-card', 'Credit');
                }
            } else if (findByAttribute('button', 'ng-click', 'clickMakePayment(TRADE_CREDIT)') &&
                !checkExist('#trade-credit')) {
                if (!findByAttribute('button.ng-hide', 'ng-click', 'clickMakePayment(TRADE_CREDIT)')) {
                    switchButton('trade-credit', 'btn-default', 'fa-building', 'Trade Credit');
                }
            }
        }
    });
}

function voicemailClick() {
    console.log('Voicemail Click:', "Called and left a voicemail.");
    addText("Called and left a voicemail.");
}
function talkedClick() {
    console.log('Talked Click:', "Called and talked to customer.")
    addText("Called and talked to customer.");
}
function getStatusText() {
    var number = find('select.editor-add-in').value;
    var options = findAll('select.editor-add-in option');
    for (var i = 0; i < options.length; i++) {
        if (options[i].value == number) {
            return options[i].innerText;
        }
    }
}
var update_text = ["Device has been repaired and is going through a quality inspection.",
                    "Awaiting callback from the customer.",
                    "Awaiting for the customer to bring in their device.",
                    "Parts are in stock for the repair and is slotted to be repaired.",
                    "Customer has declined the repair and has up to 60 days to pickup there device before it is recycled.",
                    "Customer has abandoned the device and is sloted to be recycled.",
                    "Need to order parts for the device. Will take 3 to 5 business days for shipping.",
                    "Currently diagnosing the device to give customer a repair quote.",
                    "The device is currently being repaired.",
                    "The device is repaired and ready for pickup.",
                    "We were not able to repair the device and is ready for pickup. If not picked up within 60 days will be slotted to be recycled.",
                    "Called and left a voicemail.",
                    "Called and talked to customer.",
                    "Update Time."];
function addAutoFill() {
    if (checkExist('select.editor-add-in') && !checkExist('#autofill')) {
        createTag(find('select.editor-add-in'), 'div', 'autofill', '', '');
        find('select.editor-add-in').addEventListener('click', function() {
            var title = getStatusText();
            var index = -1;
            if (title == "Quality Inspection") {
                index = 0;
            } else if (title == "Awaiting Callback") {
                index = 1;
            } else if (title == "Awaiting Device") {
                index = 2;
            } else if (title == "Awaiting Repair") {
                index = 3;
            } else if (title == "Declined - RFP") {
                index = 4;
            } else if (title == "Device Abandoned") {
                index = 5;
            } else if (title == "Need to Order Parts") {
                index = 6;
            } else if (title == "Diag in Progress") {
                index = 7;
            } else if (title == "Repair in Progress") {
                index = 8;
            } else if (title == "Repaired - RFP") {
                index = 9;
            } else if (title == "Unrepairable - RFP") {
                index = 10;
            }
            if (index != -1) {
                setText("none", update_text[index]);
            }
        });
        return true;
    }
    return false;
}
function addCreateNote() {
    if (findByText('button', 'Create Note')) {
        createTag(findByText('button', 'Create Note'), 'div', 'createnote', '', '');
        var add_create_note_run = false;
        var add_auto_fill_run = false;
        findByText('button', 'Create Note').addEventListener('click', function() {
            AutofillWaiter.addSingle('create-note-button', function() {
                if (add_create_note_run && add_auto_fill_run) {
                    AutofillWaiter.clearSingle('create-note-button');
                }
                if (!add_auto_fill_run) {
                    add_auto_fill_run = addAutoFill();
                }
                if (!add_create_note_run) {
                    add_create_note_run = addCreateNote();
                }
            }, 1000);
        });
        return true;
    }
    return false;
}
function addText(text) {
    var items = ["Called and left a voicemail.", "Called and talked to customer."];
    var old_text = find('.note-editable').innerText;
    if (old_text == '' || itemInArray(old_text, items)) {
        setText("none", text);
    } else {
        setText("none", old_text + ' ' + text);
    }
}
function setText(disp, text) {
    if (itemInArray(text, update_text) ||
            find('.note-editable').textContent == "") {
        find(".note-placeholder").style = "display: " + disp + ";";
        find(".note-editable").innerHTML = text;
        setField(".note-editable", 'input', text);
    }
}
function setButtonText() {
    var button = find('#auto_note_button');
    var current_status = getStatusText();
    button.textContent = getSwitchText(current_status);
    button.disabled = (button.textContent == "Not Available");
}
function checkSamsungOrGoogle() {
    // 1 = SAMSUNG
    // 2 = GOOGLE
    // 3 = ASURION
    // 0 = NORMAL
    var google = '#portal-alert-bar > div > div.alert.portal-alert.alert-danger > span > button';
    if (findByText('div.partner-hold', 'SAMSUNG')) {
        return SAMSUNG;
    } else if (checkExist(google) && find(google).textContent.includes("Diag App")) {
        return GOOGLE;
    } else if (findByText('div.partner-hold', 'ASURION')) {
        return ASURION;
    } else {
        return NORMAL;
    }
}
function findSatuses(text) {
    var status = "Not Available";
    findAll('.editor-add-in option').forEach(function (el) {
        if (el.innerText.includes(text)) {
            status = el.innerText;
        }
    });
    return status;
}
function getSwitchText(status) {
    var check = checkSamsungOrGoogle();
    var gspn = true;
    if (check == SAMSUNG) {
        if (findByText('button', 'GSPN')) {
            gspn = false;
        }
    }
    if (status == "Awaiting Diag") {
        return findSatuses("Diag in Progress");
    } else if (status == "Awaiting Repair") {
        if (check == SAMSUNG && !gspn) {
            return "Auto Create GSPN";
        }
        return "Repair in Progress";
    } else if (status == "Diag in Progress") {
        return "Repair in Progress";
    } else if (status == "Repair in Progress") {
        if ("Not Available" != findSatuses("Repaired - RFP")) {
            return "Repaired - RFP";
        } else {
            return "Quality Inspection";
        }
    } else if (status == "Quality Inspection" && check != SAMSUNG && check != GOOGLE) {
        return "Repaired - RFP";
    } else {
        return "Not Available";
    }
}
function autoUpdate() {
    var current_status = find('#wrap > div > div.portal-pos.with-sidebar > div > div > workorder-tab-list > div > ul > li.active > a > tab-heading > div > div:nth-child(4) > span').textContent;
    var note_button = '#paneled-side-bar > div > div.bar-buttons > button.btn.blue.fastclickable';
    var gspn_div = 'body > div.modal.fade.fastclickable.portal-base.repair-ticket-create.in > div > div > div.modal-body';
    if (find('#auto_note_button').textContent.includes('GSPN')) {
        findByText('button', 'GSPN').click();
        console.log('Clicked GSPN');
        var create_repair_ticket = setInterval(function () {
            if (findByText('.modal-dialog button', 'Create Repair Ticket')) {
                findByText('.modal-dialog button', 'Create Repair Ticket').click();
                clearInterval(create_repair_ticket);
            }
        }, 250);
        var close_ticket_window = setInterval(function () {
            if (findByText('.modal-dialog button', 'Close')) {
                findByText('.modal-dialog button', 'Close').click();
                clearInterval(close_ticket_window);
            }
        }, 250);
        var note_button_interval = setInterval(function () {
            if (checkExist(note_button) && !checkExist(gspn_div)) {
                find(note_button).click();
                clearInterval(note_button_interval);
                sleep(1500).then(() => {
                    setButtonText();
                    find('#auto_note_button').click();
                });
            }
        }, 250);
    } else {
        find(note_button).click();
    }
    sleep(250).then(() => {
        if (!checkExist(gspn_div) && !checkExist('#paneled-side-bar.closed')) {
            var text = getSwitchText(current_status);
            var els = findAll('div.extra-actions > select > option');
            for (var i = 0; i < els.length; i++) {
                if (els[i].innerText == text) {
                    find('select.editor-add-in').value = i;
                    break;
                }
            }
            find('select.editor-add-in').click();
            runAngularTrigger('div.extra-actions > select', 'change');
            if (find("#private").checked) {
                find("#private").click();
            }
            sleep(250).then(() => {
                findByText('button', 'Create Note').click();
            });
            sleep(350).then(() => {
                find(note_button).click();
            });
        }
    });
}
function checkButtonClick(title, selector='button') {
    var button = findByText(selector, title);
    if (button) {
        if (!button.disabled) {
            button.click();
            return true;
        }
    }
    return false;
}
function switchButton(id, button_class, icon_type, text) {
    if (checkExist('div.pay-type')) {
        addClass(find('button.' + button_class, find('div.pay-type')), 'ng-hide');
        find('button.' + button_class, find('div.pay-type')).id = 'org-' + id;
        createTag(find('div.pay-type'), 'button', id, 'btn ' + button_class + ' pay-type-btn fastclickable');
        createTag(find('#' + id), 'span', '', 'pay-type-content', text);
        createTag(find('#' + id + ' span'), 'i', '',  'fa ' + icon_type + ' fa-fw');
        find('#' + id).addEventListener('click', function(element) {
            openCheckOutPopup(id);
        });
    }
}
var popup_list = [
    'The Device was Returned to the Customer',
    'The Device is Still at the Store'
];
function createCheckOutButton(main_div, index) {
    console.log('index:', index);
    var butt = createTag(main_div, 'button', index.toString(), 'btn btn-confirm btn-fastclickable', popup_list[index]);
    butt.style.width = '100%';
    butt.style.padding = '10px';
    butt.style.margin = '10px';
    butt.addEventListener('click', function(element) {
        setText('none', popup_list[element.target.id] + '.');
        AutofillWaiter.addTable(function(table_number) {
            AutofillWaiter.checkButtonClick(table_number, 'Create Note');
        });
        AutofillWaiter.addTable(function(table_number) {
            if (checkExist('div.toast-message')) {
                sleep(250).then(() => {
                    AutofillWaiter.clearTable(table_number)
                })
            }
        });
        AutofillWaiter.addTable(function(table_number) {
            AutofillWaiter.checkButtonClick(table_number, 'Check Out', 'span.hover-text');
        });
        AutofillWaiter.addTable(function(table_number) {
            if (checkExist('#id-credit')) {
                // find('#org-checkout').click();
                console.log('Click: Credit Card');
                AutofillWaiter.clearTable(table_number);
                checkButtonClick('Close');
            } else if (checkExist('#id-trade-credit')) {
                // find('#org-trade-credit').click();
                console.log('Click: Trade Credit');
                AutofillWaiter.clearTable(table_number);
                checkButtonClick('Close');
            } else if (checkExist('#id-cash')) {
                // find('#org-cash').click();
                console.log('Click: Cash');
                AutofillWaiter.clearTable(table_number);
                checkButtonClick('Close');
            } else if (checkExist('#id-gift-card')) {
                // find('#org-gift-card').click();
                console.log('Click: Gift Card');
                AutofillWaiter.clearTable(table_number);
                checkButtonClick('Close');
            }
        });
    });
}
function openCheckOutPopup(id_of_fake) {
    var main_div = createPopup('Test Check Out');
    createTag(main_div, 'div', 'id-' + id_of_fake);
    for (var i = 0; i < popup_list.length; i++) {
        createCheckOutButton(main_div, i);
    }
}

/*
 * END AUTO FILL SCRIPT FUNCTIONS
 */

function runPixelScanScript() {

}

function runWorkOrderIssueScript() {

}

function runDummyWorkorderScript() {

}

/*
 * RUN ITEM SEARCH SCRIPT FUNCTIONS
 */

function runItemSearchScript() {
    ItemSearchWaiter.addSingle('item-search-run', function() {
        var html_to_add = '<div id="custom_search_div" class="custom-search col-xs-12 col-sm-12" style="margin-bottom:10px;"><div id="search-dropdown-div" class="col-xs-12 col-sm-2"><select id="item-select"><option value="Work Order">Work Order</option><option value="Part Order">Purchase Order</option><option value="Item">Exact Item</option></select></div><div id="search-input-div" class="col-xs-12 col-sm-9"><input type="text" id="item-search" name="item-search" placeholder="Search for Exact Item"></div><div id="search-button-div" class="col-xs-12 col-sm-1"><button id="search-button" type="button" class="btn btn-confirm fastclickable">Search Item</button></div></div>';
        if (checkExist('.portal-table-buttons')) {
            if (!checkURL(inventory_url) && !checkExist('#item-dropdown-div')) {
                ItemSearchWaiter.clearSingle(run_item_search);
            }
            if (checkURL(inventory_url) && !checkExist('#item-dropdown-div')) {
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
        if (!checkURL(inventory_url)) {
            ItemSearchWaiter.clearSingle('item-search-button');
        } else if (checkExist('#item-button')) {
            find('#item-button').disabled = !searchCheck();
        }
    });
}

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
            console.log('Printing');
            remove('#item-search-check');
            runAngularTrigger('#wrap > div > div.portal-header.row > div.col-xs-12.col-md-4.portal-actions > div > div > ul > li:nth-child(4) > a', 'click');
            localStorage.setItem('item-search', 'done');
            ItemSearchWaiter.clearTable(table_number);
        }
    }, 1000);
}

/*
 * END OF ITEM SEARCH SCRIPT FUNCTIONS
 */

function runMultiBuybackScript() {

}

/**
 * getData
 * Function gets data from the local storage for the site with a given name and
 * returns the raw data that is stored there.
 * @param key - String
 */
function getData(key) {
    console.log("KEY:", key, "VALUE:", window.localStorage.getItem([key]));
    if (key in localStorage) {
        return localStorage[key];
    }
    return null;
}

/**
 * setData
 * Function sets data into the local storage for the site with a given name and
 * sets the raw data with the key.
 * @param key - String
 * @param value - Raw data to be stored
 */
function setData(key, value) {
    console.log("KEY:", key, "VALUE:", value);
    localStorage.setItem([key], value);
}

/**
 * find
 * function to find an element by Css selector, if element is given
 * then will search within that element for element with the css selector.
 *
 * @param css - String that's a css selector
 * @param element - Element object from document
 * @return Element Object
 */
function find(css, element=false) {
    if (element !== false) {
        return element.querySelector(css);
    } else {
        return document.querySelector(css);
    }
}

function findInFrame(frame, css) {
    return frame.contentWindow.document.querySelector(css);
}

function findAllInFrame(frame, css) {
    return frame.contentWindow.document.querySelectorAll(css);
}

/**
 * findAll
 * function to find elements by css selector, if element is given
 * then will search within that element for element with the css selector.
 *
 * @param css - String that's a css selector
 * @param element - Element obect from document
 * @return Element Object Array
 */
function findAll(css, element=false) {
    if (element !== false) {
        return element.querySelectorAll(css);
    } else {
        return document.querySelectorAll(css);
    }
}

/**
 * findByText
 * function to find element by css selector and then finds which element
 * that contains the given text. Will search within an element object if given.
 *
 * @param css - String CSS selector
 * @param text - String text to find in element
 * @param element - Element object to search in
 * @return Element Object
 */
function findByText(css, text, element=false) {
    var els = findAll(css, element);
    for (var i = 0; i < els.length; i++) {
        if (els[i].innerText != "" && els[i].innerText.includes(text)) {
            return els[i];
        }
    }
}

/**
 * findAllByText
 * function to find elements by  css selector and then finds which elemnts
 * that contains the given text. Will search within an element if given.
 *
 * @param css - String CSS selector
 * @param text - String text to find in element
 * @param element - Element object to search in
 * @return Element Object Array
 */
function findAllByText(css, text, element=false) {
    var els = findAll(css, element);
    var list = [];
    for (var i = 0; i < els.length; i++) {
        if (els[i].innerText != "" && els[i].innerText.includes(text)) {
            list.push(els[i]);
        }
    }
    return list;
}

/**
 * findSibling
 * function to find the next sibling of element found either using a css selector
 * or css selector that contains text. Will find the next Sibling using css_sib as
 * a css selector. Will search within an element if given.
 *
 * @param css - String CSS Selector
 * @param css_sib - String CSS Selector of Next Sibling
 * @param text - String to find in non-sibling element
 * @param element - Element Object to search in
 * @return Element Object
 */
function findSibling(css, css_sib, text="", element=false) {
    var el;
    if (text !== "") {
        el = findByText(css, text, element);
    } else {
        el = find(css, element);
    }
    var els = findAll(css_sib, el.parentNode);
    if (els.length > 1) {
        for (var i = 0; i < els.length; i++) {
            if (els[i] != el) {
                return els[i];
            }
        }
    } else {
        return els[0];
    }
}

/**
 * findByAttribute
 * Function that finds an element based upon its attribute and the value of
 * that attribute. Can narrow down the search using text within the element, or
 * by finding the next sibling of an element.
 *
 * @param css - String CSS Selector
 * @param attribute - String the title of the attribute
 * @param value - String the text value of the attribute
 * @param css_sib - String CSS Selector of Next Sibling
 * @param text - String to find in non-sibling element
 * @param element - Element Object to search in
 * @return Element Object
 */
function findByAttribute(css, attribute, value, css_sib="", text="", element=false) {
    var els = [];
    if (css_sib !== "") {
        els.push(findSibling(css, css_sib, text, element));
    } else if (text !== "") {
        els = findAllByText(css, text, element);
    } else {
        els = findAll(css, element);
    }
    for (var i = 0; i < els.length; i++) {
        if (els[i].getAttribute(attribute) == value) {
            return els[i];
        }
    }
    return false;
}

/**
 * remove
 * function that finds element and then removes the element from the DOM.
 *
 * @param css
 * @param text
 * @param css_sib
 * @param element
 */
function remove(css, text="", css_sib="", element=false) {
    var el;
    if (typeof(css) == "string") {
        if (css_sib !== "") {
            el = findSibling(css, css_sib, text, element);
        } else if (text !== "") {
            el = findByText(css, text, element);
        } else {
            el = find(css, element);
        }
    } else {
        el = css;
    }
    el.parentNode.removeChild(el);
}

function removeAll(css, text="", element=false) {
    var el;
    if (typeof(css) == "string") {if (text !== "") {
            el = findAllByText(css, text, element);
        } else {
            el = findAll(css, element);
        }
    } else {
        el = css;
    }
    if (el.length > 1) {
        el.forEach(function(item) {
            item.parentNode.removeChild(item);
        })
    } else {
        el.parentNode.removeChild(el);
    }
}

/**
 * check - checks to see if an dom object exists while using
 * a css selector to find it.
 *
 * @param css - String
 * @param element - Element Object from document
 * @return boolean
 */
function checkExist(css, element=false) {
    if (findAll(css, element).length > 0) {
        return true;
    } else {
        return false;
    }
}

function checkExistInFrame(frame, css) {
    if (findAllInFrame(frame, css).length > 0) {
        return true;
    } else {
        return false;
    }
}

function findPreviousTag(tag, element) {
    if (element.parentNode.tagName == tag.toUpperCase()) {
        return element.parentNode;
    }
    return findPreviousTag(tag, element.parentNode);
}

/**
 * checkURL
 * function that checks to see if the given url is in the page url.
 *
 * @param url - String
 * @return Boolean
 */
function checkURL(url) {
    return document.location.href.includes(url);
}

/**
 * eventFire
 * function that will fire a given event on element. If css parameter given
 * is an element object it will not search for the element and fire on that
 * given object. If css parameter is css selector text it will then search
 * for the element. If text is given it will search for an element with the
 * the css selector that contains that text. If css_sib is given it will search
 * for a sibling of the original css selector that matches that css within the
 * parent node. If element is given it will do any of the searches within that
 * given element. The etype parameter can be a type such as click and will add
 * on to make 'onClick'. Otherwise will just fire a even to trigger events
 * assosiated with the element.
 *
 * @param css - Element Object or String CSS Selector
 * @param etype  - String of Event Type to fire
 * @param text - String of text to search for
 * @param css_sib - String CSS Selector to find in parent of css
 * @param element - Element Object to search within
 */
function eventFire(css, etype, text="", css_sib="", element=false) {
    var el;
    if (typeof(css) == "string") {
        if (css_sib !== "") {
            el = findSibling(css, css_sib, text, element);
        } else if (text !== "") {
            el = findByText(css, text, element);
        } else {
            el = find(css, element);
        }
    } else {
        el = css;
    }
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        var ev_obj = document.createEvent('Events');
        ev_obj.initEvent(etype, true, false);
        el.dispatchEvent(ev_obj);
    }
}

/**
 * setField
 * function that will  update a field by either giving it text of by checking the box.
 * The etype is a string param that should either be 'input' for a text field or 'click'
 * for a check box. The text param is for if the element is a text field or check box, if
 * it's a check box it must be updated with true or false for the click state and text will
 * will be a string for the text wanting to be put in the textfield. If css param is a css
 * selector then it will search for the element using that selector. If text_search element
 * is a string it will try to find an element with that text in it. If css_sib is a css
 * selector it will search for a sibling of css that can be selected with css_sib. If
 * element is given an Element Object it will search within that Element to find the
 * element wanted.
 *
 * @param css - Element Object or String CSS Selector
 * @param etype - Either 'input' or 'click'
 * @param text - Either String or Boolean
 * @param text_search - String to search for
 * @param css_sib - String CSS Selector to find
 * @param element - Element Object to search in
 */
function setField(css, etype, text, text_search="", css_sib="", element=false) {
    var el;
    if (typeof(css) == "string") {
        if (css_sib !== "") {
            el = findSibling(css, css_sib, text_search, element);
        } else if (text_search !== "") {
            el = findByText(css, text_search, element);
        } else {
            el = find(css, element);
        }
    } else {
        el = css;
    }
    if (etype == "input") {
        el.value = text;
    } else if (etype == "click") {
        el.checked = text;
    }
    eventFire(el, etype);
}

/**
 * addHTML
 * function that adds text to the html at the given doc html location.
 *
 * @param css - String css selector
 * @param add_text - Text to add as innerHTML
 * @param search_text - Text to search for to find element
 * @param element - Searches in given element
 */
function addHTML(css, add_text, search_text="", element=false) {
    var input = find(css, element);
    if (search_text != "") {
        input = findByText(css, search_text, element);
    }
    input.innerHTML += add_text;
}

/**
 * createTagBefore
 * function that creates an element on the page at a given location and
 * appends that element then returns the created the element.
 *
 * @param loc - element to prepend to.
 * @param node - index of child nodes
 * @param tag - the tag of the element
 * @param id - id of new element
 * @param el_class - class of new element
 * @param text - the inner text of the new element
 */
function createTagBefore(loc, node, tag, id='', el_class='', text='', style='') {
    var element = document.createElement(tag);
    if (id != '') {
        element.setAttribute('id', id);
    }
    if (el_class != '') {
        element.setAttribute('class', el_class);
    }
    if (text != '') {
        element.innerText = text;
    }
    if (style != '') {
        element.setAttribute('style', style);
    }
    loc.insertBefore(element, loc.childNodes[node]);
    return element;
}

/**
 * createTagAppend
 * function that creates an element on the page at a given location and
 * appends that element then returns the created the element.
 *
 * @param loc - element to prepend to.
 * @param tag - the tag of the element
 * @param id - id of new element
 * @param el_class - class of new element
 * @param text - the inner text of the new element
 */
function createTagAppend(loc, tag, id='', el_class='', text='', style='') {
    var element = document.createElement(tag);
    if (id != '') {
        element.setAttribute('id', id);
    }
    if (el_class != '') {
        element.setAttribute('class', el_class);
    }
    if (text != '') {
        element.innerText = text;
    }
    if (style != '') {
        element.setAttribute('style', style);
    }
    loc.append(element);
    return element;
}

/**
 * createTag
 * function that creates an element on the page at a given location and
 * returns the created element.
 *
 * @param loc - element to prepend to.
 * @param tag - the tag of the element
 * @param id - id of new element
 * @param el_class - class of new element
 * @param text - the inner text of the new element
 */
function createTag(loc, tag, id='', el_class='', text='', style='') {
    var element = document.createElement(tag);
    if (id != '') {
        element.setAttribute('id', id);
    }
    if (el_class != '') {
        element.setAttribute('class', el_class);
    }
    if (text != '') {
        element.innerText = text;
    }
    if (style != '') {
        element.setAttribute('style', style);
    }
    loc.prepend(element);
    return element;
}

function createInput(loc, type, name='', value='', id='', el_class='', style='') {
    var element = createTag(loc, 'input', id, el_class, '', style);
    element.setAttribute('type', type);
    if (name != '') {
        element.setAttribute('name', name);
    }
    if (value != '') {
        element.setAttribute('value', value);
    }
    return element;
}

function createInputAppend(loc, type, name='', value='', id='', el_class='', style='') {
    var element = createTagAppend(loc, 'input', id, el_class, '', style);
    element.setAttribute('type', type);
    if (name != '') {
        element.setAttribute('name', name);
    }
    if (value != '') {
        element.setAttribute('value', value);
    }
    return element;
}

function createInputBefore(loc, node, type, name='', value='', id='', el_class='', style='') {
    var element = createTagBefore(loc, node, 'input', id, el_class, '', style);
    element.setAttribute('type', type);
    if (name != '') {
        element.setAttribute('name', name);
    }
    if (value != '') {
        element.setAttribute('value', value);
    }
    return element;
}

function addClass(loc, class_name) {
    if (!loc.className.includes(class_name)) {
        loc.className += ' ' + class_name;
    }
}

function replaceClass(loc, original_class_name, new_class_name) {
    if (loc.className.includes(original_class_name)) {
        var old_class = loc.className;
        loc.className = old_class.replaceAll(original_class_name, new_class_name);
    }
}

function removeClass(loc, class_name) {
    replaceClass(loc, class_name, '');
}

function itemInArray(item, array) {
    for (var i = 0; i < array.length; i++) {
        if (item == array[i]) {
            return true;
        }
    }
    return false;
}
/**
 * createDropdown
 * function that creates a select dropdown list given a location and list of
 * strings for the title of the options. The value and title will be the same
 * value. ID and el_class are for the class of the select element.
 *
 * @param loc - Element to prepend to.
 * @param items - the array of strings used for the list
 * @param id - id of the select element
 * @param el_class - the class of the select element
 */
function createDropdown(loc, items, id='', el_class='') {
    var text = '';
    items.forEach(function(item) {
        text += '<option value="' + item + '">' + item + '</option>';
    });
    var dropdown = createTag(loc, 'select', id, el_class);
    dropdown.innerHTML = text;
}

/**
 * runAngularTrigger
 * function that gets around scope issues with chrome extensions.
 * adds the script that needs to be run to trigger an angular trigger on the page.
 * then removes the code.
 *
 * @param css - css selector inside the angular.element call
 * @param trigger - the name of the trigger in .triggerHandler
 */
function runAngularTrigger(css, trigger) {
    var code = "angular.element('" + css + "').triggerHandler('" + trigger + "');";
    createTag(find('body'), 'script', 'angular', '', code).nodeType='text/javascript';
    remove('#angular');
}

// Returns the variable where you can add stuff
// bottom id popup-bottom
function createPopup(title, size="md") {
    var table = createTagAppend(find('body'), 'div', 'popup-add');
    var html = '<style>#back_button, #skip_button, #submit_button, #update_button, .desc_button { color: #fff !important; background-color: #DA291C !important;} .desc_button:hover { color: #fff !important; background-color: #B71C1C !important};#update_title { color: #b71c1c;}</style>';
    var body = '<div id="backdrop" class="modal-backdrop fade in" modal-animation-class="fade" modal-in-class="in" ng-style="{\'z-index\': 1040 + (index &amp;&amp; 1 || 0) + index*10}" modal-backdrop="modal-backdrop" modal-animation="true" style="z-index: 1040;"></div><div id="popup-table" modal-render="true" tabindex="-1" role="dialog" class="modal fade fastclickable in" modal-animation-class="fade" modal-in-class="in" ng-style="{\'z-index\': 1050 + index*10, display: \'block\'}" ng-click="close($event)" modal-window="modal-window" size="' + size + '" index="0" animate="animate" modal-animation="true" style="z-index: 1050; display: block;"><div class="modal-dialog modal-' + size + '" ng-class="size ? \'modal-\' + size : \'\'"><div class="modal-content" modal-transclude=""><div style="min-height: 100px" class="portal-base"><div class="modal-header"><div class="row"><h4 class="modal-title col-md-9"> ' + title + '</h4><button type="button" id="close-popup-table-button" class="btn btn-cancel pull-right fastclickable">Close</button></div></div><div class="modal-body"><div id="popup-table-div" class="portal-panel panel"></div><div id="popup-bottom"></div></div></div></div></div></div>';
    addHTML('#popup-add', html);
    addHTML('#popup-add', body);
    find('#close-popup-table-button').addEventListener('click', function() {
        remove('#popup-add');
    });
    return find('#popup-table-div');
}

function Waiter() {
    this.single_list = [];
    this.waiting_list = [];
    this.table_list = [];
    this.table_time = [];
    this.addSingle = function(name, orderCheck, check_time=500) {
        this.single_list[name] = setInterval(orderCheck, check_time);
    }
    this.clearSingle = function(name) {
        if (this.single_list[name] != null) {
            clearInterval(this.single_list[name]);
        }
    }
    this.clearAllSingles = function() {
        console.log('-----Clear All Singles-----');
        console.log('Amount of Singles:', this.single_list.length);
        for (var name in this.single_list) {
            clearInterval(this.single_list[name]);
        }
        this.single_list = [];
    }
    this.addTable = function(orderCheck, check_time=1000, clearCondition=false, timer_total=20000) {
        var table_number = this.waiting_list.length;
        this.table_list.push(false);
        this.table_time.push(0);
        this.waiting_list.push(setInterval(this.checkTable, check_time, table_number, orderCheck, clearCondition, check_time, timer_total, this));
        return this.waiting_list.length - 1; // Returns current index
    }
    this.checkTable = function(table_number, orderCheck, clearCondition, check_time, timer_total, myWaiter) {
        if (myWaiter.table_time[table_number] <= timer_total) {
            myWaiter.table_time[table_number] += check_time;
            if (clearCondition == false) {
                if (table_number > 0) {
                    if (myWaiter.table_list[table_number - 1]) {
                        orderCheck(table_number);
                    }
                } else {
                    orderCheck(table_number);
                }
            } else if (clearCondition.typeof == 'function') {
                if (!clearCondition()) {
                    if (table_number > 0) {
                        if (myWaiter.table_list[table_number - 1]) {
                            orderCheck(table_number);
                        }
                    } else {
                        orderCheck(table_number);
                    }
                } else {
                    myWaiter.clearAllTables();
                }
            }
        } else {
            myWaiter.clearTable(table_number);
        }
    }
    this.clearTable = function(table_number) {
        if (table_number < this.table_list.length &&
            table_number < this.waiting_list.length) {
            this.table_list[table_number] = true;
            this.table_time[table_number] = 0;
            clearInterval(this.waiting_list[table_number]);
        }
    }
    this.clearTablesBefore = function(table_number) {
        for (var i = 0; i <= table_number; i++) {
            this.clearTable(i);
        }
    }
    this.tableClearBefore = function(table_number) {
        for (var i = 0; i <= table_number; i++) {
            if (!this.table_list[i]) {
                return false;
            }
        }
        return true;
    }
    this.clearAllTables = function() {
        console.log('-----Clear All Tables-----');
        console.log('Amount of Tables:', this.amountOfTables());
        for (var i = 0; i < this.waiting_list.length; i++) {
            clearInterval(this.waiting_list[i]);
        }
        this.waiting_list = [];
        this.table_list = [];
        this.table_time = [];
    }
    this.amountOfTables = function() {
        return this.waiting_list.length;
    }
    this.isEmpty = function() {
        if (this.amountOfTables() > 0) {
            return false;
        }
        return true;
    }
        // Checks to see if button can be clicked then clicks it
    this.checkButtonClick = function(table_number, title, selector='button', element=false) {
        var button = findByText(selector, title, element);
        if (button) {
            if (!button.disabled) {
                button.click();
                sleep(250).then(() => {
                    this.clearTable(table_number);
                });
                return true;
            }
        }
        return false;
    }
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
