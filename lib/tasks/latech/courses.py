from selenium import webdriver
import time
import os
import sys
from common import *

if len(sys.argv) < 3:
    exit("Requires shortname and term")

debug = True if os.environ['BB_DEBUG'] else False
shortname = sys.argv[1] or 'latech'
term_key = sys.argv[2] or '2014f'


driver = webdriver.Firefox() if debug else webdriver.PhantomJS()
driver.set_window_size(1024, 768)

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
                "desc": desc
                "college": college_name,
                "department": dept_name,
                "credits": credits,
                "subject": subj,
                "subjectdesc": subject_desc
            }

            print course

    finally:
        driver.find_element_by_xpath('html/body/div[3]/form/div[2]/span/a').click()
        time.sleep(2)