// ==UserScript==
// @name         UBIF Sheets Scheduler
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Used to update google sheets that is the work schedule. 
// @author       Christopher Sullivan
// @include      https://portal.ubif.net/*
// @require      https://github.com/Ashcall3000/UBREAKIFIX/raw/master/FindElement.js
// @downloadURL  https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFSheetScheduler.user.js
// @updateURL    https://github.com/Ashcall3000/UBREAKIFIX/raw/master/UBIFSheetScheduler.user.js
// @run-at document-idle
// @grant        none
// ==/UserScript==

var names = ["TIME", "Christopher", "Dillion", "Michael", "Moy", "Tyeler", "REPAIRS"];

var Table = {
    rows : 38,
    names : [],
    selected : -1, // Index of selected repair
    mouse_id : "", // To tell if something was already selected. 
    cells : new Array(this.rows),
    repairs : [],
    temp_repairs : [], // Used to move around
    createBlankTable : function(names) {
        var time = 945;
        this.rep = []; // Repairs in the repair Column
        this.repairs = [];
        this.names = names;
        // Setting up Repair columm
        if (true) {
            var temp = 1000;
            for(var i = 0; i < 21; i++) {
                this.rep.push(new Repair());
                this.rep[i].worker = names[names.length - 1];
                this.rep[i].fixed = true;
                this.rep[i].created = true;
                this.rep[i].setRepairTime(temp, temp);
                temp = this.getTime(temp);
            }
            var n = 0;
            // iPhone
            this.rep[n].title = "iPhone";
            this.rep[n].repair_time = 30
            this.rep[n].color = "iphone";
            n++;
            // iPhone Extra
            this.rep[n].title = "iPhone Extra Repair";
            this.rep[n].repair_time = 45;
            this.rep[n].color = "iphone_extra";
            n++;
            // Samsung
            this.rep[n].title = "Samsung";
            this.rep[n].repair_time = 100;
            this.rep[n].color = "samsung";
            n++;
            // Pixel - Pixel 2
            this.rep[n].title = "Pixel - Pixel 2";
            this.rep[n].repair_time = 45;
            this.rep[n].color = "pixel1_2";
            n++;
            // Pixel 3
            this.rep[n].title = "Pixel 3";
            this.rep[n].repair_time = 100;
            this.rep[n].color = "pixel3";
            n++;
            // Tablet
            this.rep[n].title = "Tablet";
            this.rep[n].repair_time = 100;
            this.rep[n].color = "tablet";
            n++;
            // Complex Computer
            this.rep[n].title = "Complex Computer";
            this.rep[n].repair_time = 100;
            this.rep[n].color = "complex_computer";
            n++;
            // Computer
            this.rep[n].title = "Computer";
            this.rep[n].repair_time = 45;
            this.rep[n].color = "computer";
            n++;
            // Console
            this.rep[n].title = "Console";
            this.rep[n].repair_time = 30;
            this.rep[n].color = "console";
            n++;
            // Diagnostic
            this.rep[n].title = "Diagnostic";
            this.rep[n].repair_time = 30;
            this.rep[n].color = "diag";
            n++;
            // Other Device
            this.rep[n].title = "Other Device";
            this.rep[n].repair_time = 30;
            this.rep[n].color = "other_device";
            n++;
            // Other Device
            this.rep[n].title = "Other Device";
            this.rep[n].repair_time = 45;
            this.rep[n].color = "other_device";
            n++;
            // Other Device
            this.rep[n].title = "Other Device";
            this.rep[n].repair_time = 100;
            this.rep[n].color = "other_device";
            n++;
            // Reflash
            this.rep[n].title = "Reflash";
            this.rep[n].repair_time = 15;
            this.rep[n].color = "reflash";
            n++;
            // Up Front
            this.rep[n].title = "Up Front";
            this.rep[n].repair_time = 15;
            this.rep[n].color = "upfront";
            n++;
            // Updates
            this.rep[n].title = "Updates";
            this.rep[n].repair_time = 15;
            this.rep[n].color = "upfront";
            n++;
            // Breaks
            this.rep[n].title = "Break";
            this.rep[n].repair_time = 30;
            this.rep[n].color = "break";
            n++;
            // Breaks
            this.rep[n].title = "Break";
            this.rep[n].repair_time = 45;
            this.rep[n].color = "break";
            n++;
            // Breaks
            this.rep[n].title = "Break";
            this.rep[n].repair_time = 100;
            this.rep[n].color = "break";
            n++;
            // Custom
            this.rep[n].title = "Custom";
            this.rep[n].repair_time = 15;
            this.rep[n].color = "custom";
            n++;
            // BLANK
            this.rep[n].color = "break";
            this.rep[n].start_time = 1000;
            this.rep[n].end_time = 1930;
        }
        for(var i = 0; time <= 1900; i++) { // Rows
            this.cells[i] = [];
            for(var j = 0; j < names.length; j++) { // Columns
                this.cells[i].push(new Cell());
                if (i == 0) { // HEAD ROW
                    if (j > 0 && j < (names.length - 1)) {  
                        this.cells[i][j].setElement("th", "h" + (i+1), "head_name");
                        this.cells[i][j].text = names[j]
                    } else if (j == 0) {
                        this.cells[i][j].setElement("th", "time_head", "time_cell"); // time column
                        this.cells[i][j].text = names[j];
                    } else if (j == (names.length - 1)) {
                        this.cells[i][j].setElement("th", "h" + j); // Repair column
                        this.cells[i][j].text = names[j];
                    }
                } else {
                    if (j == 0) { // Time Column
                        this.cells[i][j].setElement("td", "time" + time, "time_cell");
                        this.cells[i][j].text = timeConvert(time);
                    } else if (j < names.length - 1) {
                        this.cells[i][j].setElement("td", "t" + time + "n" + j, "n" + j);
                    } else {
                        this.cells[i][j].setElement("td", "r" + time);
                        if (i - 1 < this.rep.length) {
                            this.cells[i][j].text = this.rep[i-1].htmlText(time);
                            this.cells[i][j].minutes = this.rep[i-1].htmlMinutes(time);
                            this.cells[i][j].addClass(this.rep[i-1].htmlClass(time));
                        }
                    }
                }
            }
            time = this.getTime(time);
        }
    },
    setLocalRepairs : function(list) {
        for (var i = 0; i < list.length; i++) {
            var data = list[i].getData();
            for (var j = 0; j < data.length; j++) {
                localStorage.setItem(i + 'r' + j, data[j]);
            }
        }
    },
    getLocalRepairs : function() {
        var len = this.repairs.length
        var data_len = this.repairs[0].getData().length;
        var temp_repairs = [];
        for (var i = 0; i < len; i++) {
            var data = [];
            for (var j = 0; j < data_len; j++) {
                data.push(localStorage.getItem(i + 'r' + j));
            }
            temp_repairs.push(new Repair());
            temp_repairs[i].setData(data);
        }
        return temp_repairs;
    },
    copyTable : function(list) {
        this.setLocalRepairs(list);
        return this.getLocalRepairs();
    },
    updateRepairs : function() {
        for (var i = 0; i < this.repairs.length; i++) {
            this.repairs[i].updateRepairTime(this.repairs[i].start_time);
        }
    },   
    updateCells : function() {
        var time = 1000;
        for (var i = 1; time <= 1900; i++) {
            for (var j = 1; j < this.names.length; j++) {
                this.cells[i][j].reset();
                for (var r = 0; r < this.repairs.length; r++) {
                    if (this.repairs[r].repairCell(this.names[j], time)) {
                        this.cells[i][j].text = this.repairs[r].htmlText(time);
                        this.cells[i][j].minutes = this.repairs[r].htmlMinutes(time);
                        this.cells[i][j].addClass(this.repairs[r].htmlClass(time));
                        this.cells[i][j].span_text = this.repairs[r].htmlHover();
                        break;
                    }
                }
                if (j == this.names.length - 1) {
                    for (var r = 0; r < this.rep.length; r++) {
                        if (this.rep[r].repairCell(this.names[this.names.length - 1], time)) {
                            this.cells[i][j].text = this.rep[r].htmlText(time);
                            this.cells[i][j].minutes = this.rep[r].htmlMinutes(time);
                            this.cells[i][j].addClass(this.rep[r].htmlClass(time));
                            break;
                        }
                    }
                }
            }
            time = this.getTime(time);
        }
    },
    update : function() {
        this.updateRepairs();
        this.updateCells();
    },  
    getTime : function(time) {
        time += (time % 100 == 45) ? 55 : 15;
        return time
    }, 
    getHTML : function() {
        var text = '<table id="schedule"><tbody>';
        var time = 945;
        for(var i = 0; time <= 1900; i++) { // Row
            text += '<tr id="';
            text += (i == 0) ? 'title_row" class="table_head">' : 't' + time + '" class="row">';
            for (var j = 0; j < this.cells[i].length; j++) { // Colum
                text += this.cells[i][j].getHTML();
            }
            text += '</tr>';
            time = this.getTime(time);
        }
        return text + '</tbody></table>';
    }, 
    print : function() {
        document.querySelector("body").innerHTML = this.getHTML();
        console.log("Printing...");
    },
    addListener : function() {
        document.getElementById("schedule").addEventListener("mouseover", function(e) {
            var t = e.target.id;
            if (t != Table.mouse_id) {
                if (t.charAt(0) == 't' && t.charAt(1) != 'i') { // Mouse Over
                    var n = t.charAt(t.length - 1);
                    var time = t.substring(1,5);
                    if (Table.selected != -1) { // Repair selected
                        if (!String(Table.selected).includes('r')) {
                            if (!Table.repairs[Table.selected].start_time != time) {
                                Table.repairs[Table.selected].updateRepairTime(time);
                            }
                            if (!Table.repairs[Table.selected].worker != Table.names[n]) {
                                Table.repairs[Table.selected].worker = Table.names[n];
                            }
                        } else {
                            var i = Table.repairs.length;
                            var r = parseInt(Table.selected.substring(1, Table.selected.length));
                            Table.selected = i;
                            Table.repairs.push(new Repair());
                            Table.repairs[i].setData(Table.rep[r].getData());
                            Table.repairs[i].worker = Table.names[n];
                            Table.repairs[i].updateRepairTime(time);
                            Table.rep[r].selected = false;
                        }
                        Table.update();
                        Table.print();
                        Table.addListener();
                    } else {
                        for (var i = 0; i < Table.repairs.length; i++) {
                            if (Table.repairs[i].repairCell(Table.names[n], time)) {
                                Table.repairs[i].mouse_over = true;
                                break;
                            }
                        }
                    }
                } else {
                    for (var i = 0; i < Table.repairs.length; i++) {
                        if (Table.repairs[i].mouse_over) {
                            Table.repairs[i].mouse_over = false;
                            break;
                        }
                    }
                }
                Table.mouse_id = t;
            }
        });
        document.getElementById("schedule").addEventListener("click", function(e) {
            var t = e.target.id;
            console.log("ID: " + t);
            if (Table.selected != -1) { // if Repair selected
                if (!isNaN(String(Table.selected).charAt(0))) { // Repair unselect
                    if (t.charAt(0) == 't' && t.charAt(1) != 'i') { // Update repair new location
                        var n = t.charAt(t.length - 1);
                        var time = t.substring(1,5);
                        if (!Table.repairs[Table.selected].start_time != time) {
                            Table.repairs[Table.selected].updateRepairTime(time);
                        }
                        if (!Table.repairs[Table.selected].worker != Table.names[n]) {
                            Table.repairs[Table.selected].worker = Table.names[n];
                        }
                    } else {
                        Table.repairs = Table.copyTable(Table.temp_repairs);
                    }
                    Table.repairs[Table.selected].selected = false;
                    Table.selected = -1;
                    Table.update();
                    Table.print();
                    Table.addListener();
                } else if (String(Table.selected).includes('r')) { // Rep Unselect
                    Table.rep[Table.selected.charAt(1)].selected = false;
                    Table.selected = -1;
                    Table.update();
                    Table.print();
                    Table.addListener();
                }
            } else {
                // Repair select
                if (t.charAt(0) == 't' && t.charAt(1) != 'i') {
                    var n = t.charAt(t.length - 1);
                    var time = t.substring(1,5);
                    var r = "None";
                    for (var i = 0; i < Table.repairs.length; i++) {
                        if (Table.repairs[i].repairCell(Table.names[n], time)) {
                            r = Table.repairs[i].customer;
                            Table.repairs[i].selected = true;
                            Table.selected = i;
                            break;
                        }
                    }
                    console.log("ID: " + t + ", " + timeConvert(time) + " " + Table.names[n] + ', Customer: ' + r);
                    Table.temp_repairs = Table.copyTable(Table.repairs);
                    Table.update();
                    Table.print();
                    Table.addListener();
                // Rep Select
                } else if (t.charAt(0) == 'r') {
                    var time = t.substring(1,5);
                    console.log(t + ' ' + time);
                    for (var i = 0; i < Table.rep.length; i++) {
                        if (Table.rep[i].repairCell(Table.names[Table.names.length - 1], time)) {
                            console.log("Repair: " + Table.rep[i].title);
                            Table.rep[i].selected = true;
                            Table.selected = "r" + i;
                            break;
                        }
                    }
                    Table.update();
                    Table.print();
                    Table.addListener();
                } else {
                    console.log("NOPE ID: " + t);
                }
            }
        });
        document.getElementById("schedule").addEventListener('contextmenu', function(e) {
            e.preventDefault();
            var t = e.target.id;
            console.log("RIGHT: " + t);
            if (Table.selected == -1 && t.charAt(0) == 't' && t.charAt(1) != 'i') {
                var n = t.charAt(t.length - 1);
                var time = t.substring(1,5);
                for (var i = 0; i < Table.repairs.length; i++) {
                    if (Table.repairs[i].repairCell(Table.names[n], time)) {
                        if (Table.repairs[i].color.includes('complete')){
                            var text = Table.repairs[i].color;
                            Table.repairs[i].color = text.substring(0, text.length - 9);
                            Table.repairs[i].fixed = false;
                        } else {
                            Table.repairs[i].color += " complete";
                            Table.repairs[i].fixed = true;
                            break;
                        }
                    }
                }
            }
            Table.update();
            Table.print();
            Table.addListener();
            return false;
        }, false);
    }
};

