'use strict';

var Q = require('q'),
    _ = require('underscore');

function wrap(str, w) {
    if (w === undefined) {
        w = '%';
    }
    return w + str + w;
}

function arrayIfNot(thing) {
    if (_.isArray(thing)) {
        return thing;
    } else if (thing !== undefined) {
        return [thing];
    } else {
        return thing;
    }
}

function whereIn(iarr, key, carr) {
    return _.filter(iarr, function(t) {
        return carr.indexOf(t[key]) !== -1;
    });
}

function getAllCourses(conn, cb) {
    // @TODO(Shrugs) use an in-memory cache for this, pls
    conn.query('SELECT * FROM course', function(err, results) {
        if (err) {
            console.log(err);
        }
        cb(results);
    });
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

    api.campuses = function(req, res) {
        conn.query('SELECT * FROM campus WHERE school_id=?', [req.params.sid], function(err, results) {
            res.json(results);
        });
    };

    api.buildings = function(req, res) {
        conn.query('SELECT building.* FROM building JOIN campus ON building.campus_id=campus.id WHERE campus.school_id=?', [req.params.sid], function(err, results) {
            res.json(results);
        });
    };


    api.search = function(req, res) {
        var sid = req.params.sid,
            q = req.query.q || '',
            qbuildings = arrayIfNot(req.query.buildings),
            qcampuses = arrayIfNot(req.query.campuses),
            qcolleges = arrayIfNot(req.query.colleges),
            qdepts = arrayIfNot(req.query.depts),
            qrooms = arrayIfNot(req.query.rooms),
            qsubjects = arrayIfNot(req.query.subjects),
            qteachers = arrayIfNot(req.query.teachers),
            qterms = arrayIfNot(req.query.terms),

            // IMPLIED
            isWWW = req.query.isWWW,
            // any of its classes have seats_available > 0 ?
            seats = req.query.seats,
            credits_max = req.query.credits_max,
            credits_min = req.query.credits_min;

        // cool, so we need to find all of the courses that match that query
        //  filtered by those parameters
        // @TODO(Shrugs) handle errors

        var teacherSearch = [];

        var deferred = Q.defer();
        if (q !== '') {
            // SEARCH
            var searchDeferred = Q.defer();
            var mq = q.replace(' ', '-');
            // (desc LIKE ?)
            conn.query('SELECT * FROM course WHERE (name LIKE ?) OR (code LIKE ?) OR (code LIKE ?)', [wrap(q), wrap(q), wrap(mq), wrap(q)], function(err, results) {
                if (err) {
                    console.log(err);
                }
                searchDeferred.resolve(results);
            });

            searchDeferred.promise
            .then(function searchTeachers(courses) {
                var deferred = Q.defer();

                conn.query('SELECT * FROM teacher WHERE teacher.name LIKE ?', [wrap(q)], function(err, results) {
                    teacherSearch = results;
                    var tids = _.pluck(results, 'id');
                    if (qteachers === undefined) {
                        qteachers = tids;
                    } else {
                        qteachers = _.union(qteachers, tids);
                    }
                    getAllCourses(conn, function(results) {
                        deferred.resolve(results);
                    });
                });
                return deferred.promise;
            })
            .then(function(courses) {
                deferred.resolve(courses);
            });


        } else {
            getAllCourses(conn, function(results) {
                deferred.resolve(results);
            });
        }
        // BUILDINGS
        deferred.promise.then(function getBuildings(courses) {
            var deferred = Q.defer();
            if (_.isEmpty(courses)) {
                deferred.resolve(courses);
                return deferred.promise;
            }

            if (qbuildings !== undefined) {
                // get classes based on course_id, joined on rooms+buildings
                if (qrooms !== undefined) {
                    // both buildings and rooms
                    conn.query('SELECT course_id FROM class JOIN room ON class.room_id=room.id JOIN building ON room.building_id=building.id WHERE class.room_id IN (?) AND room.building_id IN (?)', [qrooms, qbuildings], function(err, results) {
                        if (err) {
                            console.log(err);
                        }
                        var cids = _.pluck(results, 'course_id');
                        // filter by whether or not the course is in that building
                        courses = whereIn(courses, 'id', cids);
                        deferred.resolve(courses);
                    });
                } else {
                    // only buildings
                    conn.query('SELECT course_id FROM class JOIN room ON class.room_id=room.id JOIN building ON room.building_id=building.id WHERE room.building_id IN (?)', [qbuildings], function(err, results) {
                        if (err) {
                            console.log(err);
                        }
                        var cids = _.pluck(results, 'course_id');
                        // filter by whether or not the course is in that building
                        courses = whereIn(courses, 'id', cids);
                        deferred.resolve(courses);
                    });
                }
            } else {
                deferred.resolve(courses);
            }

            return deferred.promise;
        })
        // CAMPUSES
        .then(function getCampus(courses) {
            var deferred = Q.defer();
            if (_.isEmpty(courses)) {
                deferred.resolve(courses);
                return deferred.promise;
            }
            if (qcampuses !== undefined) {
                conn.query('SELECT course_id FROM class JOIN room ON class.room_id=room.id JOIN building ON room.building_id=building.id JOIN campus ON building.campus_id=campus.id WHERE campus.id IN (?)', [qcampuses], function(err, results) {
                    if (err) {
                        console.log(err);
                    }
                    var cids = _.pluck(results, 'course_id');
                    courses = whereIn(courses, 'id', cids);
                    deferred.resolve(courses);
                });
            } else {
                deferred.resolve(courses);
            }
            return deferred.promise;
        })
        // COLLEGES
        .then(function getCollege(courses) {
            var deferred = Q.defer();
            if (_.isEmpty(courses)) {
                deferred.resolve(courses);
                return deferred.promise;
            }
            if (qcolleges !== undefined) {
                conn.query('SELECT course.id as id FROM course JOIN subject ON course.subject_id=subject.id JOIN department ON subject.department_id=department.id JOIN college ON department.college_id=college.id WHERE college.id IN (?)', [qcolleges], function(err, results) {
                    if (err) {
                        console.log(err);
                    }
                    var cids = _.pluck(results, 'id');
                    courses = whereIn(courses, 'id', cids);
                    deferred.resolve(courses);
                });
            } else {
                deferred.resolve(courses);
            }
            return deferred.promise;
        })
        // DEPTS
        .then(function getDepts(courses) {
            var deferred = Q.defer();
            if (_.isEmpty(courses)) {
                deferred.resolve(courses);
                return deferred.promise;
            }
            if (qdepts !== undefined) {
                conn.query('SELECT course.id as id FROM course JOIN subject ON course.subject_id=subject.id JOIN department ON subject.department_id=department.id WHERE department.id IN (?)', [qdepts], function(err, results) {
                    if (err) {
                        console.log(err);
                    }
                    var cids = _.pluck(results, 'id');
                    courses = whereIn(courses, 'id', cids);
                    deferred.resolve(courses);
                });
            } else {
                deferred.resolve(courses);
            }
            return deferred.promise;
        })
        // SUBJECTS
        .then(function getSubjects(courses) {
            var deferred = Q.defer();
            if (_.isEmpty(courses)) {
                deferred.resolve(courses);
                return deferred.promise;
            }
            if (qsubjects !== undefined) {
                conn.query('SELECT course.id as id FROM course JOIN subject ON course.subject_id=subject.id WHERE subject.id IN (?)', [qsubjects], function(err, results) {
                    if (err) {
                        console.log(err);
                    }
                    var cids = _.pluck(results, 'id');
                    courses = whereIn(courses, 'id', cids);
                    deferred.resolve(courses);
                });
            } else {
                deferred.resolve(courses);
            }
            return deferred.promise;
        })
        // TEACHERS
        .then(function getTeachers(courses) {
            var deferred = Q.defer();
            if (_.isEmpty(courses)) {
                deferred.resolve(courses);
                return deferred.promise;
            }
            if (qteachers !== undefined) {
                conn.query('SELECT course_id FROM class JOIN teacher ON class.teacher_id=teacher.id WHERE teacher.id IN (?)', [qteachers], function(err, results) {
                    if (err) {
                        console.log(err);
                    }
                    var cids = _.pluck(results, 'course_id');
                    courses = whereIn(courses, 'id', cids);
                    deferred.resolve(courses);
                });
            } else {
                deferred.resolve(courses);
            }
            return deferred.promise;
        })
        // TERMS

        // isWWW

        // SEATS

        // CREDITS
        .then(function(courses) {
            res.json({
                courses: courses,
                teachers: teacherSearch
            });
        });

    };


    return api;
};