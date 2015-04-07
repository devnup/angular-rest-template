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

      $scope.templates = [];

      $scope.available = {
        methods: ['get', 'post', 'put', 'delete']
      };

      $scope.input = {
        protocol: 'http://',
        base: ''
      };

      $scope.build = function (input) {

        var rest = {
          input: {
            method: 'get',
            url: '',
            cache: {
              enabled: false,
              hash: function () {
                return JSON.stringify(angular.copy($scope.input));
              }
            },
            result: '',
            params: [{}]
          },
          instance: $rest.build({
            base: (input.protocol || '') + (input.base || '')
          })
        };

        $scope.templates.push(rest);
      };

      $scope.refresh = function (rest) {

        var input = rest.input;
        var base = rest.instance.config().base;
        var params = {};

        input.params.map(function (p) {
          if (p.key && p.value) {
            params[p.key] = p.value;
          }
        });

        rest.instance[input.method || 'get'](input.url, params, {
          cache: input.cache
        })
          .error(function (err) {
            console.error(err);
          })
          .success(function (data) {
            try {
              rest.result = JSON.stringify(data, null, 4);
            } catch (e) {
              rest.result = data || (e && e.message ? e.message : (e || 'Error'));
            }
          })
      };

    }]);