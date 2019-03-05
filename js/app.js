var mainModule = angular.module("admincontrols", ['ngMaterial', 'uiMicrokernel', 'ui.router', 'ngCookies', 'cfp.hotkeys', 'satellizer', 'base64']).run(function ($rootScope, $location) {
    $rootScope.location = $location;
});

mainModule.constant("AppConfigurations", {
    BaseDomain: "localhost:81",
    FacetoneClientId: "3e68cdd0-1bb0-11e8-a2d3-754f63b10f12"
})
    mainModule.config(function ($urlRouterProvider, $stateProvider, $authProvider, $v6urlsProvider) {
    
    var v6urls = $v6urlsProvider.$get();
    
    $authProvider.loginUrl = v6urls.userService.url + '/auth/login';
    $authProvider.signupUrl  = v6urls.userService.url + '/auth/signup';

    $urlRouterProvider.otherwise('/signup');
    $stateProvider
        .state('signup', {
            url: '/signup',
            templateUrl: 'panels/partial-signup.html',
            controller: 'SignUpCtrl'
        })
        .state('signin', {
            url: '/signin',
            templateUrl: 'panels/partial-login.html',
            controller: 'SignInCtrl'
        })
});

mainModule.controller("maincontrol", function ($rootScope, $scope, $location, $helpers, $v6urls, $http, $timeout) {
    console.log('main controller');
    //check tenat and validate
    $scope.show = false;
    $scope.message = "";
    $rootScope.IsBusy = false;
    $scope.validateTenant = function (tenant) {
        $scope.show = true;

        $http({
            method: 'GET',
            url: $v6urls.auth + '/tenants/' + tenant,//api for validate tenant   
            headers: {
                'Content-Type': 'application/json',
                'Securitytoken': $helpers.getCookie("securityToken")
            },
        }).then(function (response) {

            if (response.data.Status == true) {
                console.log(response);
                $scope.message = 'Already exists';
                $scope.tenant = "";
            } else if (response.data.Message == 'Securitytoken not found in header.') {
                $scope.message = 'Error in Process';
            } else {
                var cTanent = $helpers.getHost();
                var res = cTanent.split('.');
                if (res[1] == "dev") {
                    window.location.href = 'https://dev.smoothflow.io/auth/signupclosure?tenant=' + tenant;
                } else {
                    window.location.href = 'https://smoothflow.io/auth/signupclosure?tenant=' + tenant;
                }
                // window.location.href = 'https://dev.smoothflow.io/auth/signupclosure?tenant=' + tenant;
            }
            $scope.show = false;
        }, function (response) {
            $scope.show = false;
            console.log(response);
        });
    };
});