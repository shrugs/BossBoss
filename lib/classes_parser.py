
from db import *
import re, glob, time, datetime, os, pdb

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
n = datetime.datetime.now()


this_term = Term.get((Term.Quarter == 'Spring') & (Term.Year==2014))
os.chdir('classes')
for course_code in glob.glob('*.html'):
    # print glob.glob('*.html')
    # try:
    h = ''
    with open(course_code) as s:
        h = s.read()

    # remove .html
    course_code = course_code[:-5]
    subject, courseID = course_code.split('-')

    re_course_info_comments_start = re.compile("""TermCode""")
    course_info_comments_start = re_course_info_comments_start.search(h)
    start_index = course_info_comments_start.start()

    # <!-- Campus pipeline not enabled-->
    re_course_info_comments_end = re.compile("""!-- Campus pipeline not enabled--""")
    course_info_comments_end = re_course_info_comments_end.search(h)
    end_index = course_info_comments_end.start()

    print start_index, end_index
    h = h[start_index:end_index]
    # print h

    try:
        db_subject = Subject.get(Subject.SubjectID == subject)
    except:
        # this should never happen
        raise Exception('UNKNOWN SUBJECT, SHIT SELF')
        db_subject = Subject.create(SubjectID=subject, Subject=subject)


    ClassID_Indexes = []
    for m in re.finditer("""\<!-- \"CrsID\"--\>""", h):
        ClassID_Indexes.append(m.start())

    # print ClassID_Indexes
    c = len(ClassID_Indexes)
    for i, this_class_index in enumerate(ClassID_Indexes):
        # for each CourseID, grab its value and the next on
        if (i <= c-2):
            next_course_index = ClassID_Indexes[i+1]
            this_class = h[this_class_index:next_course_index]
            # print str(this_class_index) + "->" + str(next_course_index) + "\n"
        else:
            this_class = h[this_class_index:]
            # print "FINAL\n"


        print course_code
        CrsID = find_key('CrsID', this_class)
        if CrsID == '':
            continue
        SectionID = find_key('SectionID', this_class).replace(' ', '').split('-')[2]
        CallNum = find_key('Callnum', this_class)
        ClassType = find_key('ActType', this_class)
        Days = find_key('Days', this_class)

        Time = find_key('Time', this_class)
        if Time != '' and Time != 'Arrange':
            TimeStart, TimeEnd = Time.split('-')
            TimeStart += 'AM' if (int(TimeStart[:2]) > 8) else 'PM'
            TimeStart = time.strftime('%H:%M', time.strptime(TimeStart, '%I:%M%p'))
            try:
                TimeEnd = time.strftime('%H:%M', time.strptime(TimeEnd, '%I:%M%p'))
            except ValueError:
                TimeEnd = ''
        else:
            TimeStart = ''
            TimeEnd = ''

        BuildingName = find_key('Building', this_class)
        RoomNum = find_key('Room', this_class)
        TeacherName = find_key('Instructor', this_class)
        if ('<br' in TeacherName):
            TeacherName = TeacherName.split('<br')[0]
        try:
            FromDate = datetime.datetime.strptime(find_key('FromDate', this_class), '%m-%d-%y')
        except ValueError:
            FromDate = ''

        try:
            ToDate = datetime.datetime.strptime(find_key('ToDate', this_class)[3:], '%m-%d-%y')
        except ValueError:
            ToDate = ''


        # BUILDING
        try:
            db_building = Building.get(Building.Name == BuildingName)
        except:
            db_building = Building.create(Name=BuildingName)

        # ROOM
        try:
            db_room = Room.get((Room.Building==db_building) & (Room.RoomNum==RoomNum))
        except:
            db_room = Room.create(Building=db_building, RoomNum=RoomNum)


        # COURSE
        try:
            db_course = Course.get(Course.CourseCode == course_code)
        except:
            # this should never happen
            pdb.set_trace()
            continue
            raise Exception('UNKNOWN COURSE, SHIT SELF')
            db_course = Course.create(CourseCode=course_code,
                                       Course=SectTitle,
                                       College = db_college,
                                       CreditsMax=CreditsMax,
                                       CreditsMin=CreditsMin,
                                       Description=Description,
                                       Dept=db_dept,
                                       Subject=db_subject,
                                       Term=this_term)

        # TEACHER
        try:
            db_teacher = Teacher.get(Teacher.Name == TeacherName)
        except:
            db_teacher = Teacher.create(Name=TeacherName, College=db_course.College)



        try:
            db_class = Class.get(((Class.Course==db_course) & (Class.SectionID == SectionID)) & (Class.Term == this_term))
        except:
            print "Subject: " + subject
            print "course_code" + course_code
            print "SectionID: " + SectionID
            print "CallNum: " + str(CallNum)
            print "db_course: " + db_course.Course
            print "Days: " + Days
            print "TimeStart: " + str(TimeStart)
            print "TimeEnd: " + str(TimeEnd)
            print "ClassType: " + ClassType
            print "db_building: " + db_building.Name
            print "db_room: " + str(db_room.RoomNum)
            print "db_teacher: " + db_teacher.Name
            print "FromDate: " + str(FromDate)
            print "ToDate: " + str(ToDate)

            db_class = Class.create(
                    SectionID=SectionID,
                    CallNum=CallNum,
                    Course=db_course,
                    Days=Days,
                    TimeStart=TimeStart,
                    TimeEnd=TimeEnd,
                    ClassType=ClassType,
                    Building=db_building,
                    Room=db_room,
                    Teacher=db_teacher,
                    Term=this_term,
                    FromDate=FromDate,
                    ToDate=ToDate
                )
            print '\n\n'


    # except Exception, e:
    #     print e