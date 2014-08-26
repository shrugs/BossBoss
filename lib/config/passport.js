'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    // Application Config
    config = require('./config'),
    FB = require('fb');

/**
 * Passport configuration
 */
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    User.findOne({
        _id: id
    }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
        done(err, user);
    });
});

// add other strategies for more authentication flexibility
passport.use(new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
        //check user table for anyone with a facebook ID of profile.id
        User.findOne({
            'facebook.id': profile.id
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            //No user was found... so create a new user with values from Facebook (all the profile. stuff)
            if (!user) {
                user = new User({
                    name: profile.displayName,
                    username: profile.username,
                    provider: 'facebook',
                    //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
                    facebook: profile._json
                });
                user.facebook.refreshToken = refreshToken;
                FB.api('/me/friends', {
                    access_token: accessToken,
                    fields: ['id', 'name'],
                    client_id: config.facebook.clientID,
                    client_secret: config.facebook.clientSecret
                }, function(response) {
                    console.log(response);
                    user.facebook.friends = response.data;
                    user.save(function(err) {
                        if (err) {
                            console.log(err);
                        }
                        return done(err, user);
                    });
                });
            } else {
                //found user. Return
                return done(err, user);
            }
        });
    }
));

module.exports = passport;