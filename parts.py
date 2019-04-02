import pyprint
from item import Item
from global_defs import contain_list
from file_handler import FileHandle


class Parts(object):
    """A class that holds an array of Item objects"""

    def __init__(self):
        self.items = []
        self.sort_type = "Item Number"

    def add_item(self, text: str):
        """Adds item to array

        Args:
            text: String"""
        self.items.append(Item(text))

    def add_item_convert(self, info) -> bool:
        """Adds Item to array given an array of strings.
        0: name
        1: item number
        2: available
        3: reserved
        4: transit
        5: average cost
        6: average consumed
        7: reoder level

        Args:
            info: array of strings"""
        if len(info) is 8:
            self.items.append(Item())
            it = self.last_item()
            it.name = info[0]
            it.item_number = int(info[1])
            it.available = 0 if 'A' in info[2] else int(info[2])
            it.reserved = 0 if 'A' in info[3] else int(info[3])
            it.transit = 0 if 'A' in info[4] else int(info[4])
            it.avg_cost = float(info[5].replace('$', ' '))
            it.avg_cons = float(info[6])
            it.reorder = int(info[7])
            return True
        else:
            return False

    def filter(self):
        """Filter out all the Item objects that have 0 reorder level."""
        for i in self.items:
            if i.reorder is 0:
                self.items.remove(i)

    def last_item(self) -> Item:
        """Returns the last Item object in array."""
        if self.items:
            return self.items[len(self.items) - 1]
        else:
            return False

    def get_item(self, index) -> Item:
        """Searches and returns the first Item matching the critiera.
        If index is a number will search by item_number.
        If index is a string will search by item name. """
        if self.items:
            if isinstance(index, int):
                for it in self.items:
                    if it.item_number is str(index):
                        return it
            elif isinstance(index, str):
                for it in self.items:
                    if index in it.name:
                        return it
        else:
            return False

    def get_item_by(self, index, select) -> Item:
        """Searches and returns the first Item matching the index in the given
           critiera given by select. Select options are:
           Name: Finds by Item Name
           SKU: Finds by Item Number
           Gadget: Finds by Gadgetfix Part Number
           QSC: Finds by QSC Part Number

           Args:
                index: String or number to be compared against.
                select: String to say what index should be compared against.
        """
        if select is "Name":
            return self.get_item(index)
        elif select is "SKU":
            return self.get_item(int(index, 10))
        elif select is "Gadget":
            for it in self.items:
                if contain_list(str(index), it.gadget_numbers):
                    return it
        elif select is "QSC":
            for it in self.items:
                if index in it.qsc_number:
                    return it
        return False

    def get_items_by(self, index, select) -> list:
        """Searches and returns a list of Item objects that contain the index
           in the given critiera given by select. Select options are:
           Name: Finds by Item Name
           SKU: Finds by Item number
           Available: Finds by Available count
           Reserved: Finds by Reserved count
           Transit: Finds by in transit count
           Reoder: Finds by Reoder Level
           Gadget: Finds by Part number of Gadget
           QSC: Finds by QSCcomputer Part Number
        """
        temp_list = []
        if "Name" in select:
            for it in self.items:
                if index in it.name:
                    temp_list.append(it)
        if "SKU" in select:
            for it in self.items:
                if index in str(it.name):
                    temp_list.append(it)
        if "Available" in select:
            for it in self.items:
                if it.available >= index:
                    temp_list.append(it)
        if "Reserved" in select:
            for it in self.items:
                if it.reserved >= index:
                    temp_list.append(it)
        if "Transit" in select:
            for it in self.items:
                if it.transit >= index:
                    temp_list.append(it)
        if "Reorder" in select:
            for it in self.items:
                if it.reorder >= index:
                    temp_list.append(it)
        if "Gadget" in select:
            for it in self.items:
                if contain_list(index, it.gadget_numbers):
                    temp_list.append(it)
        if "QSC" in select:
            for it in self.items:
                if index in it.qsc_number:
                    temp_list.append(it)
        # Remove doubles
        group = []
        for i in temp_list:
            if i not in group:
                group.append(i)
        temp_list.clear()
        return group

    def save(self):
        """Saves the list of items to a file on the computer"""
        pyprint.write("Saving Item List...")
        item_file = FileHandle('items')
        item_file.create()
        item_strings = []
        for it in self.items:
            item_strings.append(it.save_string())
        item_file.write_list(item_strings)
        pyprint.write("Item List Saved")
