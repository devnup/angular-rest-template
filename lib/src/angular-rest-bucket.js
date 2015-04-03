/**
 * Angular Rest Cache
 *
 * @alias com.devnup.rest.cache
 * @author luis@devnup.com
 */
angular.module('com.devnup.rest.cache.bucket', [
  'com.devnup.rest.cache.storage',
  'com.devnup.rest.util'
])
  .factory('$cacheBucket', [

    '$storageWrapper', '$restUtil', '$timeout',

    /**
     * Angular Rest Cache
     *
     * @class
     * @alias com.devnup.rest.cache.$cache
     * @author luis@devnup.com
     */
      function ($cache, $util, $timeout) {

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
      var callback = {};

      var cache = $cache.$local();

      // Construct cache stuff
      var construct = function (b, opt) {

        opt = opt || {};

        cache.config = cache.config || [];
        fetch[b] = opt.refresh || angular.noop;

        cache.bucket[b] = {
          createdAt: Date.now(),
          lastUpdated: Date.now(),
          refreshing: false,
          _data: {},
          timeout: {
            min: opt.min || cache.config.min,
            max: opt.max || cache.config.max,
            id: null
          }
        };

        return Bucket(b);
      };

      var Bucket = function (action, bucket, config) {

        config = config || {};
        cache[action] = bucket = bucket || cache[action] || construct(action, config);

        if (config && config.refresh) {
          fetch[action] = config.refresh;
        }

        // Refresh bucket method wrapper
        bucket.refresh = function () {

          if (fetch[action]) {

            var initialized = !!bucket._data || Object.keys(bucket._data).length;
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

        // Data function wrapper
        bucket.data = function () {
          return bucket._data;
        };

        // Clear bucket method wrapper
        bucket.clear = function () {
          Bucket.destroy(action);
        };

        // Return bucket instance
        return bucket;
      };

      /**
       * Bucket selector
       *
       * @alias com.devnup.rest.cache.bucket.$cacheBucket#selector
       *
       * @type {Function}
       * @param {String} bucket The bucket name
       * * @param {Object} config The config object
       */
      Bucket.selector = function (b, config) {
        if (cache.bucket[b]) {
          return Bucket(b, cache.bucket[b], config);
        } else {
          return construct.apply(this, arguments);
        }
      };

      /**
       * Destroy bucket cache
       *
       * @alias com.devnup.rest.cache.bucket.$cacheBucket#destroy
       * @type {Function}
       * @param {String} [bucket] The bucket name to destroy, if none will destroy all buckets
       */
      Bucket.destroy = function (bucket) {
        if (b) {
          cache.bucket[b] = {};
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