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
    $routeProvider
    .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
    })
    .when('/schedule', {
        templateUrl: 'views/schedule.html',
        controller: 'ScheduleCtrl'
    })
    .when('/about', {
        templateUrl: 'views/about.html'
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
        'http://api.bossboss.tk/api/1/default/:term',
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
        'http://api.bossboss.tk/api/1/search/',
        {},
        {
            get: {method: 'GET', isArray: true}
        }
    );
}).factory('Classes', function($resource) {
    return $resource(
        'http://api.bossboss.tk/api/1/classes/',
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

            $scope.getStyle = function(day, i) {
                if ($scope.calEvents !== undefined && i < $scope.calEvents[day].length) {
                    return $scope.calEvents[day][i].style;
                }
            };
            var colors = [
                'rgb(255, 84, 84)',
                'rgb(47, 47, 255)',
                'rgb(52, 134, 52)',
                'rgb(139, 137, 137)',
                'rgb(235, 101, 247)',
                'rgb(143, 135, 97)',
                'rgb(203, 122, 214)',
                'rgb(84, 221, 255)'

            ];
            $scope.$watch('selectedClasses', function() {
                // every time selectedClasses changes, we want to update the calendar

                $scope.hours = ['7:00AM', '8:00AM', '9:00AM', '10:00AM', '11:00AM', '12:00PM', '1:00PM', '2:00PM', '3:00PM', '4:00PM', '5:00PM', '6:00PM', '7:00PM', '8:00PM'];
                var h = element.parent().height()*0.90;
                var hourHeight = Math.floor(h/$scope.hours.length);


                var startTime = new Date(0,0,0, 7, 0, 0, 0);

                $scope.hourStyle = {
                    height: hourHeight.toString()+'px'
                };

                var dTime = function(d) {
                    return d.getHours() + d.getMinutes()/60;
                };


                var updateCalendar = function(classes) {

                    var count = 0;

                    $scope.calEvents = {
                        'M': [],
                        'T': [],
                        'W': [],
                        'R': [],
                        'F': []
                    };

                    angular.forEach(classes, function(c) {
                        // for each class, we want to make an element on the calendar
                        var ev = {
                            title: c.Course.CourseCode + '-' + c.SectionID,
                            description: c.Course.Course,
                            from: c.TimeStart,
                            to: c.TimeEnd,
                        };

                        var deltaTDuration = dTime(ev.to) - dTime(ev.from);
                        var deltaTStart = dTime(ev.from) - dTime(startTime);

                        ev.style = {
                            height: deltaTDuration*hourHeight + 'px',
                            top: (deltaTStart*hourHeight+hourHeight/2) + 'px',
                            backgroundColor: colors[count]
                        };

                        angular.forEach(c.Days.split(''), function(day) {
                            // for each day that the class is on, make and event
                            $scope.calEvents[day].push(ev);
                        });

                        if (count < colors.length-1) {
                            count ++;
                        } else {
                            count =0;
                        }
                    });
                };


                updateCalendar($scope.selectedClasses);
            }, true);
        }
    };
});

