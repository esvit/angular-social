app.directive('ngSocialFacebook', ['$parse', function ($parse) {
  'use strict';

  var options = {
    counter: {
      url: '//graph.facebook.com/fql?q=SELECT+total_count+FROM+link_stat+WHERE+url%3D%22{url}%22' +
      '&callback=JSON_CALLBACK',
      getNumber: function (data) {
        if (0 === data.data.length) {
          return 0;
        }

        return data.data[0].total_count;
      }
    },
    popup: {
      url: 'http://www.facebook.com/sharer/sharer.php?u={url}',
      width: 600,
      height: 500
    },
    track: {
      'name': 'facebook',
      'action': 'send'
    }
  };
  return {
    restrict: 'C',
    require: '^?ngSocialButtons',
    scope: true,
    replace: true,
    transclude: true,
    template: '<li>' +
    '<a ng-href="{{ctrl.link(options)}}" target="_blank" ng-click="ctrl.clickShare($event, options)"' +
    ' class="ng-social-button">' +
    '<span class="ng-social-icon"></span>' +
    '<span class="ng-social-text" ng-transclude></span>' +
    '</a>' +
    '<span ng-show="count" class="ng-social-counter">{{ count }}</span>' +
    '</li>',
    link: function (scope, element, attrs, ctrl) {
      element.addClass('ng-social-facebook');
      if (!ctrl) {
        return;
      }
      options.urlOptions = {
        url: $parse(attrs.url)(scope)
      };
      scope.options = options;
      scope.ctrl = ctrl;
      ctrl.init(scope, element, options);
    }
  };
}]);
