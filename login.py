from pyprint import write
from pyprint import midline
from browser import FireBrowser
from file_handler import FileHandle


def run(browser: FireBrowser):
    """Given a FireBrowser object will then load the appropriate file to get username and password
    to login in to UBIF Portal site.

    Args:
        browser: FireBrowser Object"""
    midline("LOGIN")
    if browser.find_tab("Portal") is not -1:
        browser.switch_tab("Portal")
    elif not browser.tab_names:
        browser.load("https://portal.ubif.net/login", "Portal")
    else:
        browser.new_tab("https://portal.ubif.net/login", "Portal")
    file = FileHandle("login")
    data = file.read_to_data()
    if browser.check_selector(data['login_css_click']):
        write("Logging in...")
        browser.click(data['login_css_click'])
        browser.send_text(data['username'], data['username_css_text'])
        browser.click(data['username_css_click'])
        browser.send_text(data['password'], data['password_css_text'])
        browser.click(data['password_css_click'], sleep_time=4)
        browser.remind_me_later()
        midline("LOGGED IN")
    else:
        midline("ALREADY LOGGED IN")
