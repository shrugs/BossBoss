from selenium import webdriver
import time

driver = webdriver.Firefox()

driver.get("http://boss.latech.edu")

catalog = driver.find_element_by_xpath("html/body/table/tbody/tr[5]/td/table/tbody/tr/td[1]/table/tbody/tr/td[1]/div/a[11]")
catalog_href = catalog.get_attribute('href')
catalog.click()

time.sleep(2)

# submit = driver.find_element_by_css_selector('input[name="submitbutton"]')
# submit.click()

# time.sleep(2)


with open('subjects.txt') as f:
    subjects = f.readlines()

# for each option, load that page, then save the html to a file based on the option name
# then .get(catalog_href)
for subject in subjects:
    val = subject.rstrip()
    print val
    try:
       open(val + '.html', 'r')
       print "skipping: " + val
       continue
    except IOError:
       pass


    print "option[value='"+ val +"']"
    driver.find_element_by_css_selector("option[value='"+ val +"']").click()

    driver.find_element_by_css_selector("input[type='submit']").click()

    time.sleep(2)

    try:
        error = driver.find_element_by_css_selector(".errortext")
    except:
        # now save file
        myFile = open('courses/' + val + ".html",'w')
        myFile.write((driver.page_source).encode('utf-8'))
        myFile.close()


    driver.get(catalog_href)

    time.sleep(2)
