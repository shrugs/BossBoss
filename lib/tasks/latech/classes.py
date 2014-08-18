# pylint: disable-msg=C0103

import time
import sys
from selenium.common.exceptions import NoSuchElementException
from .common import find_key, find_all_keys, select_and_submit, get_short_name, get_driver, get_debug, remove_dupe_space
from ..db import School, Course, Term

# VARS
debug = get_debug()
debug = True
term_key = None
if len(sys.argv) >= 2:
    term_key = sys.argv[1]
shortname = get_short_name()

# get school from DB; must be in here before hand
latech = School.get(School.shortname == shortname)

# create driver and navigate to BOSS
driver = get_driver(debug)
driver.get("http://boss.latech.edu")

# go to the "Available Course Offerings" tab
course_offerings = driver.find_element_by_xpath("html/body/table/tbody/tr[5]/td/table/tbody/tr/td[1]/table/tbody/tr/td[1]/div/a[9]")
course_offerings_href = course_offerings.get_attribute("href")
course_offerings.click()
# @TODO(Shrugs) make this sleep shit a little more intelligent
time.sleep(1)

# @TODO(Shrugs) create all the terms in the database after this
term_select = driver.find_element_by_css_selector('select[name="Term"]')
terms = [(t.get_attribute("value"), t.text.strip()) for t in term_select.find_elements_by_tag_name("option")]

if not term_key:
    term_key = terms[0][1]

# Create all terms if not exist
for (term, term_name) in terms:
    try:
        db_term = Term.get(
            Term.key == term,
            Term.name == term_name,
            Term.school == latech
        )
    except Term.DoesNotExist:
        db_term = Term.create(
            key=term,
            name=term_name,
            season=term_name.split(' ')[0].lower(),
            year=int(term_name.split(' ')[1]),
            school=latech
        )

term = Term.get(Term.key == term_key, Term.school == latech)
# select this term and submit
select_and_submit(driver, term.key)

time.sleep(1)

subjects_select = driver.find_element_by_css_selector('select[name="Subject"]')
subjects = [x.get_attribute("value") for x in subjects_select.find_elements_by_tag_name("option")]

for subject in subjects:
    # for each subject, select it and then do some stuff
    select_and_submit(driver, subject)

    time.sleep(1)

    course_select = driver.find_element_by_css_selector("select[name='CourseID']")
    courses = [x.get_attribute("value") for x in course_select.find_elements_by_tag_name("option")]

    for course in courses:
        # for each course, select it and then do something cool
        select_and_submit(driver, course)
        time.sleep(1)

        try:
            error = driver.find_element_by_css_selector(".errortext")
        except NoSuchElementException:
            # good
            pass
        finally:
            # return to course listing
            if course != courses[-1]:
                driver.find_element_by_xpath("html/body/div[3]/form/table[1]/tbody/tr/td/span/a[3]").click()
                time.sleep(1)

    # return to subject listing
    driver.find_element_by_xpath("html/body/div[3]/form/table[1]/tbody/tr/td/span/a[2]").click()
    time.sleep(1)
