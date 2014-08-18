'use strict';

angular.module('bossBossApp')
.factory('State', function () {
    var state = {};

    function getState() {
        return state;
    }

    function setState(s) {
        state = s;
    }

    return {
        state: getState,
        setState: setState
    };
});
