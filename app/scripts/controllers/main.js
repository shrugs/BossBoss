'use strict';

angular.module('bossBossApp')
.controller('MainCtrl', function ($scope, $http, $rootScope, Search, Params, debounce, where) {

    $scope.$watch('searchParams', debounce(function(p) {
        if (angular.isUndefined(p)) {
            return;
        }
        // make sure at least one thing has values
        var hasParams = false;
        var ks = Object.keys(p);
        for (var i = 0; i < ks.length; i++) {
            var k = ks[i],
                v = p[k];
            if (k === 'q' && v !== '') {
                hasParams = true;
                break;
            } else if (v.length !== 0) {
                hasParams = true;
                break;
            }
        }

        if (!hasParams) {
            return;
        }


        console.log('Searching...', p);
        Search.get(p).$promise.then(function(results) {
            console.log(results);
            $scope.results = results;
        });
    }, 500, true), true);

    $scope.addCourse = function(i) {
        $rootScope.data.courses.push($scope.results[i]);
    };

    $scope.$watch('searchParams.buildings', function(bids) {
        if (bids === undefined || bids.length === 0) {
            return;
        }
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

    $scope.addCourse = function(id) {
        var otherClass = where($rootScope.state.cart, 'id', id);
        if (otherClass === undefined) {
            $rootScope.state.cart.push({
                id: id
            });
        }
    };


    $scope.params = Params.get();


});
