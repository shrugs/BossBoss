'use strict';

angular.module('bossBossApp')
.controller('ScheduleCtrl', function ($scope, $rootScope, $timeout, Course) {

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

    $scope.hours = ['7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm'];

    // 7am
    var startTime = new Date(0,0,0, 7, 0, 0, 0);

    function tToD(t) {
        t = t.split(':');
        var hours = parseInt(t[0], 10),
            minutes = parseInt(t[1]);

        return new Date(0,0,0, hours, minutes, 0,0);
    }

    function dTime(d) {
        return d.getHours() + d.getMinutes()/60;
    }

    $rootScope.$watch('state.cart', function(courses) {
        $scope.alerts = [];
        $timeout(function() {
            // every time selectedClasses changes, we want to update the calendar
            var h = angular.element('.calendar').find('tr.events').first().height();
            var hourHeight = Math.floor(h/$scope.hours.length);

            var count = 0;

            $scope.calEvents = {
                'M': [],
                'T': [],
                'W': [],
                'R': [],
                'F': []
            };

            $scope.hourHeights = [];
            for (var i = 0; i < $scope.hours.length; i++) {
                $scope.hourHeights.push(hourHeight*i + 'px');
            }

            angular.forEach(courses, function(course) {
                if ($rootScope.cachedCourseResult[course.id] === undefined) {
                    $rootScope.cachedCourseResult[course.id] = Course.get({id: course.id}).$promise.then(function(course) {
                        var classes_by_id = {};
                        angular.forEach(course.classes, function(c) {
                            classes_by_id[c.id] = c;
                        });
                        $rootScope.classes[course.id] = classes_by_id;
                        $rootScope.courses[course.id] = course;
                    });
                }
                $rootScope.cachedCourseResult[course.id].then(function() {
                    if (course.class === undefined) {
                        return;
                    }
                    var c = $rootScope.classes[course.id][course.class.id];
                    course = $rootScope.courses[course.id];
                    $rootScope.courses[course.id].bgcolor = colors[count];
                    // for each class, we want to make an element on the calendar for each day that it's in
                    if (c.times.info !== undefined) {
                        // no time :(
                        $scope.alerts.push({
                            title: 'Heads up!',
                            desc: 'Unknown time for ' + course.code + '!'
                        });
                        return;
                    }
                    if (c.is_credit_exam) {
                        $scope.alerts.push({
                            title: 'Heads up!',
                            desc: 'You\'ve selected a credit exam for ' + course.code + ', so it won\'t show on the calendar!'
                        });
                        return;
                    }
                    angular.forEach(c.times, function(time, day) {
                        var ev = {
                            title: course.code + '-' + c.section,
                            description: c.name,
                            start: tToD(time.start),
                            end: tToD(time.end)
                        };

                        var deltaTDuration = dTime(ev.end) - dTime(ev.start);
                        var deltaTStart = dTime(ev.start) - dTime(startTime);

                        ev.style = {
                            height: deltaTDuration*hourHeight + 'px',
                            top: (deltaTStart*hourHeight+hourHeight/2) + 'px',
                            backgroundColor: colors[count]
                        };

                        $scope.calEvents[day].push(ev);
                    });

                    if (count < colors.length-1) {
                        count ++;
                    } else {
                        count =0;
                    }
                });

            });
        });
    }, true);
});
