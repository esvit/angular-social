app.directive('ngSocialGooglePlus', ['$parse', function($parse) {
    'use strict';

    var options = {
        counter: {
            url: '{proxy}?url={url}&type=google-plus&callback=JSON_CALLBACK',
            getNumber: function(data) {
                return data.count;
            }
        },
        popup: {
            url: 'https://plus.google.com/share?url={url}',
            width: 700,
            height: 500
        },
        track: {
            'name': 'Google+',
            'action': 'share'
        }
    };
    return {
        restrict: 'C',
        require: '^?ngSocialButtons',
        scope: true,
        replace: true,
        transclude: true,
        template: '<li> \
                    <a ng-href="{{ctrl.link(options)}}" target="_blank" ng-click="ctrl.clickShare($event, options)" class="ng-social-button"> \
                        <span class="ng-social-icon"></span> \
                        <span class="ng-social-text" ng-transclude></span> \
                    </a> \
                    <span ng-show="count" class="ng-social-counter">{{ count }}</span> \
                   </li>',
        link: function(scope, element, attrs, ctrl) {
            element.addClass('ng-social-google-plus');
            if (!ctrl) {
                return;
            }
            var proxyUrl = $parse(attrs.proxyUrl)(scope) || '/proxy.php';
            options.counter.url = options.counter.url.replace('{proxy}', proxyUrl);
            scope.options = options;
            scope.ctrl = ctrl;
            ctrl.init(scope, element, options);
        }
    };
}]);
