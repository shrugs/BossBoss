
from .db import *
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
    s = ""
    for subs in m:
        s += subs.group('value') + " "

    return s


# Departments.create_table(True)
# Subjects.create_table(True)
# Colleges.create_table(True)
# Courses.create_table(True)

with open('subjects.txt') as f:
    subjects = f.readlines()

done = False

this_term = Term.get((Term.Quarter == 'Spring') & (Term.Year==2014))

for subject in subjects:
    if done:
        break
    subject = subject.rstrip()

    try:
        with open(subject + '.html') as h:
            h = h.read()
            print "PARSING: " + subject + "\n"
            # page = BS(h)
            if ("There is no information for the subject you have selected." in h):
                print "No information :(\n"
                continue

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

            try:
                db_subject = Subject.select().where(Subject.SubjectID == subject).get()
            except:
                db_subject = Subject.create(SubjectID=subject, Subject=subj)


            CourseID_indexes = []
            for m in re.finditer("""\<!-- \"CourseID\"--\>""", h):
                CourseID_indexes.append(m.start())

            print CourseID_indexes
            c = len(CourseID_indexes)
            for i, CourseID in enumerate(CourseID_indexes):
                # for each CourseID, grab its value and the next on
                this_course_index = CourseID
                if (i <= c-2):
                    next_course_index = CourseID_indexes[i+1]
                    this_course = h[this_course_index:next_course_index]
                    # print str(this_course_index) + "->" + str(next_course_index) + "\n"
                else:
                    this_course = h[this_course_index:]
                    print "FINAL\n"

                # print this_course
                # print "\n\n"
                CourseCode = find_key("CourseID", this_course)
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

                # DEPT
                try:
                    db_dept = Department.select().where(Department.Dept == Department).get()
                except:
                    db_dept = Department.create(Dept=Department_str)


                # COLLEGE
                try:
                    db_college = College.select().where(College.College == College).get()
                except:
                    db_college = College.create(College=College_str)

                # COURSE
                try:
                    db_course = Course.select().where(Course.CourseCode == CourseCode).get()
                except:
                    db_course = Course.create(CourseCode=CourseCode,
                                               Course=CourseName,
                                               College = db_college,
                                               CreditsMax=CreditsMax,
                                               CreditsMin=CreditsMin,
                                               Description=Description,
                                               Dept=db_dept,
                                               Subject=db_subject,
                                               Term=this_term)


                print "Course: " + CourseName


            # done = True
    except IOError:
        print "No content: " + subject
        pass