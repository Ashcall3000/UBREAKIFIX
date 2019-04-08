import pyprint
from browser import FireBrowser
from file_handler import FileHandle
from parts import Parts


def get_to_items(browser: FireBrowser):
    browser.click('#pos', sleep_time=0)
    browser.click('#inventory')
    browser.click('button', '100', sleep_time=4)
    part_list = Parts()
    url = ""
    while browser.check_selector('a', 'Next') and url is not browser.url():
        el_list = browser.get_elements('.table tr')
        el_list.pop(0)
        for el_item in el_list:
            info = browser.get_elements('td', el_item)
            """
            2: item_name
            1: item_number
            4: available
            5: reserved
            6: intransit
            9: avg_cost
            11: Avg_cons
            10: reorder"""
            part_list.add_item_convert([info[2].text, info[1].text, info[4].text, info[5].text, info[6].text[-1:],
                                        info[9].text, info[11].text, info[10].text])
            pyprint.write(part_list.last_item().save_string())
        browser.click('.next > a:nth-child(1)')
        url = browser.url()
    return part_list
