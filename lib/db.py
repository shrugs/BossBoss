from peewee import *
from info import *
import datetime

db = MySQLDatabase(db_name, user=db_user, passwd=db_pass, host=db_host)

class OCModel(Model):
    class Meta:
        database = db




class Department(OCModel):
    DeptID = PrimaryKeyField(primary_key=True, auto_increment=True)
    Dept = CharField(100)

class Subject(OCModel):
    SubjectID = CharField(primary_key=True)
    Subject = CharField(150)

class College(OCModel):
    CollegeID = PrimaryKeyField(primary_key=True, auto_increment=True)
    College = CharField(100)

class Term(OCModel):
    TermID = PrimaryKeyField(primary_key=True, auto_increment=True)
    Quarter = CharField()
    Year = IntegerField()


class Course(OCModel):
    CourseID = PrimaryKeyField(primary_key=True)
    Course = CharField(100)
    College = ForeignKeyField(College, related_name='Courses')
    CourseCode = CharField(20)
    CreditsMax = IntegerField()
    CreditsMin = IntegerField()
    Description = TextField()
    Dept = ForeignKeyField(Department, related_name='Courses')
    Subject = ForeignKeyField(Subject, related_name='Courses')
    Term = ForeignKeyField(Term, related_name='Courses')
    TSAdded = DateTimeField(default=datetime.datetime.now)

class Teacher(OCModel):
    TeacherID = PrimaryKeyField(primary_key=True, auto_increment=True)
    Name = CharField()
    Website = TextField(null=True)
    College = ForeignKeyField(College, related_name='Teachers')

class Building(OCModel):
    BuildingID = PrimaryKeyField(primary_key=True, auto_increment=True)
    Name = CharField()
    Description = TextField(default='')


class Room(OCModel):
    RoomID = PrimaryKeyField(primary_key=True, auto_increment=True)
    RoomNum = CharField()
    Building = ForeignKeyField(Building, related_name='Rooms')

class Class(OCModel):
    ClassID = PrimaryKeyField(primary_key=True, auto_increment=True)
    SectionID = CharField(5) # 001, 002, H01, etc
    CallNum = IntegerField() # 30234
    Course = ForeignKeyField(Course, related_name='Classes')
    Days = CharField(3)
    TimeStart = TimeField(null=True)
    TimeEnd = TimeField(null=True)
    ClassType = CharField() # Lecture/Lab
    Building = ForeignKeyField(Building, related_name='Classes')
    Room = ForeignKeyField(Room, related_name='Classes')
    Teacher = ForeignKeyField(Teacher, related_name='Classes')
    Term = ForeignKeyField(Term, related_name='Classes')
    FromDate = DateTimeField(null=True)
    ToDate = DateTimeField(null=True)
    TSAdded = DateTimeField(default=datetime.datetime.now)