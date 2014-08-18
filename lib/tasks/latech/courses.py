from selenium import webdriver
import time
import os
import sys
from common import *
from ..db import *

# VARS
debug = get_debug()
shortname = get_short_name()

latech = School.get(School.shortname==shortname)

driver = get_driver(debug)
driver.get("http://boss.latech.edu")

# course catalog
catalog = driver.find_element_by_xpath("html/body/table/tbody/tr[5]/td/table/tbody/tr/td[1]/table/tbody/tr/td[1]/div/a[11]").click()
time.sleep(2)

all_subjects_select = driver.find_element_by_css_selector("select[name='Subject']")
subject = [x.get_attribute("value") for x in all_subjects_select.find_elements_by_tag_name("option")]

for subject in subject:
    # loop through all of the subjects
    select_and_submit(driver, subject)
    time.sleep(1)

    try:
        error = driver.find_element_by_css_selector(".errortext")
    except Exception, e:
        # good, get metadata about courses
        h = driver.page_source
        re_course_info_comments_start = re.compile("""\<!-- \"\"-->\n<!-- \"\"--\>""")
        course_info_comments_start = re_course_info_comments_start.search(h)
        start_index = course_info_comments_start.start()

        # <!-- Campus pipeline not enabled-->
        re_course_info_comments_end = re.compile("""\<!-- Campus pipeline not enabled-->""")
        course_info_comments_end = re_course_info_comments_end.search(h)
        end_index = course_info_comments_end.start()

        h = h[start_index:end_index]
        # print h

        # get subject name
        subj = find_key('ColCatHdrSubject', h)

        CourseID_indexes = []
        for m in re.finditer("""\<!-- \"CourseID\"--\>""", h):
            CourseID_indexes.append(m.start())

        c = len(CourseID_indexes)
        for i, CourseID in enumerate(CourseID_indexes):
            this_course_index = CourseID
            if (i <= c - 2):
                next_course_index = CourseID_indexes[i + 1]
                this_course = h[this_course_index:next_course_index]
            else:
                this_course = h[this_course_index:]

            course_code = find_key("CourseID", this_course)
            if ' ' in course_code:
                course_code = course_code.replace(' ', '')

            course_name = find_key("CourseTitle", this_course)
            college_name = find_key("College", this_course)
            dept_name = find_key("Dept", this_course)
            credit_str = find_key("Credit", this_course)
            subject_desc = find_key("SubjDesc", this_course)
            desc = ''.join(find_all_keys("ItemLine", this_course))

            if desc.find(course_name) == 0:
                desc = desc.split(course_name, 1)[1].strip()
                # also, remove until the first period
                desc = desc.split('.', 1)[1].strip()

            credits = {}

            if ('to' in credit_str):
                credits_arr = credit_str.split('to')
                credits['max'] = float(credits_arr[1].strip())
                credits['min'] = float(credits_arr[0].strip())
            else:
                credits['exactly'] = float(credit_str.strip())

            course = {
                "code": course_code,
                "name": course_name,
                "desc": desc,
                "college": college_name,
                "department": dept_name,
                "credits": credits,
                "subject": subj,
                "subjectdesc": subject_desc
            }

            if debug: print course

    finally:
        driver.find_element_by_xpath('html/body/div[3]/form/div[2]/span/a').click()
        time.sleep(2)


print "Finished scraping %s's courses." % (latech.name)