import login
from pyprint import write
from pyprint import midline
from browser import FireBrowser
from file_handler import FileHandle
from global_defs import contain_list


def run(browser: FireBrowser):
    """Given a FireBrowser object will then check to see if there are notifications
    then will go through the list and respond appropriately to them.

    Args:
        browser: FireBrowser Object"""
    midline("STATUS UPDATING")
    if browser.find_tab("Portal") is not -1:
        browser.switch_tab("Portal")
    elif not browser.tab_names:
        login.run(browser)
    else:
        login.run(browser)
    file = FileHandle("status")
    data = file.read_to_data()
    browser.remind_me_later()
    if browser.check_selector(data['notify_check']):
        write("Looking at Notifications...")
        while delete_notifications(browser, data):
            browser.click(data['notify_dropdown_click'])
        while __find_updateable_notification(browser, data):
            """Check to see if asurion or if appointment."""
            browser.click(data['lead_textarea'])
            headings = browser.get_elements_text(data['lead_type_heading'])
            if contain_list("Appointment", headings):
                browser.click(data['status_select'])
                browser.click(data['status_select_awaiting'])
                browser.send_text(data['appointment_text'], 'lead_textarea')
            elif contain_list("Asurion", headings):
                browser.send_text(data['asurion_text'], 'lead_textarea')


def delete_notifications(browser: FireBrowser, data: dict) -> bool:
    noti_list = data['delete_noti'].split[',']
    write("Deleting Extra Notifications...")
    browser.click(data['notify_dropdown_click'])
    check = False
    for element in browser.get_elements(data['notify_message']):
        if contain_list(element, noti_list):
            browser.click(browser.get_element(data['notify_delete'], element=element))
            check = True
    return check


def __find_updateable_notification(browser: FireBrowser, data: dict) -> bool:
    noti_list = data['update_noti'].split[',']
    write("Updating Notifications...")
    browser.click(data['notify_dropdown_click'])
    for element in browser.get_elements(data['notify_message']):
        if contain_list(element.text, noti_list):
            browser.click(element)
            return True
    return False
