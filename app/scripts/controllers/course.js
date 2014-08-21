'use strict';

angular.module('bossBossApp')
.controller('CourseCtrl', function ($scope, $http, $routeParams, Course) {
    $scope.course = Course.get({id: $routeParams.id, tid: $routeParams.term});

});
