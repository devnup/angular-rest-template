/**
 * Angular Rest Cache - Bucket Wrapper
 *
 * @alias com.devnup.rest.cache.bucket
 * @author luis@devnup.com
 */
angular.module('com.devnup.rest.cache.bucket', [
  'com.devnup.rest.cache.storage',
  'com.devnup.rest.util'
])
  .factory('$cacheBucket', [

    '$storageWrapper', '$restUtil', '$timeout',

    /**
     * Angular Rest Cache - Storage Wrapper Service
     *
     * @class
     * @type Function
     * @alias com.devnup.rest.cache.bucket.$cacheBucket
     * @author luis@devnup.com
     */
      function ($storage, $util, $timeout) {

      // The cache default configuration
      // TODO: put config for choosing storage type
      $storage.$local().$default({
        bucket: {},
        config: {
          min: 5000, // 5 seconds
          max: 60000 // 1 minute
        }
      });

      var fetch = {};
      var callback = {};

      var cache = $storage.$local();

      var Bucket = function (action, bucket, config) {

        // Check config is not null
        config = config || {};

        // Set bucket based on cache or construct a new one
        // TODO: this is not necessary, check Bucket.selector(). Keep one of them.
        cache[action] = bucket = bucket || cache[action] || Bucket.construct(action, config);

        // Check if should override refresh method
        if (config && config.refresh) {
          fetch[action] = config.refresh;
        }

        /**
         * Refresh bucket method wrapper
         *
         * @alias com.devnup.rest.cache.bucket.$cacheBucket~refresh
         * @type Function
         */
        bucket.refresh = function () {

          if (fetch[action]) {

            var initialized = !!bucket._data && Object.keys(bucket._data).length;
            var diff = Date.now() - bucket.lastUpdated;

            var c = {
              min: config.min || bucket.timeout.min || cache.config.min,
              max: config.max || bucket.timeout.max || cache.config.max
            };

            // TODO: set timeout for max
            if (!bucket.refreshing && (!initialized || diff > c.min)) {

              bucket.refreshing = true;

              return $util.callback({

                method: fetch[action](),

                success: function (data) {

                  bucket.lastUpdated = Date.now();
                  bucket._data = data;

                  bucket.timeout.id = $timeout(function () {

                    bucket.refresh(callback[action]);

                  }, (bucket.lastUpdated + c.max) - Date.now());

                  bucket.refreshing = false;
                },
                error: function () {

                  var t = (bucket.lastUpdated + c.max) - Date.now();

                  bucket.timeout.id = $timeout(function () {
                    bucket.refresh(callback[action]);
                  }, t >= c.min ? t : c.min);

                  bucket.refreshing = false;
                }
              });
            }
          }

          // Return interface for cached data
          return bucket.request();
        };

        /**
         * Request data stored in cache with a $http like request interface
         *
         * @alias com.devnup.rest.cache.bucket.$cacheBucket~data
         * @type Function
         * @returns {{error: Function, success: Function}}
         */
        bucket.request = function () {

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

        /**
         * Get data cached as a plain object
         *
         * @alias com.devnup.rest.cache.bucket.$cacheBucket~data
         * @type Function
         */
        bucket.data = function () {
          return bucket.data;
        };

        /**
         * Clear bucket method wrapper
         *
         * @alias com.devnup.rest.cache.bucket.$cacheBucket~clear
         * @type Function
         */
        bucket.clear = function () {
          Bucket.destroy(action);
        };

        return bucket;
      };

      /**
       * Bucket selector
       *
       * @alias com.devnup.rest.cache.bucket.$cacheBucket#selector
       *
       * @type Function
       * @param {String} bucket The bucket name
       * @param {Object} config The config object for the ```Bucket.construct``` method
       */
      Bucket.selector = function (bucket, config) {
        if (cache.bucket[bucket]) {
          return Bucket(bucket, cache.bucket[bucket], config);
        } else {
          return Bucket.construct(bucket, config);
        }
      };

      /**
       * Bucket constructor
       *
       * @alias com.devnup.rest.cache.bucket.$cacheBucket#construct
       * @type Function
       * @param {String} bucket The bucket name
       * @param {Object} input The input to construct the Bucket
       * @param {Function} [input.refresh] The $rest method that will be called to update the bucket
       * @param {Number} [input.min] Override the default min timeout (ms) for this bucket
       * @param {Number} [input.max] Override the default max timeout (ms) for this bucket
       */
      Bucket.construct = function (bucket, input) {

        input = input || {};

        var now = Date.now();

        cache.config = cache.config || [];
        fetch[bucket] = input.refresh || angular.noop;

        cache.bucket[bucket] = {
          createdAt: now,
          lastUpdated: now,
          refreshing: false,
          _data: {},
          timeout: {
            min: input.min || cache.config.min,
            max: input.max || cache.config.max,
            id: null
          }
        };

        return Bucket(b);
      };

      /**
       * Destroy bucket cache
       *
       * @alias com.devnup.rest.cache.bucket.$cacheBucket#destroy
       * @type Function
       * @param {String} [bucket] The bucket name to destroy, if none will destroy all buckets
       */
      Bucket.destroy = function (bucket) {
        if (bucket) {
          cache.bucket[bucket] = {};
        } else {
          cache = {};
        }
      };

      /**
       * Configure cache
       *
       * @alias com.devnup.rest.cache.bucket.$cacheBucket#config
       *
       * @type Function
       * @param {{}} input The input configuration
       * @param {Boolean} [input.fetch] If enabled will automatically refresh when max timeout is passed
       * @param {Number} [input.min] The min interval in ms before refreshing cache
       * @param {Number} [input.max] The max interval in ms to wait before automatically refreshing cache, if fetch is enable
       */
      Bucket.config = function (input) {
        input = input || {};
        for (var k in input) {
          if (input.hasOwnProperty(k)) {
            cache.config[k] = input[k] || cache[k];
          }
        }
      };

      return Bucket;

    }]);
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
     * Angular Rest Cache - Storage Wrapper Service
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
  'com.devnup.rest.cache.bucket',
  'com.devnup.rest.util'
])
  .factory('$cache', [

    '$cacheBucket',

    /**
     * Angular Rest Cache
     *
     * This is the public interface for the cache modules, wraps all its functionality
     *
     * @class
     * @alias com.devnup.rest.cache.$cache
     * @author luis@devnup.com
     */
      function ($Bucket) {

      return {

        /**
         * Bucket selector
         *
         * @alias com.devnup.rest.cache.$cache#bucket
         *
         * @type {Function}
         * @param {String} bucket The bucket name
         * @param {Object} config The config object
         */
        bucket: function (bucket, config) {
          return $Bucket.selector(bucket, config);
        },

        /**
         * Destroy bucket cache
         *
         * @alias com.devnup.rest.cache.$cache#destroy
         * @type {Function}
         * @param {String} [bucket] The bucket name to destroy, if none will destroy all buckets
         */
        destroy: function (bucket) {
          return $Bucket.destroy(bucket);
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
          return $Bucket.config(input);
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
     * @param {com.devnup.rest.cache.$cache} $cache The $cache service
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
          $cache.config(cache);
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
         * @param {Object} config The cache config
         * @returns {HttpPromise}
         */
        'get': function (action, input, config) {

          var request = $http.get;
          config = config || {cache: false};

          // If cache is enabled, call action bucket
          if (isCacheEnabled() && (config.cache !== false && config.cache.enabled !== false)) {

            var bucket = $cache.bucket('GET:' + action, {
              refresh: function () {
                return $util.wrapper(request, [base + action, input, config.cache]);
              }
            });

            // Refresh the bucket
            return bucket.refresh();
          }

          // If cache is disabled, just make the request
          return $util.wrapper(request, [base + action, input, config.cache]);
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
         * @param {Object} input The input to the POST request
         * @param {Object} config The cache config
         * @returns {HttpPromise}
         */
        'post': function (action, input, config) {

          var request = $http.post;
          config = config || {cache: false};

          // If cache is enabled, call action bucket
          if (isCacheEnabled() && config.cache !== false) {

            var bucket = $cache.bucket('POST:' + action, {
              refresh: function () {
                return $util.wrapper(request, [base + action, input, config.cache])
              }
            });

            // Refresh the bucket
            return bucket.refresh();
          }

          // If cache is disabled, just make the request
          return $util.wrapper(request, [base + action, input, config.cache]);
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
          config = config || {cache: false};

          // If cache is enabled, call action bucket
          if (isCacheEnabled() && config.cache !== false) {

            var bucket = $cache.bucket('PUT:' + action, {
              refresh: function () {
                return $util.wrapper(request, [base + action, input, config.cache]);
              }
            });

            // Refresh the bucket
            return bucket.refresh();
          }

          // If cache is disabled, just make the request
          return $util.wrapper(request, [base + action, input, config.cache]);
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
        'delete': function (action, input, config) {

          var request = $http.delete;
          config = config || {cache: false};

          // If cache is enabled, call action bucket
          if (isCacheEnabled() && config.cache !== false) {

            var bucket = $cache.bucket('DEL:' + action, {
              refresh: function () {
                return $util.wrapper(request, [base + action, input, config.cache]);
              }
            });

            // Refresh the bucket
            return bucket.refresh();
          }

          // If cache is disabled, just make the request
          return $util.wrapper(request, [base + action, input, config.cache]);

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