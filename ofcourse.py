
from flask import Flask, render_template, request, make_response, current_app, jsonify, url_for, send_file
import json, re
from datetime import timedelta
from functools import update_wrapper

from lib.db import *
# from flask_peewee.rest import RestAPI, RestResource

# from flask_peewee.auth import Auth
# from flask_peewee.db import Database


def crossdomain(origin='*', methods=None, headers=None, max_age=21600, attach_to_all=True, automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers
            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            h['Access-Control-Allow-Credentials'] = 'true'
            h['Access-Control-Allow-Headers'] = \
                "Origin, X-Requested-With, Content-Type, Accept, Authorization"
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator






app = Flask(__name__)



# auth = Auth(app, db)

# class PublicResource(RestResource):
#     paginate_by = 200


# api = RestAPI(app)
# api.register(User)
# api.register(Pending)
# api.register(Tag)
# api.register(PendingTags)
# api.setup()



def getTerm(term):
    # get term passed by api or
    try:
        return Term.get((Term.Quarter==term.split('-')[0]) & (Term.Year==int(term.split('-')[1])))
    except:
        return Term.get((Term.Quarter=='Fall') & (Term.Year==2014))

def isNum(str):
    try:
        int(str)
        return True
    except ValueError:
        return False

def isCourseCode(str):
    return str == re.search('\w+-\w+', str)



@app.route('/api/1/default/<term>', methods=['GET', 'OPTIONS'])
@crossdomain(origin='*', headers=['Origin', 'X-Requested-With', 'Content-Type', 'Accept'], methods=['GET', 'OPTIONS'])
def default(term=''):
    r = []

    t = getTerm(term)

    try:
        for c in Course.select().where((Course.Term==t) & (Course.CourseCode % 'ENGR-1%')).limit(10):
            r.append(c.jsonify())

        print "Returning default classes"
        return json.dumps(r)
    except Exception, e:
        print e
        exit(0)

@app.route('/api/1/search/', methods=['GET', 'OPTIONS'])
@crossdomain(origin='*', headers=['Origin', 'X-Requested-With', 'Content-Type', 'Accept'], methods=['GET', 'OPTIONS'])
def search():
    q = request.args.get('q', '')

    t = getTerm('Fall-2014')

    if q == '':
        return default()
    else:
        try:
            r = []
            if isNum(q):
                # is num, query CourseCodes
                print "is number, getting courseCodes"
                for c in Course.select().where((Course.CourseCode ** ('%-'+q)) & (Course.Term==t)).limit(50):
                    r.append(c.jsonify())

                for c in Class.select().where((Class.CallNum == int(q)) & (Class.Term==t)).limit(2):
                    r.append(c.Course.jsonify())

                print "returning courseCodes and callnumbers"
                return json.dumps(r)

            else:
                q = '%'+q+'%'
                # is string, check for CourseCode
                print "SEARCHING:", q
                if isCourseCode(q):
                    for c in Course.select().where((Course.CourseCode ** q) & (Course.Term==t)).limit(50):
                        r.append(c.jsonify())

                    print "Is course code, returning that class"
                    return json.dumps(r)
                else:
                    # search CourseCodes, teachers, and Subject and descriptions

                    print "get subjects"
                    # SUBJECTS
                    for s in Subject.select().where((Subject.Subject ** q)).limit(2):
                        for c in s.Courses.limit(10):
                            r.append(c.jsonify())

                    print "get courses"
                    # COURSE NAMES
                    for c in Course.select().where((Course.Course ** q) & (Course.Term==t)).limit(10):
                        r.append(c.jsonify())

                    print "get coursecodes"
                    # COURSE CODES
                    for c in Course.select().where((Course.CourseCode ** q) & (Course.Term==t)).limit(20):
                        r.append(c.jsonify())

                    print "get teachers"
                    # TEACHERS
                    for teach in Teacher.select().where((Teacher.Name ** q)).limit(10):
                        # for each teacher
                        for c in teach.Classes:
                            # for each class
                            if (c.Term == t):
                                r.append(c.Course.jsonify())

                    print "get descs"
                    # DESCS
                    for c in Course.select().where((Course.Description ** q) & (Course.Term==t)).limit(20):
                        r.append(c.jsonify())

                    print "returning the last 20"
                    if (len(r) > 20):
                            r = r[:20]
                    return json.dumps(r)

        except Exception, e:
            print e
            exit(0)

@app.route('/api/1/classes/', methods=['GET', 'OPTIONS'])
@app.route('/api/1/classes', methods=['GET', 'OPTIONS'])
@crossdomain(origin='*', headers=['Origin', 'X-Requested-With', 'Content-Type', 'Accept'], methods=['GET', 'OPTIONS'])
def classes():
    courseCodes = request.args.getlist('courseCodes')
    courseCodes = [str(c) for c in courseCodes]
    print courseCodes
    t = getTerm('Fall-2014');
    if len(courseCodes) == 0:
        return json.dumps([])
    else:
        r = []
        try:
            for i,c in enumerate(Course.select().where((Course.CourseCode << courseCodes) & (Course.Term == t)).limit(20)):
                r.append(c.jsonify())
                r[i]['Classes'] = []
                for cl in c.Classes:
                    r[i]['Classes'].append(cl.jsonify())

            return json.dumps(r)
        except Exception, e:
            print e
            exit(0)



@app.route('/')
@crossdomain(origin='*', headers=['Origin', 'X-Requested-With', 'Content-Type', 'Accept'], methods=['GET', 'OPTIONS'])
def index(path):
    return "Hello World"
#     # return make_response(open('templates/index.html').read())
#     # return send_file('templates/index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081, debug=True)