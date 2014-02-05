from selenium import webdriver
# from db import *
import time

driver = webdriver.Firefox()

driver.get("http://boss.latech.edu")

catalog = driver.find_element_by_xpath("html/body/table/tbody/tr[5]/td/table/tbody/tr/td[1]/table/tbody/tr/td[1]/div/a[9]")
catalog_href = catalog.get_attribute('href')
catalog.click()

time.sleep(2)


# select the most recent quarter
submit = driver.find_element_by_css_selector('input[name="submitbutton"]')
submit.click()

# this_term = Term.get((Term.Quarter=='Spring') & (Term.Year==2014))

time.sleep(2)


with open('subjects.txt') as f:
    subjects = f.readlines()

# for each option, load that page, then save the html to a file based on the option name
# then .get(catalog_href)
for subject in subjects:
    subject = subject.rstrip()
    print subject

    try:
        driver.find_element_by_css_selector("option[value='"+ subject +"']").click()
    except:
        continue

    driver.find_element_by_css_selector("input[type='submit']").click()

    time.sleep(2)

    # get a list of the courses available
    courses = []

    select_box = driver.find_element_by_css_selector("select[name='CourseID']")
    options = [x for x in select_box.find_elements_by_tag_name("option")]
    for element in options:
        courses.append(element.get_attribute("value"))

    for course in courses:
        # for each course, click on it and save that html
        try:
           open('classes/' + course + '.html', 'r')
           print "skipping: " + course
           continue
        except:
           pass


        driver.find_element_by_css_selector("option[value='"+ course +"']").click()

        driver.find_element_by_css_selector("input[type='submit']").click()

        try:
            error = driver.find_element_by_css_selector(".errortext")
        except:
            # now save file
            myFile = open('classes/' + course + ".html",'w')
            myFile.write((driver.page_source).encode('utf-8'))
            myFile.close()

        # go back to the course list
        driver.find_element_by_xpath("html/body/div[3]/form/table[1]/tbody/tr/td/span/a[3]").click()
        time.sleep(2)


    driver.get(catalog_href)
    time.sleep(2)
    submit = driver.find_element_by_css_selector('input[name="submitbutton"]')
    submit.click()
