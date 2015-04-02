'use strict';

(function() {

    /**
     * @ngdoc overview
     * @name ngStorage
     */

    angular.module('ngStorage', []).

    /**
     * @ngdoc object
     * @name ngStorage.$localStorage
     * @requires $rootScope
     * @requires $window
     */

    factory('$localStorage', _storageFactory('localStorage')).

    /**
     * @ngdoc object
     * @name ngStorage.$sessionStorage
     * @requires $rootScope
     * @requires $window
     */

    factory('$sessionStorage', _storageFactory('sessionStorage'));

    function _storageFactory(storageType) {
        return [
            '$rootScope',
            '$window',

            function(
                $rootScope,
                $window
            ){
                // #9: Assign a placeholder object if Web Storage is unavailable to prevent breaking the entire AngularJS app
                var webStorage = $window[storageType] || (console.warn('This browser does not support Web Storage!'), {}),
                    $storage = {
                        $default: function(items) {
                            for (var k in items) {
                                angular.isDefined($storage[k]) || ($storage[k] = items[k]);
                            }

                            return $storage;
                        },
                        $reset: function(items) {
                            for (var k in $storage) {
                                '$' === k[0] || delete $storage[k];
                            }

                            return $storage.$default(items);
                        }
                    },
                    _last$storage,
                    _debounce;

                for (var i = 0, k; i < webStorage.length; i++) {
                    // #8, #10: `webStorage.key(i)` may be an empty string (or throw an exception in IE9 if `webStorage` is empty)
                    (k = webStorage.key(i)) && 'ngStorage-' === k.slice(0, 10) && ($storage[k.slice(10)] = angular.fromJson(webStorage.getItem(k)));
                }

                _last$storage = angular.copy($storage);

                $rootScope.$watch(function() {
                    _debounce || (_debounce = setTimeout(function() {
                        _debounce = null;

                        if (!angular.equals($storage, _last$storage)) {
                            angular.forEach($storage, function(v, k) {
                                angular.isDefined(v) && '$' !== k[0] && webStorage.setItem('ngStorage-' + k, angular.toJson(v));

                                delete _last$storage[k];
                            });

                            for (var k in _last$storage) {
                                webStorage.removeItem('ngStorage-' + k);
                            }

                            _last$storage = angular.copy($storage);
                        }
                    }, 100));
                });

                // #6: Use `$window.addEventListener` instead of `angular.element` to avoid the jQuery-specific `event.originalEvent`
                'localStorage' === storageType && $window.addEventListener && $window.addEventListener('storage', function(event) {
                    if ('ngStorage-' === event.key.slice(0, 10)) {
                        event.newValue ? $storage[event.key.slice(10)] = angular.fromJson(event.newValue) : delete $storage[event.key.slice(10)];

                        _last$storage = angular.copy($storage);

                        $rootScope.$apply();
                    }
                });

                return $storage;
            }
        ];
    }

})();

/**
 * Angular Rest Cache - Storage Wrapper
 *
 * @alias com.devnup.rest.cache.storage
 *
 * @author luis@devnup.com
 * @since 03/29/15.
 */
angular.module('com.devnup.rest.cache.storage', [
  'ngStorage'
])
  .factory('$storageWrapper', [
    '$rootScope', '$localStorage', '$sessionStorage',
    function ($rootScope, $localStorage, $sessionStorage) {

      if (!$localStorage || !$sessionStorage) {
        throw new Error('ngStorage is required');
      }

      var wrapDefault = function (stg) {
        var def = stg.$default;
        stg.$default = function () {
          def.apply(arguments);
          return stg;
        };
        return stg;
      };

      return {
        $local: function () {
          return wrapDefault($localStorage);
        },
        $session: function () {
          return wrapDefault($sessionStorage);
        }
      }
    }
  ]);
/**
 * Angular Rest Cache
 *
 * @alias com.devnup.rest.cache
 *
 * @author luis@devnup.com
 * @since 03/29/15.
 */
