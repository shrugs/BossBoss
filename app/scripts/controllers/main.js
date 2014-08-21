'use strict';

angular.module('bossBossApp')
.controller('MainCtrl', function ($scope, $http, $rootScope, Search, Params) {

    $rootScope.$watch('state', function() {
        console.log('Main.js knows rootscope changed!');
    }, true);

    $scope.$watch('searchParams', function(p) {
        if (angular.isUndefined(p)) {
            return;
        }
        console.log('Searching...', p);
        Search.get(p).$promise.then(function(results) {
            console.log(results);
            $scope.results = results;
        });
    });

    $scope.searchParams = {
        q: 'scuba'
    };

    $scope.changeShit = function() {
        $rootScope.state.test = false;
    };

    $scope.addCourse = function(i) {
        $rootScope.data.courses.push($scope.results[i]);
    };


    $scope.params = Params.get();


});
