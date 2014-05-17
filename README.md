# [Hoodie](http://hood.ie) [AngularJS](http://angularjs.org/) [Plugin](http://hood.ie/#plugins)
[![devDependency Status](https://david-dm.org/elmarburke/hoodie-plugin-angularjs/dev-status.svg)](https://david-dm.org/elmarburke/hoodie-plugin-angularjs#info=devDependencies)
[![Build Status](https://travis-ci.org/elmarburke/hoodie-plugin-angularjs.svg?branch=master)](https://travis-ci.org/elmarburke/hoodie-plugin-angularjs)
[![Coverage Status](https://coveralls.io/repos/elmarburke/hoodie-plugin-angularjs/badge.png)](https://coveralls.io/r/elmarburke/hoodie-plugin-angularjs)

Hoodie goes angular in a cozy way!

A lot is missing, but the good news are: you can [contribute](https://github.com/elmarburke/hoodie-plugin-angularjs/fork)!

A little bit about the plugin.

## Install

`$ hoodie install angularjs` in your project folder will install the plugin. You need to load angular **BEFORE** the hoodie-plugin.

```html
<script src="jquery.js"></script>
<script src="hoodie.js"></script>
<script src="angular.js"></script>
<script src="hoodie-plugin-angularjs.js"></script>
```

Load the `hoodie` module into angular and initialize hoodie.
Note: If you don't specify any url hoodie-angular will just fall back to the current URL.

```js
angular.module('worldDominationApp', ['hoodie'])
  .config(function(hoodieProvider) {
    hoodieProvider.url('http://myhoodie.com/');
  });
```

## Services

There are currently four services. hoodie, hoodieAccount, hoodieStore and hoodieArray.

### `hoodie`

Use hoodieProvider.url(String) to configure your app's hoodie url at startup.  Scroll down for an example.

You can then inject `hoodie` with dependency injection anywhere to get your plain old hoodie instance.  For more angular-friendly services, use the below.

### `hoodieAccount`

Use the same [API like plain hoodie](http://hood.ie/#docs). Use dependency Injection.

### `hoodieStore`

Use the same [API like plain hoodie](http://hood.ie/#docs). Use dependency Injection if you want to use this. We recommend you to use `hoodieArray`.

### `hoodieArray`

Add `hoodieArray` to your di-array. With the bind method you could bind an array to your hoodie store.

#### `hoodieArray.bind(scope, store[, hoodieStore])`

* **scope**: the scope to bind with. Normaly `$scope`
* **store**: the place were the store binds to.
* **hoodieStore**: Optional. the store name in hoodie. If unset, store will be used.

Example:

```js
angular.module('worldDominationApp', ['hoodie'])
  .config(function(hoodieProvider) {
    hoodieProvider.url('http://myhoodie.com/');
  })
  .controller('TodoCtrl', function ($scope, hoodieArray) {

    $scope.delete = function(item) {
      var idx = $scope.todos.indexOf(item);
      $scope.todos.splice(idx, 1);
    };

    $scope.add = function (title) {
      $scope.todos.push({
        title: title
      });
      $scope.newTodo = '';
    }

    hoodieArray.bind($scope, 'todos', 'todo');
  });
```

## Development

We use [gulp](http://gulpjs.com) to build and [karma](http://karma-runner.github.io) to test.

Install the development dependencies.

```shell
npm install
bower install
```

- `gulp` to build, test, and jshint once.
- `gulp build` to build to dist
- `gulp jshint` to run jshint
- `gulp karma` to run karma tests once
- `gulp karma-watch` to run karma tests and re-run on change

### Build & Release Process

Before releasing, copy the release file from `dist` to the project root.
