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