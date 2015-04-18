function template(tmpl, context, filter) {
    'use strict';

    return tmpl.replace(/\{([^\}]+)\}/g, function (m, key) {
        // If key don't exists in the context we should keep template tag as is
        return key in context ? (filter ? filter(context[key]) : context[key]) : m;
    });
}

var app = angular.module('ngSocial', []);

app.directive('ngSocialButtons', ['$compile', '$q', '$parse', '$http', '$location',
    function ($compile, $q, $parse, $http, $location) {
        'use strict';

        return {
            restrict: 'A',
            scope: {
                'url': '=',
                'title': '=',
                'description': '=',
                'image': '=',
                'showcounts': '='
            },
            replace: true,
            transclude: true,
            template: '<div class="ng-social-container ng-cloak"><ul class="ng-social" ng-transclude></ul></div>',
            controller: ['$scope', '$q', '$http', function ($scope, $q, $http) {
                var getUrl = function () {
                    return $scope.url || $location.absUrl();
                }, ctrl = this;
                this.init = function (scope, element, options) {
                    if (options.counter) {
                        ctrl.getCount(scope.options).then(function (count) {
                            scope.count = count;
                        });
                    }
                };
                this.link = function (options) {
                        options = options || {};
                        var urlOptions = options.urlOptions || {};
                        urlOptions.url = getUrl();
                        if (!urlOptions.title) urlOptions.title = $scope.title;
                        if (!urlOptions.image) urlOptions.image = $scope.image;
                        if (!urlOptions.description) urlOptions.description = $scope.description || '';
                        return ctrl.makeUrl(options.clickUrl || options.popup.url, urlOptions);
                };
                this.clickShare = function (e, options) {
                    if (e.shiftKey || e.ctrlKey) {
                        return;
                    }
                    e.preventDefault();

                    if (options.track && typeof _gaq != 'undefined' && angular.isArray(_gaq)) {
                        _gaq.push(['_trackSocial', options.track.name, options.track.action, $scope.url]);
                    }

                    var process = true;
                    if (angular.isFunction(options.click)) {
                        process = options.click.call(this, options);
                    }
                    if (process) {
                        var url = ctrl.link(options);
                        ctrl.openPopup(url, options.popup);
                    }
                };
                this.openPopup = function (url, params) {
                    var left = Math.round(screen.width / 2 - params.width / 2),
                        top = 0;
                    if (screen.height > params.height) {
                        top = Math.round(screen.height / 3 - params.height / 2);
                    }

                    var win = window.open(
                        url,
                        'sl_' + this.service,
                        'left=' + left + ',top=' + top + ',' +
                        'width=' + params.width + ',height=' + params.height +
                        ',personalbar=0,toolbar=0,scrollbars=1,resizable=1'
                    );
                    if (win) {
                        win.focus();
                    } else {
                        location.href = url;
                    }
                };
                this.getCount = function (options) {
                    var def = $q.defer();
                    var urlOptions = options.urlOptions || {};
                    urlOptions.url = getUrl();
                    if (!urlOptions.title) urlOptions.title = $scope.title;
                    var url = ctrl.makeUrl(options.counter.url, urlOptions),
                        showcounts = angular.isUndefined($scope.showcounts) ? true : $scope.showcounts;

                    if (showcounts) {
                        if (options.counter.get) {
                            options.counter.get(url, def, $http);
                        } else {
                            $http.jsonp(url).success(function (res) {
                                if (options.counter.getNumber) {
                                    def.resolve(options.counter.getNumber(res));
                                } else {
                                    def.resolve(res);
                                }
                            });
                        }
                    }
                    return def.promise;
                };
                this.makeUrl = function (url, context) {
                    return template(url, context, encodeURIComponent);
                };
                return this;
            }]
        };
    }
    ]);

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
      element.addClass('ng-social-twitter');
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

