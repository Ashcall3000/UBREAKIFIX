import pyprint
from time import sleep
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.remote.webelement import WebElement
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import ElementNotInteractableException
from selenium.common.exceptions import ElementClickInterceptedException


class FireBrowser(object):
    """A Class that handles the web browser."""

    def __init__(self):
        pyprint.midline("FIREFOX")
        pyprint.write("Loading Selenium...")
        pyprint.write("Setting up browser...")
        self.urls = [""]
        fp = webdriver.FirefoxProfile()
        fp.set_preference("browser.tabs.remote.autostart", False)
        fp.set_preference("browser.tabs.remote.autostart.1", False)
        fp.set_preference("browser.tabs.remote.autostart.2", False)
        self.browser = webdriver.Firefox(firefox_profile=fp)
        self.tab_names = []
        self.current_tab = 0
        self.open = True

    def load(self, url: str, tab_name: str, tab=0):
        """Loads a new page in the given tab. If the tab number is -1
        then it will load the page in a new tab. Reopens Browser if it
        is closed.

        Args:
            url: Page Url that will be loaded.
            tab_name: Tab name for the url page.
            tab: The tab to load page on. DEFAULT: 0"""
        if not self.open:
            self.__init__()
        if tab is -1:  # Loads page to a new tab
            self.new_tab(url, tab_name)
        elif tab is not self.current_tab:
            self.switch_tab(tab)  # Will set the current tab variable
            self.load(url, tab_name, self.current_tab)
        else:
            self.urls[tab] = url
            self.tab_names[tab] = tab_name
            self.browser.get(url)
            pyprint.write("Loading URL:", url)
            pyprint.center(tab_name, "Loaded")
            self.__print()

    def new_tab(self, url="", tab_name=""):
        """Creates a new tab blank tab at the end of the list and Returns
        the number of the new tab. If given a URL and tab name then will load that
        into the new tab.

        Args:
            url: URL to load. DEFAULT: blank
            tab_name: Tab name of new tab. DEFAULT: blank"""
        if self.open:
            pyprint.write("Creating new tab...")
            self.browser.find_element_by_tag_name('body').send_keys(Keys.CONTROL + 't')
            self.browser.switch_to.window(self.browser.window_handles[len(self.urls)])
            if url and tab_name:
                self.urls.append(url)
                self.tab_names.append(tab_name)
                self.current_tab = len(self.urls) - 1
                self.load(url, tab_name, self.current_tab)
            else:
                self.urls.append("")
                self.tab_names.append("")
                self.current_tab = len(self.urls) - 1
        return self.current_tab

    def find_tab(self, tab_name: str):
        """Finds the tab with the tab name given and returns the tab number.
        If tab can't be found then returns -1.

        Args:
            tab_name: Tab name to find."""
        pyprint.write("Finding Tab:", tab_name)
        for i in range(0, len(self.tab_names)):
            if tab_name is self.tab_names[i]:
                return i
        return -1

    def switch_tab(self, tab):
        """Sets the current tab to a new tab using either tab name or
        tab number.

        Args:
            tab: The tab to go to."""
        if self.open:
            pyprint.write("Changing Tab...")
            if type(tab) is str:
                tab = self.find_tab(tab)
            if tab is not self.current_tab:
                self.current_tab = tab
                self.browser.switch_to.window(self.browser.window_handles[tab])

    def get_element(self, selector, element=False) -> WebElement:
        """Finds element in the browser using a CSS selector then returns that
        WebElement. If given a WebElement will then css search in that element.
         If element is not found on the page will return false.

        Args:
            selector: CSS String
            element: WebElement DEFAULT: False"""
        try:
            if element:
                return element.find_element_by_css_selector(selector)
            else:
                return self.browser.find_element_by_css_selector(selector)
        except NoSuchElementException:
            pyprint.warning(selector, warn="ELEMENT NOT FOUND")
            return False

    def get_elements(self, selector, element=False) -> list:
        """Finds elements in the browser using a css selector then returns those
        WebElements. If given a WebElement will then css search in that element.
        If elements are not found on the page will return empty list.

        Args:
            selector: CSS String
            element: WebElement DEFAULT: False"""
        try:
            if element:
                return element.find_element_by_css_selector(selector)
            else:
                return self.browser.find_elements_by_css_selector(selector)
        except NoSuchElementException:
            pyprint.warning(selector, warn="ELEMENTS NOT FOUND")
            return []

    def check_selector(self, selector) -> bool:
        """Given a CSS Selector tries to find element in page.
        Returns False if unable to find object.

        Args:
            selector: CSS string"""
        if self.get_element(selector):
            return True
        else:
            return False

    def close(self):
        """Closes browser and clears data."""
        if self.open:
            pyprint.midline("CLOSING BROWSER")
            self.urls = [""]
            self.tab_names = [""]
            self.current_tab = 0
            self.open = False
            self.browser.quit()
            self.__print()

    def click(self, selector, sleep_time=2) -> bool:
        """Clicks the given object. Selector can either be CSS string or
        it can be an element from selenium. At the end after the click the
        program will pause the amount of sleep_time. Returns boolean if
        program was able to click element or not.

        Args:
            selector: Either CSS Selector or Element Object.
            sleep_time: Time in seconds. DEFAULT: 2"""
        try:
            if type(selector) is str:
                selector = self.get_element(selector)
                if selector:
                    selector.click()
                    sleep(sleep_time)
                    return True
            elif type(selector) is bool:
                pyprint.warning(selector, warn='CLICK FAILURE')
                return False
            else:
                selector.click()
                sleep(sleep_time)
                return True
        except ElementClickInterceptedException:
            pyprint.warning(selector, warn='CLICK INTERCEPTED FAILURE')
            return False
        except ElementNotInteractableException:
            pyprint.warning(selector, warn='CLICK INTERACTABLE FAILURE')

    def send_text(self, text: str, selector) -> bool:
        """Sends text to a specific element. Selector can either be CSS string or
        it can be an element from selenium. Returns bool if was able to write to
        element or not.

        Args:
            text: Text that will be sent to the element.
            selector: Either CSS Selector or Element Object."""
        try:
            if type(selector) is str:
                if self.check_selector(selector):
                    selector = self.browser.find_element_by_css_selector(selector)
                    selector.send_keys(text)
                    return True
            else:
                selector.send_keys(text)
                return True
        except ElementNotInteractableException:
            pyprint.warning(selector, warn='SEND TEXT FAILURE')
            return False

    def remind_me_later(self):
        """Checks to see if the Remind Me Later button is on the screen and clicks it."""
        while self.check_selector("button.show"):
            buttons = self.get_elements("button.show")
            if len(buttons) > 1:
                self.click(buttons[1])
            else:
                self.click(buttons[0])

    def __print(self):
        pyprint.midline("BROWSER DATA", mid=":")
        # pyprint.center(":::TAB NAMES:::")
        # pyprint.write(self.tab_names)
        # pyprint.center(":::URLS:::")
        # pyprint.write(self.urls)
        # pyprint.midline()
        pyprint.write("Current Working Tab:", self.tab_names[self.current_tab])
        pyprint.write("Total Amount of Tabs:", len(self.urls))
        pyprint.midline(mid='#')
