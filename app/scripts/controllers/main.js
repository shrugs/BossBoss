'use strict';

angular.module('bossBossApp')
.controller('MainCtrl', function ($scope, $http, $rootScope, Search, Params, debounce, where) {

    $scope.$watch('searchParams', debounce(function(p) {
        if (angular.isUndefined(p)) {
            return;
        }
        console.log('Searching...', p);
        Search.get(p).$promise.then(function(results) {
            console.log(results);
            $scope.results = results;
        });
    }, 500, true), true);

    $scope.searchParams = {
        q: 'scuba'
    };

    $scope.addCourse = function(i) {
        $rootScope.data.courses.push($scope.results[i]);
    };

    $scope.$watch('searchParams.buildings', function(bids) {
        var r = [];
        angular.forEach(bids, function(bid) {
            var thisBuilding = where($scope.params.buildings, 'id', parseInt(bid, 10));
            if (!angular.isUndefined(thisBuilding)) {
                angular.forEach(thisBuilding.rooms, function(room) {
                    r.push(room);
                });
            }
        });
        $scope.possibleRooms = r;
    });


    $scope.params = Params.get();


});
