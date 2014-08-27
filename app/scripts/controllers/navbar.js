'use strict';

angular.module('bossBossApp')
.controller('NavbarCtrl', function ($scope, $location, Auth, $timeout) {
    $scope.logout = function() {
        Auth.logout().then(function() {
            $location.path('/');
        });
    };

    $scope.hideNav = function() {
        angular.element('#navbar-collapse').collapse('hide');
    };

    $scope.login = function() {
        window.location.replace('/api/auth/facebook');
    };

    $scope.isActive = function(route) {
        return route === $location.path();
    };

    $timeout(function() {
        angular.element('.navbar').tooltip({
            selector: '[data-toggle="tooltip"]'
        });
    }, 1000);

});
