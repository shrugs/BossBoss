'use strict';

angular.module('BossBossApp', [
  'ngCookies',
  'ngResource',
  'ngRoute',
  'ngAnimate',
  'ngDebounce',
  'underscore',
  'LocalStorageModule'
])
.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
    })
    .when('/schedule', {
        templateUrl: 'views/schedule.html',
        controller: 'ScheduleCtrl'
    })
    .otherwise({
        redirectTo: '/'
    });
})
.directive('bbnav', function () {
    return {
        templateUrl: 'views/bbnav.html',
        restrict: 'E'
    };
})


.factory('DefaultClasses', function($resource) {
    return $resource(
        'http://bossboss.tk/api/1/default/:term',
        {term: 'Spring-2014'},
        {
            get: {method: 'GET', isArray: true}
        }
    );
})
.factory('Capitalize', function() {
    var cap = function(str) {
        return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    };

    return {
        capitalize: cap
    };
})
.factory('Search', function($resource) {
    return $resource(
        'http://bossboss.tk/api/1/search/',
        {},
        {
            get: {method: 'GET', isArray: true}
        }
    );
}).factory('Classes', function($resource) {
    return $resource(
        'http://bossboss.tk/api/1/classes/',
        {},
        {
            get: {method: 'GET', isArray: true}
        }
    );
})

.directive('bbcal', function() {

    return {
        remove: true,
        restrict: 'AE',
        templateUrl: 'views/bbcal.html',
        link: function($scope, element, attrs) {
            $scope.$watch('selectedClasses', function() {
                // every time selectedClasses changes, we want to update the calendar

                $scope.hours = ['7:00AM', '8:00AM', '9:00AM', '10:00AM', '11:00AM', '12:00PM', '1:00PM', '2:00PM', '3:00PM', '4:00PM', '5:00PM', '6:00PM', '7:00PM', '8:00PM'];
                var h = element.parent().height();
                var hourHeight = h/$scope.hours.length;

                angular.element('.col-hour-header').css({
                    height: hourHeight.toString()+'px'
                });

                var updateCalendar = function(classes) {

                    angular.forEach(classes, function(c) {
                        // for each class, we want to make an element
                    });
                };


                updateCalendar($scope.selectedClasses);
            }, true);
        }
    };
});

