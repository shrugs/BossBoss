'use strict';

angular.module('bossBossApp')
.factory('State', function ($rootScope, Auth, User) {

    return {
        start: function() {
            $rootScope.$watch('state', function(newValue, oldValue) {
                if (angular.isUndefined(newValue)) {
                    return;
                }
                if (Auth.isLoggedIn()) {
                    // if the user is logged in, save the state to Mongo
                    Auth.currentUser().$promise.then(function(user) {
                        user.state = $rootScope.state;
                        User.update(user);
                    });
                }
            }, true);
        }
    };

});
