// ==UserScript==
// @name         UBIF Purchase Order Gadget Script
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  Helps the user create a gadgetfix po in the ubreakifix system.
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @include      https://gadgetfix.com/customer/order/detail/*
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPurchaseOrderGadget.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFPurchaseOrderGadget.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var gadget_table_number = "gadget_convert_table_2";
    var gadget_frame_created = false; // Whether iframe for gadgetfix has been added to the page or not.
    var gadget_vendor_selected = false; // Whether the vendor drop down menu is selected for gadgetfix or not.
    var gadget_convert_table = localStorage.getItem(gadget_table_number); // Whether the table to convert gadgetfix item numbers to UBIF part numbers
    var ubif_copy_created = false // Whether the button was created to copy info in portal
    if (window === window.parent) { // Runs if script isn't running in an iFrame
        if (gadget_convert_table == null || !gadget_convert_table) {
            console.log("Gadget Table: " + gadget_convert_table);
            localStorage.setItem(gadget_table_number, true);
            gadgetCreate();
        }
        if (document.location.href.includes("https://gadgetfix.com/customer/order/detail/")) {
            // Runs only when on the gadgetfix order page
            document.getElementsByClassName("container")[0].innerHTML += "<button id=\"copy\"> COPY </button> "
                + "<style type=\"text/css\">#copy {position: fixed; z-index: 1000; right: 1px; "
                + "top: 100px; background-color: #4CAF50; border: none;color: white; "
                + "font-size: 32px; cursor: pointer; padding: 10px; border-radius: 8px;}"
                + " #copy:hover {background-color: RoyalBlue;} </style>";
            document.getElementById("copy").addEventListener("click", copyClick);
        }
    } else { // Runs when site is in iframe
        //window.parent.postMessage({
        //    'func': 'parentFunc',
        //    'message': 'Message text from iframe.'
        //}, "*");
        window.parent.postMessage({
            'func': 'GadgetList',
            'list': getTableGadget()
        }, "*");
    }
    var run = setInterval(function() {
        if (document.location.href.includes("https://portal.ubif.net/pos/purchasing/edit/")) {
            // Runs to see if the current vendor is Gadgetfix or not.
            var selector = document.querySelector("select.ng-dirty");
            var select_list = document.querySelectorAll("select.ng-dirty option");
            var select_val = "";
            if (selector != null && select_list != null) {
                select_list.forEach(function(el) {
                    if (selector.value == el.value) {
                        select_val = el.innerText;
                    }
                });
            }
            if (selector != null && !gadget_frame_created && select_val == "GadgetFix") {
                gadget_vendor_selected = true;
                gadget_frame_created = createFrame();
                enableCommunication();
                //document.getElementById("copy").style.visibility = "hidden";
                if (!ubif_copy_created) {
                    document.querySelector("#page-container > div:nth-child(4)").innerHTML += "<button id=\"copy\"> COPY </button> "
                        + "<style type=\"text/css\">#copy {position: fixed; z-index: 1000; right: 1px; "
                        + "top: 100px; background-color: #4CAF50; border: none;color: white; "
                        + "font-size: 18px; cursor: pointer; padding: 10px; border-radius: 8px;}"
                        + " #copy:hover {background-color: RoyalBlue;} </style>";
                    document.getElementById("copy").addEventListener("click", copyGadget);
                    ubif_copy_created = true;
                }
            }
            if (document.querySelector("iframe") == null) {
                gadget_frame_created = false;
                ubif_copy_created = false;
            }
        } else if (ubif_copy_created) {
            var elem = document.getElementById("copy");
            elem.parentNode.removeChild(elem);
            ubif_copy_created = false;
        }
    }, 1000); // Runs every 5 seconds
})();

var gadget_list = [];

function enableCommunication() {
    if (window.addEventListener) {
        window.addEventListener("message", onMessage, false);
    } else if (window.attachEvent) {
        window.attachEvent("onmessage", onMessage, false);
    }
}

function onMessage(event) {
    // Check sender origin to be trusted
    console.log("onMessage");
    //if(!event.origin.includes("https://gadgetfix.com/")) return;
    console.log("CONTINUE");
    var data = event.data;
    console.log(data);
    gadget_list = event.data.list;
}

