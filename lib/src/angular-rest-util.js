/**
 * Angular Rest Util
 *
 * @alias com.devnup.rest.util
 * @author luis@devnup.com
 */
angular.module('com.devnup.rest.util', [])

  .factory('$restUtil', [

    /**
     * Angular Rest Util Service
     *
     * Requires Async
     *
     * @class
     * @alias com.devnup.rest.util.$restUtil
     * @author luis@devnup.com
     */
      function () {

      if (!async) {
        throw new Error('async is required');
      }

      var util = {};

      util.wrapper = function (request, arguments) {

        var fn = {
          success: angular.noop,
          error: angular.noop
        };

        request
          .apply(this, arguments)
          .success(function (data) {
            fn.success(data);
          })
          .error(function (err) {
            fn.error(err);
          });

        var method = {
          success: function (callback) {
            fn.success = callback;
            return method;
          },
          error: function (callback) {
            fn.error = callback;
            return method;
          }
        };

        return method;
      };

      util.callback = function (opt) {

        var cache = {
          success: angular.noop,
          error: angular.noop
        };

        opt = opt || {};
        opt.method = opt.method || angular.copy(cache);
        opt.success = opt.success || angular.noop;
        opt.error = opt.success || angular.noop;

        opt.method
          .success(function (data) {
            if (data.error) {
              opt.error(data.error);
              cache.error(data.error);
            } else {
              opt.success(data);
              cache.success(data);
            }
          })
          .error(function (error) {
            opt.error(error);
            cache.error(error);
          });

        var out = {
          success: function (cb) {
            cache.success = cb;
            return out;
          },
          error: function (cb) {
            cache.error = cb;
            return out;
          }
        };

        return out;
      };

      util.$async = async;
      return util;

    }])
;