app.directive('ngSocialLinkedin', ['$parse', function($parse) {
    'use strict';

    var options = {
        counter: {
            url: '//www.linkedin.com/countserv/count/share?url={url}&format=jsonp&callback=JSON_CALLBACK',
            getNumber: function(data) {
                return data.count;
            }
        },
        popup: {
            url: 'http://www.linkedin.com/shareArticle?mini=true&url={url}&title={title}&summary={description}',
            width: 600,
            height: 450
        },
        click: function(options) {
            // Add colon to improve readability
            if (!/[\.:\-–—]\s*$/.test(options.pageTitle)) options.pageTitle += ':';
            return true;
        },
        track: {
            'name': 'LinkedIn',
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
            element.addClass('ng-social-linkedin');
            if (!ctrl) {
                return;
            }
            options.urlOptions = {
              url: $parse(attrs.url)(scope),
              title: $parse(attrs.title)(scope),
              description: $parse(attrs.description)(scope)
            };
            scope.options = options;
            scope.ctrl = ctrl;
            ctrl.init(scope, element, options);
        }
    }
}]);
