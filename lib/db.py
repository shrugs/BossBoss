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

    def jsonify(self):
        return {
            'DeptID': self.DeptID,
            'Dept': self.Dept
        }

class Subject(OCModel):
    SubjectID = CharField(primary_key=True)
    Subject = CharField(150)

    def jsonify(self):
        return {
            'SubjectID': self.SubjectID,
            'Subject': self.Subject
        }

class College(OCModel):
    CollegeID = PrimaryKeyField(primary_key=True, auto_increment=True)
    College = CharField(100)
    def jsonify(self):
        return {
            'CollegeID': self.CollegeID,
            'College': self.College
        }

class Term(OCModel):
    TermID = PrimaryKeyField(primary_key=True, auto_increment=True)
    Quarter = CharField()
    Year = IntegerField()

    def jsonify(self):
        return {
            'TermID': self.TermID,
            'Quarter': self.Quarter,
            'Year': self.Year
        }


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

    def jsonify(self, n=[]):
        return {
            'CourseID': self.CourseID if 'CourseID' not in n else None,
            'Course': self.Course if 'Course' not in n else None,
            'College': self.College if 'College' not in n else None,
            'CourseCode': self.CourseCode if 'CourseCode' not in n else None,
            'CreditsMax': self.CreditsMax if 'CreditsMax' not in n else None,
            'CreditsMin': self.CreditsMin if 'CreditsMin' not in n else None,
            'Description': self.Description if 'Description' not in n else None,
            'Dept': self.Dept if 'Dept' not in n else None,
            'Subject': self.Subject if 'Subject' not in n else None,
            # 'Term': self.Term,
            'TSAdded': self.TSAdded if 'TSAdded' not in n else None
        }

class Teacher(OCModel):
    TeacherID = PrimaryKeyField(primary_key=True, auto_increment=True)
    Name = CharField()
    Website = TextField(null=True)
    College = ForeignKeyField(College, related_name='Teachers')

    def jsonify(self, n=[]):
        return {
            'TeacherID': self.TeacherID if 'TeacherID' not in n else None,
            'Name': self.Name if 'Name' not in n else None,
            'Website': self.Website if 'Website' not in n else None,
            'College': self.College if 'College' not in n else None
        }

class Building(OCModel):
    BuildingID = PrimaryKeyField(primary_key=True, auto_increment=True)
    Name = CharField()
    Description = TextField(default='')

    def jsonify(self):
        return {
            'BuildingID': self.BuildingID,
            'Name': self.Name,
            'Description': self.Description
        }


class Room(OCModel):
    RoomID = PrimaryKeyField(primary_key=True, auto_increment=True)
    RoomNum = CharField()
    Building = ForeignKeyField(Building, related_name='Rooms')

    def jsonify(self):
        return {
            'RoomID': self.RoomID,
            'RoomNum': self.RoomNum,
            'Building': self.Building,
        }

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

    def jsonify(self, n=[]):
        return {
            'ClassID': self.ClassID if 'ClassID' not in n else None,
            'SectionID': self.SectionID if 'SectionID' not in n else None,
            'CallNum': self.CallNum if 'CallNum' not in n else None,
            'Course': self.Course if 'Course' not in n else None,
            'Days': self.Days if 'Days' not in n else None,
            'TimeStart': self.TimeStart if 'TimeStart' not in n else None,
            'TimeEnd': self.TimeEnd if 'TimeEnd' not in n else None,
            'ClassType': self.ClassType if 'ClassType' not in n else None,
            'Building': self.Building if 'Building' not in n else None,
            'Room': self.Room if 'Room' not in n else None,
            'Teacher': self.Teacher if 'Teacher' not in n else None,
            'Term': self.Term if 'Term' not in n else None,
            'FromDate': self.FromDate if 'FromDate' not in n else None,
            'ToDate': self.ToDate if 'ToDate' not in n else None,
            'TSAdded': self.TSAdded if 'TSAdded' not in n else None
        }