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
                        urlOptions.title = $scope.title;
                        urlOptions.image = $scope.image;
                        urlOptions.description = $scope.description || '';
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
                    urlOptions.title = $scope.title;
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
