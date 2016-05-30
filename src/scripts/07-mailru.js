'use strict';

angular.module("ngSocial").directive('ngSocialMailru', ['$parse', function ($parse) {
  var options = {
    counter: {
      url: '//connect.mail.ru/share_count?url_list={url}&callback=1&func=JSON_CALLBACK',
      getNumber: function (data) {
        for (var url in data) if (data.hasOwnProperty(url)) {
          return data[url].shares;
        }
      }
    },
    popup: {
      url: 'http://connect.mail.ru/share?share_url={url}&title={title}&description={description}&image_url={image}',
      width: 550,
      height: 360
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
      element.addClass('ng-social-mailru');
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
  }
}]);
