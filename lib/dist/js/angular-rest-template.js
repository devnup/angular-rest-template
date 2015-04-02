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

      var wrapDefault = function (stg) {
        var def = stg.$default;
        stg.$default = function () {
          def.apply(arguments);
          return stg;
        };
        return stg;
      };

      return {

        /**
         * Local storage wrapper
         *
         * @alias com.devnup.rest.cache.storage.$storageWrapper#$local
         * @type {Function}
         */
        $local: function () {
          return wrapDefault($localStorage);
        },

        /**
         * Session storage wrapper
         *
         * @alias com.devnup.rest.cache.storage.$storageWrapper#$session
         * @type {Function}
         */
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
 * @author luis@devnup.com
 */
angular.module('com.devnup.rest.cache', [
  'com.devnup.rest.cache.storage'
])
  .factory('$cache', [

    '$storageWrapper',

    /**
     * Angular Rest Cache
     *
     * @class
     * @alias com.devnup.rest.cache.$cache
     * @author luis@devnup.com
     */
      function ($cache) {

      // The cache default configuration
      // TODO: put config for choosing storage type
      var cache = $cache.$local().$default({
        bucket: {},
        config: {
          min: 5000, // 5 seconds
          max: 60000 // 1 minute
        }
      });

      // Construct cache stuff
      var construct = function (b, opt) {

        opt = opt || {};

        cache[b] = {
          createdAt: Date.now(),
          lastUpdated: Date.now(),
          refresh: opt.refresh,
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

      var Bucket = function (b) {

        // Get clean object from cache
        var i = JSON.parse(JSON.stringify(cache[b]));

        // Refresh bucket method wrapper
        i.refresh = function () {

          // TODO: check if is initialized and last updated date
          if (cache[b].refresh) {
            cache[b]
              .refresh()
              .success(function (data) {
                cache[b].lastUpdated = Date.now();
                cache[b]._data = data;
              });
          }
        };

        // Data function wrapper
        i.data = function () {
          return cache[b]._data;
        };

        // Clear bucket method wrapper
        i.clear = function () {
          destroy(b);
        };

        // Return bucket instance
        return i;
      };

      // Bucket interface wrapper
      var method = function (b) {
        if (cache[b]) {
          return Bucket(cache[b]);
        } else {
          return construct.apply(arguments);
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
         */
        bucket: function (bucket) {
          return method.apply(this, [bucket]);
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

    }])
;
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
     * @param {angular.$http} $http The angular $http service
     * @returns {{get: {HttpPromise}, post: {HttpPromise}, put: {HttpPromise}, delete: {HttpPromise}}}
     */
      function ($restUtil, $http) {

      var base = '/api/';
      var cache = false;

      // Service public interface
      return {

        'callback': $restUtil.callback,

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
          return cache ? $cache.bucket(action, {
            refresh: function () {
              $restUtil.wrapper.apply(this, [base + action, input])
            }
          }) :

            // If cache is disabled, just make the request
            $restUtil.wrapper(request, [base + action, input]);
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
          return $restUtil.wrapper($http.post, [base + action, input]);
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
          return $restUtil.wrapper($http.put, [base + action, input]);
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
          return $restUtil.wrapper($http.delete, [base + action, input]);
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

      async.wrapper = function (request, arguments) {

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
          },
          cache: function (opt) {
            // TODO: implement cache integration
            return method;
          }
        };

        return method;
      };

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

    }]);