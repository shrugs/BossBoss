import re

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
