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

      // Perform request and set enable cache
      rest.get('hello/world', {

        cache: {
          min: 60000, // 1 minute
          max: 300000 // 5 minutes
        }

      )).success(function(data) {

        // Will be refreshed every 5 minutes automatically
        $scope.result = data;

      }).error(function(e) {

        console.error(e);

      })

    }
  }
]);

```

### Samples

- [Sample - Rest Playground (HTML + JS)](http://angular-rest-template.snippets.devnup.com)

### Documentation

- [API Reference (JSDoc)](http://angular-rest-template.snippets.devnup.com/docs)

### Authors
- [André Seiji](https://github.com/seijitamanaha) - [seiji@devnup.com](mailto:seiji@devnup.com)
- [Luís Eduardo Brito](https://github.com/luiseduardobrito) - [luis@devnup.com](mailto:luis@devnup.com)

### Dependencies

This repository is based in several open source components, most of them used to make Rest Playground so beautifully designed.

The library itself would not be possible without some these awesome components, and you'll need to import them in your application to make angular-rest-templates work.

In the Bower package there are standalone minified files with these dependencies already included.

- [caolan/async](https://github.com/caolan/async)
    - **Author**: [Caolan McMahon](https://github.com/caolan)
    - **License**: [View in GitHub](https://raw.githubusercontent.com/caolan/async/master/LICENSE)

- [gsklee/ngStorage](https://github.com/gsklee/ngStorage)
    - **Author**: [G. Kay Lee](https://github.com/gsklee)
    - **License**: [View in GitHub](https://raw.githubusercontent.com/gsklee/ngStorage/master/LICENSE)

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