function Cell() {    
    this.tag = "";
    this.id = "";
    this.el_class = "table_cell";
    this.text = "";
    this.minutes = 0;
    this.span_text = "";
    this.setElement = function(tag, id, el_class) {
        this.tag = tag;
        this.id = id;
        if (el_class == undefined) {
            this.addClass(el_class);
        }
    };
    this.addClass = function(text) {
        if (text != undefined) {
            if (!(this.el_class.includes(text))) {
                this.el_class += " " + text;
            }
        }
    };
    this.checkClass = function(text) {
        return this.el_class.includes(text);
    };
    this.removeClass = function(text) {
        if (this.el_class.includes(text)) {
            var temp = this.el_class;
            var start = temp.indexOf(text);
            var end = start;
            for (var i = start; i < el_class.length; i++) {
                if (el_class.charAt(i) == ' ') {
                    end = i;
                }
            }
            this.el_class = temp.substring(0, start - 1) + temp.substring(end);
        }
    };
    this.reset = function() {
        this.el_class = "table_cell";
        this.text = "";
        this.minutes = 0;
        this.span_text = "";
    };
    this.getHTML = function() {
        var temp = '<';
        temp += this.tag;
        temp += (this.id) ? ' id="' + this.id + '"' : '';
        temp += ' class="' + this.el_class + '"';
        temp += '>' + this.text;
        if (this.minutes > 0) {
            temp += '<div class="minutes"> ';
            var rem = this.minutes % 100;
            if (this.minutes >= 100) {
                temp += ((this.minutes - rem) / 100);
                if (rem > 0) {
                    temp += ' h ' + rem + ' m ';
                } else {
                    temp += (this.minutes >= 200) ? ' hours ' : ' hour '; 
                }
            } else {
                temp += this.minutes + ' mins ';
            }
            temp += ' </div>';
        }
        if (this.span_text.length > 0 && this.span_text != '<br>:am</br>') {
            temp += '<span class="tooltiptext">';
            temp += this.span_text;
            temp += '</span>';
        }
        temp += '</' + this.tag + '>';
        return temp;
    };
}

