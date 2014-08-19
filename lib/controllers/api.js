'use strict';

var q = require('q');

function wrap(str, w) {
    if (w === undefined) {
        w = '%';
    }
    return w + str + w;
}

module.exports = function(conn) {
    var api = {};

    api.schools = function(req, res) {
        conn.query('SELECT * FROM school', function(err, results) {
            return res.json(results);
        });
    };
    api.school = function(req, res) {
        conn.query('SELECT * FROM school WHERE id=? LIMIT 1', [req.params.sid], function(err, results) {
            if (results.length === 1) {
                return res.json(results[0]);
            }

            return res.json({
                error: 'No such school.'
            });
        });
    };
    api.terms = function(req, res) {
        conn.query('SELECT * FROM term WHERE school_id=?', [req.params.sid], function(err, results) {
            return res.json(results);
        });
    };
    api.term = function(req, res) {
        conn.query('SELECT * FROM term WHERE school_id=? AND id=? LIMIT 1', [req.params.sid, req.params.tid], function(err, results) {
            if (results.length ===1) {
                res.json(results[0]);
                return;
            }

            return res.json({
                // @TODO(Shrugs) grab school from db and give error a name
                error: 'No such term: ' + req.params.tid + ' for school: ' + req.params.sid + '.'
            });
        });
    };
    api.courses = function(req, res) {
        var sid = req.params.sid,
            tid = req.query.tid,
            q   = req.query.q;

        if (sid === undefined) {
            // the fuck?
            return res.json({
                error: "No school provided."
            });
        }

        if (tid === undefined) {
            // if no term, give all from school
            conn.query('SELECT course.* FROM course JOIN subject ON course.subject_id=subject.id WHERE subject.school_id=?', [sid], function(err, result) {
                return res.json(result);
            });
        } else {
            // else, filter by term using classes
            if (q !== undefined) {
                // filter with query
                q = wrap(q);
                conn.query('SELECT course.* from course JOIN class ON class.course_id=course.id WHERE class.term_id=? AND (course.name LIKE ? OR course.code LIKE ?) LIMIT 200', [tid, q, q], function(err, result) {
                    return res.json(result);
                });
            } else {
                // else, just return all of the courses for that term, limited to 100
                conn.query('SELECT course.* from course JOIN class ON class.course_id=course.id WHERE class.term_id=? LIMIT 100', [tid], function(err, result) {
                    return res.json(result);
                });
            }
        }

    };
    api.course = function(req, res) {
        conn.query('SELECT * FROM course WHERE id=? LIMIT 1', [req.params.sid, req.params.cid], function(err, results) {
            if (results.length ===1) {
                return res.json(results[0]);
            }

            return res.json({
                error: 'No such course.'
            });
        });
    };
    api.teachers = function(req, res) {
        conn.query('SELECT * FROM teacher WHERE school_id=?', [req.params.sid], function(err, results) {
            return res.json(results);
        });
    };
    api.teacher = function(req, res) {
        conn.query('SELECT * FROM teacher WHERE id=? LIMIT 1', [req.params.tid], function(err, results) {
            if (results.length === 1) {
                return res.json(results[0]);
            }

            return res.json({
                error: "No such teacher."
            });
        });
    };


    api.search = function(req, res) {
        var sid = req.params.sid,
            q = req.query.q || '',
            qbuildings = req.query.buildings,
            qcampuses = req.query.campuses,
            qcolleges = req.query.colleges,
            qdepts = req.query.depts,
            qrooms = req.query.rooms,
            qschools = req.query.schools,
            qsubjects = req.query.subjects,
            qteachers = req.query.teachers,
            qterms = req.query.terms,

            // IMPLIED
            isWWW = req.query.isWWW,
            // any of its classes have seats_available > 0 ?
            seats = req.query.seats,
            credits_max = req.query.credits_max,
            credits_min = req.query.credits_min;

        // cool, so we need to find all of the courses that match that query
        //  filtered by those parameters
        var mq = q.replace(' ', '-');
        conn.query('SELECT * FROM course WHERE name LIKE ? OR code LIKE ? OR code LIKE ?', [wrap(q), wrap(q), wrap(mq)], function(err, courses) {
            return res.json(courses);
        });

    };


    return api;
};