app.directive('ngSocialGooglePlus', ['$parse', function ($parse) {
  'use strict';

  var options = {
    counter: {
      url: '//share.yandex.ru/gpp.xml?url={url}',
      getNumber: function (data) {
        return data.count;
      },
      get: function (jsonUrl, deferred, $http) {
        if (options._) {
          deferred.reject();
          return;
        }

        if (!window.services) window.services = {};
        window.services.gplus = {
          cb: function (number) {
            options._.resolve(number);
          }
        };

        options._ = deferred;
        $http.jsonp(jsonUrl);
      }
    },
    popup: {
      url: 'https://plus.google.com/share?url={url}',
      width: 700,
      height: 500
    },
    track: {
      'name': 'Google+',
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
      element.addClass('ng-social-google-plus');
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
      element.addClass('ng-social-vk');
      if (!ctrl) {
        return;
      }
      options.urlOptions = {
        url: $parse(attrs.url)(scope),
        title: $parse(attrs.title)(scope),
        description: $parse(attrs.description)(scope),
        image: $parse(attrs.image)(scope)
      };
      scope.options = options;
      scope.ctrl = ctrl;
      ctrl.init(scope, element, options);
    }
  }
}]);

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
      url: 'http://connect.mail.ru/share?share_url={url}&title={title}',
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
      element.addClass('ng-social-pinterest');
      if (!ctrl) {
        return;
      }
      options.urlOptions = {
        url: $parse(attrs.url)(scope),
        title: $parse(attrs.title)(scope),
        image: $parse(attrs.image)(scope)
      };
      scope.options = options;
      scope.ctrl = ctrl;
      ctrl.init(scope, element, options);
    }
  }
}]);

'use strict';

angular.module("ngSocial").directive('ngSocialGithubForks', function () {
  var options = {
    counter: {
      url: '//api.github.com/repos/{user}/{repository}?callback=JSON_CALLBACK',
      getNumber: function (data) {
        return data.data.forks_count;
      }
    },
    clickUrl: 'https://github.com/{user}/{repository}/'
  };
  return {
    restrict: 'C',
    require: '^?ngSocialButtons',
    scope: true,
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
      element.addClass('ng-social-github ng-social-github-forks');
      if (!ctrl) {
        return;
      }
      options.urlOptions = {
        'user': attrs.user,
        'repository': attrs.repository
      };
      scope.options = options;
      scope.ctrl = ctrl;
      ctrl.init(scope, element, options);
    }
  }
});

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
    scope: true,
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
      options.urlOptions = {
        'user': attrs.user,
        'repository': attrs.repository
      };
      scope.options = options;
      scope.ctrl = ctrl;
      ctrl.init(scope, element, options);
    }
  }
});

app.directive('ngSocialStumbleupon', ['$parse', function ($parse) {
    'use strict';

    var options = {
        counter: {
            url: '{proxy}?url={url}&type=stumbleupon&callback=JSON_CALLBACK',
            getNumber: function (data) {
                return data.count;
            }
        },
        popup: {
            url: 'http://www.stumbleupon.com/submit?url={url}&title={title}',
            width: 800,
            height: 600
        },
        track: {
            'name': 'StumbleUpon',
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
            element.addClass('ng-social-google-plus');
            if (!ctrl) {
                return;
            }
            options.urlOptions = {
              url: $parse(attrs.url)(scope),
              title: $parse(attrs.title)(scope)
            };
            var proxyUrl = $parse(attrs.proxyUrl)(scope) || '/proxy.php';
            options.counter.url = options.counter.url.replace('{proxy}', proxyUrl);
            scope.options = options;
            scope.ctrl = ctrl;
            ctrl.init(scope, element, options);
        }
    };
}]);

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

app.directive('ngSocialLinkedin', ['$parse', function($parse) {
    'use strict';

    var options = {
        counter: {
            url: '//www.linkedin.com/countserv/count/share?url={url}&format=jsonp&callback=JSON_CALLBACK',
            getNumber: function(data) {
                return data.count;
            }
        },
        popup: {
            url: 'http://www.linkedin.com/shareArticle?mini=true&url={url}&title={title}&summary={description}',
            width: 600,
            height: 450
        },
        click: function(options) {
            // Add colon to improve readability
            if (!/[\.:\-–—]\s*$/.test(options.pageTitle)) options.pageTitle += ':';
            return true;
        },
        track: {
            'name': 'LinkedIn',
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
        link: function(scope, element, attrs, ctrl) {
            element.addClass('ng-social-linkedin');
            if (!ctrl) {
                return;
            }
            options.urlOptions = {
              url: $parse(attrs.url)(scope),
              title: $parse(attrs.title)(scope),
              description: $parse(attrs.description)(scope)
            };
            scope.options = options;
            scope.ctrl = ctrl;
            ctrl.init(scope, element, options);
        }
    }
}]);

angular.module('ngSocial').run(['$templateCache', function ($templateCache) {
	$templateCache.put('/views/buttons.html', '<div class="ng-social-container ng-cloak"><ul class="ng-social" ng-transclude></ul></div>');
}]);