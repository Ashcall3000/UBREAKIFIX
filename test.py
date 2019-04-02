import pyprint
import login
from parts import Parts
from time import sleep
from browser import FireBrowser
from file_handler import FileHandle
from item_list_creator import get_to_items


pyprint.topline("WELCOME")
browser = FireBrowser()
login.run(browser)
part_list = get_to_items(browser)
part_list.save()
browser.close()

"""
re_list = fbrow.get_elements("button.show")
fbrow.click(re_list[1])
fbrow.click(re_list[0])
if fbrow.check_selector(".badge"):
    noti_list = ['New Asurion Claim Added']
    dele_noti_list = ['Submitted', 'Received']
    if fbrow.check_selector(".badge"):
        fbrow.click("li.dropdown:nth-child(3)")
        for el in fbrow.get_elements(".msg"):
            pyprint.write("Text:", el.text)
            if el.text in noti_list:
                fbrow.click(el)
fbrow.click("div.ng-pristine")
fbrow.send_text("We set the part aside and are ready for you to come in at your earliest convenience."
                , "div.ng-pristine")

# fbrow.close()

pyprint.bottomline()"""
