/**
 * Angular Rest Cache - Bucket Wrapper
 *
 * @alias com.devnup.rest.cache.bucket
 * @author luis@devnup.com
 */
angular.module('com.devnup.rest.cache.bucket', [
  'com.devnup.rest.cache.storage',
  'com.devnup.rest.util'
])
  .factory('$cacheBucket', [

    '$storageWrapper', '$restUtil', '$timeout',

    /**
     * Angular Rest Cache - Storage Wrapper Service
     *
     * @class
     * @type Function
     * @alias com.devnup.rest.cache.bucket.$cacheBucket
     * @author luis@devnup.com
     */
      function ($storage, $util, $timeout) {

      // The cache default configuration
      // TODO: put config for choosing storage type
      $storage.$local().$default({
        bucket: {},
        config: {
          min: 5000, // 5 seconds
          max: 60000 // 1 minute
        }
      });

      var fetch = {};
      var callback = {};

      var cache = $storage.$local();

      var Bucket = function (action, bucket, config) {

        // Check config is not null
        config = config || {};

        // Set bucket based on cache or construct a new one
        // TODO: this is not necessary, check Bucket.selector(). Keep one of them.
        cache[action] = bucket = bucket || cache[action] || Bucket.construct(action, config);

        // Check if should override refresh method
        if (config && config.refresh) {
          fetch[action] = config.refresh;
        }

        /**
         * Refresh bucket method wrapper
         *
         * @alias com.devnup.rest.cache.bucket.$cacheBucket~refresh
         * @type Function
         */
        bucket.refresh = function () {

          if (fetch[action]) {

            var initialized = !!bucket._data && Object.keys(bucket._data).length;
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
          return bucket.request();
        };

        /**
         * Request data stored in cache with a $http like request interface
         *
         * @alias com.devnup.rest.cache.bucket.$cacheBucket~data
         * @type Function
         * @returns {{error: Function, success: Function}}
         */
        bucket.request = function () {

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

        /**
         * Get data cached as a plain object
         *
         * @alias com.devnup.rest.cache.bucket.$cacheBucket~data
         * @type Function
         */
        bucket.data = function () {
          return bucket.data;
        };

        /**
         * Clear bucket method wrapper
         *
         * @alias com.devnup.rest.cache.bucket.$cacheBucket~clear
         * @type Function
         */
        bucket.clear = function () {
          Bucket.destroy(action);
        };

        return bucket;
      };

      /**
       * Bucket selector
       *
       * @alias com.devnup.rest.cache.bucket.$cacheBucket#selector
       *
       * @type Function
       * @param {String} bucket The bucket name
       * @param {Object} config The config object for the ```Bucket.construct``` method
       */
      Bucket.selector = function (bucket, config) {
        if (cache.bucket[bucket]) {
          return Bucket(bucket, cache.bucket[bucket], config);
        } else {
          return Bucket.construct(bucket, config);
        }
      };

      /**
       * Bucket constructor
       *
       * @alias com.devnup.rest.cache.bucket.$cacheBucket#construct
       * @type Function
       * @param {String} bucket The bucket name
       * @param {Object} input The input to construct the Bucket
       * @param {Function} [input.refresh] The $rest method that will be called to update the bucket
       * @param {Number} [input.min] Override the default min timeout (ms) for this bucket
       * @param {Number} [input.max] Override the default max timeout (ms) for this bucket
       */
      Bucket.construct = function (bucket, input) {

        input = input || {};

        var now = Date.now();

        cache.config = cache.config || [];
        fetch[bucket] = input.refresh || angular.noop;

        cache.bucket[bucket] = {
          createdAt: now,
          lastUpdated: now,
          refreshing: false,
          _data: {},
          timeout: {
            min: input.min || cache.config.min,
            max: input.max || cache.config.max,
            id: null
          }
        };

        return Bucket(b);
      };

      /**
       * Destroy bucket cache
       *
       * @alias com.devnup.rest.cache.bucket.$cacheBucket#destroy
       * @type Function
       * @param {String} [bucket] The bucket name to destroy, if none will destroy all buckets
       */
      Bucket.destroy = function (bucket) {
        if (bucket) {
          cache.bucket[bucket] = {};
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