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

      var hash = {};
      var fetch = {};

      var cache = $storage.$local();

      var Bucket = function (action, bucket, config) {

        // Check config is not null
        config = config || {};
        bucket = bucket || cache.bucket[action];

        // Check if should override values
        if (config) {

          fetch[action] = config.refresh || fetch[action];
          hash[action] = hash[action] || ''.concat(config.hash);

          if (bucket) {

            bucket.timeout = bucket.timeout || {
              min: cache.config.min,
              max: cache.config.max
            };

            bucket.timeout.min = config.min || bucket.timeout.min;
            bucket.timeout.max = config.max || bucket.timeout.max;
          }
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

            var hashIsTheSame = true;

            if (hash[action] && typeof hash === typeof angular.noop) {
              hashIsTheSame = hashIsTheSame || hash[action]() === bucket.lastUpdatedHash;
            }

            if (hash[action] && typeof hash === typeof 'string') {
              hashIsTheSame = hashIsTheSame || hash[action] === bucket.lastUpdatedHash;
            }

            var c = {
              min: bucket.timeout.min || cache.config.min,
              max: bucket.timeout.max || cache.config.max
            };

            // TODO: set timeout for max
            if (!bucket.refreshing && (!initialized || diff > c.min || !hashIsTheSame)) {

              bucket.refreshing = true;

              return $util.callback({

                method: fetch[action](),

                success: function (data) {

                  bucket.lastUpdated = Date.now();
                  bucket._data = data;

                  bucket.timeout.id = $timeout(function () {

                    if (Object.keys(cache.bucket[action]).length !== 0) {
                      bucket.refresh();
                    }

                  }, (bucket.lastUpdated + c.max) - Date.now());

                  bucket.refreshing = false;

                  var fn = $util.cache(action);

                  if (fn && typeof fn.success === typeof angular.noop) {
                    fn.success(data);
                  }
                },
                error: function () {

                  var t = (bucket.lastUpdated + c.max) - Date.now();

                  bucket.timeout.id = $timeout(function () {

                    if (Object.keys(cache.bucket[action]).length !== 0) {
                      bucket.refresh();
                    }

                  }, t >= c.min ? t : c.min);

                  bucket.refreshing = false;

                  var fn = $util.cache(action);

                  if (fn && typeof fn.error === typeof angular.noop) {
                    fn.error(data);
                  }
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
       * @param {String} action The bucket name
       * @param {Object} config The config object for the ```Bucket.construct``` method
       */
      Bucket.selector = function (action, config) {
        if (cache.bucket[action]) {
          return Bucket(action, cache.bucket[action], config);
        } else {
          return Bucket.construct(action, config);
        }
      };

      /**
       * Bucket constructor
       *
       * @alias com.devnup.rest.cache.action.$cacheBucket#construct
       * @type Function
       * @param {String} action The action name
       * @param {Object} input The input to construct the Bucket
       * @param {Function} [input.refresh] The $rest method that will be called to update the action
       * @param {Number} [input.min] Override the default min timeout (ms) for this action
       * @param {Number} [input.max] Override the default max timeout (ms) for this action
       */
      Bucket.construct = function (action, input) {

        input = input || {};

        var now = Date.now();

        cache.config = cache.config || [];
        fetch[action] = input.refresh || angular.noop;

        cache.bucket[action] = {
          createdAt: now,
          lastUpdated: now,
          lastUpdatedHash: null,
          refreshing: false,
          _data: {},
          timeout: {
            min: input.min || cache.config.min,
            max: input.max || cache.config.max,
            id: null
          }
        };

        return Bucket(action);
      };

      /**
       * Destroy bucket cache
       *
       * @alias com.devnup.rest.cache.bucket.$cacheBucket#destroy
       * @type Function
       * @param {String} [action] The bucket name to destroy, if none will destroy all buckets
       */
      Bucket.destroy = function (action) {
        if (action) {
          cache.bucket[action] = {};
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