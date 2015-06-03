'use strict';

angular.module("ngSocial").directive('ngSocialPinterest', ['$parse', function ($parse) {
  var options = {
    counter: {
      url: '//api.pinterest.com/v1/urls/count.json?url={url}&callback=JSON_CALLBACK',
      getNumber: function (data) {
        return data.count;
      }
    },
    popup: {
      url: 'http://pinterest.com/pin/create/button/?url={url}&description={title}&media={image}',
      width: 630,
      height: 270
    }
  };
  return {
    restrict: 'C',
    require: '^?ngSocialButtons',
    scope: {
      url: "=url",
      title: "=title",
      image: "=image"
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
      element.addClass('ng-social-pinterest');
      if (!ctrl) {
        return;
      }
    
      scope.$watchGroup(['title', 'url', 'image'], function(newValues, oldValues) {
        if(newValues) {
          options.urlOptions = {
            title: newValues[0],
            url: newValues[1],
	        image: newValues[2]
          };
          scope.options = options;
          scope.ctrl = ctrl;
          ctrl.init(scope, element, options);
        }
      });
    }
  }
}]);
