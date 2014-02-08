'use strict';

angular.module('BossBossApp')
.controller('MainCtrl', function ($scope, DefaultClasses, $debounce, Search) {
    $scope.searchResults = DefaultClasses.get();
    $scope.selectedCourses = $scope.searchResults;

    $scope.$watch('searchText', $debounce(function() {
        $scope.searchResults = Search.get({q:$scope.searchText});
    }, 1000), true);
});
