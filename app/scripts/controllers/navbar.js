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
        angular.element('.btn-facebook').first().parent().tooltip({
            placement: 'left',
            title: 'Sync your schedule across devices and compare with friends!',
            trigger: 'hover'
        });
    });

});
