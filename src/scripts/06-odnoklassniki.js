'use strict';

angular.module("ngSocial").directive('ngSocialOdnoklassniki', ['$parse', function ($parse) {
  var options = {
    counter: {
      url: 'http://connect.ok.ru/dk?st.cmd=extLike&ref={url}&uid={index}',
      get: function (jsonUrl, deferred, $http) {
        if (!options._) {
          options._ = [];
          if (!window.ODKL) window.ODKL = {};
          window.ODKL.updateCount = function(idx, number) {
            options._[idx].resolve(number);
          };
        }

        var index = options._.length;
        options._.push(deferred);
        $http.jsonp(jsonUrl.replace('{index}', index));
      }
    },
    popup: {
      url: 'http://connect.ok.ru/dk?st.cmd=WidgetSharePreview&service=odnoklassniki&st.shareUrl={url}',
      width: 550,
      height: 360
    },
    track: {
      'name': 'Odnoklassniki',
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
    link: function (scope, element, attrs, ctrl) {
      element.addClass('ng-social-odnoklassniki');
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
  }
}]);
