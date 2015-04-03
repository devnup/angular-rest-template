/**
 * Angular Rest Cache
 *
 * @alias com.devnup.rest.cache
 * @author luis@devnup.com
 */
angular.module('com.devnup.rest.cache', [
  'com.devnup.rest.cache.storage',
  'com.devnup.rest.cache.bucket',
  'com.devnup.rest.util'
])
  .factory('$cache', [

    '$cacheBucket',

    /**
     * Angular Rest Cache
     *
     * This is the public interface for the cache modules, wraps all its functionality
     *
     * @class
     * @alias com.devnup.rest.cache.$cache
     * @author luis@devnup.com
     */
      function ($Bucket) {

      return {

        /**
         * Bucket selector
         *
         * @alias com.devnup.rest.cache.$cache#bucket
         *
         * @type {Function}
         * @param {String} bucket The bucket name
         * @param {Object} config The config object
         */
        bucket: function (bucket, config) {
          return $Bucket.selector(bucket, config);
        },

        /**
         * Destroy bucket cache
         *
         * @alias com.devnup.rest.cache.$cache#destroy
         * @type {Function}
         * @param {String} [bucket] The bucket name to destroy, if none will destroy all buckets
         */
        destroy: function (bucket) {
          return $Bucket.destroy(bucket);
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
          return $Bucket.config(input);
        }
      };

    }]);