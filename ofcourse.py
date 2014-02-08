from flask import Flask, render_template, request, make_response, current_app, jsonify, url_for
import json, re
from datetime import timedelta
from functools import update_wrapper

from lib.db import *
# from flask_peewee.rest import RestAPI, RestResource

# from flask_peewee.auth import Auth
# from flask_peewee.db import Database

def crossdomain(origin=None, methods=None, headers=None, max_age=21600, attach_to_all=True, automatic_options=True):
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


@app.route('/')
def index():
    return "Hello World"


def getTerm(term):
    # get term passed by api or
    try:
        return Term.get((Term.Quarter==term.split('-')[0]) & (Term.Year==int(term.split('-')[1])))
    except:
        return Term.select().order_by(Term.StartDate.desc()).limit(1).get()

def isNum(str):
    try:
        int(str)
        return True
    except ValueError:
        return False

def isCourseCode(str):
    return str == re.search('\w+-\w+', str)


@app.route('/api/1/pending', methods=['GET', 'POST', 'OPTIONS'])
@app.route('/api/1/pending/<int:pendingID>/', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
@crossdomain(origin='*', headers=['Origin', 'X-Requested-With', 'Content-Type', 'Accept'])
def test(pendingID=None):
    pass

@app.route('/api/1/default/<term>', methods=['GET', 'OPTIONS'])
def default(term=''):
    r = []

    t = getTerm(term)

    for c in Course.select().where((Course.Term==t) & (Course.College==College.get(College.CollegeID==5))).limit(10):
        r.append(c.jsonify())

    return json.dumps(r)

@app.route('/api/1/search/', methods=['GET', 'OPTIONS'])
def search():
    q = request.args.get('q', '')
    if q == '':
        return default()
    else:
        r = []
        if isNum(q):
            # is num, query CourseCodes
            for c in Course.select().where(Course.CourseCode ** ('%-'+q)).limit(50):
                r.append(c.jsonify())

            for c in Class.select().where(Class.CallNum == int(q)).limit(2):
                r.append(c.Course.jsonify())

            return json.dumps(r)

        else:
            q = '%'+q+'%'
            # is string, check for CourseCode
            if isCourseCode(q):
                for c in Course.select().where(Course.CourseCode ** q).limit(50):
                    r.append(c.jsonify())

                return json.dumps(r)
            else:
                # search CourseCodes, teachers, and Subject and descriptions

                # SUBJECTS
                for s in Subject.select().where((Subject.Subject ** q)).limit(2):
                    for c in s.Courses.limit(10):
                        r.append(c.jsonify())

                # COURSE NAMES
                for c in Course.select().where(Course.Course ** q).limit(10):
                    r.append(c.jsonify())

                # COURSE CODES
                for c in Course.select().where(Course.CourseCode ** q).limit(20):
                    r.append(c.jsonify())

                # TEACHERS
                for t in Teacher.select().where((Teacher.Name ** q)).limit(10):
                    for c in t.Classes:
                        r.append(c.Course.jsonify())


                # DESCS
                for c in Course.select().where(Course.Description ** q).limit(20):
                    r.append(c.jsonify())

                return json.dumps(r[:20])


@app.route('/api/1/classes/', methods=['GET', 'OPTIONS'])
def classes():
    courseCodes = request.args.getlist('courseCodes')
    print courseCodes
    if len(courseCodes) == 0:
        return json.dumps([])
    else:
        r = []
        for c in Course.select().where(Course.CourseCode << courseCodes).limit(20):
            for cl in c.Classes:
                r.append(cl.jsonify())

        return json.dumps(r)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081, debug=True)
