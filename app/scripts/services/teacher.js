'use strict';

angular.module('bossBossApp')
.factory('Teacher', function ($resource, School) {
    return $resource('/api/schools/:sid/terms/:tid/teachers/:id', {
        sid: School.id,
        tid: School.thisTerm
    });
});
