'use strict';

angular.module('bossBossApp')
.controller('CourseCtrl', function ($scope, $routeParams, Course, $rootScope, where) {
    $scope.course = Course.get({id: $routeParams.id});

    $scope.addClass = function(i) {
        var thisClass = $scope.course.classes[i];
        if ($rootScope.state === undefined) {
            $rootScope.state = {
                cart: []
            };
        }
        var otherClass = where($rootScope.state.cart, 'id', $scope.course.id);
        if (otherClass !== undefined) {
            $rootScope.state.cart.splice($rootScope.state.cart.indexOf(otherClass), 1);
        }
        $rootScope.state.cart.push({
            id: $scope.course.id,
            class: {
                id: thisClass.id,
            }
        });
    };
});
