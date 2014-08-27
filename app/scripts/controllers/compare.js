'use strict';

angular.module('bossBossApp')
.controller('CompareCtrl', function ($scope, Compare, Facebook, localStorageService, $rootScope, debounce) {

    $scope.mutualCourses = localStorageService.get('mutualCourses');
    $scope.friends = {};

    $scope.loadProfilePictures = function() {
        // load profile pictures
        angular.forEach($scope.mutualCourses, function(course) {
            angular.forEach(course.mutual, function(friend) {
                $scope.friends[friend.id] = friend;
            });
        });

        angular.forEach($scope.friends, function(friend) {
            Facebook.api('/' + friend.id + '/picture', function(response) {
                friend.pic = response.data.url;
            });
        });
    };

    $scope.getMutuals = function() {
        $scope.mutualCourses = Compare.query();
        $scope.friends = {};
        $scope.mutualCourses.$promise.then(function(courses) {
            if (courses.length === 0) {
                $scope.fail = true;
            }
            localStorageService.set('mutualCourses', courses);
            $scope.loadProfilePictures();
        });
    };

    if ($scope.mutualCourses === undefined || $scope.mutualCourses === null) {
        $scope.getMutuals();
    } else {
        $scope.loadProfilePictures();
    }

    // this would work if we didn't have to wait for the state setting request to go through.
    // honestly, I don't give a shit anymore, so the refresh button is fine for me

    // $rootScope.$watch('state.cart', debounce(function(nv) {
    //     if (nv === undefined) {
    //         return;
    //     }

    //     $scope.getMutuals();
    // }, 200), true);

});
