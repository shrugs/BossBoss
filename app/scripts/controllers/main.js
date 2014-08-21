'use strict';

angular.module('bossBossApp')
.controller('MainCtrl', function ($scope, $http, $rootScope, Search, Params, debounce) {

    function where(arr, key, val) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][key] === val) {
                return arr[i];
            }
        }
        return;
    }


    $rootScope.$watch('state', function() {
        console.log('Main.js knows rootscope changed!');
    }, true);

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

    $scope.changeShit = function() {
        $rootScope.state.test = false;
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
