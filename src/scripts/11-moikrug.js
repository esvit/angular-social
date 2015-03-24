app.directive('ngSocialMoiKrug', ['$parse', function ($parse) {
    'use strict';

    var options = {
        popup: {
            url: '//share.yandex.ru/go.xml?service=moikrug&url={url}&title={title}',
            width: 800,
            height: 600
        },
        track: {
            'name': 'MoiKrug',
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
                   </li>',
        link: function (scope, element, attrs, ctrl) {
            element.addClass('ng-social-moi-krug');
            if (!ctrl) {
                return;
            }
            options.urlOptions = {
              url: $parse(attrs.url)(scope),
              title: $parse(attrs.title)(scope)
            };
            scope.options = options;
            scope.ctrl = ctrl;
            ctrl.init(scope, element, options);
        }
    };
}]);
