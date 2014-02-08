'use strict';

angular.module('BossBossApp')
.controller('ScheduleCtrl', function ($scope, localStorageService, Classes) {
    $scope.selectedCourses = localStorageService.get('selectedCourses');
    // now get all of the class info for those courses
    $scope.classes = Classes.get({courseCodes: $scope.selectedCourses});
});
