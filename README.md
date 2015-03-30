angular-rest-template
===================

### Installation

Using Bower: ```bower install --save angular-rest-template```

### Browser Usage

Include the library in your HTML file:
```markup
<!-- Angular Colors Util (Minified) -->
<script type="text/javascript" src="bower_components/angular-rest-template/lib/dist/js/angular-rest-template.min.js"></script>

<!-- Angular Colors Util (Full) -->
<script type="text/javascript" src="bower_components/angular-rest-template/lib/dist/js/angular-rest-template.js"></script>
```

Include the module in your Angular app:
```javascript
angular
    .module('myApp', ['com.devnup.rest'])
    .controller('BodyCtrl', ['$scope', '$rest', function($scope, $rest) {

      var rest = $rest.create({
          base: 'http://api.devnup.com'
      });

      var cache = {
        result: null,
        errors: []
      }

      return {

        // GET: http://api.devnup.com/hello/world
        hello: rest.get('hello/world'),

        // POST: http://api.devnup.com/hello/world
        another_endpoint: $async.callback({

            method: $emailAPI.post('another/endpoint', {
              message: 'Hello world!'
            }),

            success: function(data) {
                // Save to service cache before running the callback
                cache.result = data;
            },
            error: function(data) {
                 // Save to service error cache before running the callback
                 cache.errors.push(data);
             },
        })
      }
    }]);

```

### Samples

- [Sample Color Generator (HTML + JS)](http://angular-rest-template.snippets.devnup.com)

### Documentation

- [API Reference (JSDoc)](http://angular-rest-template.snippets.devnup.com/docs)

### Authors
- [André Seiji](https://github.com/seijitamanaha) - [seiji@devnup.com](mailto:seiji@devnup.com)
- [Luís Eduardo Brito](https://github.com/luiseduardobrito) - [luis@devnup.com](mailto:luis@devnup.com)

### License

The MIT License (MIT)

Copyright (c) 2015 - Devnup Solutions

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.