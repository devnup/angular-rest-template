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

          // TODO: check if is initialized and last updated date
          if (fetch[action]) {
            return $util.callback({
              method: fetch[action](),
              success: function (data) {
                bucket.lastUpdated = Date.now();
                bucket._data = data;
              }
            });
          }

          return {};
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