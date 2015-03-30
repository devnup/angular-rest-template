/**
 * Angular Rest Template
 * v0.0.1
 *
 * @alias com.devnup.rest
 *
 * @author luis@devnup.com
 * @since 03/29/15.
 */
angular.module('com.devnup.rest', [
  'ngResource'
])

  .factory('$rest', ['$resource',

    /**
     * Angular Rest Service
     * v0.0.1
     *
     * @class
     * @type {Function}
     * @alias com.devnup.rest.$rest
     */
      function ($resource) {

      return {
        resource: $resource
      };

    }

  ]);