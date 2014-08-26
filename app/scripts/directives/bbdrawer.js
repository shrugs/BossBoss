'use strict';

angular.module('bossBossApp')
.directive('bbDrawer', function ($rootScope, $window, Course, where, $location) {
    return {
        templateUrl: 'partials/bbdrawer.html',
        restrict: 'AE',
        link: function postLink($scope, element) {

            $scope.classes = {};
            $scope.courses = {};

            $scope.handleWindow = function() {
                // 300 happens to be the width of a col-md-4 and is conveniently also below smartphone min-width
                $scope.drawerState = element.width() >= 300;
                $scope.chevronHeight = (angular.element($window).height()*0.3).toString() + 'px';
                angular.element('.drawer-handle').height(angular.element($window).height() - angular.element('.navbar').first().height() - 100);
            };

            $scope.handleWindow();
            // angular.element($window).bind('resize', function() {
            //     $scope.handleWindow();
            //     return $scope.$apply();
            // });

            $scope.removeCourse = function(i) {
                $rootScope.state.cart.splice(i, 1);
            };

            $scope.open = function() {
                $scope.drawerState = true;
                // show backdrop
                angular.element('.backdrop').show();
            };
            $scope.close = function() {
                $scope.drawerState = false;
                angular.element('.backdrop').hide();
            };

            $scope.toggle = function() {
                if ($scope.drawerState) {
                    $scope.close();
                } else {
                    $scope.open();
                }
            };

            $scope.shouldShowSchedule = function() {
                return $location.path() !== '/schedule';
            };

            $scope.chooseClass = function(c) {
                var i = $rootScope.state.cart.indexOf(where($rootScope.state.cart, 'id', c.course_id));
                if ($rootScope.state.cart[i].class === undefined) {
                    $rootScope.state.cart[i].class = {};
                }
                $rootScope.state.cart[i].class.id = c.id;
            };

            $scope.$watch('drawerState', function(s) {
                var md = angular.element('.drawer.mobile');
                if (s) {
                    md.removeClass('col-xs-1').addClass('col-xs-12');
                    md.removeClass('col-sm-1').addClass('col-sm-12');
                } else {
                    md.removeClass('col-xs-12').addClass('col-xs-1');
                    md.removeClass('col-sm-12').addClass('col-sm-1');
                }
            });

            $scope.onClassClick = function(id) {
                angular.element('.course' + id).dropdown('toggle');
            };

            $rootScope.$watch('state.cart', function() {
                angular.forEach($scope.state.cart, function(c) {
                    if ($rootScope.cachedCourseResult[c.id] === undefined) {
                        $rootScope.cachedCourseResult[c.id] = Course.get({id: c.id}).$promise.then(function(course) {
                            var classes_by_id = {};
                            angular.forEach(course.classes, function(c) {
                                classes_by_id[c.id] = c;
                            });
                            $rootScope.classes[course.id] = classes_by_id;
                            $rootScope.courses[course.id] = course;
                        });
                    }
                });
            }, true);

        }
    };
});
