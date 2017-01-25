require.config({
    baseUrl: "js",
    paths: {
        'angular': '../libs/angular/angular.min',
        'angular-route': '../libs/angular-route/angular-route.min',
        'angularAMD': '../libs/angularAMD/angularAMD.min',
        'bootstrap': '../libs/bootstrap/dist/js/bootstrap.min',
        'jquery': '../libs/jquery/dist/jquery.min',
        'typeahead': '../libs/typeahead/dist/typeahead.jquery',
        'bloodhound': '../libs/typeahead/dist/bloodhound'
    },
    shim: { 'angularAMD': ['angular'],
            'angular-route': ['angular'],
            'bootstrap': ['jquery'],
            'typeahead':{
                'deps': ['jquery'],
                'init': function ($) {
                    return require.s.contexts._.registry['typeahead.js'].factory( $ );
                }
            },
            'bloodhound': {
                'deps': ['jquery'],
                'exports': 'Bloodhound'
            },
            'ui-bootstrap': ['bootstrap']
        },
    deps: ['app']
});