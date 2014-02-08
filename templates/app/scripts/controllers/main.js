'use strict';

angular.module('BossBossApp')
.controller('MainCtrl', function ($scope, DefaultClasses, $debounce, Search, _, localStorageService) {
    $scope.searchResults = DefaultClasses.get();
    $scope.selectedCourses = localStorageService.get('selectedCourses') || [];
    $scope.loading = false;

    $scope.$watch('searchResults', function() {
        // $scope.loading = $scope.searchResults.length === 0;
        $scope.loading = true;
        var a = window.setInterval(function(){
            $scope.loading = false;
            clearInterval(a);
        }, 1000);
    });

    $scope.$watch('selectedCourses', function() {
        localStorageService.add('selectedCourses', $scope.selectedCourses);
    }, true);

    $scope.$watch('searchText', $debounce(function() {
        $scope.searchResults = [];
        if ($scope.searchText !== '') {
            $scope.searchResults = Search.get({q:$scope.searchText});
        }
    }, 400), true);

    $scope.addCourse = function(i) {

        // if not already in list
        if (_.find($scope.selectedCourses, function(obj){return obj.CourseID === $scope.searchResults[i].CourseID;}) === undefined) {
            $scope.selectedCourses.push($scope.searchResults[i]);
        }

        $scope.searchResults.splice(i, 1);
    };

    $scope.removeCourse = function(i) {
        // if not already in list
        if (_.find($scope.searchResults, function(obj){return obj.CourseID === $scope.selectedCourses[i].CourseID;}) === undefined) {
            $scope.searchResults.push($scope.selectedCourses[i]);
        }

        $scope.selectedCourses.splice(i, 1);
    };



});
