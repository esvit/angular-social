'use strict';

angular.module("ngSocial").directive('ngSocialGithub', function () {
  var options = {
    counter: {
      url: '//api.github.com/repos/{user}/{repository}?callback=JSON_CALLBACK',
      getNumber: function (data) {
        return data.data.watchers_count;
      }
    },
    clickUrl: 'https://github.com/{user}/{repository}/'
  };
  return {
    restrict: 'C',
    require: '^?ngSocialButtons',
    scope: {
      user: "=user",
      repository: "=repository"
    },
    replace: true,
    transclude: true,
    template: '<li> \
                    <a ng-href="{{ctrl.link(options)}}" target="_blank" class="ng-social-button"> \
                        <span class="ng-social-icon"></span> \
                        <span class="ng-social-text" ng-transclude></span> \
                    </a> \
                    <span ng-show="count" class="ng-social-counter">{{ count }}</span> \
                   </li>',
    link: function (scope, element, attrs, ctrl) {
      element.addClass('ng-social-github');
      if (!ctrl) {
        return;
      }

      scope.$watchGroup(['user', 'repository'], function(newValues, oldValues) {
        if(newValues) {
          options.urlOptions = {
            user: newValues[0],
            repository: newValues[1]
          };
          scope.options = options;
          scope.ctrl = ctrl;
          ctrl.init(scope, element, options);
        }
      });
    }
  }
});
