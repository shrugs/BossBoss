from flask import Flask, render_template, request, make_response, current_app
import json
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



@app.route('/api/1/pending', methods=['GET', 'POST', 'OPTIONS'])
@app.route('/api/1/pending/<int:pendingID>/', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
@crossdomain(origin='*', headers=['Origin', 'X-Requested-With', 'Content-Type', 'Accept'])
def pending(pendingID=None):
    pass


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)
