'use strict';

angular.module('bossBossApp')
.factory('where', function () {
    return function where(arr, key, val) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][key] === val) {
                return arr[i];
            }
        }
        return;
    };
});
