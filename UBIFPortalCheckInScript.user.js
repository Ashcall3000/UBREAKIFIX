// ==UserScript==
// @name         UBIF Portal Check-In Script
// @namespace    http://tampermonkey.net/
// @version      1.6.0.0
// @description  Prompts user for information to format into the condition notes.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/Searcher.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalCheckInScript.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPortalCheckInScript.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

var window_box = 0;
var pc = "";
var acc = "";
var pcm = "";
var cond = "";
var desc = "";
var notes = ["", "", "", "", ""];
var passfield = false;
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

console.log("check in script is running");

// Variables for array in input tag name.
var test = true; // Program hasn't run yet.
var google_test = true; // If button wasn't added for google devices then true
var passfield = false;
if (findByText('a', 'Google') == null) {
    passfield = findSibling('label', 'input', 'Passcode:');
}
var saved_pc = "";
if (passfield) {
    saved_pc = ((!passfield) ? "" : passfield.value);
}

// Remove chat box so that program can run.
if (checkExist('chat-box')) {
    remove('chat-box');
}

// Creates the gray backdrop
addHTML('body div', '<div id="backdrop" class="modal-backdrop fade in" modal-animation-class="fade" modal-in-class="in" ng-style="{\'z-index\': 1040 + ' +
        '(index &amp;&amp; 1 || 0) + index*10}" modal-backdrop="modal-backdrop" modal-animation="true" style="z-index: 1051;"></div>');
console.log("LINE: 44");
// Create the body
createBox('PASSCODE', 'Passcode:', 'What is the passcode or password for the device?');
changeWindow(0);

find('tbody').addEventListener('click', keypad);
find('#clear_button').addEventListener('click', function() {
    var el = find('#update_info');
    el.value = el.value.substring(el.value.indexOf(']') + 1);
    if (el.value.charAt(0) == ' ' || el.value.charAt(0) == '\n') {
        el.value = el.value.substring(1);
    }
    var list = findAll('tbody input');
    for (var i = 0; i < list.length; i++) {
        list[i].checked = false;
    }
});
if (!passfield) {
    changeWindow(window_box + 1);
}
find('#update_info').value = saved_pc;

