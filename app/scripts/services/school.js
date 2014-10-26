'use strict';

angular.module('bossBossApp')
.factory('School', function () {
    var id = 1;
    var thisTerm = 4; // Winter 2015
    return {
        baseURL: '/api/schools/' + id.toString(),
        thisTerm: thisTerm,
        id: id
    };
});
