from db import *

Department.create_table()
Subject.create_table()
College.create_table()
Term.create_table()
Course.create_table()
Teacher.create_table()
Building.create_table()
Room.create_table()
Class.create_table()

Term.create(Quarter='Spring', Year=2014)