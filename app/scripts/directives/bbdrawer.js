'use strict';

angular.module('bossBossApp')
.directive('bbDrawer', function ($rootScope) {
    return {
        templateUrl: 'partials/bbdrawer.html',
        restrict: 'AE',
        link: function postLink($scope, element, attrs) {

            $scope.drawerState = element.width() > 100;

            $scope.removeCourse = function(i) {

            };

            $scope.open = function() {
                $scope.drawerState = true;
            };
            $scope.close = function() {
                $scope.drawerState = false;
            };

            $scope.toggle = function() {
                if ($scope.drawerState) {
                    $scope.close();
                } else {
                    $scope.open();
                }
            };

            $rootScope.$watch('state', function() {
                $scope.state = $rootScope.state;
            }, true);

        }
    };
});
