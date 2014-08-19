# pylint: disable-msg=C0103

import time
import sys
import re
import datetime
import json

from selenium.common.exceptions import NoSuchElementException
from .common import find_key, find_all_keys, select_and_submit, get_short_name, get_driver, get_debug, remove_dupe_space, normalize
from ..db import School, Term, Course, College, Department, Subject, Campus, Course, Teacher, Building, Room, Class

# VARS
debug = get_debug()
term_key = None
if len(sys.argv) >= 2:
    term_key = sys.argv[1]
shortname = get_short_name()

# get school from DB; must be in here before hand
latech = School.get(
    (School.shortname == shortname)
)

# create driver and navigate to BOSS
driver = get_driver(debug)
driver.get("http://boss.latech.edu")

# go to the "Available Course Offerings" tab
course_offerings = driver.find_element_by_xpath("html/body/table/tbody/tr[5]/td/table/tbody/tr/td[1]/table/tbody/tr/td[1]/div/a[9]")
course_offerings_href = course_offerings.get_attribute("href")
course_offerings.click()
# @TODO(Shrugs) make this sleep shit a little more intelligent
time.sleep(1)

# @TODO(Shrugs) create all the terms in the database after this
term_select = driver.find_element_by_css_selector('select[name="Term"]')
terms = [(t.get_attribute("value"), t.text.strip()) for t in term_select.find_elements_by_tag_name("option")]

if not term_key:
    term_key = terms[0][0]

# Create all terms if not exist
for (term, term_name) in terms:
    try:
        db_term = Term.get(
            Term.key == term,
            Term.name == term_name,
            Term.school == latech
        )
    except Term.DoesNotExist:
        db_term = Term.create(
            key=term,
            name=term_name,
            season=term_name.split(' ')[0].lower(),
            year=int(term_name.split(' ')[1]),
            school=latech
        )

term = Term.get(Term.key == term_key, Term.school == latech)
# select this term and submit
select_and_submit(driver, term.key)

time.sleep(1)

subjects_select = driver.find_element_by_css_selector('select[name="Subject"]')
subjects = [x.get_attribute("value") for x in subjects_select.find_elements_by_tag_name("option")]

