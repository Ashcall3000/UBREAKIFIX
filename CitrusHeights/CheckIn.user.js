// ==UserScript==
// @name         Check In
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Helps with the check in process 
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/Search.js
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/Waiter.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/CheckIn.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/CitrusHeights/CheckIn.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==
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

var check_in_run = setInterval(function() {
    if (checkExist('#check-in-button')) {
        clearInterval(check_in_run);
    }
    if (checkExist(".condition-notes") && !checkExist('#check-in-button')) {
        var check_in_button = createTag(findByText('div.panel-body', 'Physical Appearance'), 'button', 'check-in-button', 'btn btn-open-checkin', 'Open Check In');
        check_in_button.style.width = '100%';
        check_in_button.style.padding = '10px';
        check_in_button.style.fontSize = '14px';
        find('#check-in-button').addEventListener('click', createCheckIn);
        find('#check-in-button').click();
    }
}, 500);

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
