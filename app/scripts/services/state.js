'use strict';

angular.module('bossBossApp')
.factory('State', function ($rootScope, Auth, User, localStorageService) {

    return {
        start: function() {

            $rootScope.state = localStorageService.get('state') || {cart: []};

            // get mongo state
            if (Auth.isLoggedIn()) {
                Auth.currentUser().$promise.then(function(user) {
                    $rootScope.state = user.state;
                });
            }

            $rootScope.$watch('state', function(state) {
                if (angular.isUndefined(state) && state !== {cart: []}) {
                    return;
                }
                localStorageService.set('state', state);
                if (Auth.isLoggedIn()) {
                    // if the user is logged in, save the state to Mongo
                    Auth.currentUser().$promise.then(function(user) {
                        if (user) {
                            user.state = state;
                            User.update(user);
                        }
                    });
                }
            }, true);
        }
    };

});
