import pyprint
from browser import FireBrowser
from file_handler import FileHandle


class Ebay(object):
    """A class that buys and grabs info of ebay purchase."""

    def __init__(self, item_name="", link=""):
        self.ebay_file = FileHandle("ebay")
        self.item_name = item_name
        self.ebay_item_name = ""
        self.link = link
        self.detail_link = ""
        self.sub_total = ""
        self.shipping = ""
        self.tax = ""
        self.tab = 0

    def purchase(self, browser: FireBrowser, link="", new_tab=False):
        """Loads ebay and then purchase the item and gets the details of purchase.

        Args:
            browser: Firebrowser Object
            link: URL string
            new_tab: Whether should open in a new tab."""
        if link:
            self.link = link
        if new_tab:
            browser.load(self.link, "Ebay", -1)
        else:
            browser.load(self.link, "Ebay")
        self.tab = browser.current_tab
        data = self.ebay_file.read_to_data()
        browser.click('input', 'Buy It Now')
        browser.click('button', 'Confirm and pay')
        browser.click('a', 'View order details')
        self.detail_link = browser.url()
        self.ebay_item_name = browser.get_element_text('h4', browser.get_element('.tableItemDetails').parent)
        if browser.check_selector('td', 'Subtotal'):
            self.sub_total = browser.get_element_text('#orderCostItemSubTotal')[1:]
        if browser.check_selector('td', 'Sales tax'):
            self.tax = browser.get_element_text('#orderCostSalesTaxBuyer')[1:]
        if browser.check_selector('td', 'Shipping') and browser.check_selector('span', 'Free'):
            self.shipping = browser.get_element_text('#orderCostShippingAndHandling')[1:]

