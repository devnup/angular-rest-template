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