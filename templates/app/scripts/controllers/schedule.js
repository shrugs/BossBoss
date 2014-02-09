'use strict';

angular.module('BossBossApp')
.controller('ScheduleCtrl', function ($scope, localStorageService, Classes) {
    $scope.selectedCourses = localStorageService.get('selectedCourses') || [];
    $scope.loading = true;
    $scope.noCourses = false;
    // now get all of the class info for those courses
    $scope.courses = Classes.get({courseCodes: $scope.selectedCourses.map(function(obj){return obj.CourseCode;})}, function(){
        // yay
        $scope.loading = false;
        if ($scope.courses.length === 0) {
            $scope.noCourses = true;
        }

        angular.forEach($scope.courses, function(course) {
            angular.forEach(course.Classes, function(c) {
                c.TimeStart = new Date(0,0,0,c.TimeStart.split(':')[0], c.TimeStart.split(':')[1], 0, 0);
                c.TimeEnd = new Date(0,0,0,c.TimeEnd.split(':')[0], c.TimeEnd.split(':')[1], 0, 0);
            });
        });

    }, function() {
        // nay
        $scope.loading = false;
        $scope.noCourses = true;
    });

    $scope.$watch('courses', function() {
        if ($scope.courses.length > 0) {
            localStorageService.add('selectedCourses', $scope.courses);
        }
    }, true);

    $scope.selectedClasses = {};

    $scope.selectClass = function(course, i) {
        var selectedClass = course.Classes[i];
        $scope.selectedClasses[course.CourseCode] = selectedClass;
    };

    $scope.getClassClass = function(course, c) {

        if ($scope.selectedClasses[course.CourseCode] === c) {
            // is in class
            return 'class-selected';
        } else {
            return undefined;
        }
    };

    $scope.selectedEverything = function() {

        if ($scope.courses.length === 0) {
            return false;
        }

        for (var i = 0; i < $scope.courses.length; i++) {
            if ($scope.selectedClasses[$scope.courses[i].CourseCode] === undefined) {
                return false;
            }
        }

        return true;
    };

    $scope.presentCallNums = function() {
        $scope.shouldPresent = true;
    };

    $scope.callnums = function() {
        var nums = [];
        for (var i = 0; i < $scope.courses.length; i++) {
            if ($scope.selectedClasses[$scope.courses[i].CourseCode] !== undefined) {
                nums.push($scope.selectedClasses[$scope.courses[i].CourseCode]);
            }
        }
        return nums;
    };

    $scope.removeCourse = function(i) {
        $scope.courses.splice(i, 1);
    };

});
