app.directive('ngSocialVk', ['$parse', function ($parse) {
  'use strict';

  var options = {
    counter: {
      url: '//vkontakte.ru/share.php?act=count&url={url}&index={index}',
      get: function (jsonUrl, deferred, $http) {
        if (!options._) {
          options._ = [];
          if (!window.VK) window.VK = {};
          window.VK.Share = {
            count: function (idx, number) {
              options._[idx].resolve(number);
            }
          };
        }

        var index = options._.length;
        options._.push(deferred);
        $http.jsonp(jsonUrl.replace('{index}', index));
      }
    },
    popup: {
      url: 'http://vk.com/share.php?url={url}&title={title}&description={description}&image={image}',
      width: 550,
      height: 330
    },
    track: {
      'name': 'VKontakte',
      'action': 'share'
    }
  };
  return {
    restrict: 'C',
    require: '^?ngSocialButtons',
    replace: true,
    scope: {
      url: "=url",
      description: "=description",
      title: "=title",
      image: "=image"
    },
    transclude: true,
    template: '<li> \
                    <a ng-href="{{ctrl.link(options)}}" target="_blank" ng-click="ctrl.clickShare($event, options)" class="ng-social-button"> \
                        <span class="ng-social-icon"></span> \
                        <span class="ng-social-text" ng-transclude></span> \
                    </a> \
                    <span ng-show="count" class="ng-social-counter">{{ count }}</span> \
                   </li>',
    link: function (scope, element, attrs, ctrl) {
      element.addClass('ng-social-vk');
      if (!ctrl) {
        return;
      }

      scope.$watchGroup(['url', 'description', 'title', 'image'], function(newValues, oldValues) {
        if(newValues) {
          options.urlOptions = {
            url: newValues[0],
            description: newValues[1],
            title: newValues[2],
            image: newValues[3]
          };
          scope.options = options;
          scope.ctrl = ctrl;
          ctrl.init(scope, element, options);
        }
      });
    }
  }
}]);
