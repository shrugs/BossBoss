from selenium import webdriver
from pymongo import MongoClient
import time
import re
import os

debug = True if os.environ['BB_DEBUG'] else False


def find_key(key, text):
    new_re = '\<!-- \"' + key + '\"-->\n\<!-- \"(?P<value>.+)\"--\>'
    m = re.search(new_re, text)
    if (m):
        return m.group('value').strip()
    else:
        return ""


def find_all_keys(key, text):
    new_re = '\<!-- \"' + key + '\"-->\n\<!-- \"(?P<value>.+)\"--\>'
    m = re.finditer(new_re, text)
    s = ""
    for subs in m:
        s += subs.group('value') + " "

    return s


def select_and_submit(d, value):
    d.find_element_by_css_selector("option[value='%s']" % value).click()
    d.find_element_by_css_selector("input[type='submit']").click()


driver = webdriver.Firefox() if debug else webdriver.PhantomJS()
driver.set_window_size(1024, 768)

driver.get("http://boss.latech.edu")

# GET COURSES FIRST
catalog = driver.find_element_by_xpath("html/body/table/tbody/tr[5]/td/table/tbody/tr/td[1]/table/tbody/tr/td[1]/div/a[11]").get_attribute('href').click()
time.sleep(2)

all_courses_select = driver.find_elements_by_tag_name()
all_courses = [x.get_attribute("value") for x in all_courses_select.find_elements_by_tag_name("option")]

for course in all_courses:
    # for each course, select it and then do something cool
    select_and_submit(driver, course)
    time.sleep(1)

    try:
        error = driver.find_element_by_css_selector(".errortext")
        driver.find_element_by_xpath('html/body/div[3]/form/div[2]/span/a').click()
        continue
    except:
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
                # print str(this_course_index) + "->" + str(next_course_index) + "\n"
            else:
                this_course = h[this_course_index:]
                print "FINAL\n"

            # print this_course
            # print "\n\n"
            CourseCode = find_key("CourseID", this_course)
            if ' ' in CourseCode:
                CourseCode = CourseCode.replace(' ', '')

            CourseName = find_key("CourseTitle", this_course)
            College_str = find_key("College", this_course)
            Department_str = find_key("Dept", this_course)
            Credit = find_key("Credit", this_course)
            CourseCtr = find_key("CourseCtr", this_course)
            SubjectDescription = find_key("SubjDesc", this_course)
            Description = find_all_keys("ItemLine", this_course)

            if ('to' in Credit):
                cred = Credit.split('to')
                CreditsMax = float(cred[1].strip())
                CreditsMin = float(cred[0].strip())
            else:
                CreditsMin = float(Credit.strip())
                CreditsMax = CreditsMin

            course = {
                "code": CourseCode,
                "name": CourseName,
                "college": College_str,
                "dept": Department_str,
                "credit": {
                    "min": CreditsMin,
                    "max": CreditsMax
                },
                "desc": SubjectDescription,
                "major": SubjectDescription
            }

            # fuck it, SQLAlchemy for this bullshit


# NOW GET CLASSES
driver.get("http://boss.latech.edu")

catalog = driver.find_element_by_xpath("html/body/table/tbody/tr[5]/td/table/tbody/tr/td[1]/table/tbody/tr/td[1]/div/a[9]").get_attribute('href').click()
# @TODO(Shrugs) make this sleep shit a little more intelligent
time.sleep(1)

# select the most recent quarter
submit = driver.find_element_by_css_selector('input[name="submitbutton"]')
this_semester = driver.find_element_by_css_selector('select[name="Term"]').find_elements_by_tag_name("option").get_attribute("value")
submit.click()

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
