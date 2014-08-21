'use strict';

angular.module('bossBossApp')
.factory('Course', function ($resource, School) {
    return $resource(School.baseURL + '/courses/:id');
});
