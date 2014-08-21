'use strict';

angular.module('bossBossApp')
.directive('bbAddCourse', function ($window) {
    return {
        template: '<span class="glyphicon glyphicon-plus" ng-style="{marginTop: marginTop}" style="padding-left: 0;"></span>',
        restrict: 'AE',
        link: function postLink($scope, element) {
            $scope.handleWindow = function() {
                element.height(0);
                element.height(element.parents('.class').height());
                $scope.marginTop = (element.height()/2) - element.find('span').first().height()/2;
            };

            $scope.handleWindow();
            angular.element($window).bind('resize', function() {
                $scope.handleWindow();
                return $scope.$apply();
            });
        }
    };
});
