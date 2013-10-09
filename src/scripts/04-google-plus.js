'use strict';

angular.module("ngSocial").directive('ngSocialGooglePlus', function() {
    var options = {
        popup: {
            url: 'https://plus.google.com/share?url={url}',
            width: 700,
            height: 500
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
            scope.options = options;
            scope.ctrl = ctrl;
            ctrl.init(scope, element, options);
        }
    }
});
