from peewee import *
from info import *
import json


# @TODO(Shrugs) this code could be better with multi-column indexes and primary keys or something
db = MySQLDatabase(db_name, user=db_user, passwd=db_pass, host=db_host)


class BaseModel(Model):

    class Meta:
        database = db


class School(BaseModel):
    name = CharField()
    shortname = CharField()
    location = CharField()


class Term(BaseModel):
    name = CharField()     # Fall 2014
    key = CharField()      # 2014f, for example
    season = CharField()   # Fall
    year = IntegerField()  # 2014

    school = ForeignKeyField(School, related_name='terms')


class College(BaseModel):
    name = CharField()  # College of Engineering

    school = ForeignKeyField(School, related_name='colleges')


class Department(BaseModel):
    name = CharField()  # Computer Science

    college = ForeignKeyField(College, related_name='departments')


class Subject(BaseModel):
    name = CharField()            # Mathematics
    code = CharField()            # MATH
    desc = TextField(default='')  # whatever

    department = ForeignKeyField(Department, related_name='subjects')
    # I hate to mess up my perfect structure, but I need it for queries
    school = ForeignKeyField(School, related_name='subjects')


class Campus(BaseModel):
    name = CharField()                # South Campus
    location = TextField(default='')  # Coordinates?

    school = ForeignKeyField(School, related_name='campuses')


class Course(BaseModel):
    name = CharField()                             # Princ Of Financial Accounting
    code = CharField()                             # ACCT-201
    credits = TextField(default='{}')              # {min: num, max: num, exactly: num}
    desc = TextField(null=True, default=None)      # blah blah
    notes = TextField(null=True, default=None)     # signature needed, etc
    activity = CharField(null=True, default=None)  # Lecture (or Lab)

    subject = ForeignKeyField(Subject, related_name='courses')


class Teacher(BaseModel):
    name = CharField()                                        # SWANBOM M
    website = CharField(null=True)                            # idk
    rmp_id = CharField(null=True, default=None)               # 13132
    rmp_name = CharField(null=True, default=None)             # Michael Swanbom
    rmp_quality = IntegerField(null=True, default=None)       # 42 (/10)
    rmp_helpfulness = IntegerField(null=True, default=None)   # 48 (/10)
    rmp_clarity = IntegerField(null=True, default=None)       # 38 (/10)
    rmp_easiness = IntegerField(null=True, default=None)      # 3.8 (/10)
    rmp_hotness = BooleanField(null=True, default=None)       # True/False

    school = ForeignKeyField(School, related_name='teachers')


class Building(BaseModel):
    name = CharField()           # Lambright Sports Center
    shortname = CharField(null=True, default=None)  #Lambright
    desc = TextField(null=True, default=None)  # Sport Center with blah blah

    campus = ForeignKeyField(Campus, related_name='buildings')


class Room(BaseModel):
    name = CharField()  # 202A

    building = ForeignKeyField(Building, related_name='rooms')


class Class(BaseModel):
    section = CharField()            # 001
    callnum = CharField()            # 12345
    seats_status = CharField()       # Open/Closed
    seats_max = IntegerField(null=True, default=None)       # 40
    seats_available = IntegerField(null=True, default=None)  # 11
    session = CharField()            # Normal Academic Term
    times = TextField(default='{}')  # {"S": {start: "<time>", end: "<time>"}, "M": {start: "<time>", end: "<time>"}}
    date_from = DateTimeField(null=True, default=None)      # When the class is offered from.
    date_to = DateTimeField(null=True, default=None)        # When the class stops being offered.
    is_www = BooleanField(default=False)
    is_credit_exam = BooleanField(default=False)

    course = ForeignKeyField(Course, related_name='classes')
    term = ForeignKeyField(Term, related_name='classes')
    room = ForeignKeyField(Room, related_name='classes')
    teacher = ForeignKeyField(Teacher, related_name='classes')


def create_tables():
    for obj in [School, Term, College, Department, Subject, Campus, Course, Teacher, Building, Room, Class]:
        try:
            obj.create_table()
        except OperationalError:
            print "Table for %s already exists." % (obj)


def drop_tables(ex):
    tables = [School, Term, College, Department, Subject, Campus, Course, Teacher, Building, Room, Class]
    db.drop_tables(list(set(tables).difference([eval(e) for e in ex])))


if __name__ == '__main__':
    import sys

    if sys.argv[1] == 'create':
        create_tables()
        print "Created tables."
    elif sys.argv[1] == 'drop':
        drop_tables(sys.argv[2:])
        print "Dropped tables."
    elif sys.argv[1] == 'reset':
        drop_tables(sys.argv[2:])
        create_tables()
        print "Dropped and then created tables."
