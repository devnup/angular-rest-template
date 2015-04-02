/**
 * Angular Rest Cache - Storage Wrapper
 *
 * @alias com.devnup.rest.cache.storage
 *
 * @author luis@devnup.com
 * @since 03/29/15.
 */
angular.module('com.devnup.rest.cache.storage', [
  'ngStorage'
])
  .factory('$storageWrapper', [
    '$rootScope', '$localStorage', '$sessionStorage',
    function ($rootScope, $localStorage, $sessionStorage) {

      if (!$localStorage || !$sessionStorage) {
        throw new Error('ngStorage is required');
      }

      var wrapDefault = function (stg) {
        var def = stg.$default;
        stg.$default = function () {
          def.apply(arguments);
          return stg;
        };
        return stg;
      };

      return {
        $local: function () {
          return wrapDefault($localStorage);
        },
        $session: function () {
          return wrapDefault($sessionStorage);
        }
      }
    }
  ]);