function copyGadget() {
    var button = document.getElementById("copy");
    console.log("CLICKED");
    button.innerHTML = "COPIED";
    button.disabled = true;
    button.style.background = "Gray";
    button.style.opacity = "0.3";
    var rows = document.querySelectorAll("#csv-table tr");
    var temp = [];
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].className == "") {
            temp.push(rows[i]);
        }
    }
    rows = temp;
    for (var i = 0; i < rows.length; i++) {
        var i_num = rows[i].querySelector("td:nth-child(2) > span:nth-child(1)").innerHTML;
        var i_price = rows[i].querySelector("td:nth-child(8) > span:nth-child(1) > input:nth-child(1)");
        if (i_num != 12001) {
            var part = listSearch(i_num);
            i_price.value = part.price;
            buttonClick(i_price);
        }
    }
    temp = [];
    for (var i = 0; i < rows.length; i++) {
        var i_num = rows[i].querySelector("td:nth-child(2) > span:nth-child(1)").innerHTML;
        if (i_num == 12001) {
            temp.push(rows[i]);
        }
    }
    var temp_a = [];
    for (var i = 0; i < gadget_list.length; i++) {
        if (gadget_list[i].item == 12001) {
            temp_a.push(gadget_list[i]);
        }
    }
    if (temp.length == temp_a.length) {
        for (var i = 0; i < temp.length; i++) {
            var i_price = temp.querySelector("td:nth-child(8) > span:nth-child(1) > input:nth-child(1)")
            i_price.value = temp_a[i].price;
            buttonClick(i_price);
        }
    }
    // UBIF TAX .totals-table > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(2) > input:nth-child(1)
    // UBIF SHIP div.move-down-5:nth-child(4) > input:nth-child(2)
    // GADGET SHIP .table-border > tfoot:nth-child(3) > tr:nth-child(2) > th:nth-child(6) > span:nth-child(1)
    // GADGET TAX .table-border > tfoot:nth-child(3) > tr:nth-child(3) > th:nth-child(6) > span:nth-child(1)
    var ship_tax = listSearch("Others");
    var ubif_ship = document.querySelector("div.move-down-5:nth-child(4) > input:nth-child(2)");
    ubif_ship.value = ship_tax.price;
    buttonClick(ubif_ship);
    var ubif_tax = document.querySelector(".totals-table > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(2) > input:nth-child(1)");
    ubif_tax.value = ship_tax.quan;
    buttonClick(ubif_tax);
}

function listSearch(item_part) {
    for (var i = 0; i < gadget_list.length; i++) {
        if (gadget_list[i].item == item_part) {
            return gadget_list[i];
        }
    }
}

function buttonClick(elem) {
    elem.dispatchEvent(new Event("input", {bubbles:true}));
    elem.dispatchEvent(new Event("click", {bubbles:true}));
}

/**
 * Creates an iFrame on ubif purchase portal page with custom URL.
 */
function createFrame() {
    var site_url = prompt("Paste the Gadgetfix URL into the text field", "https://gadgetfix.com/");
    document.querySelector("#pos-left-content > div:nth-child(2)").innerHTML += "<iframe src=\""
    + site_url + "\" id=\"gadget_frame\" style=\"height: 300px; width: 100%; border: none; margin-bottom: 15px;\"></iframe>";
    return true;
}

