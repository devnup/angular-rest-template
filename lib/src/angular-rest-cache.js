/**
 * Angular Rest Cache
 *
 * @alias com.devnup.rest.cache
 *
 * @author luis@devnup.com
 * @since 03/29/15.
 */
angular.module('com.devnup.rest.cache', [
  'com.devnup.rest.cache.storage'
])
  .factory('$cache', ['$storageWrapper', function ($cache) {

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
        timeout: {
          min: opt.min || cache.config.min,
          max: opt.max || cache.config.max
        }
      };

      return wrap(b);
    };

    // Destroy cache stuff
    var destroy = function (b) {
      if (b) {
        cache[b] = {};
      } else {
        cache = {};
      }
    };

    var wrap = function (b) {

      // Get clean object from cache
      var i = JSON.parse(JSON.stringify(cache[b]));

      // Refresh bucket method wrapper
      i.refresh = function (callback) {

        // TODO: check if is initialized and last updated date
        if (cache[b].refresh) {
          cache[b].refresh(function (err, result) {
            cache[b].lastUpdated = Date.now();
            cache[b].result = result;
            callback(err, cache[b]);
          });
        } else {
          callback(null, cache[b]);
        }
      };

      // Clear bucket method wrapper
      i.clear = function () {
        destroy(b);
      };
    };

    // Bucket interface wrapper
    var method = function (b) {
      if (cache[b]) {
        return wrap(cache[b]);
      } else {
        return construct.apply(arguments);
      }
    };

    return {

      bucket: method,
      destroy: destroy,

      config: function (opt) {
        opt = opt || {};
        for (var k in opt) {
          cache.config[k] = opt[k] || cache[k];
        }
      }
    };

  }]);