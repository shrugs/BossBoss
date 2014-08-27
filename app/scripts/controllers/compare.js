'use strict';

angular.module('bossBossApp')
.controller('CompareCtrl', function ($scope, Compare) {
    $scope.courses = Compare.query();
});
