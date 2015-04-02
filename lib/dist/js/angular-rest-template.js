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
        timeout: {
          min: opt.min || cache.config.min,
          max: opt.max || cache.config.max
        }
      };

      return wrap(b);
    };

    // Destroy cache stuff
    var destroy = function (b) {
      if (b) {
        cache[b] = {};
      } else {
        cache = {};
      }
    };

    var wrap = function (b) {

      // Get clean object from cache
      var i = JSON.parse(JSON.stringify(cache[b]));

      // Refresh bucket method wrapper
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

      // Clear bucket method wrapper
      i.clear = function () {
        destroy(b);
      };
    };

    // Bucket interface wrapper
    var method = function (b) {
      if (cache[b]) {
        return wrap(cache[b]);
      } else {
        return construct.apply(arguments);
      }
    };

    return {

      bucket: method,
      destroy: destroy,

      config: function (opt) {
        opt = opt || {};
        for (var k in opt) {
          cache.config[k] = opt[k] || cache[k];
        }
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
          return $async.wrapper($http.get, [base + action, input]);
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
          return $async.wrapper($http.post, [base + action, input]);
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
          return $async.wrapper($http.put, [base + action, input]);
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
          return $async.wrapper($http.delete, [base + action, input]);
        }
      }

    }]);