for subject in subjects:
    # for each subject, select it and then do some stuff
    select_and_submit(driver, subject)

    time.sleep(1)

    course_select = driver.find_element_by_css_selector("select[name='CourseID']")
    courses = [x.get_attribute("value") for x in course_select.find_elements_by_tag_name("option")]

    for course in courses:
        # for each course, select it and then do something cool
        select_and_submit(driver, course)
        time.sleep(1)

        try:
            error = driver.find_element_by_css_selector(".errortext")
        except NoSuchElementException:
            # good
            h = driver.page_source
            re_course_info_comments_start = re.compile("""TermCode""")
            course_info_comments_start = re_course_info_comments_start.search(h)
            start_index = course_info_comments_start.start()

            # <!-- Campus pipeline not enabled-->
            re_course_info_comments_end = re.compile("""!-- Campus pipeline not enabled--""")
            course_info_comments_end = re_course_info_comments_end.search(h)
            end_index = course_info_comments_end.start()

            h = h[start_index:end_index]

            class_id_indexes = []
            for m in re.finditer("""\<!-- \"CrsID\"--\>""", h):
                class_id_indexes.append(m.start())

            c = len(class_id_indexes)
            for i, this_class_index in enumerate(class_id_indexes):
                # for each CourseID, grab its value and the next on
                if i <= c - 2:
                    next_class_index = class_id_indexes[i + 1]
                    this_class = h[this_class_index:next_class_index]
                else:
                    this_class = h[this_class_index:]

                course_code = find_key('CrsID', this_class).strip().replace(' ', '')
                if course_code == '':
                    continue

                subject_code = course_code.split('-')[0]
                section = find_key('SectionID', this_class).replace(' ', '').strip().split('-')[2]
                callnum = find_key('Callnum', this_class)
                activity = find_key('ActType', this_class)
                days = find_key('Days', this_class)
                time_str = find_key('Time', this_class)

                times = {}

                if 'arrange' in time_str.lower():
                    times = {
                        "info": "To be Arranged"
                    }
                elif time_str != '':
                    if '\n' in time_str:
                        print time_str
                        import pdb
                        pdb.set_trace()
                        # @TODO(Shrugs) handle classes with multiple times on multiple days
                        # seems to be delimited by \n
                    else:
                        time_start, time_end = time_str.split('-')
                        time_start += 'AM' if (7 < int(time_start[:2]) < 12) else 'PM'
                        time_start = time.strftime('%H:%M', time.strptime(time_start, '%I:%M%p'))
                        try:
                            time_end = time.strftime('%H:%M', time.strptime(time_end, '%I:%M%p'))
                        except ValueError:
                            time_end = ''

                        for day in days:
                            times[day] = {
                                "start": time_start,
                                "end": time_end
                            }
                else:
                    times = {
                        "info": "Unknown time"
                    }

                times = json.dumps(times)

                seats_status = normalize(find_key('Status', this_class))

                seats_available = find_key('SeatAvail', this_class)
                seats_available = int(seats_available) if seats_available != '' else 0

                seats_max = find_key('SeatEnroll', this_class)
                seats_max = int(seats_max) if seats_max != '' else 0

                if 'open' in seats_status.lower() and seats_available == 0 and seats_max == 0:
                    # we need to parse it out because they're incompetent
                    open_re = '^Open - (?P<available>.+) of (?P<max>.+)$'
                    m = re.search(open_re, seats_status)
                    if m:
                        seats_available = int(normalize(m.group('available')))
                        seats_max = int(normalize(m.group('max')))

                    seats_status = normalize(seats_status.split('-', 1)[0])

                course_notes = find_key('CourseNotes', this_class).replace('<br />', ', ')
                course_notes = normalize(course_notes)
                session = normalize(find_key('Sess', this_class))
                campus_name = normalize(find_key('Site', this_class))
                building_name = normalize(find_key('Building', this_class))
                room_name = normalize(find_key('Room', this_class))
                teacher_name = find_key('Instructor', this_class)
                building_name = normalize(find_key('Building', this_class))

                if '<br' in teacher_name:
                    teacher_name = teacher_name.split('<br')[0]

                teacher_name = normalize(teacher_name).title()

                try:
                    date_from = datetime.datetime.strptime(find_key('FromDate', this_class), '%m-%d-%y')
                except ValueError:
                    date_from = ''

                try:
                    date_to = datetime.datetime.strptime(find_key('ToDate', this_class)[3:], '%m-%d-%y')
                except ValueError:
                    date_to = ''

                # CAMPUS
                try:
                    db_campus = Campus.get(
                        (Campus.name == campus_name),
                        (Campus.school == latech)
                    )
                except Campus.DoesNotExist:
                    db_campus = Campus.create(
                        name=campus_name,
                        school=latech
                    )

                # BUILDING
                try:
                    db_building = Building.get(
                        (Building.name == building_name),
                        (Building.campus == db_campus)
                    )
                except Building.DoesNotExist:
                    db_building = Building.create(
                        name=building_name,
                        campus=db_campus
                    )

                # ROOM
                try:
                    db_room = Room.get(
                        (Room.name == room_name),
                        (Room.building == db_building)
                    )
                except Room.DoesNotExist:
                    db_room = Room.create(
                        name=room_name,
                        building=db_building
                    )

                # TEACHER
                try:
                    db_teacher = Teacher.get(
                        (Teacher.name == teacher_name),
                        (Teacher.school == latech)
                    )
                except Teacher.DoesNotExist:
                    db_teacher = Teacher.create(
                        name=teacher_name,
                        school=latech
                    )

                # SUBJECT
                try:
                    db_subject = Subject.get(
                        (Subject.code == subject_code),
                        (Subject.school == latech)
                    )
                except Subject.DoesNotExist, e:
                    print "ugh..."
                    print subject_code
                    raise e

                # COURSE
                try:
                    db_course = Course.get(
                        (Course.code == course_code),
                        (Course.subject == db_subject)
                    )
                except Course.DoesNotExist, e:
                    print "Fuck, the software they use is incompetent."
                    print course_code
                    continue

                if db_course.notes is None and course_notes is not '':
                    db_course.notes = course_notes
                    db_course.save()

                # CLASS
                try:
                    db_class = Class.get(
                        (Class.callnum == callnum),
                        (Class.course == db_course),
                        (Class.term == term)
                    )
                except Class.DoesNotExist:
                    db_class = Class.create(
                        section=section,
                        callnum=callnum,
                        activity=activity,
                        seats_status=seats_status,
                        seats_max=seats_max,
                        seats_available=seats_available,
                        session=session,
                        times=times,
                        date_from=date_from,
                        date_to=date_to,
                        course=db_course,
                        term=term,
                        room=db_room,
                        teacher=db_teacher
                    )

                # update relevant info in the event of a re-scrape
                db_class.section = section
                db_class.activity = activity
                db_class.seats_status = seats_status
                # @TODO(Shrugs) fix this, ideally
                # db_class.seats_max = seats_max
                # db_class.seats_available = seats_available,
                db_class.times = times
                db_class.date_from = date_from,
                db_class.date_to = date_to
                db_class.room = db_room
                db_class.save()

        finally:
            # return to course listing
            if course != courses[-1]:
                driver.find_element_by_xpath("html/body/div[3]/form/table[1]/tbody/tr/td/span/a[3]").click()
                time.sleep(1)

    # return to subject listing
    driver.find_element_by_xpath("html/body/div[3]/form/table[1]/tbody/tr/td/span/a[2]").click()
    time.sleep(1)


driver.close()