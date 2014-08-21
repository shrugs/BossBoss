'use strict';

angular.module('bossBossApp')
.factory('School', function () {
    var id = 1;

    return {
        baseURL: '/api/schools/' + id.toString(),
        thisTerm: 1,
        id: id
    };
});
