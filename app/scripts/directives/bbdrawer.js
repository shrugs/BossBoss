'use strict';

angular.module('bossBossApp')
.directive('bbDrawer', function ($rootScope, $window) {
    return {
        templateUrl: 'partials/bbdrawer.html',
        restrict: 'AE',
        link: function postLink($scope, element) {

            $scope.handleWindow = function() {
                // 300 happens to be the width of a col-md-4 and is conveniently also below smartphone min-width
                $scope.drawerState = element.width() >= 300;
                console.log(element.width());
                $scope.chevronHeight = (angular.element($window).height() / 2).toString() + 'px';
                angular.element('.drawer-handle').height(angular.element($window).height() - angular.element('.navbar').first().height() - 50);
            };

            $scope.handleWindow();
            angular.element($window).bind('resize', function() {
                $scope.handleWindow();
                return $scope.$apply();
            });

            $scope.removeCourse = function(i) {
                $rootScope.data.courses.splice(i, 1);
            };

            $scope.open = function() {
                $scope.drawerState = true;
            };
            $scope.close = function() {
                $scope.drawerState = false;
            };

            $scope.toggle = function() {
                if ($scope.drawerState) {
                    $scope.close();
                } else {
                    $scope.open();
                }
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

            $rootScope.$watch('state', function() {
                $scope.state = $rootScope.state;
            }, true);

        }
    };
});
