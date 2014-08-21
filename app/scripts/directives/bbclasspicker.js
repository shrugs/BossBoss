'use strict';

angular.module('bossBossApp')
.directive('bbClassPicker', function () {
    return {
        templateUrl: 'partials/bbClassPicker',
        restrict: 'AE',
        scope: {
            classes: '=',
            onChoice: '='
        },
        link: function postLink($scope, element) {

        }
    };
});
