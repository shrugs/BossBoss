'use strict';

angular.module('bossBossApp')
.directive('bbDrawer', function ($rootScope, $window) {
    return {
        templateUrl: 'partials/bbdrawer.html',
        restrict: 'AE',
        link: function postLink($scope, element) {


            $scope.handleWindow = function() {
                $scope.drawerState = element.width() > 100;
                $scope.chevronHeight = (angular.element($window).height() / 2).toString() + 'px';
                angular.element('.drawer-handle').height(angular.element($window).height() - angular.element('.navbar').first().height() - 50);
            };

            $scope.handleWindow();
            angular.element($window).bind('resize', function() {
                $scope.handleWindow();
                return $scope.$apply();
            });

            $scope.removeCourse = function(i) {

            };

            $scope.open = function() {
                $scope.drawerState = true;
                var md = angular.element('.drawer.mobile');
                md.removeClass('col-xs-1').addClass('col-xs-12');
                md.removeClass('col-sm-1').addClass('col-sm-12');
            };
            $scope.close = function() {
                $scope.drawerState = false;
                var md = angular.element('.drawer.mobile');
                md.removeClass('col-xs-12').addClass('col-xs-1');
                md.removeClass('col-sm-12').addClass('col-sm-1');
            };

            $scope.toggle = function() {
                if ($scope.drawerState) {
                    $scope.close();
                } else {
                    $scope.open();
                }
            };

            $rootScope.$watch('state', function() {
                $scope.state = $rootScope.state;
            }, true);

        }
    };
});
