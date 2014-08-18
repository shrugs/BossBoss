from selenium import webdriver
import time
import os
from common import *

if len(sys.argv) < 2:
    exit("Requires term")

# VARS
debug = get_debug()
term_key = sys.argv[1]
shortname = get_short_name()

# get school from DB; must be in here before hand
latech = School.get(School.shortname==shortname)

# create driver and navigate to BOSS
driver = get_driver(debug)
driver.get("http://boss.latech.edu")

# go to the "Available Course Offerings" tab
driver.find_element_by_xpath("html/body/table/tbody/tr[5]/td/table/tbody/tr/td[1]/table/tbody/tr/td[1]/div/a[9]").click()
# @TODO(Shrugs) make this sleep shit a little more intelligent
time.sleep(1)

# @TODO(Shrugs) create all the terms in the database after this
this_semester = driver.find_element_by_css_selector('select[name="Term"]').find_elements_by_tag_name("option").get_attribute("value")
print this_semester

# select the most recent quarter
driver.find_element_by_css_selector('input[name="submitbutton"]').click()

time.sleep(1)

subjects_select = driver.find_element_by_css_selector('select[name="Subject"]')
subjects = [x.get_attribute("value") for x in subjects_select.find_elements_by_tag_name("option")]

for subject in subjects:
    # for each subject, select it and then do some stuff
    select_and_submit(driver, subject)

    time.sleep(1)

    select_box = driver.find_element_by_css_selector("select[name='CourseID']")
    courses = [x.get_attribute("value") for x in select_box.find_elements_by_tag_name("option")]

    for course in courses:
        # for each course, select it and then do something cool
        select_and_submit(driver, course)
        time.sleep(1)

        try:
            error = driver.find_element_by_css_selector(".errortext")
        except:
            # good
            pass

        # return to course listing
        driver.find_element_by_xpath("html/body/div[3]/form/table[1]/tbody/tr/td/span/a[3]").click()
        time.sleep(2)

    # return to subject listing
    driver.get(catalog_href)
    time.sleep(2)
    driver.find_element_by_css_selector('input[name="submitbutton"]').click()
