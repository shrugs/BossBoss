'use strict';

angular.module('bossBossApp')
.directive('bbIndicator', function ($window) {
    return {
        template: '<div style="padding: 0 2px; height: 100%;" ng-style="{backgroundColor: color}"></div>',
        restrict: 'AE',
        scope: {
            status: '@'
        },
        link: function postLink($scope, element) {
            $scope.handleWindow = function() {
                element.height(element.parents('.class').height());
            };

            $scope.handleWindow();
            angular.element($window).bind('resize', function() {
                $scope.handleWindow();
                return $scope.$apply();
            });

            var neg = $scope.status === 'Closed' || $scope.status === 'Cancelled';
            $scope.color = !neg ? '#5cb85c' : '#777777';

        }
    };
});
