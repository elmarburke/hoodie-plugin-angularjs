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

### `hoodieObject`

Add `hoodieObject` to your di-array. With the bind method you could bind an object to your hoodie store.

#### `hoodieObject.bind(store, id)`

* **store**: the place were the item is saved.
* **id**: the items id you want to bind to.

Returns an object with the item you selected from hoodie.

Example: 

```js
angular.module('worldDominationApp', ['hoodie'])
  .config(function(hoodieProvider) {
    hoodieProvider.url('http://myhoodie.com/');
  })
  .controller('TodoCtrl', function ($scope, hoodieObject) {

    $scope.secretSuperpower = hoodieObject.bind('superpower', '12ffID');
    // $scope.secretSuperpower contains now an object with the hoodie object with the id 12ffID
    // it is two way bounded with hoodie
  });
```


## Development

We use [gulp](http://gulpjs.com) to build and [karma](http://karma-runner.github.io) to test.

Install the development dependencies.
```shell
npm install
bower install
```

Run `gulp test` to build and test once.
Run `gulp` to start the karma test server and run test continuously on every save.

### Build & Release Process

Run `gulp tag` to prepare the built plugin for distribution.

Internally it does the following:
- Concat the source files and wrap them in Hoodie.extend()
- Move the built file from `dist` to the project root. (We keep the concatenated file in dist by default so it cannot be accidentally commited)
- Commit, tag, and Push
