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
 * @author luis@devnup.com
 */
angular.module('com.devnup.rest.cache.storage', [
  'ngStorage'
])
  .factory('$storageWrapper', [
    '$rootScope', '$localStorage', '$sessionStorage',

    /**
     * Angular Rest Cache
     *
     * @class
     * @alias com.devnup.rest.cache.storage.$storageWrapper
     * @author luis@devnup.com
     */
      function ($rootScope, $localStorage, $sessionStorage) {

      if (!$localStorage || !$sessionStorage) {
        throw new Error('ngStorage is required');
      }

      return {

        /**
         * Local storage wrapper
         *
         * @alias com.devnup.rest.cache.storage.$storageWrapper#$local
         * @type {Function}
         */
        $local: function () {
          return $localStorage;
        },

        /**
         * Session storage wrapper
         *
         * @alias com.devnup.rest.cache.storage.$storageWrapper#$session
         * @type {Function}
         */
        $session: function () {
          return $sessionStorage;
        }
      }
    }
  ]);
/**
 * Angular Rest Cache
 *
 * @alias com.devnup.rest.cache
 * @author luis@devnup.com
 */
angular.module('com.devnup.rest.cache', [
  'com.devnup.rest.cache.storage',
  'com.devnup.rest.util'
])
  .factory('$cache', [

    '$storageWrapper', '$restUtil',

    /**
     * Angular Rest Cache
     *
     * @class
     * @alias com.devnup.rest.cache.$cache
     * @author luis@devnup.com
     */
      function ($cache, $util) {

      // The cache default configuration
      // TODO: put config for choosing storage type
      $cache.$local().$default({
        bucket: {},
        config: {
          min: 5000, // 5 seconds
          max: 60000 // 1 minute
        }
      });

      var fetch = {};
      var cache = $cache.$local();

      // Construct cache stuff
      var construct = function (b, opt) {

        opt = opt || {};

        fetch[b] = opt.refresh || angular.noop;

        cache[b] = {
          createdAt: Date.now(),
          lastUpdated: Date.now(),
          refreshing: false,
          _data: {},
          timeout: {
            min: opt.min || cache.config.min,
            max: opt.max || cache.config.max
          }
        };

        return Bucket(b);
      };

      // Destroy cache stuff
      var destroy = function (b) {
        if (b) {
          cache[b] = {};
        } else {
          cache = {};
        }
      };

      var Bucket = function (action, bucket, config) {

        if (config && config.refresh) {
          fetch[action] = config.refresh;
        }

        // Refresh bucket method wrapper
        bucket.refresh = function () {

          if (fetch[action]) {

            var initialized = !!bucket._data;
            var diff = Date.now() - bucket.lastUpdated;

            var c = {
              min: config.min || bucket.timeout.min || cache.config.min,
              max: config.max || bucket.timeout.max || cache.config.max
            };

            // TODO: set timout for max
            if (!bucket.refreshing && (!initialized || diff > c.min)) {
              bucket.refreshing = true;
              return $util.callback({
                method: fetch[action](),
                success: function (data) {
                  bucket.lastUpdated = Date.now();
                  bucket._data = data;
                  bucket.refreshing = false;
                },
                error: function() {
                  bucket.refreshing = false;
                }
              });
            }
          }

          // Return interface for cached data
          var m = {
            error: function () {
              return m;
            },
            success: function (fn) {
              fn(bucket._data);
              return m;
            }
          };

          return m;
        };

        // Data function wrapper
        bucket.data = function () {
          return bucket._data;
        };

        // Clear bucket method wrapper
        bucket.clear = function () {
          destroy(action);
        };

        // Return bucket instance
        return bucket;
      };

      // Bucket interface wrapper
      var method = function (b, config) {
        if (cache[b]) {
          return Bucket(b, cache[b], config);
        } else {
          return construct.apply(this, arguments);
        }
      };

      return {

        /**
         * Bucket selector
         *
         * @alias com.devnup.rest.cache.$cache#bucket
         *
         * @type {Function}
         * @param {String} bucket The bucket name
         * * @param {Object} config The config object
         */
        bucket: function (bucket, config) {
          return method.apply(this, [bucket, config]);
        },

        /**
         * Destroy bucket cache
         *
         * @alias com.devnup.rest.cache.$cache#destroy
         * @type {Function}
         * @param {String} [bucket] The bucket name to destroy, if none will destroy all buckets
         */
        destroy: function (bucket) {
          return destroy.apply(this, [bucket]);
        },

        /**
         * Configure cache
         *
         * @alias com.devnup.rest.cache.$cache#config
         *
         * @type Function
         * @param {{}} input The input configuration
         * @param {Boolean} [input.fetch] If enabled will automatically refresh when max timeout is passed
         * @param {Number} [input.min] The min interval in ms before refreshing cache
         * @param {Number} [input.max] The max interval in ms to wait before automatically refreshing cache, if fetch is enable
         */
        config: function (input) {
          input = input || {};
          for (var k in input) {
            if (input.hasOwnProperty(k)) {
              cache.config[k] = input[k] || cache[k];
            }
          }
        }
      };

    }]);
