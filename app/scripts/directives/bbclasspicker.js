'use strict';

angular.module('bossBossApp')
.directive('bbClassPicker', function () {
    return {
        templateUrl: 'partials/bbClassPicker',
        restrict: 'AE',
        scope: {
            classes: '=',
            onChoice: '=',
            pickerId: '@'
        },
        link: function postLink($scope, element) {

        }
    };
});
