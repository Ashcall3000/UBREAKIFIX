from pyprint import write
from pyprint import midline


class Item(object):
    """A class that holds data for specific items in UBIF."""

    def __init__(self, text=""):
        self.name = ""  # Name of item in ubif system
        self.item_number = ""  # Unique number in UBIF System
        self.available = 0  # Amount that is available to be used
        self.reserved = 0  # Amount that is reserved for a customer
        self.transit = 0  # Amount of parts being shipped to store
        self.avg_cost = 0.00  # Average Cost of the part
        self.avg_cons = 0.00  # Average Daily Consumption
        self.reorder = 0  # Amount to keep stock of item.
        self.gadget_numbers = []  # A list of gadgetfix part number
        self.qsc_number = ""  # Part number for qsccomputer
        if text:
            self.create(text)

    def create(self, text: str):
        strings = text.split(',')
        self.name = strings[0]
        self.item_number = int(strings[1], 10)
        self.available = int(strings[2], 10)
        self.reserved = int(strings[3], 10)
        self.transit = int(strings[4], 10)
        self.avg_cost = float(strings[5])
        self.avg_cons = float(strings[6])
        self.reorder = int(strings[7], 10)
        self.gadget_numbers = strings[8].split('+')
        self.qsc_number = strings[9]

    def save_string(self) -> str:
        gadget_string = ""
        for string in self.gadget_numbers:
            gadget_string += str(string) + "+"
        string = (self.name + "," + str(self.item_number) + "," + str(self.available) + "," + str(self.reserved) + "," \
               + str(self.transit) + "," + str(self.avg_cost) + "," + str(self.avg_cons) + "," + str(self.reorder) \
               + "," + gadget_string[:-1] + "," + self.qsc_number)
        write(string)
        return str(string)

    def pretty_print(self):
        midline(str(self.item_number))
        write('SKU:', self.item_number)
        write('Name:', self.name)
        write('Available:', self.available)
        write('Reserved:', self.reserved)
        write('Transit:', self.transit)
        write('Average Cost: $', self.avg_cost)
        write('Average Consumption:', self.avg_cons)
        write('Reorder Level:', self.reorder)
