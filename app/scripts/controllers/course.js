'use strict';

angular.module('bossBossApp')
.controller('CourseCtrl', function ($scope, $routeParams, Course) {
    $scope.course = Course.get({id: $routeParams.id});

});
