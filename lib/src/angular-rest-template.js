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