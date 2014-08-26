'use strict';

angular.module('bossBossApp')
.controller('MainCtrl', function ($scope, $http, $rootScope, Search, Params, debounce, where, $location, localStorageService) {

    var isFirstRun = true;

    $scope.searchParams = localStorageService.get('searchParams') || {
        terms: [1]
    };
    $scope.results = localStorageService.get('results') || undefined;

    $scope.$watch('searchParams', debounce(function(p) {
        if (angular.isUndefined(p)) {
            return;
        }
        localStorageService.set('searchParams', p);

        if (!isFirstRun || $scope.results === undefined) {
            console.log('Searching...', p);
            $scope.results = Search.get(p);
            $scope.results.$promise.then(function(results) {
                console.log(results);
                localStorageService.set('results', results);
            });
        }
        isFirstRun = false;
    }, 500, true), true);

    $scope.goTo = function(url) {
        $location.path(url);
    };

    // $scope.$watch('searchParams.buildings', function(bids) {
    //     if (bids === undefined || bids.length === 0) {
    //         return;
    //     }
    //     var r = [];
    //     angular.forEach(bids, function(bid) {
    //         var thisBuilding = where($scope.params.buildings, 'id', parseInt(bid, 10));
    //         if (!angular.isUndefined(thisBuilding)) {
    //             angular.forEach(thisBuilding.rooms, function(room) {
    //                 r.push(room);
    //             });
    //         }
    //     });
    //     $scope.possibleRooms = r;
    // });

    $scope.addCourse = function(id) {
        var otherClass = where($rootScope.state.cart, 'id', id);
        if (otherClass === undefined) {
            $rootScope.state.cart.push({
                id: id
            });
        }
    };

    $scope.params = localStorageService.get('params') || undefined;
    if ($scope.params === undefined) {
        Params.get().$promise.then(function(params) {
            $scope.params = params;
            localStorageService.set('params', params);
        });
    }


});
