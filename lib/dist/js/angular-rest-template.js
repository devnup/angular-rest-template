/**
 * Angular Rest Template
 * v0.0.1
 *
 * @alias com.devnup.rest
 *
 * @author luis@devnup.com
 * @since 03/29/15.
 */
angular.module('com.devnup.rest', [])


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
  ['$async', '$http',
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