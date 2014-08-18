from selenium import webdriver
import time
import os

debug = True if os.environ['BB_DEBUG'] else False

driver = webdriver.Firefox() if debug else webdriver.PhantomJS()
driver.set_window_size(1024, 768)

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