angular.module('com.devnup.rest.cache', [
  'com.devnup.rest.cache.storage'
])
  .factory('$cache', ['$storageWrapper', function ($cache) {

    var cache = $cache.$local().$default({
      bucket: {}
    });

    var construct = function (b, opt) {

      opt = opt || {};

      cache[b] = {
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        refresh: opt.refresh
      };

      return wrap(b);
    };

    var destroy = function (b) {
      cache[b] = {};
    };

    var cleanObject = function (obj) {
      return JSON.parse(JSON.stringify(obj));
    };

    var wrap = function (b) {

      var i = cleanObject(cache[b]);

      i.refresh = function (callback) {

        // TODO: check if is initialized and last updated date
        if (cache[b].refresh) {
          cache[b].refresh(function (err, result) {
            cache[b].lastUpdated = Date.now();
            cache[b].result = result;
            callback(err, cache[b]);
          });
        } else {
          callback(null, cache[b]);
        }
      };

      i.clear = function () {
        destroy(b);
      };
    };

    var method = function (b) {

      if (cache[b]) {
        return wrap(cache[b]);
      } else {
        return construct.apply(arguments);
      }
    };

    return {
      bucket: method,
      clear: function () {
        cache = {};
      }
    };

  }]);
/**
 * Angular Rest Template
 * v0.0.1
 *
 * @alias com.devnup.rest
 *
 * @author luis@devnup.com
 * @since 03/29/15.
 */
angular.module('com.devnup.rest', [
  'com.devnup.rest.cache'
])
  .factory('$async', [function () {

    async.callback = function (opt) {

      var cache = {
        success: angular.noop,
        error: angular.noop
      };

      opt = opt || {};
      opt.method = opt.method || angular.copy(cache);
      opt.success = opt.success || angular.noop;
      opt.error = opt.success || angular.noop;

      opt.method
        .success(function (data) {
          if (data.error) {
            opt.error(data.error);
            cache.error(data.error);
          } else {
            opt.success(data);
            cache.success(data);
          }
        })
        .error(function (error) {
          opt.error(error);
          cache.error(error);
        });

      var out = {
        success: function (cb) {
          cache.success = cb;
          return out;
        },
        error: function (cb) {
          cache.error = cb;
          return out;
        }
      };

      return out;
    };

    return async;

  }])

  .factory('$rest',

  /**
   * Angular Rest Service
   * v0.0.1
   *
   * @class
   * @type {Function}
   * @alias com.devnup.rest.$rest
   *
   * @param {angular.$http} $http The angular $http service
   * @returns {{get: {HttpPromise}, post: {HttpPromise}, put: {HttpPromise}, delete: {HttpPromise}}}
   */
  ['$async', '$http', '$cache',
    function ($async, $http) {

      var base = '/api/';

      // Service public interface
      return {

        'callback': $async.callback,

        /**
         * Set configuration variables
         *
         * @alias com.devnup.rest.$rest#config
         *
         * @param {Object} input The input config
         * @param {String} input.base The base to all requests
         */
        'config': function (input) {
          base = input.base
        },

        /**
         * Performs a GET request in the API
         *
         * @alias com.devnup.rest.$rest#get
         *
         * @example <caption>Performing a simple GET request to /api/user/me</caption>
         * $api.get('user/me').then(function(response) {
         *   console.log(response.data.user);
         * });
         *
         * @param {String} action The action path
         * @param {Object} input The input to the GET request
         * @returns {HttpPromise}
         */
        'get': function (action, input) {
          return $http.get(base + action, input);
        },

        /**
         * Performs a POST request in the API
         *
         * @alias com.devnup.rest.$rest#post
         *
         * @example <caption>Performing a simple POST request to /api/user/login</caption>
         * $api.post('user/login', {
         *   email: 'test@company.com'
         *   password: '1233456'
         * }).then(function(response) {
         *   console.log(response.data.user);
         * });
         *
         * @param {String} action The action path
         * @param {Object} input The input to the GET request
         * @returns {HttpPromise}
         */
        'post': function (action, input) {
          return $http.post(base + action, input);
        },

        /**
         * Performs a PUT request in the API
         *
         * @alias com.devnup.rest.$rest#put
         *
         * @param {String} action The action path
         * @param {Object} input The input to the GET request
         * @returns {HttpPromise}
         */
        'put': function (action, input) {
          return $http.put(base + action, input);
        },

        /**
         * Performs a DELETE request in the API
         *
         * @alias com.devnup.rest.$rest#delete
         *
         * @param {String} action The action path
         * @param {Object} input The input to the GET request
         * @returns {HttpPromise}
         */
        'delete': function (action, input) {
          return $http.delete(base + action, input);
        }
      }

    }]);