function keypad(event) {
    if (event.target.id.includes('checkbox')) {
        var element = find('#update_info');
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

function updateNotes() {
    var el_cond = find(".condition-notes");
    var el_accs = findAll(".checklist-item");
    var org_text = el_cond.value;
    var acc_up = acc.toUpperCase();
    var text = "";
    for (var i = 0; i < shorts.length; i++) {
        text += shorts[i] + ((notes[i] == null || notes[i] == '') ? 'NA' : notes[i]) + '\n| ';
    }
    text += ((org_text == null || org_text == '') ? '' : ('\n| ' + org_text));
    setField(".condition-notes", "input", text);
    if (passfield) {
        var pass_loc = findSibling('label', 'input', 'Passcode:');
        setField(pass_loc, "input", notes[0])
    }
    var words = getWords(notes[1]);
    for (var i = 0; i < words.length; i++) {
        if (findByText('label', words[i])) {
            var el = findSibling('label', 'input', words[i]);
            if (el) {
                setField(el, "click", true);
            }
        }
    }

    //setField("input", 'input', (pc == null || pc == "") ? "NA" : pc, 'Passcode:', 'label');
}

function getWords(text) {
    var temp = "";
    var words = [];
    var capped = false;
    for (var i = 0; i < text.length; i++) {
        var c = text.charAt(i);
        if (c != ' ' && isNaN(c)) {
            console.log(c);
            if (!capped) {
                temp = c.toUpperCase();
                capped = true;
            } else {
                temp += c.toLowerCase();
            }
        } else {
            if (temp.length > 0) {
                words.push(temp);
            }
            temp = "";
            capped = false;
        }
    }
    if (temp.length > 0) {
        words.push(temp);
    }
    return words;
}

function createBox(title, second_title, text) {
    var html = '<style>#back_button, #skip_button, #submit_button, #update_button, .desc_button { color: #fff !important; background-color: #DA291C !important;} .desc_button:hover { color: #fff !important; background-color: #B71C1C !important};' +
        '#update_title { color: #b71c1c;}</style><div id="update_box" modal-render="true" tabindex="1" role="dialog" class="modal fade fastclickable portal-base kbase-training-modal in"' +
    'modal-animation-class="fade" modal-in-class="in" ng-style="{\'z-index\': 1050 + index*10, display: \'block\'}" ng-click="close($event)"' +
    'modal-window="modal-window" window-class="portal-base kbase-training-modal" size="md" index="1" animate="animate" modal-animation="true"' +
    'style="z-index: 1060; display: block;"><div class="modal-dialog modal-md" ng-class="size ? \'modal-\' + size : \'\'">' +
    '<div class="modal-content" modal-transclude=""><div><div class="modal-header"><h3 id="update_title" ' +
    'class="modal-title">Device Check In<button id="update_button" type="button" class="btn btn-default fastclickable show" ng-class="buttonRemindMe">' +
    'Cancel</button></h3></div><div class="modal-body"><div class="row move-down-20" id="update_prompt">' + text + '</div>' +
    '<div class="row"></div><label id="update_label">' + second_title + '</label><textarea id="update_info" wrap="soft"></textarea><button id="skip_button"' +
    ' type="button" class="btn btn-default" style="width:100%">Skip</button><button id="back_button" type="button" class="btn btn-default" style="width:50%">Back</button><button id="submit_button" type="button" class="btn btn-default" style="width:50%">' +
    'Next</button></div><div id="add_loc"></div></div></div></div></div></div>';
    addHTML("body div", html);
    find('#update_button').addEventListener('click', function() {
        cancelBox(titles.length);
    });
    find('#update_info').addEventListener('keypress', function() {
        if (event.keyCode == 13) {
            if (event.shiftKey && window_box != 0) {
                changeWindow(window_box - 1);
            } else {
                changeWindow(window_box + 1);
            }
        }
    });
    find('#submit_button').addEventListener('click', function() {
        changeWindow(window_box + 1);
    });
    find('#skip_button').addEventListener('click', function() {
        find('#update_info').value = '';
        changeWindow(window_box + 1);
    });
    find('#back_button').addEventListener('click', function() {
        changeWindow(window_box - 1);
    })
}

function deleteBox(css) {
    var element = find(css);
    var child = element.lastElementChild;
    while (child) {
        element.removeChild(child);
        child = element.lastElementChild;
    }
    element.parentNode.removeChild(element);
}

var DButTable = {
    buttons : [],
    printed : false,
    makeButtons : function() {
        this.buttons = [];
        this.buttons.push(new DButton('0_desc', 'Water Damage', ' Due to the unpredictable nature of water damage, we are not responsible for any loss of functionalities.'));
        this.buttons.push(new DButton('1_desc', 'Unable to Test', ' We were unable to fully test the device so we cannot be responsible for any loss of functionalities.'));
        this.buttons.push(new DButton('2_desc', 'Frame Bend', ' With any bend in the frame there is a chance the motherboard has been damaged. If that is the case there might be loss of some functionalities to the device.'));
        this.buttons.push(new DButton('3_desc', 'Data Retrieval', ' Because we were not able to verify the data that needs to be recovered. We will consider it a successful data salvage as long as a large chunk or a lot of the data was recovered.'));
        this.buttons.push(new DButton('4_desc', 'Extreme Damage', ' With extreme amounts of damage to the device it is hard to verify if there was any damage to the motherboard. If this is the case there might be loss of some functionalities to the device.'));
        this.buttons.push(new DButton('5_desc', 'Screen Protector', ' We may have to remove the screen protector during the repair process. We apologize for any convience this may cause, but we will try out best to work around the accessories attached to your device.'));
        this.buttons.push(new DButton('6_desc', 'Asurion Repair', 'Asurion Repair.'));
    },
    makeContactButtons : function() {
        this.buttons = [];
        this.buttons.push(new DButton('0_desc', 'Call', ' Call the Customer.'));
        this.buttons.push(new DButton('1_desc', 'Text', ' Text the Customer.'));
        this.buttons.push(new DButton('2_desc', 'Email', ' Email the customer.'));
        this.buttons.push(new DButton('3_desc', 'Will Return', ' Customer will return for the device.'));
    },
    makeAccButtons : function() {
        this.buttons = [];
        this.buttons.push(new DButton('0_desc', 'Sim Card', 'Sim Card. '));
      	this.buttons.push(new DButton('1_desc', 'SD Card', 'SD Card. '));
        this.buttons.push(new DButton('2_desc', 'Case', 'Case. '));
        this.buttons.push(new DButton('3_desc', 'Charge Cord', 'Charging Cord. '));
        this.buttons.push(new DButton('4_desc', 'S-Pen', 'S-Pen. '));
        this.buttons.push(new DButton('5_desc', 'Missing S-Pen', 'The S-Pen is missing. '));
    },
  	makeCondButtons : function() {
      	this.buttons = [];
      	this.buttons.push(new DButton('0_desc', 'Slight Scuffing', ' Device has slight scuffing on the housing.'));
      	this.buttons.push(new DButton('1_desc', 'Average Scuffing', ' Device has some heavier scuffs here and there on the housing.'));
      	this.buttons.push(new DButton('2_desc', 'Heavy Scuffing', ' Device has deep scratches and heavy scuffing on the housing.'));
      	this.buttons.push(new DButton('3_desc', 'Screen Broken', ' Device screen is broken.'));
      	this.buttons.push(new DButton('4_desc', 'LCD Broken', ' The LCD is broken.'));
      	this.buttons.push(new DButton('5_desc', 'LCD Good', ' The LCD is good.'));
        this.buttons.push(new DButton('6_desc', 'Frame Bend', ' There is a bend in the frame of the device.'));
    },
    printButtons : function() {
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
            text += '<button id="';
            text += this.buttons[i].id;
            text += '" type="button" class="btn btn-default desc_button" style="width:';
            text += width;
            text += '%">' + this.buttons[i].title;
            text += '</button>';
        }
        addHTML('#add_loc', text);
        if (!this.printed) {
            find('#add_loc').addEventListener('click', function(e) {
                console.log(e.target.id);
                var id = (e.target.id.includes('desc')) ? e.target.id.charAt(0) : '';
                if (!document.querySelector('#update_info').value.includes(DButTable.buttons[id]) && id != '') {
                    document.querySelector('#update_info').value += DButTable.buttons[id].text;
                }
            });
            this.printed = true;
        }
    }
};

function DButton(id, title, text) {
    this.title = title;
    this.text = text;
    this.id = id;
}

function changeWindow(number) {
    if (!passfield && number == 0) {
        number = 1;
    }
    if (number == 0) {
        find('#back_button').disabled = true;
        find('#add_loc').innerHTML = '';
        addHTML('#add_loc', '<style>input {position: absolute;opacity: 0;cursor: pointer;height: 13px;width: 13px;z-index: 10;-ms-transform: scale(2.5);' +
                ' /* IE */-moz-transform: scale(2.5); /* FF */-webkit-transform: scale(2.5); /* Safari and Chrome */-o-transform: scale(2.5); /* Opera */' +
                'transform: scale(2.5);padding: 0px;left:30px;top:8px;}#keypad {padding-left: 220px;}.checkbox {width: 35px;height: 35px;background: ' +
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
            var el = find('#update_info');
            el.value = el.value.substring(el.value.indexOf(']') + 1);
            if (el.value.charAt(0) == ' ' || el.value.charAt(0) == '\n') {
                el.value = el.value.substring(1);
            }
            var list = findAll('tbody input');
            for (var i = 0; i < list.length; i++) {
                list[i].checked = false;
            }
        });
    }
    if (number == 0 && this.window_box == 0) {
        find('#update_label').innerText = this.titles[0];
        find('#update_prompt').innerText = this.prompts[0];
    } else if (number >= 0 && number < this.titles.length) {
        if (window_box == (this.titles.length - 1) && number < window_box) {
            find('#device-condition div.row').appendChild(find('three-state-button-list'));
            find('#add_loc').style.height = '';
            find('#skip_button').style.height = '';
            find('#skip_button').style.visibility = "visible";
            find('#update_info').style.height = '';
            find('#update_info').style.visibility = "visible";
        }
        var info_el = find('#update_info');
        info_el.style.height = "75px";
        notes[window_box] = removeal(info_el.value);
        info_el.value = notes[number];
        window_box = number;
        find('#update_label').innerText = this.titles[number];
        find('#update_prompt').innerText = this.prompts[number];
        if (number != 0) {
            find('#add_loc').innerHTML = '';
        }
        if (number != (this.titles.length - 1)) {
            if (number != 0) {
                find('#back_button').disabled = false;
            }
            find('#submit_button').innerText = 'Next';
            if (number == 1) {
                DButTable.makeAccButtons();
                DButTable.printButtons();
            } else if (number == 2) {
                DButTable.makeContactButtons();
                DButTable.printButtons();
            } else if (number == 3) {
                DButTable.makeCondButtons();
                DButTable.printButtons();
            } else if (number == 4) {
                DButTable.makeButtons();
                DButTable.printButtons();
            }
        } else {
            if (checkExist('three-state-button-list')) {
                var t = find('three-state-button-list');
                find('#add_loc').appendChild(find('three-state-button-list'));
                find('#add_loc').style.height = '320px';
                find('#skip_button').style.height = '0px';
                find('#skip_button').style.visibility = "hidden";
                find('#submit_button').style.width = '50%';
                find('#submit_button').innerText = 'Submit';
                find('#back_button').style.width = '50%';
                find('#update_info').style.height = '0px';
                find('#update_info').style.visibility = "hidden";
            }
        }
    } else {
        cancelBox(window_box);
        updateNotes();
    }
}

