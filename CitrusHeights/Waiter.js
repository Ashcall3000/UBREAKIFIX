function Waiter() {
    this.single_list = [];
    this.single_name = [];
    this.waiting_list = [];
    this.table_list = [];
    this.table_time = [];
    this.addSingle = function(name, orderCheck, check_time=1500) {
        this.single_name.push(name);
        this.single_list.push(setInterval(function() {
            orderCheck();
        }, check_time));
    }
    this.clearSingle = function(name) {
        var index = -1;
        for (var i = 0; i < this.single_name.length; i++) {
            if (this.single_name[i] == name) {
                index = i;
            }
        }
        if (index >= 0) {
            console.log('Single Name:', name);
            clearInterval(this.single_list[index]);
            return true;
        }
        console.log('Single Name Not Found:', name);
        return false;
    }
    this.clearAllSingles = function(title='') {
        var check = false;
        console.log('-----Clear All Singles-----');
        if (title != '') {
            console.log("Title:", title);
        }
        console.log('Single Amount:', this.single_list.length);
        for (var i = 0; i < this.single_name.length; i++) {
            if (this.clearSingle(this.single_name[i])) {
                check = true;
            }
        }
        if (!check) {
            this.single_list = [];
            this.single_name = [];
        }
        console.log('---------------------------');
    }
    this.addTable = function(orderCheck, check_time=250, clearCondition=false, timer_total=60000) {
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
                sleep(100).then(() => {
                    this.clearTable(table_number);
                });
                return true;
            }
        }
        return false;
    }
}
