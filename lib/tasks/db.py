from peewee import *
from info import *

db = MySQLDatabase(db_name, user=db_user, passwd=db_pass, host=db_host)


class BaseModel(Model):
    class Meta:
        database = db


class School(BaseModel):
    name = CharField()
    location = CharField()


class Term(BaseModel):
    term = CharField()
    year = IntegerField()

    school = ForeignKeyField(School, related_name='terms')


class College(BaseModel):
    name = CharField()


class Department(BaseModel):
    name = CharField()


class Subject(BaseModel):
    name = CharField()


class Campus(BaseModel):
    name = CharField()
    location = TextField()


class Course(BaseModel):
    name = CharField()
    code = CharField()
    credits = TextField()
    desc = TextField()

    department = ForeignKeyField(Department, related_name='courses')
    college = ForeignKeyField(College, related_name='courses')
    subject = ForeignKeyField(Subject, related_name='courses')
    term = ForeignKeyField(Term, related_name='courses')


class Teacher(BaseModel):
    name = CharField()
    website = CharField()


class Building(BaseModel):
    name = CharField()
    desc = TextField()

    campus = ForeignKeyField(Campus, related_name='buildings')


class Room(BaseModel):
    name = CharField()

    building = ForeignKeyField(Building, related_name='rooms')


class Class(BaseModel):
    section = CharField()
    callnum = CharField()
    activity = CharField()
    seats_max = IntegerField()
    seats_available = IntegerField()
    time = TextField()
    date_from = DateTimeField()
    date_to = DateTimeField()

    course = ForeignKeyField(Course, related_name='classes')


def create_tables():
    db.create_tables([School, Term, College, Department, Subject, Campus, Course, Teacher, Building, Room, Class])


def drop_tables():
    db.drop_tables([School, Term, College, Department, Subject, Campus, Course, Teacher, Building, Room, Class])


if __name__ == '__main__':
    import sys

    if sys.argv[1] == 'create':
        create_tables()
    elif sys.argv[1] == 'drop':
        drop_tables()
