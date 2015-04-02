/**
 * Angular Rest Cache
 *
 * @alias com.devnup.rest.cache
 *
 * @author luis@devnup.com
 * @since 03/29/15.
 */
angular.module('com.devnup.rest.cache', [
  'ngStorage'
])
  .factory('$storageWrapper', [
    '$rootScope', '$localStorage', '$sessionStorage', '$cookieStorage',
    function ($rootScope, $localStorage, $sessionStorage, $cookieStorage) {

      if (!$localStorage || !$sessionStorage || !$cookieStorage) {
        throw new Error('ngStorage is required');
      }
      return {
        $local: function () {
          return $localStorage;
        },
        $session: function () {
          return $sessionStorage;
        },
        $cookie: function () {
          return $cookieStorage;
        }
      }
    }
  ]);