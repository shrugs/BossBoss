'use strict';

angular.module('bossBossApp')
.factory('Course', function ($resource, School) {
    return $resource('/api/schools/:sid/terms/:tid/courses/:id', {
        sid: School.id,
        tid: School.thisTerm
    });
});
