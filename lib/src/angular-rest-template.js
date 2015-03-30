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
  'ngResource'
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
  ['$async', '$req',
    function ($async, $req) {

      var prefix = '/api/';

      // Service public interface
      return {

        /**
         * Performs a GET request in the API
         *
         * @alias com.devnup.ws.panel.api.$api#get
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
          return $http.get(prefix + action, input);
        },

        /**
         * Performs a POST request in the API
         *
         * @alias com.devnup.ws.panel.api.$api#post
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
          return $http.post(prefix + action, input);
        },

        /**
         * Performs a PUT request in the API
         *
         * @alias com.devnup.ws.panel.api.$api#put
         *
         * @param {String} action The action path
         * @param {Object} input The input to the GET request
         * @returns {HttpPromise}
         */
        'put': function (action, input) {
          return $http.put(prefix + action, input);
        },

        /**
         * Performs a DELETE request in the API
         *
         * @alias com.devnup.ws.panel.api.$api#delete
         *
         * @param {String} action The action path
         * @param {Object} input The input to the GET request
         * @returns {HttpPromise}
         */
        'delete': function (action, input) {
          return $http.delete(prefix + action, input);
        }
      }

    }]);