'use strict';

angular.module('bossBossApp')
.controller('TeacherCtrl', function ($scope, $routeParams, Teacher, $rootScope, where) {
    $scope.teacher = Teacher.get({id: $routeParams.id});

    $scope.addClass = function(i) {
        var thisClass = $scope.teacher.classes[i];
        var otherClass = where($rootScope.state.cart, 'id', thisClass.course_id);
        if (otherClass !== undefined) {
            $rootScope.state.cart.splice($rootScope.state.cart.indexOf(otherClass), 1);
        }
        $rootScope.state.cart.push({
            id: thisClass.course_id,
            class: {
                id: thisClass.id
            }
        });
    };
});
