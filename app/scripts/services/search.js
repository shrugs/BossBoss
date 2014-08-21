'use strict';

angular.module('bossBossApp')
.factory('Search', function ($resource, School) {
    return $resource(School.baseURL + '/search');
});
