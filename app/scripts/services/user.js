'use strict';

angular.module('bossBossApp')
.factory('User', function ($resource) {
    return $resource('/api/users/:id', {
        id: '@id'
    }, { //parameters default
        update: {
            method: 'PUT'
        },
        get: {
            method: 'GET',
            params: {
                id:'me'
            }
        }
	});
});