function cancelBox(length) {
    if (checkExist('three-state-button-list')) {
        find('#device-condition div.row').appendChild(find('three-state-button-list'));
    }
    deleteBox('#backdrop');
    deleteBox('#update_box');
    DButTable.printed = false;
}

function removeal(text) {
    var temp = "";
    for (var i = 0; i < text.length; i++) {
        var c = text.charAt(i);
        if (c != '\n') {
            temp += c;
        }
    }
    return temp;
}

function phoneNumberConvert(text) {
    var temp = "";
    var start = 0;
    var end = 0;
    var check = false;
    for (var j = 0; j < text.length; j++) {
        var d = text.charAt(j);
        if (d != ' ' && d != '/' && d != '-' && d != '.') {
            if (!isNaN(d)) {
                temp += d;
                if (!check) {
                    check = true;
                    start = j;
                }
            } else if (temp.length < 7) {
                temp = "";
                start = 0;
                check = false;
            } else if (temp.length >= 7) {
                end = j;
                break;
            }
        }
    }
    if (temp.length >= 7) {
        var phone = temp.substring(0,3) + '-';
        if (temp.length > 7) {
            phone += temp.substring(3,6) + '-' + temp.substring(6,10);
        } else {
            phone += temp.substring(3,7);
        }
        temp = text.substring(0, start);
        temp += (text.charAt(start - 1) != ' ') ? ' ' : '';
        temp += phone;
        temp += (text.charAt(end + 1) != ' ') ? ' ' : '';
        temp += text.substring((end == 0) ? text.length : end);
        return temp;
    } else {
        return text;
    }
}