function save(filename, text) {
    var blob = new Blob([text], {type: 'text/csv'});
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

function copyClick() {
    var button = document.getElementById("copy");
    console.log("CLICKED");
    button.innerHTML = "SAVED";
    button.disabled = true;
    button.style.background = "Gray";
    button.style.opacity = "0.3";
    var list = getTableGadget();
    var table_text = '"","SKU","Item Name","ADR","Store Stock","Proj. Shortage","Proj. Need","Price","To Order","Subtotal","Actions"\n';
    for (var i = 0; i < list.length; i++) {
        table_text += list[i].text + "\n";
    }
    var elem = document.createElement('textarea');
    elem.value = document.location.href;
    document.body.appendChild(elem);
    elem.select();
    document.execCommand('copy');
    document.body.removeChild(elem);
    var filename = "Gadgetfix Order " + getTimeDate() + ".csv";
    save(filename, table_text);
}

function getTableGadget() {
    var els = document.getElementsByTagName("tr");
    var part_list = [];
    for (var i = 9; i < els.length - 7; i++) {
        var item_num = gadgetConvert(els[i].querySelector("p").innerText.substring(6));
        var price_amoun = els[i].querySelector(".i-right").innerText.substring(1);
        var quan_amoun = els[i].querySelector(".i-center").innerText;
        part_list.push(new part(item_num, price_amoun, quan_amoun));
    }
    if (window !== window.parent) {
        part_list.push(new part("Other", document.querySelector(".table-border > tfoot:nth-child(3) > tr:nth-child(2) > th:nth-child(6) > span:nth-child(1)").innerText.substring(1)
                            , document.querySelector(".table-border > tfoot:nth-child(3) > tr:nth-child(3) > th:nth-child(6) > span:nth-child(1)").innerText.substring(1)));
    }
    return part_list;
}

function part(item, price, quan) {
    this.item = item; // Item number from GadgetFix
    this.price = price; // Price of the part
    this.quan = quan; // How many of the part is being ordered.
    this.text = '"","' + item + '","","","","","","' + price + '","' + quan + '","",""';
}

function getTimeDate() {
    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var year = d.getFullYear();
    var hours = d.getHours();
    var mins = d.getMinutes();
    return month + "-" + day + "-" + year + "_" + hours + "-" + mins;
}

function gadgetConvert(item_number) {
    if (localStorage.getItem("gadget_convert_table")) {
        var temp_num = localStorage.getItem(item_number);
        if (temp_num != null) {
            return temp_num;
        } else {
            return "12001";
        }
    }
}

function gadgetCreate() {
    console.log("CREATE");
    localStorage.setItem(351309799887, 8218); //  iPhone 5 Back Camera
    localStorage.setItem(371254701166, 8225); //  iPhone 5 Dock Connector Black
    localStorage.setItem(350778276217, 8226); //  iPhone 5 Dock Connector White
    localStorage.setItem(231475279944, 8217); //  iPhone 5 Prox
    localStorage.setItem(351309802008, 8229); //  iPhone 5 Volume Button Flex
    localStorage.setItem(351309799887, 8218); //  iPhone 5 Back Camera
    localStorage.setItem(371254707871, 8232); //  iPhone 5 Loudspeaker
    localStorage.setItem(351309778975, 8219); //  iPhone 5 Ear Speaker
    localStorage.setItem(230898666694, 26145); //  iPhone 5 Black Screen GV
    localStorage.setItem(230880746952, 26146); //  iPhone 5 White Screen GV
    localStorage.setItem(231475290997, 8327); //  iPhone 5s/5c/SE Vibrator
    localStorage.setItem(351309786526, 8336); //  iPhone 5c Home Flex
    localStorage.setItem(231132525304, 8375); //  iPhone 5c Prox
    localStorage.setItem(350972396686, 8351); //  iPhone 5c Power/Volume/Mute Flex
    localStorage.setItem(351309795391, 8335); //  iPhone 5c Dock Connector Black
    localStorage.setItem(370980268783, 8334); //  iPhone 5c Back Camera
    localStorage.setItem(351309797302, 10113); //  iPhone 5c Loudspeaker
    localStorage.setItem(231083787503, 26147); //  iPhone 5c Screen Black
    localStorage.setItem(371254721799, 8325); //  iPhone 5s/SE Ear Speaker
    localStorage.setItem(231230902498, 29010); //  iPhone 5s/SE Home Button Silver
    localStorage.setItem(371064185299, 29011); //  iPhone 5s/SE Home Button Gold
    localStorage.setItem(231098139673, 8323); //  iPhone 5s Power/Volume/Mute Flex
    localStorage.setItem(232292016029, 8324); //  iPhone 5s Dock Connector Black
    localStorage.setItem(352021805596, 8340); //  iPhone 5s Dock Connector White
    localStorage.setItem(370981229673, 8341); //  iPhone 5s Prox
    localStorage.setItem(370980268686, 8319); //  iPhone 5s Back Camera
    localStorage.setItem(371254713821, 8327); //  iPhone 5s/SE Vibrator
    localStorage.setItem(231297502190, 26150); //  iPhone 5s Screen White GV
    localStorage.setItem(231083786589, 26148); //  iPhone 5s Screen Black GV
    localStorage.setItem(231489546839, 26150); //  iPhone 5s Screen White GV
    localStorage.setItem(371267567970, 26148); //  iPhone 5s Screen Black GV
    localStorage.setItem(372122407637, 29013); //  iPhone 5s/SE Home Button Black
    localStorage.setItem(372122409112, 29011); //  iPhone 5s/SE Home Button Gold
    localStorage.setItem(372122408491, 29010); //  iPhone 5s/SE Home Button Silver
    localStorage.setItem(232545374625, 22443); //  iPhone SE Dock Connector White
    localStorage.setItem(352198507751, 22442); //  iPhone SE Dock Connector Black
    localStorage.setItem(232545109429, 22444); //  iPhone SE Power/Volume/Mute Flex
    localStorage.setItem(232545079924, 8341); //  iPhone 5s/SE Prox
    localStorage.setItem(371594240768, 26150); //  iPhone 5s/SE Screen White GV
    localStorage.setItem(351701324127, 26148); //  iPhone 5s/SE Screen Black GV
    localStorage.setItem(231490367990, 26150); //  iPhone 5s/SE Screen White GV
    localStorage.setItem(231490374717, 26148); //  iPhone 5s/SE Screen Black GV
    localStorage.setItem(372122400035, 22496); //  iPhone SE Back Camera
    localStorage.setItem(351360299241, 8514); //  iPhone 6 Loud Speaker
    localStorage.setItem(351990888623, 8620); //  iPhone 6 Home Button Gold
    localStorage.setItem(232251811130, 8618); //  iPhone 6 Home Button Black
    localStorage.setItem(351990888966, 8619); //  iPhone 6 Home Button White
    localStorage.setItem(231525328912, 8513); //  iPhone 6 Ear Speaker
    localStorage.setItem(371741582417, 8505); //  iPhone 6 Volume/Mute Flex
    localStorage.setItem(231525331495, 8507); //  iPhone 6 Dock Connector White
    localStorage.setItem(351364869744, 8506); //  iPhone 6 Dock Connector Black
    localStorage.setItem(371296214723, 8519); //  iPhone 6 Back Camera
    localStorage.setItem(351361331833, 8518); //  iPhone 6 Prox
    localStorage.setItem(231504799613, 18587); //  iPhone 6 Screen White GV
    localStorage.setItem(371281698997, 18586); //  iPhone 6 Screen Black GV
    localStorage.setItem(371626810674, 18587); //  iPhone 6 Screen White GV
    localStorage.setItem(371629018822, 18586); //  iPhone 6 Screen Black GV
    localStorage.setItem(371155812445, 8502); //  iPhone 6 Screen White OEM
    localStorage.setItem(231350666771, 8501); //  iPhone 6 Screen Black OEM
    localStorage.setItem(352018416744, 8620); //  iPhone 6 Plus Home Button Gold
    localStorage.setItem(371907155954, 8618); //  iPhone 6 Plus Home Button Black
    localStorage.setItem(352018417084, 8619); //  iPhone 6 Plus Home Button White
    localStorage.setItem(232581186226, 8616); //  iPhone 6 Plus Volume/Mute Flex
    localStorage.setItem(351820490498, 8604); //  iPhone 6 Plus Dock Connector Black
    localStorage.setItem(371907185032, 8605); //  iPhone 6 Plus Dock Connector White
    localStorage.setItem(232285071631, 8611); //  iPhone 6 Plus Back Camera
    localStorage.setItem(371296929328, 8610); //  iPhone 6 Plus Prox
    localStorage.setItem(351364866136, 8623); //  iPhone 6 Plus Ear Speaker
    localStorage.setItem(231527907765, 19816); //  iPhone 6 Plus Screen Black GV
    localStorage.setItem(351368105566, 19817); //  iPhone 6 Plus Screen White GV
    localStorage.setItem(371566103690, 19816); //  iPhone 6 Plus Screen Black GV
    localStorage.setItem(371565344722, 19817); //  iPhone 6 Plus Screen White GV
    localStorage.setItem(371879757693, 8602); //  iPhone 6 Plus Screen White
    localStorage.setItem(351900698901, 8601); //  iPhone 6 Plus Screen Black
    localStorage.setItem(351990886264, 17128); //  iPhone 6s Home Button Silver
    localStorage.setItem(371876275393, 17127); //  iPhone 6s Home Button Gold
    localStorage.setItem(351990887460, 17125); //  iPhone 6s Home Button Black
    localStorage.setItem(232432152350, 8661); //  iPhone 6s Ear Speaker
    localStorage.setItem(232251803460, 8664); //  iPhone 6s Power/Volume/Mute Flex
    localStorage.setItem(351820463165, 8654); //  iPhone 6s Dock Connector Black
    localStorage.setItem(351948894730, 8654); //  iPhone 6s Dock Connector
    localStorage.setItem(232194927009, 8654); //  iPhone 6s Dock Connector
    localStorage.setItem(232242648596, 8807); //  iPhone 6s Prox
    localStorage.setItem(352013036473, 8660); //  iPhone 6s Back Camera
    localStorage.setItem(351599821132, 29984); //  iPhone 6s Screen White GV
    localStorage.setItem(371504137311, 29983); //  iPhone 6s Screen Black GV
    localStorage.setItem(372115001364, 29984); //  iPhone 6s Screen White GV
    localStorage.setItem(352192989307, 29983); //  iPhone 6s Screen Black GV
    localStorage.setItem(352218603356, 8650); //  iPhone 6s Screen Black OEM
    localStorage.setItem(232383236227, 8651); //  iPhone 6s Screen White OEM
	localStorage.setItem(371901150201, 8808); //  iPhone 6s Plus Back Camera
	localStorage.setItem(352016016319, 17127); //  iPhone 6s Plus Home Button Gold
	localStorage.setItem(371904667326, 17128); //  iPhone 6s Plus Home Button Silver
	localStorage.setItem(371904667487, 17125); //  iPhone 6s Plus Home Button Black
	localStorage.setItem(352137118807, 8809); //  iPhone 6s Plus Earpiece
	localStorage.setItem(351984080886, 8807); //  iPhone 6s Plus Prox Flex
	localStorage.setItem(232251805134, 8813); //  iPhone 6s Plus Power Flex
	localStorage.setItem(232117056670, 8803); //  iPhone 6s Plus Battery
	localStorage.setItem(352331470887, 8803); //  iPhone 6s Plus Battery
	localStorage.setItem(231910788005, 8805); //  iPhone 6s Plus Dock White
	localStorage.setItem(232286040826, 8804); //  iPhone 6s Plus Dock Light Gray
	localStorage.setItem(231910809739, 8804); //  iPhone 6s Plus Dock Dark Gray
	localStorage.setItem(231778139466, 32880); //  iPhone 6s Plus Screen White GV
	localStorage.setItem(231778148124, 32879); //  iPhone 6s Plus Screen Black GV
	localStorage.setItem(351747392493, 32880); //  iPhone 6s Plus Screen White GV
	localStorage.setItem(352036444483, 32879); //  iPhone 6s Plus Screen Black GV
	localStorage.setItem(351243051531, 32880); //  iPhone 6s Plus Screen White GV
	localStorage.setItem(231408703951, 32879); //  iPhone 6s Plus Screen Black GV
	localStorage.setItem(351820444501, 8801); //  iPhone 6s Plus Screen White OEM
	localStorage.setItem(371735353160, 8800); //  iPhone 6s Plus Screen Black OEM
    localStorage.setItem(232430919622, 22126); //  iPhone 7 Ear Speaker
    localStorage.setItem(352212909854, 22134); //  iPhone 7 Loud Speaker
    localStorage.setItem(352013701811, 22130); //  iPhone 7 Dock Connector Black
    localStorage.setItem(232282039487, 22131); //  iPhone 7 Dock Connector White
    localStorage.setItem(371901881032, 22130); //  iPhone 7 Dock Connector Gray
    localStorage.setItem(371910573797, 22132); //  iPhone 7 Power/Volume/Mute Flex
    localStorage.setItem(232281274704, 22125); //  iPhone 7 Prox
    localStorage.setItem(351860174388, 33152); //  iPhone 7 Screen Black GV
    localStorage.setItem(232099868494, 33153); //  iPhone 7 Screen White GV
    localStorage.setItem(352174184146, 33152); //  iPhone 7 Screen Black GV
    localStorage.setItem(372089093586, 33153); //  iPhone 7 Screen White GV
    localStorage.setItem(232597556830, 22037); //  iPhone 7 Screen Black OEM
    localStorage.setItem(232594561585, 22038); //  iPhone 7 Screen White OEM
    localStorage.setItem(352013048676, 22127); //  iPhone 7 Back Camera
    localStorage.setItem(352069061184, 22143); //  iPhone 7 Plus Ear Speaker
    localStorage.setItem(352211137520, 22152); //  iPhone 7 Plus Loud Speaker
    localStorage.setItem(371901170209, 22142); //  iPhone 7 Plus Prox
    localStorage.setItem(232281268359, 22144); //  iPhone 7 Plus Back Camera
    localStorage.setItem(352013705246, 22147); //  iPhone 7 Plus Dock Connector Black
    localStorage.setItem(232282045939, 22147); //  iPhone 7 Plus Dock Connector Gray
    localStorage.setItem(232282044470, 22148); //  iPhone 7 Plus Dock Connector White
    localStorage.setItem(232102484447, 38065); //  iPhone 7 Plus Screen Black GV
    localStorage.setItem(371752861300, 38066); //  iPhone 7 Plus Screen White GV
    localStorage.setItem(372108878039, 38065); //  iPhone 7 Plus Screen Black GV
    localStorage.setItem(372108909501, 38066); //  iPhone 7 Plus Screen White GV
    localStorage.setItem(352035532621, 22138); //  iPhone 7 Plus Screen Black OEM
    localStorage.setItem(351671961729, 22139); //  iPhone 7 Plus Screen White OEM
    localStorage.setItem(371901922803, 51963); //  iPhone 8 Ear Speaker
    localStorage.setItem(372196164342, 51953); //  iPhone 8 Power/Volume/Rear Mic Flex
    localStorage.setItem(372143814821, 51949); //  iPhone 8 Dock Connector Gray
    localStorage.setItem(372143816377, 51951); //  iPhone 8 Dock Connector Gold
    localStorage.setItem(232570629004, 51950); //  iPhone 8 Dock Connector Silver
    localStorage.setItem(351680391286, 51957); //  iPhone 8 Wireless Charging Coil
    localStorage.setItem(232591163934, 51961); //  iPhone 8 Loud Speaker
    localStorage.setItem(232570608426, 51964); //  iPhone 8 Prox
    localStorage.setItem(232570614285, 51962); //  iPhone 8 Back Camera
    localStorage.setItem(372113737170, 51896); //  iPhone 8 Screen White GV
    localStorage.setItem(372113736469, 51895); //  iPhone 8 Screen Black GV
    localStorage.setItem(371696397868, 51896); //  iPhone 8 Screen White GV
    localStorage.setItem(371696413648, 51895); //  iPhone 8 Screen Black GV
    localStorage.setItem(231928324494, 51890); //  iPhone 8 Screen White OEM
    localStorage.setItem(231928324955, 51889); //  iPhone 8 Screen Black OEM
    localStorage.setItem(371901922803, 52183); //  iPhone 8 Plus Ear Speaker
    localStorage.setItem(372196166869, 52191); //  iPhone 8 Plus Power/Volume Flex
    localStorage.setItem(231881204366, 52193); //  iPhone 8 Plus Wireless Charging Coil
    localStorage.setItem(232587560986, 52185); //  iPhone 8 Plus Loud Speaker
    localStorage.setItem(232570647542, 52187); //  iPhone 8 Plus Dock Connector Gray
    localStorage.setItem(232570640761, 52189); //  iPhone 8 Plus Dock Connector Gold
    localStorage.setItem(372143829046, 52188); //  iPhone 8 Plus Dock Connector Silver
    localStorage.setItem(351650379621, 52190); //  iPhone 8 Plus Vibrator
    localStorage.setItem(232570422541, 52182); //  iPhone 8 Plus Prox
    localStorage.setItem(232570420768, 52184); //  iPhone 8 Plus Back Camera
    localStorage.setItem(352191979703, 52060); //  iPhone 8 Plus Screen White GV
    localStorage.setItem(372113738855, 52059); //  iPhone 8 Plus Screen Black GV
    localStorage.setItem(371214997666, 52060); //  iPhone 8 Plus Screen White GV
    localStorage.setItem(351742809926, 52059); //  iPhone 8 Plus Screen Black GV
    localStorage.setItem(231928581483, 52054); //  iPhone 8 Plus Screen White OEM
    localStorage.setItem(371612750070, 52053); //  iPhone 8 Plus Screen Black OEM
	localStorage.setItem(351319041030, 79325); //  iPhone X Battery
    localStorage.setItem(351975568388, 61562); //  iPhone X Dock Connector Black
    localStorage.setItem(232181051425, 74482); //  iPhone X Dock Connector White
    localStorage.setItem(351622468304, 61565); //  iPhone X Ear Speaker
    localStorage.setItem(231729854649, 61559); //  iPhone X OLED Premium Black
    localStorage.setItem(351633110990, 81500); //  iPhone X OLED Black GV
    localStorage.setItem(352307995499, 81500); //  iPhone X OLED Black GV
    localStorage.setItem(351262122612, 81500); //  iPhone X OLED Black GV
    localStorage.setItem(231805622009, 61560); //  iPhone X Rear Camera
    localStorage.setItem(351599307946, 61561); //  iPhone X Front Camera
    localStorage.setItem(231805514836, 61570); //  iPhone X Side Buttons White
    localStorage.setItem(231796905118, 61569); //  iPhone X Side Buttons Black
	localStorage.setItem(231470625821, 90372); //  iPhone XR LCD Black
	localStorage.setItem(231452265229, 84889); //  iPhone XS Back Camera Lens
	localStorage.setItem(351286007763, 84889); //  iPhone XS Back Camera Lens
	localStorage.setItem(371236962434, 84889); //  iPhone XS Back Camera Lens
	localStorage.setItem(351270318692, 97492); //  iPhone XS OLED Black GV
	localStorage.setItem(372286434393, 97492); //  iPhone XS OLED Black GV
	localStorage.setItem(231466433181, 90370); //  iPhone XS OLED Black Premium
	localStorage.setItem(351283947922, 84880); //  iPhone XS Max Back Camera Lens
	localStorage.setItem(371235368205, 84880); //  iPhone XS Max Back Camera Lens
	localStorage.setItem(231452234181, 84880); //  iPhone XS Max Back Camera Lens
	localStorage.setItem(231448432511, 84875); //  iPhone XS Max Back Camera
	localStorage.setItem(371230667862, 84879); //  iPhone XS Max Earpiece
	localStorage.setItem(351319041931, 90371); //  iPhone XS Max OLED Black
    localStorage.setItem(351309717832, 7031); //  iPad 2 Wifi Flex
    localStorage.setItem(220882592273, 7057); //  iPad 2 Power/Volume/Mute Button Flex
    localStorage.setItem(351309713089, 7036); //  iPad 2 Dock Connector
    localStorage.setItem(370913397680, 7038); //  iPad 2 Screen Black
    localStorage.setItem(350892393748, 7039); //  iPad 2 Screen White
    localStorage.setItem(371538686178, 7038); //  iPad 2 Screen Black
    localStorage.setItem(351636373484, 7039); //  iPad 2 Screen White
    localStorage.setItem(230659764093, 7055); //  iPad 2 Plastic Frame Black x5
    localStorage.setItem(230659764100, 7054); //  iPad 2 Plastic Frame White x5
    localStorage.setItem(230754449862, 7049); //  iPad 2 LCD
    localStorage.setItem(230801256614, 7055); //  iPad 3 Plastic Frame Black
    localStorage.setItem(230801256637, 7054); //  iPad 3 Plastic Frame White
    localStorage.setItem(230808897510, 7062); //  iPad 3 Dock Connector
    localStorage.setItem(231475222622, 25186); //  iPad 3 Volume Flex
    localStorage.setItem(221026013877, 7064); //  iPad 3 Screen Black
    localStorage.setItem(221026013929, 7065); //  iPad 3 Screen White
    localStorage.setItem(231822684260, 7064); //  iPad 3 Screen Black
    localStorage.setItem(231822683015, 7065); //  iPad 3 Screen White
    localStorage.setItem(320899761100, 7067); //  iPad 3 LCD
    localStorage.setItem(351309711834, 7080); //  iPad 4 Home Flex
    localStorage.setItem(350660887772, 7064); //  iPad 4 Screen Black
    localStorage.setItem(370705127192, 7065); //  iPad 4 Screen White
    localStorage.setItem(371301910626, 7064); //  iPad 4 Screen Black
    localStorage.setItem(231527936306, 7065); //  iPad 4 Screen White
    localStorage.setItem(370787550856, 7067); //  iPad 4 LCD
    localStorage.setItem(352039038894, 7100); //  iPad 5 Screen Black
    localStorage.setItem(371929771404, 7101); //  iPad 5 Screen White
    localStorage.setItem(372212065639, 7100); //  iPad 5 Screen Black
    localStorage.setItem(352271437222, 7101); //  iPad 5 Screen White
    localStorage.setItem(232658206096, 7101); //  iPad 5 Screen White
    localStorage.setItem(231848830149, 78514); //  iPad 6 LCD
    localStorage.setItem(231777469291, 84583); //  iPad 6 Glass Black
    localStorage.setItem(351590309880, 84584); //  iPad 6 Glass White
    localStorage.setItem(371496149441, 84583); //  iPad 6 Glass Black
    localStorage.setItem(351590277257, 84584); //  iPad 6 Glass White
	localStorage.setItem(231766734246, 84584); //  iPad 6 Glass White
    localStorage.setItem(231068351342, 7072); //  iPad Mini Wifi Flex
    localStorage.setItem(370916635073, 7089); //  iPad Mini Dock Connector White
    localStorage.setItem(370916635041, 7088); //  iPad Mini Dock Connector Black
    localStorage.setItem(231475214882, 7090); //  iPad Mini Volume Flex
    localStorage.setItem(370824895613, 7083); //  iPad Mini Glass White
    localStorage.setItem(371254678535, 7082); //  iPad Mini Glass Black
    localStorage.setItem(371289196182, 7083); //  iPad Mini Glass White
    localStorage.setItem(231513307087, 7082); //  iPad Mini Glass Black
    localStorage.setItem(351309757794, 7111); //  iPad Mini 3 LCD
    localStorage.setItem(351379834621, 7250); //  iPad Mini 3 Glass Black
    localStorage.setItem(351379836117, 7251); //  iPad Mini 3 Glass White
    localStorage.setItem(351467414792, 7250); //  iPad Mini 3 Glass Black
    localStorage.setItem(371399423744, 7251); //  iPad Mini 3 Glass White
    localStorage.setItem(371356009648, 7304); //  iPad Mini 3 Home Button Silver
    localStorage.setItem(351454691922, 7302); //  iPad Mini 3 Home Button Black
    localStorage.setItem(352016655762, 7303); //  iPad Mini 3 Home Button Gold
    localStorage.setItem(371689771807, 69459); //  iPad Mini 4 Home Button Black
    localStorage.setItem(371689772827, 69460); //  iPad Mini 4 Home Button Silver
    localStorage.setItem(232035607484, 26329); //  iPad Mini 4 Power Button
    localStorage.setItem(232288035024, 26326); //  iPad Mini 4 Dock Connector Black
    localStorage.setItem(371907172838, 69464); //  iPad MIni 4 Dock Connector White
    localStorage.setItem(352137146226, 26328); //  iPad Mini 4 Back Camera
    localStorage.setItem(351660337084, 8416); //  iPad Mini 4 Glass White
    localStorage.setItem(371566118586, 8415); //  iPad Mini 4 Glass Black
    localStorage.setItem(371341675023, 8416); //  iPad Mini 4 Glass White
    localStorage.setItem(371342347893, 8415); //  iPad Mini 4 Glass Black
    localStorage.setItem(371254670398, 7208); //  iPad Air Mic
    localStorage.setItem(351309708602, 7212); //  iPad Air Home Button Flex
    localStorage.setItem(371254615059, 7205); //  iPad Air Dock Connector Black
    localStorage.setItem(231689921567, 7205); //  iPad Air Dock Connector
    localStorage.setItem(231096370912, 7100); //  iPad Air Glass Black
    localStorage.setItem(231096370939, 7101); //  iPad Air Glass White
    localStorage.setItem(231822667085, 7100); //  iPad Air Glass Black
    localStorage.setItem(371538668171, 7101); //  iPad Air Glass White
    localStorage.setItem(371254680987, 7253); //  iPad Air LCD
    localStorage.setItem(371640372107, 7226); //  iPad Air 2 Headphone Jack White
    localStorage.setItem(231958379474, 7225); //  iPad Air 2 Headphone Jack Black
    localStorage.setItem(231958383231, 9325); //  iPad Air 2 Dock Connector Black
    localStorage.setItem(371640374753, 9325); //  iPad Air 2 Dock Connector White
    localStorage.setItem(351552232653, 7200); //  iPad Air 2 Screen Black
    localStorage.setItem(231722984571, 7201); //  iPad Air 2 Screen White
    localStorage.setItem(371326277951, 7200); //  iPad Air 2 Screen Black
    localStorage.setItem(231485887910, 7201); //  iPad Air 2 Screen White
    localStorage.setItem(351820438877, 21669); //  iPad Pro 9.7 Screen Black
    localStorage.setItem(351820438562, 21670); //  iPad Pro 9.7 Screen White
    localStorage.setItem(352018421590, 69468); //  iPad Pro 9.7 Dock Connector Black
    localStorage.setItem(371907158665, 69469); //  iPad Pro 9.7 Dock Connector White
    localStorage.setItem(232159282461, 69473); //  iPad Pro 10.5 Dock Connector White
    localStorage.setItem(371636634545, 69472); //  iPad Pro 10.5 Dock Connector Black
    localStorage.setItem(371479812603, 69470); //  iPad Pro 10.5 Back Camera
    localStorage.setItem(372123852636, 49773); //  iPad Pro 10.5 Screen Black
    localStorage.setItem(372118304355, 49774); //  iPad Pro 10.5 Screen White
    localStorage.setItem(232619120456, 56540); //  iPad Pro 12.9 2nd Gen Screen Black
    localStorage.setItem(372108923295, 56541); //  iPad Pro 12.9 2nd Gen Screen White
    localStorage.setItem(351584480429, 56540); //  iPad Pro 12.9 2nd Gen Screen Black
    localStorage.setItem(231764045324, 56541); //  iPad Pro 12.9 2nd Gen Screen White
}
