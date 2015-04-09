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

      var Template = function () {

        var config = {
          base: '',
          cache: false
        };

        var isCacheEnabled = function () {
          return !!config.cache;
        };

        this['callback'] = $util.callback;

        /**
         * Set configuration variables
         *
         * @alias com.devnup.rest.$rest#config
         *
         * @param {Object} input The input config
         * @param {String} input.base The base to all requests
         */
        this['config'] = function (input) {

          if (input) {

            config.base = input.base || config.base;
            config.cache = input.cache || config.cache;

            $cache.config(config.cache);
          }

          return config;
        };

        this['request'] = function (method, action, input, cfg) {

          var request = function (url, input, cache) {
            return $http({
              method: method.toUpperCase(),
              url: url,
              params: method.toLowerCase() === 'get' ? input : {},
              data: method.toLowerCase() !== 'get' ? input : {},
              headers: config.headers || {}
            });
          };

          input = input || {};
          cfg = cfg || config.cache || {cache: false};
          cfg.cache = cfg.cache || false;

          var base = cfg.base || config.base;

          // If cache is enabled, call action bucket
          if (isCacheEnabled() || (cfg.cache !== false && cfg.cache.enabled !== false)) {

            var bucket = $cache.bucket(action, {
              min: cfg.cache.min ? parseInt(cfg.cache.min) : cfg.cache.min,
              max: cfg.cache.max ? parseInt(cfg.cache.max) : cfg.cache.max,
              hash: function () {
                return JSON.stringify(input);
              },
              refresh: function () {
                return $util.wrapper(request, [base + action, input, config.cache]);
              }
            });

            // Refresh the bucket
            return bucket.refresh();
          }

          $cache.destroy(action);
          return new $util.wrapper(request, [config.base + action, input, config.cache]);
        };

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
        this['get'] = function (action, input, config) {
          var args = ['get'].concat(Array.prototype.slice.call(arguments));
          return this['request'].apply(this, args);
        };

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
        this['post'] = function (action, input, config) {
          var args = ['post'].concat(Array.prototype.slice.call(arguments));
          return this['request'].apply(this, args);
        };

        /**
         * Performs a PUT request in the API
         *
         * @alias com.devnup.rest.$rest#put
         *
         * @param {String} action The action path
         * @param {Object} input The input to the GET request
         * @returns {HttpPromise}
         */
        this['put'] = function (action, input) {
          var args = ['put'].concat(Array.prototype.slice.call(arguments));
          return this['request'].apply(this, args);
        };

        /**
         * Performs a DELETE request in the API
         *
         * @alias com.devnup.rest.$rest#delete
         *
         * @param {String} action The action path
         * @param {Object} input The input to the GET request
         * @returns {HttpPromise}
         */
        this['delete'] = function (action, input, config) {
          var args = ['delete'].concat(Array.prototype.slice.call(arguments));
          return this['request'].apply(this, args);
        };

      };

      Template.prototype.build = function (config) {
        var template = new Template();
        template.config(config);
        return template;
      };

      return new Template();
    }
  ]);