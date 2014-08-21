'use strict';

angular.module('bossBossApp')
.directive('bbRemoveCourse', function ($window) {
    return {
        template: '<span class="glyphicon glyphicon-remove" ng-style="{marginTop: marginTop}"></span>',
        restrict: 'AE',
        link: function postLink($scope, element) {
            // $scope.handleWindow = function() {
            //     element.height(0);
            //     element.height(element.parents('.course').height());
            //     $scope.marginTop = (element.height()/2) - element.find('span').first().height()/2;
            // };

            // $scope.handleWindow();
            // angular.element($window).bind('resize', function() {
            //     $scope.handleWindow();
            //     return $scope.$apply();
            // });
        }
    };
});
