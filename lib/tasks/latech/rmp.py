import requests
from bs4 import BeautifulSoup as BS
import urllib

from .common import get_debug, remove_dupe_space
from ..db import Teacher

RMP_SEARCH_ENDPOINT = 'http://search.mtvnservices.com/typeahead/suggest/'
RMP_SEARCH_PARAMS = {
    'solrformat': 'true',
    'rows': '10',
    'q': '',
    'limit': '10',
    'siteName': 'rmp',
    'fq': 'content_type_s%3ATEACHER'
}
RMP_TEACHER_PAGE_URL = 'http://www.ratemyprofessors.com/ShowRatings.jsp'


# for each teacher, create or update their rmp rating
# initially need to find their tid via private api

# after we have their tid, go directly to their page and scrape values with bs4

for teacher in Teacher.select():
    if not teacher.rmp_id:
        RMP_SEARCH_PARAMS['q'] = teacher.name
        r = requests.get(RMP_SEARCH_ENDPOINT, params=RMP_SEARCH_PARAMS)
        try:
            r = r.json()
        except ValueError:
            print r.text
            continue

        possible_teachers = r['response']['docs']
        # filter for teachers at latech
        possible_teachers = [t for t in possible_teachers if t['schoolname_s'] == 'Louisiana Tech University']

        if len(possible_teachers) == 0:
            # no teachers at latech :(
            print 'No RMP for %s' % teacher.name
            continue
        elif len(possible_teachers) == 1:
            teacher.rmp_id = possible_teachers[0]['pk_id']
            teacher.rmp_name = possible_teachers[0]['teacherfullname_s']
        elif len(possible_teachers) > 1:
            # prompt me for choice, I suppose
            print possible_teachers
            i = int(raw_input('Choose the index of the correct teacher.'))
            teacher.rmp_id = possible_teachers[i]['pk_id']
            teacher.rmp_name = possible_teachers[i]['teacherfullname_s']

    # cool, now we have correct id
    # refresh values in database
    teacher_page = requests.get(RMP_TEACHER_PAGE_URL, params={'tid': teacher.rmp_id}).text

    soup = BS(teacher_page)
    teacher.rmp_quality = int(float(soup.find(id='quality').strong.text) * 10)
    teacher.rmp_helpfulness = int(float(soup.find(id='helpfulness').strong.text) * 10)
    teacher.rmp_clarity = int(float(soup.find(id='clarity').strong.text) * 10)
    teacher.rmp_easiness = int(float(soup.find(id='easiness').strong.text) * 10)
    # teacher.rmp_hotness = int(soup.find(id='hot').strong.text)

    teacher.save()