function Repair() {
    this.title = "";
    this.worker = "";
    this.customer = "";
    this.workoder = "";
    this.color = ""; // Color index from list of colors
    this.asurion = false;
    this.start_time = "1000"; //
    this.end_time = "1900";
    this.repair_time = 0; // Time it will take to repair. 
    this.selected = false; // If user selected this item.
    this.fixed = false; // Will auto move to fit other repairs or not.
    this.fixed_end_time = ""; // time when repair is due from W.O.
    this.created = false;
    this.mouse_over = false; // To tell if the mouse is over the repair
    this.moved = false; // if Repair is moved from original spot.
    this.notes = ""; // Any Notes on the repair. 
    this.temp_start_time = this.start_time; 
    this.temp_end_time = this.end_time;
    this.repairInTime = function(time) {
        if (this.start_time != this.end_time) {
            return (this.start_time <= time && changeTime(this.end_time, -15) >= time);
        } else {
            return time == this.start_time;
        }
    };
    this.repairCell = function(name, time) {
        if (this.repairInTime(time)) {
            return (name == this.worker);
        }
        return false;
    };
    this.htmlText = function(time) {
        if (time == changeTime(this.end_time, -15) || this.start_time == this.end_time) {
            return this.title;
        }
        return "";
    };
    this.htmlMinutes = function(time) {
        if (time == this.start_time) {
            return this.repair_time;
        }
        return 0;
    };
    this.htmlClass = function(time) {
        var text = 'repair ';
        text += this.color;
        if (time == this.start_time) {
            text += ' top';
        }
        if (time == changeTime(this.end_time, -15) || this.start_time == this.end_time) {
            text += ' bottom';
        }
        if (this.selected) {
            text += ' selected';
        } /*
        if (this.mouse_over) {
            text += ' move';
        }
        if (this.moved) {
            text += ' move';
        } */
        return text;
    };
    this.htmlHover = function() {
        if (!this.selected) {
            var text = this.customer;
            if (this.asurion) {
                text += "<br>" + timeConvert(this.fixed_end_time) + "</br>";
            }
            return text;
        }
        return "";
    };
    this.setRepairTime = function(start, end) {
        if (start == undefined) {
            start = this.start_time;
        }
        if (end == undefined) {
            end = this.end_time;
        }
        this.start_time = start;
        this.end_time = end;
        this.repair_time = timeDistance(start, end);
    };
    this.updateRepairTime = function(start) {
        if (start == undefined) {
            start = this.start_time;
        }
        this.start_time = parseInt(start);
        this.end_time = changeTime(this.start_time, this.repair_time)
    };
    this.updateTempTime = function(start) {
        if (start == undefined) {
            start = this.start_time;
        }
        this.temp_start_time = this.start_time;
        this.temp_end_time = this.end_time;
        this.start_time = start;
        this.end_time = changeTime(this.start_time, this.repair_time);
    };
    this.goBack = function() {
        this.start_time = this.temp_start_time;
        this.end_time = this.temp_end_time;
    };
    this.setData = function(data) {
        this.title = data[0];
        this.worker = data[1];
        this.customer = data[2];
        this.workoder = data[3];
        this.color = data[4];
        this.asurion = data[5];
        this.start_time = data[6];
        this.end_time = data[7];
        this.repair_time = data[8];
        this.fixed = data[9];
        this.fixed_end_time = data[10];
        this.notes = data[11];
        this.created = true;
    };
    this.getData = function() {
        return [this.title, this.worker, this.customer, this.workorder, this.color, this.asurion, this.start_time, this.end_time, this.repair_time, this.fixed, this.fixed_end_time, this.notes];
    };
}

