'use strict';

angular.module('bossBossApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ui.select2',
    'debounce',
    'LocalStorageModule',
    'facebook'
])
.config(function ($routeProvider, $locationProvider, $httpProvider, localStorageServiceProvider, FacebookProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/main',
            controller: 'MainCtrl'
        })
        .when('/signup', {
            templateUrl: 'partials/signup',
            controller: 'SignupCtrl'
        })
        .when('/settings', {
            templateUrl: 'partials/settings',
            controller: 'SettingsCtrl',
            authenticate: true
        })
        .when('/schedule', {
            templateUrl: 'partials/schedule',
            controller: 'ScheduleCtrl'
        })
        .when('/course/:id', {
          templateUrl: 'partials/course',
          controller: 'CourseCtrl'
        })
        .when('/teacher/:id', {
          templateUrl: 'partials/teacher',
          controller: 'TeacherCtrl'
        })
        .when('/about', {
          templateUrl: 'partials/about',
          controller: 'AboutCtrl'
        })
        .when('/compare', {
          templateUrl: 'partials/compare',
          controller: 'CompareCtrl',
          authenticate: true
        })
        .otherwise({
            redirectTo: '/'
        });

    $locationProvider.html5Mode(true);
    localStorageServiceProvider.setPrefix('BossBoss');

    // Intercept 401s and redirect you to login
    $httpProvider.interceptors.push(['$q', '$location', function($q, $location) {
        return {
            'responseError': function(response) {
                if(response.status === 401) {
                    $location.path('/login');
                    return $q.reject(response);
                }
                else {
                    return $q.reject(response);
                }
            }
        };
    }]);

    FacebookProvider.init('895105880503569');
})
.run(function ($rootScope, $location, Auth, State, uiSelect2Config, School, localStorageService) {

    uiSelect2Config.allowClear = true;
    State.start();
    $rootScope.cachedCourseResult = {};

    if (localStorageService.get('lastTerm') !== School.thisTerm) {
        localStorageService.clearAll();
    }

    localStorageService.set('lastTerm', School.thisTerm);

    // Auth.currentUser().$promise.then(function(user) {
    //     if (user.state.route) {
    //         $location.path(user.state.route);
    //     }
    // });
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$routeChangeStart', function (event, next) {

        if (next.authenticate && !Auth.isLoggedIn()) {
            $location.path('/login');
        }

        // save to state
        // $rootScope.state.route = $location.path();
    });
});