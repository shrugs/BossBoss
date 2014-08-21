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
        results = results.map(function(c) {
            if (c.credits !== undefined) {
                c.credits = JSON.parse(c.credits);
            }
            return c;
        });
        cb(results);
    });
}

function buildings(conn, sid, cb) {
    conn.query('SELECT room.id as room_id, room.building_id, building.name as building_name, room.name as room_name FROM room JOIN building on room.building_id=building.id JOIN campus ON building.campus_id=campus.id WHERE campus.school_id=?', [sid], function(err, results) {
        var rooms_by_building = _.groupBy(results, 'building_id');
        rooms_by_building = _.map(rooms_by_building, function(rs) {
            var rooms = _.map(rs, function(room) {
                return {
                    id: room.room_id,
                    name: room.room_name,
                    building_name: room.building_name
                };
            });

            return {
                id: rs[0].building_id,
                name: rs[0].building_name,
                rooms: rooms
            };
        });
        cb(rooms_by_building);
    });
}

// function peeweeify(conn, obj, cb) {

//     // for each key in object, turn all _id references into actual values
//     Object.keys(obj).forEach(function(k) {
//         var idRe = /.+_id/;
//         if (idRe.test(k)) {
//             var table = k.split('_id')[0];
//             conn.query('SELECT * FROM ' + table + ' WHERE ' + table + '.id=?', [obj[k]], function(result) {
//                 obj[table] = result;
//             });
//         }
//     });
// }


// @TODO(Shrugs) this could probably become a clever function generating thing
function campuses(conn, sid, cb) {
    conn.query('SELECT campus.* FROM campus WHERE school_id=?', [sid], function(err, results) {
        cb(results);
    });
}

function colleges(conn, sid, cb) {
    conn.query('SELECT college.* FROM college WHERE school_id=?', [sid], function(err, results) {
        cb(results);
    });
}

function departments(conn, sid, cb) {
    conn.query('SELECT department.* FROM department JOIN college ON department.college_id=college.id WHERE college.school_id=?', [sid], function(err, results) {
        cb(results);
    });
}

function subjects(conn, sid, cb) {
    conn.query('SELECT subject.* FROM subject WHERE school_id=?', [sid], function(err, results) {
        cb(results);
    });
}

function teachers(conn, sid, cb) {
    conn.query('SELECT teacher.* FROM teacher WHERE school_id=?', [sid], function(err, results) {
        cb(results);
    });
}

