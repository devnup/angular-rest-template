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
        max: 60000
      }
    });

  })

  .controller('PlaygroundCtrl', [
    '$scope', '$rest',
    function ($scope, $rest) {

      $scope.input = {
        url: 'http://dev.ws.devnup.com/api/status',
        params: [{}]
      };

      $scope.result = '';

      $scope.refresh = function () {

        var params = {};

        $scope.input.params.map(function (p) {
          if (p.key && p.value) {
            params[p.key] = p.value;
          }
        });

        $rest
          .get($scope.input.url, params)
          .cache({
            min: 5 * 1000, // 5 seconds
            max: 30 * 1000 // 30 seconds
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

      $scope.refresh();
    }]);