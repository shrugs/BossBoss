'use strict';

angular.module('bossBossApp')
.factory('Params', function ($resource, School) {
    return $resource(School.baseURL + '/params');
});
