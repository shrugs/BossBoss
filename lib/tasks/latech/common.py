import re
import os

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
    r = []
    for subs in m:
        r.append(subs.group('value'))
    return r


def select_and_submit(d, value):
    d.find_element_by_css_selector("option[value='%s']" % value).click()
    d.find_element_by_css_selector("input[type='submit']").click()


def get_short_name():
    full_path = os.path.dirname(os.path.realpath(__file__))
    return full_path.split('/')[-1]

def get_driver(debug):
    driver = webdriver.Firefox() if debug else webdriver.PhantomJS()
    driver.set_window_size(1024, 768)
    return driver

def get_debug():
    return True if os.environ['BB_DEBUG'] else False