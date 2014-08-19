# pylint: disable-msg=C0103

import time
import json
import re
from selenium.common.exceptions import NoSuchElementException
from .common import find_key, find_all_keys, select_and_submit, get_short_name, get_driver, get_debug, remove_dupe_space
from ..db import School, College, Department, Subject, Course

# VARS
debug = get_debug()
shortname = get_short_name()

# get School DB object
latech = School.get(
    (School.shortname == shortname)
)

# init driver
driver = get_driver(debug)
driver.get("http://boss.latech.edu")

# course catalog
catalog = driver.find_element_by_xpath("html/body/table/tbody/tr[5]/td/table/tbody/tr/td[1]/table/tbody/tr/td[1]/div/a[11]").click()
time.sleep(1)

# get a list of all of the subject keys
all_subjects_select = driver.find_element_by_css_selector("select[name='Subject']")
subjects = [(x.get_attribute("value"), x.text.strip()) for x in all_subjects_select.find_elements_by_tag_name("option")]

for subject, subject_name in subjects:
    # loop through all of the subjects
    print "Scraping %s (%s)..." % (subject, subject_name)
    select_and_submit(driver, subject)
    time.sleep(1)

    try:
        error = driver.find_element_by_css_selector(".errortext")
    except NoSuchElementException:
        # good, get metadata about courses
        h = driver.page_source
        re_course_info_comments_start = re.compile("""\<!-- \"\"-->\n<!-- \"\"--\>""")
        course_info_comments_start = re_course_info_comments_start.search(h)
        start_index = course_info_comments_start.start()

        re_course_info_comments_end = re.compile("""\<!-- Campus pipeline not enabled-->""")
        course_info_comments_end = re_course_info_comments_end.search(h)
        end_index = course_info_comments_end.start()

        h = h[start_index:end_index]

        CourseID_indexes = []
        for m in re.finditer("""\<!-- \"CourseID\"--\>""", h):
            CourseID_indexes.append(m.start())

        c = len(CourseID_indexes)
        for i, CourseID in enumerate(CourseID_indexes):
            this_course_index = CourseID
            if i <= c - 2:
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
            desc = ' '.join(find_all_keys("ItemLine", this_course))

            if desc.find(course_name) == 0:
                desc = desc.split(course_name, 1)[1].strip()
                # also, remove until the first period
                desc = desc.split('.', 1)[1].strip()

            desc = remove_dupe_space(desc)
            course_name = course_name.title()

            credits_obj = {}

            if 'to' in credit_str:
                credits_arr = credit_str.split('to')
                credits_obj['max'] = float(credits_arr[1].strip())
                credits_obj['min'] = float(credits_arr[0].strip())
            else:
                credits_obj['exactly'] = float(credit_str.strip())

            credits_str = json.dumps(credits_obj)

            course = {
                "name": course_name,
                "code": course_code,
                "credits": credits_str,
                "desc": desc,
                "college": college_name,
                "department": dept_name,
                "subject": subject_name,
            }

            # COLLEGE
            try:
                db_college = College.get(
                    (College.name == college_name)
                )
            except College.DoesNotExist:
                db_college = College.create(
                    name=college_name,
                    school=latech
                )

            try:
                db_dept = Department.get(
                    (Department.name == dept_name),
                    (Department.college == db_college)
                )
            except Department.DoesNotExist:
                db_dept = Department.create(
                    name=dept_name,
                    college=db_college
                )

            try:
                db_subject = Subject.get(
                    (Subject.name == subject_name),
                    (Subject.code == subject),
                    (Subject.department == db_dept),
                    (Subject.school == latech)
                )
            except Subject.DoesNotExist:
                db_subject = Subject.create(
                    name=subject_name,
                    code=subject,
                    department=db_dept,
                    school=latech
                )

            try:
                db_course = Course.get(
                    (Course.code == course_code),
                    (Course.subject == db_subject)
                )
            except Course.DoesNotExist:
                db_course = Course.create(
                    name=course_name,
                    code=course_code,
                    credits=credits_str,
                    desc=desc,
                    subject=db_subject
                )

            db_course.name = course_name
            db_course.credits = credits_str
            db_course.desc = desc
            db_course.save()

            # if debug: print course

    finally:
        driver.find_element_by_xpath('html/body/div[3]/form/div[2]/span/a').click()
        time.sleep(1)

driver.close()
print "Finished scraping %s's courses." % (latech.name)
