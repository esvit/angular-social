app.directive('ngSocialTwitter', ['$parse', function ($parse) {
  'use strict';

  var options = {
    counter: {
      url: '//urls.api.twitter.com/1/urls/count.json?url={url}&callback=JSON_CALLBACK',
      getNumber: function (data) {
        return data.count;
      }
    },
    popup: {
      url: 'http://twitter.com/intent/tweet?url={url}&text={title}',
      width: 600,
      height: 450
    },
    click: function (options) {
      // Add colon to improve readability
      if (!/[\.:\-–—]\s*$/.test(options.pageTitle)) options.pageTitle += ':';
      return true;
    },
    track: {
      'name': 'twitter',
      'action': 'tweet'
    }
  };
  return {
    restrict: 'C',
    require: '^?ngSocialButtons',
    scope: {
      url: "=url",
      title: "=title",
      description: "=description"
    },
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
      element.addClass('ng-social-twitter');
      if (!ctrl) {
        return;
      }

      scope.$watchGroup(['title', 'url', 'description'], function(newValues, oldValues) {
        if(newValues) {
          options.urlOptions = {
            title: newValues[0],
            url: newValues[1],
            description: newValues[2]
          };
          scope.options = options;
          scope.ctrl = ctrl;
          ctrl.init(scope, element, options);
        }
      });
    }
  }
}]);
