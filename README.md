[Hoodie](http://hood.ie) [AngularJS](http://angularjs.org/) [Plugin](http://hood.ie/#plugins)
======================

Hoodie goes angular in a cozy way!

A lot is missing, but the good news are: you can [contribute](https://github.com/elmarburke/hoodie-plugin-angularjs/fork)!

A little bit about the plugin.

Install
-------

`$ hoodie install angularjs` in your project folder will install the plugin. You need to load angular **BEFORE** hoodie.

Initialize hoodie and load the plugin into angular. add the module name `hoodieModule` to your module array. Example:

```js
// Init Hoodie
var hoodie  = new Hoodie()
window.hoodie = hoodie;

// Init Angular
angular.module('worldDominationApp', ['hoodieModule'])
```

Services
--------

There are currently three services. hoodieAccount, hoodieStore and hoodieArray.

### `hoodieAccount`

Use the same [API like plain hoodie](http://hood.ie/#docs). Use dependency Injection.

### `hoodieStore`

Use the same [API like plain hoodie](http://hood.ie/#docs). Use dependency Injection if you want to use this. I recomend
you to use `hoodieArray`.

### `hoodieArray`

This is real nice. Add `hoodieArray` to your di-array. With the bind method you could bind an array to your hoodie store.

#### `hoodieArray.bind(scope, store[, hoodieStore])`

* **scope**: the scope to bind with. Normaly `$scope`
* **store**: the place were the store binds to.
* **hoodieStore**: Not needed. the store name in hoodie. If unset, store will be used.

Example:

```js
angular.module('worldDominationApp', ['hoodieModule'])

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
