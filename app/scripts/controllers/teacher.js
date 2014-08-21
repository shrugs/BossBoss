'use strict';

angular.module('bossBossApp')
.controller('TeacherCtrl', function ($scope, $routeParams, Teacher) {
    $scope.teacher = Teacher.get({id: $routeParams.id});
});
