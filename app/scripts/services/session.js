'use strict';

angular.module('bossBossApp')
  .factory('Session', function ($resource) {
    return $resource('/api/session/');
  });