function terms(conn, sid, cb) {
    conn.query('SELECT term.* FROM term WHERE school_id=?', [sid], function(err, results) {
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
            } else {
                return res.json({
                    error: 'No such school.'
                });
            }
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
        conn.query('SELECT course.*, subject.name as subject_name, department.name as department_name FROM course JOIN subject ON course.subject_id=subject.id JOIN department ON subject.department_id=department.id JOIN college ON department.college_id=college.id WHERE college.school_id=? AND course.id=? LIMIT 1', [req.params.sid, req.params.cid], function(err, results) {
            if (err) {
                console.log(err);
            }
            if (results.length === 1) {
                var course = results[0];
                // now get all classes associated with the course
                conn.query('SELECT class.*, teacher.id as teacher_id, teacher.name as teacher_name, room.id as room_id, room.name as room_name, building.id as building_id, building.name as building_name FROM class JOIN teacher ON class.teacher_id=teacher.id JOIN room ON class.room_id=room.id JOIN building ON room.building_id=building.id WHERE class.course_id=? AND class.term_id=?', [course.id, req.params.tid], function(err, results) {
                    course.classes = results.map(function(r) {
                        r.times = JSON.parse(r.times);
                        return r;
                    });
                    course.credits = JSON.parse(course.credits);
                    return res.json(course);
                });
            } else {
                return res.json({
                    error: 'No such course.'
                });
            }
        });
    };
    api.teacher = function(req, res) {
        conn.query('SELECT * FROM teacher WHERE id=? LIMIT 1', [req.params.teacherid], function(err, results) {
            if (err) {
                console.log(err);
            }
            if (results.length === 1) {
                var teacher = results[0];

                conn.query('SELECT class.*, teacher.id as teacher_id, teacher.name as teacher_name, room.id as room_id, room.name as room_name, building.id as building_id, building.name as building_name, course.code as course_code, course.name as course_name, course.id as course_id, subject.name as subject_name, department.name as department_name FROM class JOIN teacher ON class.teacher_id=teacher.id JOIN room ON class.room_id=room.id JOIN building ON room.building_id=building.id JOIN course ON class.course_id=course.id JOIN subject ON course.subject_id=subject.id JOIN department ON subject.department_id=department.id WHERE class.teacher_id=? AND class.term_id=?', [teacher.id, req.params.tid], function(err, results) {
                    teacher.classes = results.map(function(r) {
                        r.times = JSON.parse(r.times);
                        return r;
                    });
                    return res.json(teacher);
                });
            } else {
                return res.json({
                    error: "No such teacher."
                });
            }
        });
    };

    api.campuses = function(req, res) {
        campuses(conn, req.params.sid, res.json);
    };

    api.buildings = function(req, res) {
        buildings(conn, req.params.sid, res.json);
    };

    api.colleges = function(req, res) {
        colleges(conn, req.params.sid, res.json);
    };

    api.departments = function(req, res) {
        departments(conn, req.params.sid, res.json);
    };

    api.subjects = function(req, res) {
        subjects(conn, req.params.sid, res.json);
    };
    api.teachers = function(req, res) {
        teachers(conn, req.params.sid, res.json);
    };
    api.terms = function(req, res) {
        terms(conn, req.params.sid, res.json);
    };

    api.params = function(req, res) {
        var sid = req.params.sid;
        // @TODO(Shrugs) cache the fuck out of this


        // to promise or to callback
        // that is the question
        // fuck it, callback hell
        var params = {};
        buildings(conn, sid, function(results) {
            params.buildings = results;
            campuses(conn, sid, function(results) {
                params.campuses = results;
                colleges(conn, sid, function(results) {
                    params.colleges = results;
                    departments(conn, sid, function(results) {
                        params.depts = results;
                        // I immediately regret this decision.
                        buildings(conn, sid, function(results) {
                            params.buildings = results;
                            subjects(conn, sid, function(results) {
                                params.subjects = results;
                                teachers(conn, sid, function(results) {
                                    params.teachers = results;
                                    terms(conn, sid, function(results) {
                                        // oh god, where am I
                                        params.terms = results;
                                        res.json(params);
                                        // fuck you, it works
                                    });
                                });
                            });
                        });
                    });
                });
            });
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
            is_www = req.query.is_www,
            // any of its classes have seats_available > 0 ?
            is_open = req.query.is_open,
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
            conn.query('SELECT * FROM course WHERE (name LIKE ?) OR (code LIKE ?) OR (code LIKE ?) OR (course.desc LIKE (?))', [wrap(q), wrap(q), wrap(mq), wrap(q)], function(err, results) {
                if (err) {
                    console.log(err);
                }
                results = results.map(function(c) {
                    if (c.credits !== undefined) {
                        c.credits = JSON.parse(c.credits);
                    }
                    return c;
                });
                searchDeferred.resolve(results);
            });

            searchDeferred.promise
            .then(function searchTeachers(courses) {
                var deferred = Q.defer();

                conn.query('SELECT * FROM teacher WHERE teacher.name LIKE ?', [wrap(q)], function(err, teachers) {
                    if (teachers.length > 0) {
                        teacherSearch = teachers;
                        var tids = _.pluck(teachers, 'id');
                        if (qteachers === undefined) {
                            qteachers = tids;
                        } else {
                            qteachers = _.union(qteachers, tids);
                        }
                        getAllCourses(conn, deferred.resolve);
                    } else {
                        deferred.resolve(courses);
                    }
                });
                return deferred.promise;
            })
            .then(function(courses) {
                deferred.resolve(courses);
            });


        } else {
            getAllCourses(conn, deferred.resolve);
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
        .then(function(courses) {
            var deferred = Q.defer();

            if (_.isEmpty(courses)) {
                deferred.resolve(courses);
                return deferred.promise;
            }
            if (qterms !== undefined) {
                conn.query('SELECT course_id FROM class WHERE term_id IN (?)', [qterms], function(err, results) {
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
        // is_www
        // @TODO(Shrugs) figure out how peewee does Booleans and make this work
        // .then(function(courses) {
        //     var deferred = Q.defer();

        //     if (_.isEmpty(courses)) {
        //         deferred.resolve(courses);
        //         return deferred.promise;
        //     }
        //     if (is_www !== undefined) {
        //         conn.query('SELECT course_id FROM class WHERE is_www IS NOT NULL', [is_www], function(err, results) {
        //             if (err) {
        //                 console.log(err);
        //             }
        //             var cids = _.pluck(results, 'course_id');
        //             courses = whereIn(courses, 'id', cids);
        //             deferred.resolve(courses);
        //         });
        //     } else {
        //         deferred.resolve(courses);
        //     }

        //     return deferred.promise;
        // })
        // SEATS
        // .then(function(courses) {
        //     var deferred = Q.defer();

        //     if (_.isEmpty(courses)) {
        //         deferred.resolve(courses);
        //         return deferred.promise;
        //     }
        //     if (is_open !== undefined) {
        //         conn.query('SELECT course_id FROM class WHERE seats_status="open"', function(err, results) {
        //             if (err) {
        //                 console.log(err);
        //             }
        //             var cids = _.pluck(results, 'course_id');
        //             courses = whereIn(courses, 'id', cids);
        //             deferred.resolve(courses);
        //         });
        //     } else {
        //         deferred.resolve(courses);
        //     }

        //     return deferred.promise;
        // })
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