/**
 * Angular Rest Template
 * v0.0.1
 *
 * @alias com.devnup.rest
 * @author luis@devnup.com
 */
angular.module('com.devnup.rest', [
  'com.devnup.rest.cache',
  'com.devnup.rest.util'
])
  .factory('$rest', [

    '$restUtil', '$http', '$cache',

    /**
     * Angular Rest Service
     *
     * @class
     * @type {Function}
     * @alias com.devnup.rest.$rest
     *
     * @param {com.devnup.rest.util.$util} $util The $util service
     * @param {angular.$http} $http The angular $http service
     * @returns {{get: {HttpPromise}, post: {HttpPromise}, put: {HttpPromise}, delete: {HttpPromise}}}
     */
      function ($util, $http, $cache) {

      var base = '/api/';
      var cache = false;

      var isCacheEnabled = function () {
        return !!cache;
      };

      // Service public interface
      return {

        'callback': $util.callback,

        /**
         * Set configuration variables
         *
         * @alias com.devnup.rest.$rest#config
         *
         * @param {Object} input The input config
         * @param {String} input.base The base to all requests
         */
        'config': function (input) {
          base = input.base;
          cache = input.cache;
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

          var request = $http.get;

          // If cache is enabled, call action bucket
          if (isCacheEnabled()) {

            var bucket = $cache.bucket(action, {
              refresh: function () {
                return $util.wrapper(request, [base + action, input])
              }
            });

            // Refresh the bucket
            return bucket.refresh();
          }

          // If cache is disabled, just make the request
          $util.wrapper(request, [base + action, input]);
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

          var request = $http.post;

          // If cache is enabled, call action bucket
          if (isCacheEnabled()) {

            var bucket = $cache.bucket(action, {
              refresh: function () {
                return $util.wrapper(request, [base + action, input])
              }
            });

            // Refresh the bucket
            return bucket.refresh();
          }

          // If cache is disabled, just make the request
          $util.wrapper(request, [base + action, input]);
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

          var request = $http.put;

          // If cache is enabled, call action bucket
          if (isCacheEnabled()) {

            var bucket = $cache.bucket(action, {
              refresh: function () {
                return $util.wrapper(request, [base + action, input])
              }
            });

            // Refresh the bucket
            return bucket.refresh();
          }

          // If cache is disabled, just make the request
          $util.wrapper(request, [base + action, input]);
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

          var request = $http.delete;

          // If cache is enabled, call action bucket
          if (isCacheEnabled()) {

            var bucket = $cache.bucket(action, {
              refresh: function () {
                return $util.wrapper(request, [base + action, input])
              }
            });

            // Refresh the bucket
            return bucket.refresh();
          }

          // If cache is disabled, just make the request
          $util.wrapper(request, [base + action, input]);

        }
      }
    }
  ]);
/**
 * Angular Rest Util
 *
 * @alias com.devnup.rest.util
 * @author luis@devnup.com
 */
angular.module('com.devnup.rest.util', [])

  .factory('$restUtil', [

    /**
     * Angular Rest Util Service
     *
     * Requires Async
     *
     * @class
     * @alias com.devnup.rest.util.$restUtil
     * @author luis@devnup.com
     */
      function () {

      if (!async) {
        throw new Error('async is required');
      }

      var util = {};

      util.wrapper = function (request, arguments) {

        var fn = {
          success: angular.noop,
          error: angular.noop
        };

        request
          .apply(this, arguments)
          .success(function (data) {
            fn.success(data);
          })
          .error(function (err) {
            fn.error(err);
          });

        var method = {
          success: function (callback) {
            fn.success = callback;
            return method;
          },
          error: function (callback) {
            fn.error = callback;
            return method;
          }
        };

        return method;
      };

      util.callback = function (opt) {

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

      util.$async = async;
      return util;

    }])
;