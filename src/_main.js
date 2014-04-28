// TODO: No need of a global variable why pollute global scope?
var hoodieModule = angular.module('hoodie', []);

// TODO: Not sure if we should wrap this
//Takes a callback that takes a single argument,
//and returns a function that will $evalAsync and call that callack
//$evalAsync will just make sure we don't have any $apply-conflicts
function angularDigestFn($rootScope, callback) {
  return function() {
    var args = arguments;
    $rootScope.$evalAsync(function() {
      callback.apply(null, args);
    });
  };
}

// TODO: Should be extracted into a AngularService
//Takes a hoodie event, and will do the following when it fires in addition 
//to calling the function:
// 1. call $apply
// 2. $emit('hoodie:evnetName') on the $rootScope
function hoodieEventWrap(hoodieInstance, eventName, $rootScope,  fn) {
  hoodieInstance.on(eventName, angularDigestFn($rootScope, function(eventData) {
    fn(eventData);
    $rootScope.$emit('hoodie:' + eventName, eventData);
  }));
}


// TODO: We should use $q.when
//Takes a hoodie function that returns a promise, and returns a function
//that will call the hoodie function, then take that hoodie promise and
//instead return a $q-promise and $apply when it returns
function hoodiePromiseFnWrap(context, fnName, $q, $rootScope) {
  return function() {
    var args = arguments;
    var deferred = $q.defer();
    context[fnName].apply(context, args).then(
      angularDigestFn($rootScope, deferred.resolve),
      angularDigestFn($rootScope, deferred.reject)
    );
    return deferred.promise;
  };
}
