require.config({
    baseUrl: "js",
    paths: {
        'angular': '../libs/angular/angular.min',
        'angular-route': '../libs/angular-route/angular-route.min',
        'angularAMD': '../libs/angularAMD/angularAMD.min'
    },
    shim: { 'angularAMD': ['angular'], 'angular-route': ['angular'] },
    deps: ['app']
});