function timeDistance(start, end) {
    var total = 0;
    var count = start; 
    while (count < end) {
        count = changeTime(count, 15);
        total = changeTime(total, 15);
    }
    return total;
}

function changeTime(time, amount) {
    if (amount > 0) {
        var min = amount % 100; 
        min += (amount - min) / 100 * 60;
        for (var t = 0; t < min; t+=15) {
            time += (time % 100 == 45) ? 55 : 15;
        }
    } else if (amount < 0) {
        amount *= -1;
        var min = amount % 100;
        min += (amount - min) / 100 * 60;
        for (var t = 0; t < min; t+=15) {
            time -= (time % 100 == 0) ? 55 : 15;
        }
    }
    return time;
}

function timeConvert(time) {
    if (time < 1300) {
        if (time >= 1200) {
            return String(time).substring(0,2) + ':' + String(time).substring(2,4) + "pm";
        } else {
            return String(time).substring(0,2) + ':' + String(time).substring(2,4) + "am";
        }
    } else {
        var num = time - 1200;
        return String(num).charAt(0) + ':' + String(num).substring(1) + "pm";
    }
}


/** TESTING STUFF **/
if (true) {
    Table.createBlankTable(names);
    var n = 0;
    Table.repairs.push(new Repair);
    Table.repairs[n].title = "Samsung";
    Table.repairs[n].worker = "Christopher";
    Table.repairs[n].customer = "Ashiah Scharaga";
    Table.repairs[n].asurion = true;
    Table.repairs[n].fixed_end_time = 1145;
    Table.repairs[n].color = "samsung";
    Table.repairs[n].setRepairTime(1045, 1145);
    n++;
    Table.repairs.push(new Repair);
    Table.repairs[n].title = "Up Front";
    Table.repairs[n].worker = "Christopher";
    Table.repairs[n].color = "upfront";
    Table.repairs[n].setRepairTime(1000, 1045);
    n++;
    Table.repairs.push(new Repair);
    Table.repairs[n].title = "Break";
    Table.repairs[n].worker = "Christopher";
    Table.repairs[n].color = "break";
    Table.repairs[n].setRepairTime(1200, 1245);
    n++;
    Table.repairs.push(new Repair);
    Table.repairs[n].title = "iPhone";
    Table.repairs[n].worker = "Christopher";
    Table.repairs[n].color = "iPhone";
    Table.repairs[n].setRepairTime(1315, 1345);
    n++;
    Table.repairs.push(new Repair);
    Table.repairs[n].title = "Samsung";
    Table.repairs[n].worker = "Christopher";
    Table.repairs[n].color = "samsung";
    Table.repairs[n].setRepairTime(1345, 1445);

    Table.update();
    Table.print();
    Table.addListener();
}
