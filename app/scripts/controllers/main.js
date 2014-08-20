'use strict';

angular.module('bossBossApp')
.controller('MainCtrl', function ($scope, $http, $rootScope) {

    $rootScope.state = $rootScope.currentUser.state || {};

    $rootScope.$watch('state', function() {
        console.log('Main.js knows rootscope changed!');
    }, true);

    $scope.changeShit = function() {
        $rootScope.state = {test: "true"};
    };

});
