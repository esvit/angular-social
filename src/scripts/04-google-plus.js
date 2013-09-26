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
        controller: function($scope, $http) {
            /*var url = 'https://plusone.google.com/_/+1/fastbutton?url=' + encodeURIComponent('http://news.mistinfo.com/');
            $.get(url, function (data) { console.info(data);
                    var aggregate = $('#aggregateCount', data).html(),
                        exactMatch = $('script', data).html().match('\\s*c\\s*:\\s*(\\d+)');

                    $scope.count = exactMatch ? exactMatch[1] + ' (' + aggregate + ')' : aggregate;
                }
            );*/
        },
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