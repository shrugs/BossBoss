'use strict';

angular.module('bossBossApp')
.factory('Compare', function ($resource) {
    return $resource('/api/compare');
});
