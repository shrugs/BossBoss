'use strict';

angular.module('bossBossApp')
.directive('bbIndicator', function ($window, $timeout) {
    return {
        template: '<div style="padding: 0 2px; height: 100%; width: 20%;" ng-style="{backgroundColor: color}"></div>',
        restrict: 'AE',
        scope: {
            status: '@'
        },
        link: function postLink($scope, element) {
            $scope.handleWindow = function() {
                element.height(0);
                element.height(element.parents('.class').height());
            };

            $timeout($scope.handleWindow, 400);
            angular.element($window).bind('resize', function() {
                $scope.handleWindow();
                return $scope.$apply();
            });

        }
    };
});
