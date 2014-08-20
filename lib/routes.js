'use strict';

var index = require('./controllers'),
    users = require('./controllers/users'),
    session = require('./controllers/session');

var middleware = require('./middleware');

/**
 * Application routes
 */
module.exports = function(app, passport, conn) {
    var api = require('./controllers/api')(conn);

    // Redirect the user to Facebook for authentication.  When complete,
    // Facebook will redirect the user back to the application at
    //     /auth/facebook/callback
    app.get('/api/auth/facebook', function(req, res) {
        passport.authenticate('facebook')(req, res);
    });

    // Facebook will redirect the user to this URL after approval.  Finish the
    // authentication process by attempting to obtain an access token.  If
    // access was granted, the user will be logged in.  Otherwise,
    // authentication has failed.
    app.get('/api/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '#/',
            failureRedirect: '#/login'
        }
    ));

    // Server API Routes
    // SEARCH
    app.get('/api/schools/:sid/search', api.search);
    // TEACHERS
    app.get('/api/schools/:sid/teachers/:tid', api.teacher);
    app.get('/api/schools/:sid/teachers', api.teachers);
    // COURSES
    app.get('/api/schools/:sid/courses/:cid', api.course);
    app.get('/api/schools/:sid/courses', api.courses);
    // TERM
    app.get('/api/schools/:sid/terms/:tid', api.term);
    app.get('/api/schools/:sid/terms', api.terms);
    // CAMPUSES
    app.get('/api/schools/:sid/campuses', api.campuses);
    // BUILDINGS
    app.get('/api/schools/:sid/buildings', api.buildings);
    // SCHOOL
    app.get('/api/schools/:sid', api.school);
    app.get('/api/schools', api.schools);



    app.post('/api/users', users.create);
    app.put('/api/users', users.changePassword);
    app.get('/api/users/me', users.me);
    app.get('/api/users/:id', users.show);

    app.post('/api/session', session.login);
    app.del('/api/session', session.logout);

    // All undefined api routes should return a 404
    app.get('/api/*', function(req, res) {
        res.send(404);
    });

    // All other routes to use Angular routing in app/scripts/app.js
    app.get('/partials/*', index.partials);
    app.get('/*', middleware.setUserCookie, index.index);
};