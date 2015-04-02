/**
 * Created by luiseduardobrito on 3/4/15.
 */
angular.module('restPlayground', [
  'com.devnup.rest'
])

  .run(function ($rest) {

    // Configure your rest template
    $rest.config({

      // Base domain for requests
      // Used as prefix in all http calls
      base: '',

      // Example: $rest.get('http://example.com').cache().success(console.log)
      cache: {

        // Storage type
        type: 'local',

        // 5 seconds min cache
        min: 5000,

        // 1 min max cache
        // will automatically update itself when enabled
        // using .cache() method after the request call
        // when timeout is reached
        max: 10000
      }
    });
  })

  .controller('PlaygroundCtrl', [
    '$scope', '$rest',
    function ($scope, $rest) {

      $scope.input = {
        url: 'http://dev.ws.devnup.com/api/status',
        cache: true,
        params: [{}]
      };

      $scope.result = '';

      $scope.refresh = function (input) {

        var params = {};

        input.params.map(function (p) {
          if (p.key && p.value) {
            params[p.key] = p.value;
          }
        });

        $rest
          .get(input.url, params, {
            cache: !!input.cache
          })
          .error(function (err) {
            console.error(err);
          })
          .success(function (data) {
            try {
              $scope.result = JSON.stringify(data);
            } catch (e) {
              $scope.result = data || e && e.message ? e.message : (e || 'Error');
            }
          })
      };

      $scope.refresh($scope.input);

    }]);