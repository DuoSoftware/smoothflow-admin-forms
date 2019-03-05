//added by lakmini 18/08/2017
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
            templateUrl: 'partial-signup.html',
            controller: 'SignUpCtrl'
        })
        .state('signin', {
            url: '/signin',
            templateUrl: 'partial-login.html',
            controller: 'SignInCtrl'
        })
        .state('verify', {
            url: '/verify/',
            templateUrl: 'partial-verify.html',
            params: {
                email: undefined
            },
            controller: 'VerifyCtrl'
        })
        .state('workspace', {
            url: '/workspace',
            templateUrl: 'partial-workspace.html',
            controller: 'WorkspaceCtrl'
        })
        .state('auth', {
            url: '/auth',
            templateUrl: 'partial-auth.html',
            controller: 'maincontrol'
        })
        .state('contactsupport', {
            url: '/contactsupport',
            templateUrl: 'partial-activate.html',
            controller: 'contactsupport'
        })
        .state('activate', {
            url: '/activate',
            templateUrl: 'activated.html',
            controller: 'activated'
        })
        .state('tenant', {
            url: '/tenant',
            templateUrl: 'tenant.html',
            controller: 'maincontrol'
        });;
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
mainModule.controller("contactsupport", function ($rootScope, $scope, $location) {
    if ($rootScope.location.search().error != "") {
        $scope.pagemessage = $rootScope.location.search().error;
        $scope.activeshow = false;
        $scope.errorshow = true;
    }
});
mainModule.controller("activated", function ($rootScope, $scope, $location, $v6urls, $http) {
    if ($rootScope.location.search().code != "") {
        $scope.userCode = $rootScope.location.search().code;

        $http({
            method: 'GET',
            url: $v6urls.auth + '/tenants/acceptinvite' + $scope.userCode,
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(function (response) {
            $scope.activeStatus = response.data;

        }, function (response) {
            console.log(response);
        });
    }
    $scope.lunchApp = function () {
        if ($scope.activeStatus.Status) {
            window.location.href = 'https://dev.smoothflow.io/';
        } else {
            window.location.href = 'https://dev.smoothflow.io/';
        }

    }
});
mainModule.factory('UserService', function ($http, $v6urls, baseUrls) {

    getOranizationExistence = function (orgName) {
        if (!orgName) { return Promise.reject('Organization name cannot be null or empty'); }
        else {
            var url = $v6urls.userService.url+'/'+$v6urls.userService.version+'/Organization/'+orgName+'/exists';
            return $http.get(url).then(function (data) {
                if (data) {
                    return { organizationName: orgName, availability: data}
                }else {
                }
            }, function (err) {
    
            });
        }
    };

    getOwnerExistence = function (owner) {
        if (!owner) {return Promise.reject('Owner cannot be null or empty'); }
        else {
            var url = $v6urls.userService.url+'/'+$v6urls.userService.version+'/Owner/'+owner+'/exists';
            return $http.get(url).then(function (data) {
                if (data) {
                    return { ownerName: owner, availability: data}
                }else {
                }
            }, function (err) {

            });
        }
    }

    return {
        getOranizationExistence: getOranizationExistence,
        getOwnerExistence: getOwnerExistence
    }
});

mainModule.controller('SignUpCtrl', function ($scope, $auth, UserService, $mdDialog, $state, $stateParams) {
    console.log('signup controller');

    $scope.user = {};
    $scope.emailSuccess = true;

    SignUp = function () {
        debugger;
        var user = angular.merge({
            timeZone: "",
        }, $scope.user);
      
        $mdDialog.show({
            template: '<md-dialog ng-cloak>'+'<md-dialog-content>'+'<div style="height:auto; width:auto; padding:10px;" layout="row" layout-align="start center">'+'<md-progress-circular md-mode="indeterminate"></md-progress-circular>'+'<span>'+'Processing your request. Please wait...'+'</span>'+'</div>'+'</md-dialog-content>'+'</md-dialog>',
            parent: angular.element(document.body),
            clickOutsideToClose: false
        });

        $auth.signup(user).then(function (res) {
            $mdDialog.hide();
            $state.go('verify', {
                    email: user.mail
            });


        }, function (err) {
            console.log(err);
            $mdDialog.show($mdDialog.alert().title('Error').content(err.data.message).ariaLabel('ERROR').ok('OKAY').targetEvent());
        
        })
    }

    check = function() {
        console.log(document.getElementById('password').value);
        console.log(document.getElementById('cpassword').value);

        if (document.getElementById('password').value == document.getElementById('cpassword').value){
            // document.getElementById('message').style.color = 'green';
            $scope.confirm = true;
        } else {
            if(document.getElementById('cpassword').value === ""){

            }
            // document.getElementById('message').style.color = 'red';
            $scope.confirm = false;
        }
        // if(=$scope.user.cpassword){

        // }
    }

    CheckOraganizationAvailability = function () {
        var previouslySearchedOn = "";

        return function (currentEntry) {
            if (previouslySearchedOn === currentEntry) { return; }
            else {
                UserService.getOranizationExistence(currentEntry).then(function (res) {
                    previouslySearchedOn = currentEntry;
                    console.log(res.availability.data.IsSuccess);
                    if(res.availability.data.IsSuccess === false){
                        $scope.isavalableCname = true;
                    }
                    else{
                        $scope.isavalableCname = false;
                    }
                }).catch(function (err) {
                    console.log(err);
                });
            }
        }
    }();

    CheckOwnerAvailability = function () {
        var previouslySearchedOn = "";

        return function (currentEntry) {
            if (previouslySearchedOn === currentEntry) { return; }
            else {
                UserService.getOwnerExistence(currentEntry).then(function (res) {
                   previouslySearchedOn = currentEntry;
                   if(res.availability.data.IsSuccess === false){
                        $scope.isavalable = true;
                    }
                    else{
                        $scope.isavalable = false;
                    }
                }).catch(function (err) {
                    console.log(err)
                });
            }
        }
    }();

    signin = function(){
        $state.go('signin');
    }

    $scope.onSignUp = SignUp;
    $scope.check = check;
    $scope.onCheckOraganizationAvailability = CheckOraganizationAvailability;
    $scope.onCheckOwnerAvailability = CheckOwnerAvailability;
    $scope.signin = signin;
});

mainModule.controller('VerifyCtrl', function ($scope, $auth, $state, $stateParams) {
    console.log('verify controller');
    console.log($stateParams);
    if ($stateParams && $stateParams.email) {
        $scope.usermail = $stateParams.email
    }
    // $scope.usermail = $state.params.email
});

mainModule.controller('SignInCtrl', function ($scope, $auth, $mdDialog, $base64, AppConfigurations, UserService) {
    console.log('signin controller');

    $scope.user = {};

    SignIn = function () {
        var user = {}, 
            clientID = $base64.encode(AppConfigurations.FacetoneClientId) || "";

        user = angular.merge({
            clientID: clientID,
            console: 'SMOOTH_FLOW_CONSOLE',
            scope: []
        }, $scope.user);

        $auth.login(user, {
            Authorization: 'Basic ' + clientID
        }).then(function (res) {
            
        }, function (err) {
              $mdDialog.show($mdDialog.alert().title('Error').content(err.data.message).ariaLabel('ERROR').ok('OKAY').targetEvent());

        });
    }

    $scope.onSignIn = SignIn;
});
mainModule.controller('WorkspaceCtrl', function ($scope, $auth) { 
    console.log('workspace controller');

    var host = window.location.host.replace(/(^\w+:|^)\/\//, '');

    if (AppConfigurations.BaseDomain === host) {

    }
});
