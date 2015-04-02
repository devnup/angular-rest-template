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

    var cache = $cache.$local().$default({
      bucket: {}
    });

    var construct = function (b, opt) {

      opt = opt || {};

      cache[b] = {
        createdAt: Date.now(),
        lastUpdated: Date.now(),
        refresh: opt.refresh
      };

      return wrap(b);
    };

    var destroy = function (b) {
      cache[b] = {};
    };

    var cleanObject = function (obj) {
      return JSON.parse(JSON.stringify(obj));
    };

    var wrap = function (b) {

      var i = cleanObject(cache[b]);

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

      i.clear = function () {
        destroy(b);
      };
    };

    var method = function (b) {

      if (cache[b]) {
        return wrap(cache[b]);
      } else {
        return construct.apply(arguments);
      }
    };

    return {
      bucket: method,
      clear: function () {
        cache = {};
      }
    };

  }]);